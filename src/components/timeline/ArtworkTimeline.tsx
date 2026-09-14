import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ACCENT,
  ArtworkLightbox,
  boxDateStyle,
  boxDescriptionStyle,
  boxImageStyle,
  boxTitleStyle,
  CreditHighlight,
  FramedArtwork,
  MUTED,
  type TimelineAssets,
  type TimelineEvent,
} from './ArtworkPresentation'

export type {
  BorderRepeatMode,
  TimelineAssets,
  TimelineBoxBorder,
  TimelineEvent,
} from './ArtworkPresentation'
export { CreditHighlight }

type TimelineProps = {
  events: TimelineEvent[]
  assets?: TimelineAssets
  credits?: React.ReactNode
  gapNode?: { event: TimelineEvent; gapIndex: number }
}

const LINE_COLOR = '#ccd8ff'

const COLUMN_WIDTH = 320
const FIRST_GAP_EXTRA = 960
const FIRST_GAP_REPEATS = 4
const SEGMENT_HOLE_X = COLUMN_WIDTH / 2
const BOX_RATIO = 4 / 3
const BOX_WIDTH = COLUMN_WIDTH - 64
const BOX_HEIGHT = BOX_WIDTH / BOX_RATIO
const CONNECTOR_GAP = 4
const CONNECTOR_LENGTH = 26
const LANE_HEIGHT = CONNECTOR_LENGTH + CONNECTOR_GAP + BOX_HEIGHT
const POINT_SIZE = 22
const CAPTION_WIDTH = 190
const START_PADDING = 240

const SCROLLBAR_HEIGHT = 14
const SCROLLBAR_TRACK_HEIGHT = 8
const SCROLLBAR_MIN_THUMB = 56
const SCROLLBAR_BOTTOM_INSET = 22
const SCROLL_CLASS = 'artwork-timeline-scroll'

export default function ArtworkTimeline({ events, assets, credits, gapNode }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [events])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      if (e.deltaY === 0) return
      el.scrollLeft += e.deltaY
      e.preventDefault()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div style={rootStyle}>
      <style>{scrollbarHideCss}</style>
      <div ref={scrollRef} className={SCROLL_CLASS} style={scrollStyle}>
        <div style={contentStyle}>
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
                  onOpen={setActiveEvent}
                  gapNode={isFirst ? gapNode : undefined}
                />
              )
            })}
          </div>
          {credits && (
            <div style={creditsRowStyle}>
              <p style={creditsTextStyle}>
                <strong style={creditsLabelStyle}>Credits</strong> {credits}
              </p>
            </div>
          )}
        </div>
        {activeEvent && (
          <ArtworkLightbox
            event={activeEvent}
            box={assets?.box}
            onClose={() => setActiveEvent(null)}
          />
        )}
      </div>
      <TimelineScrollbar
        scrollRef={scrollRef}
        track={assets?.scrollbar?.track}
        thumb={assets?.scrollbar?.thumb}
      />
    </div>
  )
}

