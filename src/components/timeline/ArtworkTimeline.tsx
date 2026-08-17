import { useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type TimelineEvent = {
  id: string
  title: string
  date: string // month and year, e.g. "March 2024"
  imageSrc?: string
  imageAlt?: string
  description?: string
}

// A 9-slice border: the source image is cut into 4 fixed corners, 4 stretchable
// (or tileable) edges, and a discarded center. Corners keep their pixel size at
// any box dimension; only the straight edges scale. This is how the frame is
// made to hug the image no matter its aspect ratio.
export type TimelineBoxBorder = {
  /** Frame image whose four corners stay fixed and whose edges stretch/tile. */
  src: string
  /**
   * Distance (in SOURCE-image px) from each edge inward to where the corner
   * ends. A single number applies to all four sides; pass
   * [top, right, bottom, left] for asymmetric art.
   */
  slice: number | [number, number, number, number]
  /** On-screen thickness of the border. Defaults to `slice` (single-number form). */
  width?: number
  /**
   * How the straight edge tile fills the gap between corners along its length
   * (the cross-axis thickness is always fixed at `width`, never scaled):
   *   - 'stretch': uniformly rescales the tile to fit — warps any pattern.
   *   - 'repeat':  tiles the source at native size, clipping the last copy.
   *   - 'round':   tiles at (near-)native size so a whole number always fits.
   * Pass a tuple to control axes independently, per the CSS spec order:
   * [top & bottom edges, left & right edges].
   */
  repeat?: BorderRepeatMode | [BorderRepeatMode, BorderRepeatMode]
  /** How far (px) the frame sits outside the image edge. Defaults to 0. */
  outset?: number
}

export type BorderRepeatMode = 'stretch' | 'repeat' | 'round'

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
  scrollbar?: {
    /**
     * Back-line (track) art. A single self-contained image stretched across the
     * whole scrollbar width, so an SVG should carry preserveAspectRatio="none".
     * Falls back to a thin CSS line when omitted.
     */
    track?: string
    /**
     * Draggable thumb art. Stretched to the thumb's on-screen box, so an SVG
     * should carry preserveAspectRatio="none" if it shouldn't distort-lock.
     * Falls back to a CSS placeholder rectangle when omitted.
     */
    thumb?: string
  }
  box?: {
    /** 9-slice frame that dynamically hugs the image. Preferred. */
    border?: TimelineBoxBorder
    /** Legacy single-image frame stretched over the image bounds. */
    frame?: string
    /**
     * Square backdrop drawn behind the image (and frame). Treated as a
     * 1000x1000px source that's non-uniformly stretched to match each
     * image's own rendered dimensions, same as the frame does.
     */
    backdrop?: string
  }
}

type TimelineProps = {
  events: TimelineEvent[]
  assets?: TimelineAssets
  credits?: React.ReactNode
}

// ─────────────────────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────────────────────

const LINE_COLOR = '#ccd8ff'
const ACCENT = '#c4d3ff'
const MUTED = 'rgba(196,211,255,0.8)'
const FAINT = 'rgba(196,211,255,0.4)'

const COLUMN_WIDTH = 320
const FIRST_GAP_EXTRA = 960 // widen the first column so the gap to the second event runs extra long
const FIRST_GAP_REPEATS = 4 // tile the segment this many times across the extra gap width
const BOX_RATIO = 4 / 3
const BOX_WIDTH = COLUMN_WIDTH - 64
const BOX_HEIGHT = BOX_WIDTH / BOX_RATIO
const CONNECTOR_GAP = 4 // space between connector and spine
const CONNECTOR_LENGTH = 26 // same stem length above and below the line
const LANE_HEIGHT = CONNECTOR_LENGTH + CONNECTOR_GAP + BOX_HEIGHT
const POINT_SIZE = 22
const CAPTION_WIDTH = 190 // caption sits to the left of the image
const START_PADDING = 240 // extra room so the first piece's caption fits
const LIGHTBOX_FRAME_SCALE = 2.6 // enlarges the frame's fixed corners in the popup

// Custom bottom scrollbar. The track reuses the timeline's line segment art,
// tiled at a shrunken size and 50% opacity; the thumb is a swappable rectangle.
const SCROLLBAR_HEIGHT = 14 // thumb on-screen thickness
const SCROLLBAR_TRACK_HEIGHT = 8 // back-line on-screen thickness
const SCROLLBAR_MIN_THUMB = 56 // keep the thumb grabbable even on huge timelines
const SCROLLBAR_BOTTOM_INSET = 22 // gap from the viewport bottom edge
const SCROLL_CLASS = 'artwork-timeline-scroll'

