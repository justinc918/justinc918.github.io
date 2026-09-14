import { useRef, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface ImageItem {
  id: string
  src: string
  x: number
  y: number
  width?: number
  height?: number
}

interface SectionItem {
  id: string
  src: string
}

interface SectionSpec {
  id: string
  x: number
  y: number
  items: SectionItem[]
  rows?: number
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

const MIN_SCALE = 0.5
const MAX_SCALE = 8
const CARD_WIDTH = 280

// Grouped artwork section: uniform frames arranged in a grid, edges touching.
const FRAME_WIDTH = 260
const FRAME_HEIGHT = 360
const FRAME_GAP = 0
const FRAME_PADDING = 12
const SECTION_ROWS = 2
// Editable placeholder texture for the frame edges/backing.
const FRAME_TEXTURE_SRC = `${import.meta.env.BASE_URL}images/common/frame_texture.png`

const INITIAL_TRANSFORM: Transform = { x: 0, y: 0, scale: MIN_SCALE }
const TEXTURE_SRC = `${import.meta.env.BASE_URL}images/common/whiteboard.png`
const TEXTURE_TILE = 512

// Responsive UI sizing for the fixed corner buttons. The buttons keep their
// current look at the reference viewport width and scale up/down from there,
// clamped so they never get too small or too large.
const UI_BASE_WIDTH = 1440
const UI_MIN_SCALE = 0.7
const UI_MAX_SCALE = 1.4

// Rendered width of the return button image (anchored bottom-left). Treated as
// a square for positioning the reset button in its empty (upper-right) corner.
const RETURN_WIDTH = 312

function getUiScale() {
  if (typeof window === 'undefined') return 1
  const raw = window.innerWidth / UI_BASE_WIDTH
  return Math.min(UI_MAX_SCALE, Math.max(UI_MIN_SCALE, raw))
}

export default function Whiteboard({ images = [], sections = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM)
  const [uiScale, setUiScale] = useState<number>(getUiScale)
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onResize = () => setUiScale(getUiScale())
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
        {sections.map(spec => (
          <SectionGroup key={spec.id} spec={spec} />
        ))}
      </div>

      <button
        type="button"
        aria-label="Reset view"
        onPointerDown={e => e.stopPropagation()}
        onClick={resetCamera}
        style={{
          ...resetButtonStyle,
          left: RETURN_WIDTH * 0.55 * uiScale,
          bottom: RETURN_WIDTH * 0.02 * uiScale,
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/common/zoom.svg`}
          alt=""
          draggable={false}
          style={{ display: 'block', width: 48 * uiScale, height: 48 * uiScale }}
        />
      </button>

      <button
        type="button"
        aria-label="Back to artwork"
        onPointerDown={e => e.stopPropagation()}
        onClick={() => navigate('/artwork/digital')}
        style={returnButtonStyle}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/common/whiteboard_return.png`}
          alt=""
          draggable={false}
          style={{ display: 'block', width: RETURN_WIDTH * uiScale * 0.70, height: 'auto' }}
        />
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
        width: item.width ?? CARD_WIDTH,
        height: item.height ?? 'auto',
        display: 'block',
      }}
    />
  )
}

function SectionGroup({ spec }: { spec: SectionSpec }) {
  const rows = spec.rows ?? SECTION_ROWS

  return (
    <div
      style={{
        position: 'absolute',
        left: spec.x,
        top: spec.y,
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateRows: `repeat(${rows}, ${FRAME_HEIGHT}px)`,
        gridAutoColumns: `${FRAME_WIDTH}px`,
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
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  zIndex: 101,
}

// Clip the return button to its visible navy triangle so its click region
// matches the artwork (the rest of the PNG is fully transparent). Percent-based
// so it stays aligned at any scale. Traced from the image's opaque boundary.
const RETURN_CLIP_PATH =
  'polygon(0% 16%, 0% 100%, 81% 100%, 76% 90%, 72% 80%, 59% 70%, 48% 60%, 25% 50%, 17% 40%, 13% 30%, 7% 20%)'

const returnButtonStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  background: 'none',
  border: 'none',
  padding: 0,
  display: 'block',
  cursor: 'pointer',
  clipPath: RETURN_CLIP_PATH,
  zIndex: 100,
}