function TimelineScrollbar({
  scrollRef,
  track,
  thumb,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>
  track?: string
  thumb?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [geo, setGeo] = useState({ left: 0, width: 0, scrollable: false })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      const trackWidth = trackRef.current?.clientWidth ?? 0
      const ratio = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1
      const width = Math.max(trackWidth * ratio, SCROLLBAR_MIN_THUMB)
      const progress = max > 0 ? el.scrollLeft / max : 0
      const left = Math.max(0, (trackWidth - width) * progress)
      setGeo({ left, width, scrollable: max > 1 })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [scrollRef])

  const onThumbPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current
    const track = trackRef.current
    if (!el || !track) return
    e.preventDefault()
    const startX = e.clientX
    const startScroll = el.scrollLeft
    const max = el.scrollWidth - el.clientWidth
    const usable = track.clientWidth - geo.width
    const onMove = (ev: PointerEvent) => {
      if (usable <= 0) return
      const delta = ((ev.clientX - startX) / usable) * max
      el.scrollLeft = startScroll + delta
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const onTrackPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current
    const track = trackRef.current
    if (!el || !track) return
    const rect = track.getBoundingClientRect()
    const max = el.scrollWidth - el.clientWidth
    const usable = track.clientWidth - geo.width
    if (usable <= 0) return
    const target = e.clientX - rect.left - geo.width / 2
    el.scrollLeft = (Math.min(Math.max(target, 0), usable) / usable) * max
  }

  return (
    <div
      ref={trackRef}
      style={{ ...scrollbarWrapStyle, opacity: geo.scrollable ? 1 : 0 }}
      onPointerDown={onTrackPointerDown}
      aria-hidden={!geo.scrollable}
    >
      {track ? (
        <img src={track} alt="" aria-hidden="true" style={scrollbarTrackImageStyle} />
      ) : (
        <div style={scrollbarTrackFallbackStyle} />
      )}
      <div
        style={{ ...scrollbarThumbStyle, left: geo.left, width: geo.width }}
        onPointerDown={(e) => {
          e.stopPropagation()
          onThumbPointerDown(e)
        }}
        role="scrollbar"
        aria-orientation="horizontal"
        tabIndex={0}
      >
        {thumb ? (
          <img src={thumb} alt="" aria-hidden="true" style={scrollbarThumbImageStyle} />
        ) : (
          <div style={scrollbarThumbPlaceholderStyle} />
        )}
      </div>
    </div>
  )
}

type ColumnProps = {
  event: TimelineEvent
  above: boolean
  isFirst: boolean
  isLast: boolean
  assets?: TimelineAssets
  onOpen: (event: TimelineEvent) => void
  gapNode?: { event: TimelineEvent; gapIndex: number }
}

function TimelineColumn({ event, above, isFirst, isLast, assets, onOpen, gapNode }: ColumnProps) {
  const contentShift = isFirst ? -FIRST_GAP_EXTRA / 2 : 0
  const shiftStyle: React.CSSProperties = contentShift
    ? { transform: `translateX(${contentShift}px)` }
    : {}

  return (
    <div style={isFirst ? { ...columnStyle, width: COLUMN_WIDTH + FIRST_GAP_EXTRA } : columnStyle}>
      <div style={{ ...laneStyle('up'), ...shiftStyle }}>
        {above && (
          <>
            <TimelineBox event={event} box={assets?.box} onOpen={onOpen} />
            <TimelineConnector asset={assets?.line?.connector} orientation="up" />
          </>
        )}
      </div>

      <div style={spineStyle}>
        <TimelineLine
          asset={assets?.line?.segment}
          startCap={isFirst ? assets?.line?.startCap : undefined}
          endCap={isLast ? assets?.line?.endCap : undefined}
          showStartCap={isFirst}
          showEndCap={isLast}
          gapRepeats={isFirst ? FIRST_GAP_REPEATS : undefined}
          gapWidth={isFirst ? FIRST_GAP_EXTRA : undefined}
        />
        {isFirst &&
          Array.from({ length: FIRST_GAP_REPEATS - 1 }, (_, index) => (
            <div key={index} style={gapPointStyle(index + 1)}>
              <TimelinePoint asset={assets?.point?.marker} />
            </div>
          ))}
        {isFirst && gapNode && (
          <div style={gapNodeStyle(gapNode.gapIndex)}>
            <TimelineConnector asset={assets?.line?.connector} orientation="down" />
            <TimelineBox event={gapNode.event} box={assets?.box} onOpen={onOpen} />
          </div>
        )}
        <div style={shiftStyle}>
          <TimelinePoint asset={assets?.point?.marker} />
        </div>
      </div>

      <div style={{ ...laneStyle('down'), ...shiftStyle }}>
        {!above && (
          <>
            <TimelineConnector asset={assets?.line?.connector} orientation="down" />
            <TimelineBox event={event} box={assets?.box} onOpen={onOpen} />
          </>
        )}
      </div>
    </div>
  )
}