// ─────────────────────────────────────────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────────────────────────────────────────

export default function ArtworkTimeline({ events, assets, credits }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  // The event whose image is expanded into the fullscreen lightbox, or null.
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null)

  // Oldest (left) first: start pinned to the far left.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [events])

  // Translate a plain vertical mouse wheel into horizontal scrolling so mouse
  // users (who have no horizontal wheel) can move through the timeline. A
  // native non-passive listener is required because React's onWheel is passive
  // and can't call preventDefault. Trackpad horizontal gestures (deltaX) are
  // left untouched so two-axis input still feels natural.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return // nothing to scroll sideways
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return // real horizontal intent
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
          <TimelineLightbox
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

// ─────────────────────────────────────────────────────────────────────────────
// Scrollbar module (custom, draggable, pinned to the viewport bottom)
// ─────────────────────────────────────────────────────────────────────────────

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
  // Pixel geometry of the thumb, recomputed on scroll/resize so the bar mirrors
  // the scroll container exactly.
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

  // Drag the thumb: map horizontal pointer movement across the usable track
  // range onto the container's scrollable range.
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

  // Click anywhere on the track to jump the thumb's center to that point.
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

// ─────────────────────────────────────────────────────────────────────────────
// Column: one event = line segment + point + connector + box
// ─────────────────────────────────────────────────────────────────────────────

type ColumnProps = {
  event: TimelineEvent
  above: boolean
  isFirst: boolean
  isLast: boolean
  assets?: TimelineAssets
  onOpen: (event: TimelineEvent) => void
}

