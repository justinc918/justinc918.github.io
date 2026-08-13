import { useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type TimelineEvent = {
  id: string
  date: string
  title: string
  imageSrc?: string
  imageAlt?: string
  description?: string
}

// Asset slots are grouped by type so each visual layer can be swapped for a
// custom SVG later without touching layout logic. Any slot left undefined falls
// back to a CSS placeholder.
export type TimelineAssets = {
  line?: {
    segment?: string
    startCap?: string
    endCap?: string
    connector?: string
  }
  point?: {
    marker?: string
  }
  box?: {
    frame?: string
  }
}

type TimelineProps = {
  events: TimelineEvent[]
  assets?: TimelineAssets
}

// ─────────────────────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────────────────────

const LINE_COLOR = '#ccd8ff'
const ACCENT = '#c4d3ff'
const MUTED = 'rgba(196,211,255,0.8)'
const FAINT = 'rgba(196,211,255,0.4)'

const COLUMN_WIDTH = 320
const LANE_HEIGHT = 260 // vertical space reserved for a box on one side of the line
const CONNECTOR_UP = 26 // top images sit closer to the line
const CONNECTOR_DOWN = 96 // bottom images sit ~2x farther from the line
const POINT_SIZE = 22
const BOX_RATIO = 4 / 3
const CAPTION_WIDTH = 190 // caption sits to the left of the image
const START_PADDING = 240 // extra room so the first piece's caption fits

// ─────────────────────────────────────────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────────────────────────────────────────

export default function ArtworkTimeline({ events, assets }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Oldest (left) first: start pinned to the far left.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [events])

  return (
    <div ref={scrollRef} style={scrollStyle}>
      <div style={trackStyle}>
        {events.map((event, index) => {
          const above = index % 2 === 0
          const isFirst = index === 0
          const isLast = index === events.length - 1
          return (
            <TimelineColumn
              key={event.id}
              event={event}
              above={above}
              isFirst={isFirst}
              isLast={isLast}
              assets={assets}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Column: one event = line segment + point + connector + box
// ─────────────────────────────────────────────────────────────────────────────

type ColumnProps = {
  event: TimelineEvent
  above: boolean
  isFirst: boolean
  isLast: boolean
  assets?: TimelineAssets
}

function TimelineColumn({ event, above, isFirst, isLast, assets }: ColumnProps) {
  return (
    <div style={columnStyle}>
      {/* Upper lane holds a box only when it points above the line */}
      <div style={laneStyle('up')}>
        {above && (
          <>
            <TimelineBox event={event} frame={assets?.box?.frame} />
            <TimelineConnector asset={assets?.line?.connector} orientation="up" />
          </>
        )}
      </div>

      {/* Center spine: continuous line with a milestone point */}
      <div style={spineStyle}>
        <TimelineLine
          asset={assets?.line?.segment}
          startCap={isFirst ? assets?.line?.startCap : undefined}
          endCap={isLast ? assets?.line?.endCap : undefined}
          showStartCap={isFirst}
          showEndCap={isLast}
        />
        <TimelinePoint asset={assets?.point?.marker} />
      </div>

      {/* Lower lane holds a box only when it points below the line */}
      <div style={laneStyle('down')}>
        {!above && (
          <>
            <TimelineConnector asset={assets?.line?.connector} orientation="down" />
            <TimelineBox event={event} frame={assets?.box?.frame} />
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Line module
// ─────────────────────────────────────────────────────────────────────────────

type LineProps = {
  asset?: string
  startCap?: string
  endCap?: string
  showStartCap: boolean
  showEndCap: boolean
}

function TimelineLine({ asset, startCap, endCap, showStartCap, showEndCap }: LineProps) {
  return (
    <div style={lineWrapStyle}>
      {asset ? (
        <img src={asset} alt="" aria-hidden="true" style={lineImageStyle} />
      ) : (
        <div style={linePlaceholderStyle} />
      )}
      {showStartCap && (
        <div style={{ ...capStyle, left: 0 }}>
          {startCap ? (
            <img src={startCap} alt="" aria-hidden="true" style={capImageStyle} />
          ) : (
            <div style={capPlaceholderStyle} />
          )}
        </div>
      )}
      {showEndCap && (
        <div style={{ ...capStyle, right: 0 }}>
          {endCap ? (
            <img src={endCap} alt="" aria-hidden="true" style={capImageStyle} />
          ) : (
            <div style={{ ...capPlaceholderStyle, transform: 'rotate(180deg)' }} />
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Point module
// ─────────────────────────────────────────────────────────────────────────────

function TimelinePoint({ asset }: { asset?: string }) {
  return (
    <div style={pointWrapStyle}>
      {asset ? (
        <img src={asset} alt="" aria-hidden="true" style={pointImageStyle} />
      ) : (
        <div style={pointPlaceholderStyle} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Connector module (vertical stem between line and box)
// ─────────────────────────────────────────────────────────────────────────────

function TimelineConnector({
  asset,
  orientation,
}: {
  asset?: string
  orientation: 'up' | 'down'
}) {
  return (
    <div style={connectorWrapStyle(orientation)}>
      {asset ? (
        <img src={asset} alt="" aria-hidden="true" style={connectorImageStyle} />
      ) : (
        <div style={connectorPlaceholderStyle} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Box module (artwork card)
// ─────────────────────────────────────────────────────────────────────────────

function TimelineBox({ event, frame }: { event: TimelineEvent; frame?: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <figure
      style={boxStyle}
      aria-label={`${event.date} — ${event.title}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
    >
      {/* Caption sits to the left of the image and fades in on hover. It is
          absolutely positioned so it never shifts the image layout. */}
      <figcaption style={boxCaptionStyle(hovered)}>
        <span style={boxDateStyle}>{event.date}</span>
        <span style={boxTitleStyle}>{event.title}</span>
        {event.description && <span style={boxDescriptionStyle}>{event.description}</span>}
      </figcaption>
      <div style={boxMediaStyle(hovered)}>
        {/* Border art: uses the custom frame when supplied, otherwise a plain
            rectangle placeholder. Expands slightly outward on hover. */}
        {frame ? (
          <img src={frame} alt="" aria-hidden="true" style={boxFrameStyle(hovered)} />
        ) : (
          <div style={boxBorderPlaceholderStyle(hovered)} />
        )}
        {event.imageSrc ? (
          <img src={event.imageSrc} alt={event.imageAlt ?? event.title} style={boxImageStyle} />
        ) : (
          <div style={boxImagePlaceholderStyle}>
            <span style={boxPlaceholderLabelStyle}>Add image here</span>
          </div>
        )}
      </div>
    </figure>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const scrollStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  overflowX: 'auto',
  overflowY: 'hidden',
  display: 'flex',
  alignItems: 'center',
}

const trackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  minWidth: 'min-content',
  margin: 'auto',
  padding: `0 64px 0 ${START_PADDING}px`,
}

const columnStyle: React.CSSProperties = {
  flex: '0 0 auto',
  width: COLUMN_WIDTH,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

// Each lane anchors its content to the spine (line) side and grows away from
// it: upper boxes stack upward, lower boxes hang downward. This keeps boxes
// from overflowing across the line even when the caption space is reserved.
const laneStyle = (position: 'up' | 'down'): React.CSSProperties => ({
  height: LANE_HEIGHT,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: position === 'up' ? 'flex-end' : 'flex-start',
})

const spineStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: POINT_SIZE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

// Line

const lineWrapStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: 0,
  width: '100%',
  transform: 'translateY(-50%)',
}

const lineImageStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
}

const linePlaceholderStyle: React.CSSProperties = {
  width: '100%',
  height: 2,
  backgroundColor: LINE_COLOR,
}

const capStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
}

const capImageStyle: React.CSSProperties = {
  display: 'block',
  height: 12,
  width: 'auto',
}

const capPlaceholderStyle: React.CSSProperties = {
  width: 0,
  height: 0,
  borderTop: '5px solid transparent',
  borderBottom: '5px solid transparent',
  borderLeft: `9px solid ${LINE_COLOR}`,
}

// Point

const pointWrapStyle: React.CSSProperties = {
  position: 'relative',
  width: POINT_SIZE,
  height: POINT_SIZE,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
}

const pointImageStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
}

const pointPlaceholderStyle: React.CSSProperties = {
  width: POINT_SIZE,
  height: POINT_SIZE,
  borderRadius: '50%',
  backgroundColor: ACCENT,
  boxShadow: `0 0 0 4px rgba(196,211,255,0.15)`,
}

// Connector

const connectorWrapStyle = (orientation: 'up' | 'down'): React.CSSProperties => ({
  width: 12,
  height: orientation === 'up' ? CONNECTOR_UP : CONNECTOR_DOWN,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...(orientation === 'up' ? { marginTop: 4 } : { marginBottom: 4 }),
})

const connectorImageStyle: React.CSSProperties = {
  display: 'block',
  width: 'auto',
  height: '100%',
}

const connectorPlaceholderStyle: React.CSSProperties = {
  width: 2,
  height: '100%',
  backgroundColor: LINE_COLOR,
}

// Box

const boxStyle: React.CSSProperties = {
  position: 'relative',
  margin: 0,
  width: COLUMN_WIDTH - 64,
  outline: 'none',
}

const boxMediaStyle = (hovered: boolean): React.CSSProperties => ({
  position: 'relative',
  width: '100%',
  aspectRatio: `${BOX_RATIO}`,
  transform: hovered ? 'scale(1.05)' : 'scale(1)',
  transition: 'transform 220ms ease',
  transformOrigin: 'center',
})

const boxFrameStyle = (hovered: boolean): React.CSSProperties => ({
  position: 'absolute',
  inset: hovered ? -8 : 0,
  width: 'auto',
  height: 'auto',
  pointerEvents: 'none',
  zIndex: 1,
  transition: 'inset 220ms ease',
})

// Placeholder rectangle border, stands in for the frame art the user adds later.
const boxBorderPlaceholderStyle = (hovered: boolean): React.CSSProperties => ({
  position: 'absolute',
  inset: hovered ? -8 : 0,
  border: `1px solid ${hovered ? ACCENT : FAINT}`,
  borderRadius: 4,
  pointerEvents: 'none',
  zIndex: 1,
  transition: 'inset 220ms ease, border-color 220ms ease',
})

const boxImageStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 4,
}

const boxImagePlaceholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  backgroundColor: 'rgba(196,211,255,0.04)',
}

const boxPlaceholderLabelStyle: React.CSSProperties = {
  color: 'rgba(196,211,255,0.5)',
  fontSize: 14,
  letterSpacing: '0.03em',
}

const boxCaptionStyle = (hovered: boolean): React.CSSProperties => ({
  position: 'absolute',
  top: 0,
  right: '100%',
  height: '100%',
  width: CAPTION_WIDTH,
  marginRight: 34,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-end',
  textAlign: 'right',
  gap: 4,
  opacity: hovered ? 1 : 0,
  transform: hovered ? 'translateX(0)' : 'translateX(8px)',
  transition: 'opacity 220ms ease, transform 220ms ease',
  pointerEvents: hovered ? 'auto' : 'none',
})

const boxDateStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

const boxTitleStyle: React.CSSProperties = {
  color: ACCENT,
  fontSize: 20,
  fontWeight: 700,
  letterSpacing: '0.02em',
}

const boxDescriptionStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: 15,
  lineHeight: 1.5,
}
