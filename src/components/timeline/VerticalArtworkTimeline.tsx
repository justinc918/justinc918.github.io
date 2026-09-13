import { useState } from 'react'
import {
  ArtworkLightbox,
  boxDateStyle,
  boxDescriptionStyle,
  boxTitleStyle,
  FramedArtwork,
  MUTED,
  type TimelineAssets,
  type TimelineEvent,
} from './ArtworkPresentation'

const LINE_COLOR = '#ccd8ff'
const POINT_SIZE = 22

type VerticalTimelineProps = {
  events: TimelineEvent[]
  assets?: TimelineAssets
  credits?: React.ReactNode
}

const mobileImageStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  maxWidth: '100%',
  height: 'auto',
  objectFit: 'contain',
  borderRadius: 4,
}

export default function VerticalArtworkTimeline({ events, assets, credits }: VerticalTimelineProps) {
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null)
  const markerSrc = assets?.point?.marker

  return (
    <>
      <div className="page-scroll digital-page vertical-artwork-timeline" style={pageStyle}>
        <div className="vertical-artwork-timeline__inner" style={innerStyle}>
          <div className="vertical-artwork-timeline__rail" aria-hidden="true" />
          <ol className="vertical-artwork-timeline__list" style={listStyle}>
            {events.map((event) => (
              <VerticalTimelineItem
                key={event.id}
                event={event}
                box={assets?.box}
                markerSrc={markerSrc}
                onOpen={setActiveEvent}
              />
            ))}
          </ol>
          {credits && (
            <div className="vertical-artwork-timeline__credits">
              <p style={creditsTextStyle}>
                <strong style={creditsLabelStyle}>Credits</strong> {credits}
              </p>
            </div>
          )}
        </div>
      </div>
      {activeEvent && (
        <ArtworkLightbox
          event={activeEvent}
          box={assets?.box}
          onClose={() => setActiveEvent(null)}
        />
      )}
    </>
  )
}

function VerticalTimelineItem({
  event,
  box,
  markerSrc,
  onOpen,
}: {
  event: TimelineEvent
  box?: TimelineAssets['box']
  markerSrc?: string
  onOpen: (event: TimelineEvent) => void
}) {
  const canOpen = Boolean(event.imageSrc)
  const label = event.date
    ? event.title
      ? `${event.title} — ${event.date}`
      : event.date
    : event.title

  const open = () => {
    if (canOpen) onOpen(event)
  }

  return (
    <li className="vertical-artwork-timeline__item" style={itemStyle}>
      <div className="vertical-artwork-timeline__marker" style={markerColStyle}>
        {markerSrc ? (
          <img src={markerSrc} alt="" aria-hidden="true" style={markerImageStyle} />
        ) : (
          <div style={markerFallbackStyle} />
        )}
      </div>
      <article className="vertical-artwork-timeline__card" style={cardStyle}>
        <div
          className="vertical-artwork-timeline__media"
          style={canOpen ? { ...mediaWrapStyle, cursor: 'pointer' } : mediaWrapStyle}
          role={canOpen ? 'button' : undefined}
          tabIndex={canOpen ? 0 : undefined}
          aria-label={canOpen ? `View ${label}` : undefined}
          onClick={open}
          onKeyDown={(e) => {
            if (canOpen && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              open()
            }
          }}
        >
          <FramedArtwork
            event={event}
            box={box}
            imageStyle={mobileImageStyle}
            loading="lazy"
            placeholderMinWidth={160}
          />
        </div>
        <figcaption style={captionStyle}>
          {event.title ? <span style={boxTitleStyle}>{event.title}</span> : null}
          {event.date && <span style={boxDateStyle}>{event.date}</span>}
          {event.description && <span style={boxDescriptionStyle}>{event.description}</span>}
        </figcaption>
      </article>
    </li>
  )
}

const pageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
}

const innerStyle: React.CSSProperties = {
  position: 'relative',
  padding: '24px 20px 40px',
  maxWidth: 560,
  margin: '0 auto',
}

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
}

const itemStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `${POINT_SIZE}px 1fr`,
  columnGap: 12,
  alignItems: 'start',
}

const markerColStyle: React.CSSProperties = {
  width: POINT_SIZE,
  height: POINT_SIZE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 1,
}

const markerImageStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
}

const markerFallbackStyle: React.CSSProperties = {
  width: POINT_SIZE,
  height: POINT_SIZE,
  borderRadius: '50%',
  backgroundColor: LINE_COLOR,
}

const cardStyle: React.CSSProperties = {
  margin: 0,
  minWidth: 0,
}

const mediaWrapStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  minHeight: 44,
  outline: 'none',
}

const captionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  gap: 6,
  marginTop: 12,
  padding: 0,
}

const creditsTextStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: 15,
  lineHeight: 1.55,
  margin: 0,
}

const creditsLabelStyle: React.CSSProperties = {
  color: '#fff',
  fontWeight: 700,
}
