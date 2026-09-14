import { useEffect } from 'react'
import { useBreakpoint } from '../../hooks/useBreakpoint'

export type TimelineEvent = {
  id: string
  title: string
  date: string
  imageSrc?: string
  imageAlt?: string
  description?: string
  /** When set, clicking the artwork navigates to this in-app route instead of opening the lightbox. */
  href?: string
}

export type TimelineBoxBorder = {
  src: string
  slice: number | [number, number, number, number]
  width?: number
  repeat?: BorderRepeatMode | [BorderRepeatMode, BorderRepeatMode]
  outset?: number
}

export type BorderRepeatMode = 'stretch' | 'repeat' | 'round'

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
    track?: string
    thumb?: string
  }
  box?: {
    border?: TimelineBoxBorder
    frame?: string
    backdrop?: string
  }
}

export const ACCENT = '#c4d3ff'
export const MUTED = 'rgba(196,211,255,0.8)'
export const FAINT = 'rgba(196,211,255,0.4)'

export const LIGHTBOX_FRAME_SCALE = 2.6

export function CreditHighlight({ children }: { children: React.ReactNode }) {
  return <span style={{ color: ACCENT }}>{children}</span>
}

export const boxDateStyle: React.CSSProperties = {
  color: ACCENT,
  fontSize: 14,
  fontWeight: 400,
  letterSpacing: '0.02em',
}

export const boxTitleStyle: React.CSSProperties = {
  color: ACCENT,
  fontSize: 20,
  fontWeight: 700,
  letterSpacing: '0.02em',
}

export const boxDescriptionStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: 15,
  lineHeight: 1.5,
}

const legacyFrameStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 1,
}

export const boxImageStyle: React.CSSProperties = {
  display: 'block',
  height: '100%',
  width: 'auto',
  objectFit: 'contain',
  borderRadius: 4,
}

export function frameWrapStyle(
  hovered: boolean,
  border?: TimelineBoxBorder,
  scale = 1,
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'relative',
    height: '100%',
    boxSizing: 'content-box',
    borderRadius: 4,
    transition: 'border-color 220ms ease',
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

export function backdropStyle(border?: TimelineBoxBorder, scale = 1): React.CSSProperties {
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

type FramedArtworkProps = {
  event: TimelineEvent
  box?: TimelineAssets['box']
  hovered?: boolean
  frameScale?: number
  imageStyle?: React.CSSProperties
  placeholderMinWidth?: number
  /** When true, frame wrapper fills the parent height (horizontal timeline cards). */
  fillHeight?: boolean
  loading?: 'lazy' | 'eager'
}

export function FramedArtwork({
  event,
  box,
  hovered = false,
  frameScale = 1,
  imageStyle = boxImageStyle,
  placeholderMinWidth = 200,
  fillHeight = false,
  loading = 'eager',
}: FramedArtworkProps) {
  const border = box?.border
  const frame = box?.frame
  const backdrop = box?.backdrop

  return (
    <div
      style={{
        ...frameWrapStyle(hovered, border, frameScale),
        height: fillHeight ? '100%' : 'auto',
      }}
    >
      {backdrop && (
        <img src={backdrop} alt="" aria-hidden="true" style={backdropStyle(border, frameScale)} />
      )}
      {frame && !border && (
        <img src={frame} alt="" aria-hidden="true" style={legacyFrameStyle} />
      )}
      {event.imageSrc ? (
        <img
          src={event.imageSrc}
          alt={event.imageAlt ?? event.title}
          style={imageStyle}
          loading={loading}
          decoding="async"
        />
      ) : (
        <div
          style={{
            width: placeholderMinWidth,
            maxWidth: '100%',
            minHeight: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            backgroundColor: 'rgba(196,211,255,0.04)',
          }}
        >
          <span style={{ color: 'rgba(196,211,255,0.5)', fontSize: 14, letterSpacing: '0.03em' }}>
            Add image here
          </span>
        </div>
      )}
    </div>
  )
}

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

export function ArtworkLightbox({
  event,
  box,
  onClose,
}: {
  event: TimelineEvent
  box?: TimelineAssets['box']
  onClose: () => void
}) {
  const isMobile = useBreakpoint('mobile')

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

  const label = event.date ? `${event.title} — ${event.date}` : event.title

  return (
    <div
      style={lightboxOverlayStyle}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <style>{lightboxKeyframes}</style>
      {/* On mobile, let taps on the artwork bubble up so touching anywhere closes
          the lightbox. On desktop, keep clicks on the artwork from closing it. */}
      <figure
        style={lightboxFigureStyle}
        onClick={isMobile ? undefined : (e) => e.stopPropagation()}
      >
        <FramedArtwork
          event={event}
          box={box}
          frameScale={LIGHTBOX_FRAME_SCALE}
          imageStyle={lightboxImageStyle}
        />
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
