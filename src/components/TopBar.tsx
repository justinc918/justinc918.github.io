import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const BASE = import.meta.env.BASE_URL
const RESUME_URL = `${BASE}files/JustinChenResumeF.pdf`
const SMALL_HORIZ = `${BASE}images/common/small_horiz.svg`

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  color: isActive ? '#c4d3ff' : 'rgba(196,211,255,0.75)',
  textDecoration: 'none',
  fontSize: 18,
  letterSpacing: '0.03em',
  fontWeight: isActive ? 500 : 400,
})

const externalLinkStyle: React.CSSProperties = {
  color: 'rgba(196,211,255,0.75)',
  textDecoration: 'none',
  fontSize: 18,
  letterSpacing: '0.03em',
}

type Indicator = { left: number; width: number; top: number; visible: boolean }

export default function TopBar() {
  const pathname = useLocation().pathname
  const artworkActive = pathname.startsWith('/artwork')

  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const [indicator, setIndicator] = useState<Indicator>({ left: 0, width: 0, top: 0, visible: false })

  // Index of the nav item that matches the current route (the "resting" position).
  const activeIndex =
    pathname === '/' ? 0
    : pathname.startsWith('/projects') ? 1
    : artworkActive ? 2
    : pathname.startsWith('/faq') ? 3
    : -1

  const moveTo = useCallback((index: number) => {
    const nav = navRef.current
    const el = index >= 0 ? itemRefs.current[index] : null
    if (!nav || !el) {
      setIndicator((prev) => ({ ...prev, visible: false }))
      return
    }
    const navRect = nav.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    // Fixed width: the widest of the five items, so the underline never resizes.
    const maxWidth = Math.max(
      ...itemRefs.current.map((item) => item?.getBoundingClientRect().width ?? 0),
    )
    const center = rect.left - navRect.left + rect.width / 2
    setIndicator({
      left: center - maxWidth / 2,
      width: maxWidth,
      top: rect.bottom - navRect.top + 4,
      visible: true,
    })
  }, [])

  // Rest under the active route item; re-measure on route change / resize.
  useLayoutEffect(() => {
    moveTo(activeIndex)
    const onResize = () => moveTo(activeIndex)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeIndex, moveTo])

  const setItemRef = (index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el
  }

  return (
    <nav
      ref={navRef}
      style={barStyle}
      onMouseLeave={() => moveTo(activeIndex)}
    >
      <img
        src={SMALL_HORIZ}
        alt=""
        aria-hidden="true"
        style={{
          ...indicatorStyle,
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
          top: indicator.top,
          opacity: indicator.visible ? 1 : 0,
        }}
      />
      <NavLink
        to="/"
        end
        ref={setItemRef(0)}
        style={navItemStyle}
        onMouseEnter={() => moveTo(0)}
      >
        {({ isActive }) => <span style={navLinkStyle({ isActive })}>About</span>}
      </NavLink>
      <NavLink
        to="/projects"
        ref={setItemRef(1)}
        style={navItemStyle}
        onMouseEnter={() => moveTo(1)}
      >
        {({ isActive }) => <span style={navLinkStyle({ isActive })}>Projects</span>}
      </NavLink>
      <NavLink
        to="/artwork/digital"
        ref={setItemRef(2)}
        style={navItemStyle}
        onMouseEnter={() => moveTo(2)}
      >
        <span style={navLinkStyle({ isActive: artworkActive })}>Artwork</span>
      </NavLink>
      <NavLink
        to="/faq"
        ref={setItemRef(3)}
        style={navItemStyle}
        onMouseEnter={() => moveTo(3)}
      >
        {({ isActive }) => <span style={navLinkStyle({ isActive })}>FAQ</span>}
      </NavLink>
      <a
        href={RESUME_URL}
        target="_blank"
        rel="noopener noreferrer"
        ref={setItemRef(4)}
        style={{ ...navItemStyle, ...externalLinkStyle }}
        onMouseEnter={() => moveTo(4)}
      >
        Resume
      </a>
    </nav>
  )
}

const navItemStyle: React.CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  textDecoration: 'none',
}

const indicatorStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  height: 'auto',
  pointerEvents: 'none',
  transition: 'transform 1.00s cubic-bezier(0.22, 1, 0.36, 1), width 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease',
  willChange: 'transform, width',
}

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 56,
  padding: '14px 28px',
  background: 'transparent',
  flexShrink: 0,
  position: 'relative',
  zIndex: 200,
  textTransform: 'uppercase',
}