type LineProps = {
  asset?: string
  startCap?: string
  endCap?: string
  showStartCap: boolean
  showEndCap: boolean
  
  gapRepeats?: number
  gapWidth?: number
}

function TimelineLine({
  asset,
  startCap,
  endCap,
  showStartCap,
  showEndCap,
  gapRepeats,
  gapWidth,
}: LineProps) {
  const hasGapRepeats = gapRepeats != null && gapWidth != null && gapRepeats > 0

  return (
    <div style={lineWrapStyle}>
      {hasGapRepeats ? (
        <LineSegment
          asset={asset}
          width={COLUMN_WIDTH + gapWidth}
          repeats={gapRepeats}
          tileWidth={COLUMN_WIDTH}
        />
      ) : (
        <LineSegment asset={asset} width="100%" />
      )}
      {showStartCap && (
        <div style={{ ...capStyle, left: 0, transform: startCap ? startCapTransform : capStyle.transform }}>
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

function LineSegment({
  asset,
  width,
  repeats,
  tileWidth = COLUMN_WIDTH,
}: {
  asset?: string
  width: number | '100%'
  repeats?: number
  tileWidth?: number
}) {
  if (repeats != null && repeats > 1 && typeof width === 'number') {
    return (
      <div style={{ ...lineRepeatRowStyle, width }}>
        {Array.from({ length: repeats }, (_, index) => (
          <LineSegment key={index} asset={asset} width={tileWidth} />
        ))}
      </div>
    )
  }

  if (asset) {
    return (
      <img
        src={asset}
        alt=""
        aria-hidden="true"
        style={{
          ...lineImageStyle,
          width,
          ...(typeof width === 'number' ? { flexShrink: 0 } : {}),
        }}
      />
    )
  }

  return (
    <div
      style={{
        ...linePlaceholderStyle,
        width,
        ...(typeof width === 'number' ? { flexShrink: 0 } : {}),
      }}
    />
  )
}

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
        <img
          src={asset}
          alt=""
          aria-hidden="true"
          style={orientation === 'down' ? connectorImageFlippedStyle : connectorImageStyle}
        />
      ) : (
        <div style={connectorPlaceholderStyle} />
      )}
    </div>
  )
}

function TimelineBox({
  event,
  box,
  onOpen,
}: {
  event: TimelineEvent
  box?: TimelineAssets['box']
  onOpen: (event: TimelineEvent) => void
}) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const isLink = Boolean(event.href)
  const interactive = isLink || Boolean(event.imageSrc)

  const handleOpen = () => {
    if (isLink) navigate(event.href!)
    else if (event.imageSrc) onOpen(event)
  }

  return (
    <figure
      style={interactive ? { ...boxStyle, cursor: 'pointer' } : boxStyle}
      aria-label={event.date ? `${event.title} — ${event.date}` : event.title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleOpen()
        }
      }}
      role={interactive ? 'button' : undefined}
      tabIndex={0}
    >
      <figcaption style={boxCaptionStyle(hovered)}>
        <span style={boxTitleStyle}>{event.title}</span>
        {event.date && <span style={boxDateStyle}>{event.date}</span>}
        {event.description && <span style={boxDescriptionStyle}>{event.description}</span>}
      </figcaption>
      <div style={boxMediaStyle(hovered)}>
        <FramedArtwork event={event} box={box} hovered={hovered} fillHeight imageStyle={boxImageStyle} />
      </div>
    </figure>
  )
}

const rootStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
}

const scrollStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  overflowX: 'auto',
  overflowY: 'hidden',
}

const scrollbarHideCss = `
  .${SCROLL_CLASS} { scrollbar-width: none; -ms-overflow-style: none; }
  .${SCROLL_CLASS}::-webkit-scrollbar { display: none; }
`

const scrollbarWrapStyle: React.CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: SCROLLBAR_BOTTOM_INSET,
  width: '50%',
  transform: 'translateX(-50%)',
  height: SCROLLBAR_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  zIndex: 5,
  transition: 'opacity 200ms ease',
}

const scrollbarTrackImageStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  width: '100%',
  height: SCROLLBAR_TRACK_HEIGHT,
  opacity: 0.5,
  pointerEvents: 'none',
}

const scrollbarTrackFallbackStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  height: 2,
  borderRadius: 1,
  backgroundColor: LINE_COLOR,
  opacity: 0.5,
  pointerEvents: 'none',
}

const scrollbarThumbStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  height: SCROLLBAR_HEIGHT,
  cursor: 'grab',
  touchAction: 'none',
  outline: 'none',
}

const scrollbarThumbImageStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
}

const scrollbarThumbPlaceholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: SCROLLBAR_HEIGHT / 2,
  backgroundColor: ACCENT,
}

const contentStyle: React.CSSProperties = {
  minWidth: 'min-content',
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  paddingBottom: SCROLLBAR_BOTTOM_INSET + SCROLLBAR_HEIGHT + 14,
}

const trackStyle: React.CSSProperties = {
  flex: '1 0 auto',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  minWidth: 'min-content',
  padding: `0 64px 0 ${START_PADDING}px`,
}

const creditsRowStyle: React.CSSProperties = {
  minWidth: 'min-content',
  padding: `0 64px 0 ${START_PADDING}px`,
  marginTop: 8,
}

const creditsTextStyle: React.CSSProperties = {
  width: 'max-content',
  color: MUTED,
  fontSize: 15,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
}

const creditsLabelStyle: React.CSSProperties = {
  color: '#fff',
  fontWeight: 700,
}

const columnStyle: React.CSSProperties = {
  flex: '0 0 auto',
  width: COLUMN_WIDTH,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

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

const gapPointStyle = (tileIndex: number): React.CSSProperties => ({
  position: 'absolute',
  left: tileIndex * COLUMN_WIDTH + SEGMENT_HOLE_X,
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1,
})

const gapNodeStyle = (gapIndex: number): React.CSSProperties => ({
  position: 'absolute',
  left: gapIndex * COLUMN_WIDTH + SEGMENT_HOLE_X,
  top: '50%',
  transform: 'translateX(-50%)',
  paddingTop: POINT_SIZE / 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 2,
})

const lineWrapStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: 0,
  width: '100%',
  transform: 'translateY(-50%)',
}

const lineRepeatRowStyle: React.CSSProperties = {
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
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

const startCapTransform = 'translate(-92.24%, -50%)'

const capPlaceholderStyle: React.CSSProperties = {
  width: 0,
  height: 0,
  borderTop: '5px solid transparent',
  borderBottom: '5px solid transparent',
  borderLeft: `9px solid ${LINE_COLOR}`,
}

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

const connectorWrapStyle = (orientation: 'up' | 'down'): React.CSSProperties => ({
  width: 12,
  height: CONNECTOR_LENGTH,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  ...(orientation === 'up' ? { marginTop: CONNECTOR_GAP } : { marginBottom: CONNECTOR_GAP }),
})

const connectorImageStyle: React.CSSProperties = {
  display: 'block',
  width: 'auto',
  height: '100%',
}

const connectorImageFlippedStyle: React.CSSProperties = {
  ...connectorImageStyle,
  transform: 'scaleY(-1)',
}

const connectorPlaceholderStyle: React.CSSProperties = {
  width: 2,
  height: '100%',
  backgroundColor: LINE_COLOR,
}

const boxStyle: React.CSSProperties = {
  position: 'relative',
  margin: 0,
  width: BOX_WIDTH,
  outline: 'none',
}

const boxMediaStyle = (hovered: boolean): React.CSSProperties => ({
  position: 'relative',
  width: '100%',
  aspectRatio: `${BOX_RATIO}`,
  transform: hovered ? 'scale(1.05)' : 'scale(1)',
  transition: 'transform 220ms ease',
  transformOrigin: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

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

