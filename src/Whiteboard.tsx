import { useRef, useState, useCallback, useEffect } from 'react'

interface ImageItem {
  id: string
  src: string
  x: number
  y: number
}

interface SectionItem {
  id: string
  src: string
}

interface SectionSpec {
  id: string
  items: SectionItem[]
  columns?: number
  /** Extra vertical offset from viewport center, in px. Positive moves it down. */
  offsetY?: number
}

interface Props {
  images?: ImageItem[]
  sections?: SectionSpec[]
}

interface Transform {
  x: number
  y: number
  scale: number
}

const MIN_SCALE = 0.1
const MAX_SCALE = 8
const CARD_WIDTH = 280

// Grouped artwork section: uniform frames arranged in a grid, edges touching.
const FRAME_WIDTH = 260
const FRAME_HEIGHT = 360
const FRAME_GAP = 0
const FRAME_PADDING = 12
const SECTION_COLUMNS = 2
const SECTION_OFFSET_Y = 70
// Editable placeholder texture for the frame edges/backing.
const FRAME_TEXTURE_SRC = `${import.meta.env.BASE_URL}images/common/frame_texture.png`

const INITIAL_TRANSFORM: Transform = { x: 0, y: 0, scale: 1 }
const TEXTURE_SRC = `${import.meta.env.BASE_URL}images/common/whiteboard.png`
const TEXTURE_TILE = 512

export default function Whiteboard({ images = [], sections = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setViewport({ width: el.clientWidth, height: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()

    const rect = containerRef.current!.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setTransform(prev => {
      const delta = e.deltaY < 0 ? 1.05 : 0.95
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * delta))

      const scaleRatio = nextScale / prev.scale
      return {
        scale: nextScale,
        x: mouseX - scaleRatio * (mouseX - prev.x),
        y: mouseY - scaleRatio * (mouseY - prev.y),
      }
    })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-card]')) return
    isPanning.current = true
    lastPointer.current = { x: e.clientX, y: e.clientY }
    containerRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPanning.current) return
    const dx = e.clientX - lastPointer.current.x
    const dy = e.clientY - lastPointer.current.y
    lastPointer.current = { x: e.clientX, y: e.clientY }
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
  }

  const onPointerUp = () => { isPanning.current = false }

  const resetCamera = useCallback(() => {
    setTransform(INITIAL_TRANSFORM)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        resetCamera()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resetCamera])

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isPanning.current ? 'grabbing' : 'grab',
        backgroundColor: 'rgb(239, 239, 232)',
        backgroundImage: `url(${TEXTURE_SRC})`,
        backgroundRepeat: 'repeat',
        backgroundPosition: `${transform.x}px ${transform.y}px`,
        backgroundSize: `${TEXTURE_TILE * transform.scale}px ${TEXTURE_TILE * transform.scale}px`,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transformOrigin: '0 0',
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          willChange: 'transform',
        }}
      >
        {images.map(img => (
          <ImageCard key={img.id} item={img} />
        ))}
        {viewport.width > 0 &&
          sections.map(spec => (
            <SectionGroup key={spec.id} spec={spec} viewport={viewport} />
          ))}
      </div>

      <button
        type="button"
        onPointerDown={e => e.stopPropagation()}
        onClick={resetCamera}
        style={resetButtonStyle}
      >
        Reset
      </button>
    </div>
  )
}

function ImageCard({ item }: { item: ImageItem }) {
  return (
    <img
      data-card
      src={item.src}
      alt={item.id}
      draggable={false}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: CARD_WIDTH,
        height: 'auto',
        display: 'block',
      }}
    />
  )
}

function SectionGroup({
  spec,
  viewport,
}: {
  spec: SectionSpec
  viewport: { width: number; height: number }
}) {
  const columns = spec.columns ?? SECTION_COLUMNS
  const rows = Math.ceil(spec.items.length / columns)
  const sectionWidth = columns * FRAME_WIDTH + (columns - 1) * FRAME_GAP
  const sectionHeight = rows * FRAME_HEIGHT + (rows - 1) * FRAME_GAP

  // Center horizontally, sit slightly below the vertical center of the viewport.
  const left = (viewport.width - sectionWidth) / 2
  const top = (viewport.height - sectionHeight) / 2 + (spec.offsetY ?? SECTION_OFFSET_Y)

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, ${FRAME_WIDTH}px)`,
        gap: FRAME_GAP,
      }}
    >
      {spec.items.map(item => (
        <div
          key={item.id}
          data-card
          style={{
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            // Editable placeholder texture for the frame edges/backing.
            backgroundColor: '#000',
            backgroundImage: `url(${FRAME_TEXTURE_SRC})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: FRAME_PADDING,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={item.src}
            alt={item.id}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      ))}
    </div>
  )
}

const resetButtonStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 20,
  left: 20,
  background: 'rgba(0,0,0,0.05)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(0,0,0,0.1)',
  color: 'rgba(0,0,0,0.55)',
  fontSize: 12,
  padding: '6px 14px',
  borderRadius: 20,
  letterSpacing: '0.03em',
  cursor: 'pointer',
  zIndex: 100,
}
