import { useRef, useState, useCallback, useEffect } from 'react'

interface ImageItem {
  id: string
  src: string
  x: number
  y: number
}

interface Props {
  images: ImageItem[]
}

interface Transform {
  x: number
  y: number
  scale: number
}

const MIN_SCALE = 0.1
const MAX_SCALE = 8
const CARD_WIDTH = 280

const INITIAL_TRANSFORM: Transform = { x: 0, y: 0, scale: 1 }
const TEXTURE_SRC = `${import.meta.env.BASE_URL}images/common/whiteboard.png`
const TEXTURE_TILE = 512

export default function Whiteboard({ images }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM)

  // Pan state tracked in a ref so event handlers never go stale
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()

    const rect = containerRef.current!.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setTransform(prev => {
      const delta = e.deltaY < 0 ? 1.1 : 0.9
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * delta))

      // Zoom toward the cursor position
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

  // ── Pan ───────────────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    // Only pan on the background (not on cards)
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

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
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
      {/* Canvas layer */}
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

// ── Image card ───────────────────────────────────────────────────────────────

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
