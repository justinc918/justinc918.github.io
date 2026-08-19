import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useBreakpoint } from '../hooks/useBreakpoint'

const BASE = import.meta.env.BASE_URL
const RESUME_URL = `${BASE}files/JustinChenResumeF.pdf`
const SMALL_HORIZ = `${BASE}images/common/small_horiz.svg`
const LOGO = `${BASE}images/common/logo.png`

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

type NavItem = {
  label: string
  to?: string
  href?: string
  isActive: (pathname: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'About', to: '/', isActive: (pathname) => pathname === '/' },
  { label: 'Projects', to: '/projects', isActive: (pathname) => pathname.startsWith('/projects') },
  { label: 'Artwork', to: '/artwork/digital', isActive: (pathname) => pathname.startsWith('/artwork') },
  { label: 'FAQ', to: '/faq', isActive: (pathname) => pathname.startsWith('/faq') },
]

export default function TopBar() {
  const pathname = useLocation().pathname
  const isMobile = useBreakpoint('mobile')
  const artworkActive = pathname.startsWith('/artwork')
  const [menuOpen, setMenuOpen] = useState(false)

  const navRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const [indicator, setIndicator] = useState<Indicator>({ left: 0, width: 0, top: 0, visible: false })
  const [animated, setAnimated] = useState(false)

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

  useLayoutEffect(() => {
    if (isMobile) return

    if (!animated) {
      moveTo(0)
      const raf = requestAnimationFrame(() => {
        setAnimated(true)
        moveTo(activeIndex)
      })
      return () => cancelAnimationFrame(raf)
    }
    moveTo(activeIndex)
    const onResize = () => moveTo(activeIndex)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeIndex, moveTo, animated, isMobile])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const setItemRef = (index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el
  }

  return (
    <div style={isMobile ? mobileBarWrapperStyle : barWrapperStyle}>
      <NavLink to="/" end style={isMobile ? mobileLogoLinkStyle : logoLinkStyle} aria-label="Home">
        <img src={LOGO} alt="" style={logoStyle} />
      </NavLink>

      {isMobile ? (
        <>
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            style={menuButtonStyle}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span style={menuIconStyle} aria-hidden="true">
              {menuOpen ? '✕' : '☰'}
            </span>
          </button>
          {menuOpen && (
            <nav id="mobile-nav" style={mobileNavStyle}>
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to!}
                  end={item.to === '/'}
                  style={mobileNavItemStyle}
                  onClick={() => setMenuOpen(false)}
                >
                  {({ isActive }) => (
                    <span style={navLinkStyle({ isActive: item.isActive(pathname) || isActive })}>
                      {item.label}
                    </span>
                  )}
                </NavLink>
              ))}
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={mobileNavItemStyle}
                onClick={() => setMenuOpen(false)}
              >
                <span style={externalLinkStyle}>Resume</span>
              </a>
            </nav>
          )}
        </>
      ) : (
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
              transition: animated ? indicatorStyle.transition : 'none',
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
      )}
    </div>
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

const barWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 28px',
  flexShrink: 0,
  position: 'relative',
  zIndex: 200,
}

const mobileBarWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 20px',
  paddingTop: 'max(14px, env(safe-area-inset-top))',
  paddingLeft: 'max(20px, env(safe-area-inset-left))',
  paddingRight: 'max(20px, env(safe-area-inset-right))',
  flexShrink: 0,
  position: 'relative',
  zIndex: 200,
}

const logoLinkStyle: React.CSSProperties = {
  position: 'absolute',
  left: 28,
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
}

const mobileLogoLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
}

const logoStyle: React.CSSProperties = {
  height: 32,
  width: 'auto',
  display: 'block',
}

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 56,
  width: '100%',
  background: 'transparent',
  position: 'relative',
  textTransform: 'uppercase',
}

const menuButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 44,
  minHeight: 44,
  padding: 0,
  border: 'none',
  background: 'transparent',
  color: '#c4d3ff',
  cursor: 'pointer',
}

const menuIconStyle: React.CSSProperties = {
  fontSize: 22,
  lineHeight: 1,
}

const mobileNavStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(20, 24, 39, 0.97)',
  borderBottom: '1px solid rgba(196, 211, 255, 0.15)',
  textTransform: 'uppercase',
  zIndex: 201,
}

const mobileNavItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  minHeight: 48,
  padding: '0 20px',
  textDecoration: 'none',
}