function TimelineColumn({ event, above, isFirst, isLast, assets, onOpen }: ColumnProps) {
  // The first column is widened by FIRST_GAP_EXTRA. Because its point and box
  // are centered, we shift them back left by half the extra width so the first
  // image keeps its original left offset and only the gap after it grows.
  const contentShift = isFirst ? -FIRST_GAP_EXTRA / 2 : 0
  const shiftStyle: React.CSSProperties = contentShift
    ? { transform: `translateX(${contentShift}px)` }
    : {}

  return (
    <div style={isFirst ? { ...columnStyle, width: COLUMN_WIDTH + FIRST_GAP_EXTRA } : columnStyle}>
      {/* Upper lane holds a box only when it points above the line */}
      <div style={{ ...laneStyle('up'), ...shiftStyle }}>
        {above && (
          <>
            <TimelineBox event={event} box={assets?.box} onOpen={onOpen} />
            <TimelineConnector asset={assets?.line?.connector} orientation="up" />
          </>
        )}
      </div>

      {/* Center spine: continuous line with a milestone point. The line spans
          the full (widened) column so it stays continuous; only the point is
          shifted back to its original position. */}
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
        <div style={shiftStyle}>
          <TimelinePoint asset={assets?.point?.marker} />
        </div>
      </div>

      {/* Lower lane holds a box only when it points below the line */}
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

// ─────────────────────────────────────────────────────────────────────────────
// Line module
// ─────────────────────────────────────────────────────────────────────────────

type LineProps = {
  asset?: string
  startCap?: string
  endCap?: string
  showStartCap: boolean
  showEndCap: boolean
  /** Tile the segment across the widened first-column gap instead of stretching once. */
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

// ─────────────────────────────────────────────────────────────────────────────
// Box module (artwork card)
// ─────────────────────────────────────────────────────────────────────────────

function TimelineBox({
  event,
  box,
  onOpen,
}: {
  event: TimelineEvent
  box?: TimelineAssets['box']
  onOpen: (event: TimelineEvent) => void
}) {
  const [hovered, setHovered] = useState(false)
  const border = box?.border
  const frame = box?.frame
  const backdrop = box?.backdrop
  const canOpen = Boolean(event.imageSrc)

  const handleOpen = () => {
    if (canOpen) onOpen(event)
  }

  return (
    <figure
      style={canOpen ? { ...boxStyle, cursor: 'pointer' } : boxStyle}
      aria-label={event.date ? `${event.title} — ${event.date}` : event.title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (canOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleOpen()
        }
      }}
      role={canOpen ? 'button' : undefined}
      tabIndex={0}
    >
      {/* Caption sits to the left of the image and fades in on hover. It is
          absolutely positioned so it never shifts the image layout. */}
      <figcaption style={boxCaptionStyle(hovered)}>
        <span style={boxTitleStyle}>{event.title}</span>
        {event.date && <span style={boxDateStyle}>{event.date}</span>}
        {event.description && <span style={boxDescriptionStyle}>{event.description}</span>}
      </figcaption>
      <div style={boxMediaStyle(hovered)}>
        {/* The frame wrapper shrink-wraps to the image's real rendered size, so
            whatever border it carries hugs the picture rather than the 4:3
            media box. Border priority: 9-slice > legacy frame > placeholder. */}
        <div style={frameWrapStyle(hovered, border)}>
          {backdrop && (
            <img src={backdrop} alt="" aria-hidden="true" style={backdropStyle(border)} />
          )}
          {frame && !border && (
            <img src={frame} alt="" aria-hidden="true" style={legacyFrameStyle} />
          )}
          {event.imageSrc ? (
            <img src={event.imageSrc} alt={event.imageAlt ?? event.title} style={boxImageStyle} />
          ) : (
            <div style={boxImagePlaceholderStyle}>
              <span style={boxPlaceholderLabelStyle}>Add image here</span>
            </div>
          )}
        </div>
      </div>
    </figure>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox module (fullscreen expanded artwork)
// ─────────────────────────────────────────────────────────────────────────────

function TimelineLightbox({
  event,
  box,
  onClose,
}: {
  event: TimelineEvent
  box?: TimelineAssets['box']
  onClose: () => void
}) {
  const border = box?.border
  const frame = box?.frame
  const backdrop = box?.backdrop

  // Close on Escape and lock background scroll while the popup is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div
      style={lightboxOverlayStyle}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={event.date ? `${event.title} — ${event.date}` : event.title}
    >
      <style>{lightboxKeyframes}</style>
      {/* Stop propagation so clicks on the artwork itself don't close the popup. */}
      <figure style={lightboxFigureStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...frameWrapStyle(false, border, LIGHTBOX_FRAME_SCALE), height: 'auto' }}>
          {backdrop && (
            <img
              src={backdrop}
              alt=""
              aria-hidden="true"
              style={backdropStyle(border, LIGHTBOX_FRAME_SCALE)}
            />
          )}
          {frame && !border && (
            <img src={frame} alt="" aria-hidden="true" style={legacyFrameStyle} />
          )}
          {event.imageSrc && (
            <img
              src={event.imageSrc}
              alt={event.imageAlt ?? event.title}
              style={lightboxImageStyle}
            />
          )}
        </div>
        {(event.title || event.date || event.description) && (
          <figcaption style={lightboxCaptionStyle}>
            {event.title && <span style={boxTitleStyle}>{event.title}</span>}
            {event.date && <span style={boxDateStyle}>{event.date}</span>}
            {event.description && <span style={boxDescriptionStyle}>{event.description}</span>}
          </figcaption>
        )}
      </figure>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

// Holds the scroll region plus the overlaid custom scrollbar. The scrollbar
// lives OUTSIDE the scrolling element so it stays pinned while content pans.
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

// The custom scrollbar replaces the native one, so hide the native bar (which
// macOS hides until scrolling anyway, and which would otherwise double up).
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

// Single-image back line stretched across the full scrollbar width at half
// strength for a subtle rail.
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

// Stacks the timeline track and the credits line into one vertically-centered
// column whose width is driven by the track, so both share a single horizontal
// scroll region. The bottom padding reserves the strip the custom scrollbar
// floats over, so the credits (the last row) land just above the bar.
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

// Wrap important words inside `credits` with this to make them stand out in the
// brighter accent blue, while surrounding text stays the muted blue.
export function CreditHighlight({ children }: { children: React.ReactNode }) {
  return <span style={{ color: ACCENT }}>{children}</span>
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

// The start-cap art's nose tip (its visual "end", the point that should meet
// the line) sits at ~92.2% of the image's own width rather than at its right
// edge, because the source SVG carries a little empty margin past the tip.
// Shifting left by that fraction of its own rendered width (a %, so it holds
// regardless of the fixed 12px render height) lands the tip exactly on the
// line's start instead of the image's left edge, so the head trails off to
// the left of the line rather than overlapping it.
const startCapTransform = 'translate(-92.24%, -50%)'

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

// The connector art is drawn for the top (up) case; flip it vertically for
// the bottom (down) case so any asymmetric detail (taper, arrow, etc.) points
// away from the spine on both sides instead of repeating the same direction.
const connectorImageFlippedStyle: React.CSSProperties = {
  ...connectorImageStyle,
  transform: 'scaleY(-1)',
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

// Shrink-wraps the image (image is height:100% / width:auto, so the wrapper
// takes the image's exact rendered box) and carries the border. This is what
// makes the frame track each image's real dimensions.
//   - 9-slice border  -> border-image (fixed corners, stretchable edges)
//   - no border art    -> a thin placeholder rectangle
// The border is drawn OUTSIDE the content (content-box), so the image still
// fills the full box height while the frame sits around it.
const frameWrapStyle = (
  hovered: boolean,
  border?: TimelineBoxBorder,
  // Multiplies the on-screen border thickness so the frame's fixed corners are
  // enlarged in the lightbox while the source slice stays the same.
  scale = 1,
): React.CSSProperties => {
  const base: React.CSSProperties = {
    position: 'relative',
    height: '100%',
    boxSizing: 'content-box',
    borderRadius: 4,
    transition: 'border-color 220ms ease',
    // Rasterize the tiled border-image into its own compositor layer so the
    // hover scale on the parent stretches this finished texture rather than
    // re-tiling the segments at a fractional size (which opens hairline gaps
    // between the repeated frame pieces).
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  }

  if (border) {
    const sliceValue = Array.isArray(border.slice) ? border.slice.join(' ') : `${border.slice}`
    const baseWidth = border.width ?? (Array.isArray(border.slice) ? border.slice[0] : border.slice)
    const width = baseWidth * scale
    return {
      ...base,
      borderStyle: 'solid',
      borderWidth: width,
      borderImageSource: `url(${border.src})`,
      borderImageSlice: sliceValue,
      borderImageWidth: `${width}px`,
      borderImageRepeat: Array.isArray(border.repeat)
        ? border.repeat.join(' ')
        : border.repeat ?? 'stretch',
      borderImageOutset: `${(border.outset ?? 0) * scale}px`,
    }
  }

  return {
    ...base,
    border: `1px solid ${hovered ? ACCENT : FAINT}`,
  }
}

// Legacy single-image frame: stretched over the (now image-sized) wrapper so it
// hugs the picture instead of the media box.
const legacyFrameStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 1,
}

// Square backdrop drawn behind the image AND the frame. `inset: 0` alone would
// only cover the content box (the image itself), leaving it invisible behind
// any transparent gaps in the frame's border art or outset — so when a 9-slice
// border is present, this expands outward by the border's on-screen width
// (plus outset) to also fill the area the frame sits over. It's stretched
// non-uniformly (no object-fit, sides pinned rather than width/height set) so
// the 1000x1000 source always fills the box exactly regardless of distortion.
// A negative z-index is required (not just a lower one) because the artwork
// <img> itself is unpositioned — per the stacking spec, positioned descendants
// always paint above static in-flow content unless they carry a negative
// stack level.
const backdropStyle = (border?: TimelineBoxBorder, scale = 1): React.CSSProperties => {
  const base: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: -1,
  }

  if (border) {
    const baseWidth = border.width ?? (Array.isArray(border.slice) ? border.slice[0] : border.slice)
    const expand = baseWidth * scale + (border.outset ?? 0) * scale
    return { ...base, top: -expand, right: -expand, bottom: -expand, left: -expand }
  }

  return { ...base, inset: 0, width: '100%', height: '100%' }
}

// Match the box height and preserve the image's native proportions; width
// scales automatically so nothing gets cropped or stretched.
const boxImageStyle: React.CSSProperties = {
  display: 'block',
  height: '100%',
  width: 'auto',
  objectFit: 'contain',
  borderRadius: 4,
}

const boxImagePlaceholderStyle: React.CSSProperties = {
  width: 200,
  maxWidth: '100%',
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
  color: ACCENT,
  fontSize: 14,
  fontWeight: 400,
  letterSpacing: '0.02em',
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

// Lightbox

const lightboxKeyframes = `@keyframes artworkLightboxFade { from { opacity: 0 } to { opacity: 1 } }`

const lightboxOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 20,
  padding: 32,
  backgroundColor: 'rgba(6,10,26,0.82)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  animation: 'artworkLightboxFade 180ms ease',
}

const lightboxFigureStyle: React.CSSProperties = {
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 18,
  maxWidth: '100%',
  maxHeight: '100%',
}

const lightboxImageStyle: React.CSSProperties = {
  display: 'block',
  maxWidth: '82vw',
  maxHeight: '78vh',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  borderRadius: 4,
}

const lightboxCaptionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 4,
  maxWidth: 620,
}

