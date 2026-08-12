import { useLayoutEffect, useRef, useState } from 'react'
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

function ActiveIndicator({ width }: { width: number }) {
  return (
    <img
      src={SMALL_HORIZ}
      alt=""
      aria-hidden="true"
      style={{ ...activeIndicatorStyle, width }}
    />
  )
}

const externalLinkStyle: React.CSSProperties = {
  color: 'rgba(196,211,255,0.75)',
  textDecoration: 'none',
  fontSize: 18,
  letterSpacing: '0.03em',
}

export default function TopBar() {
  const [artworkOpen, setArtworkOpen] = useState(false)
  const artworkActive = useLocation().pathname.startsWith('/artwork')
  const artworkLabelRef = useRef<HTMLSpanElement>(null)
  const [indicatorWidth, setIndicatorWidth] = useState<number>()

  useLayoutEffect(() => {
    const el = artworkLabelRef.current
    if (!el) return
    setIndicatorWidth(el.offsetWidth)
  }, [])

  return (
    <nav style={barStyle}>
      <NavLink to="/" style={navItemStyle} end>
        {({ isActive }) => (
          <>
            <span style={navLinkStyle({ isActive })}>About</span>
            {isActive && indicatorWidth != null && <ActiveIndicator width={indicatorWidth} />}
          </>
        )}
      </NavLink>
      <NavLink to="/projects" style={navItemStyle}>
        {({ isActive }) => (
          <>
            <span style={navLinkStyle({ isActive })}>Projects</span>
            {isActive && indicatorWidth != null && <ActiveIndicator width={indicatorWidth} />}
          </>
        )}
      </NavLink>
      <div
        style={navItemStyle}
        onMouseEnter={() => setArtworkOpen(true)}
        onMouseLeave={() => setArtworkOpen(false)}
      >
        <span
          ref={artworkLabelRef}
          style={{ ...artworkLabelStyle, color: artworkActive ? '#c4d3ff' : artworkLabelStyle.color, fontWeight: artworkActive ? 500 : 400 }}
        >
          Artwork
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" style={artworkArrowStyle}>
            <path
              d="M1 1 L5 5 L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {artworkActive && indicatorWidth != null && <ActiveIndicator width={indicatorWidth} />}
        {artworkOpen && (
          <div style={dropdownStyle}>
            <NavLink
              to="/artwork/digital"
              style={navLinkStyle}
              onClick={() => setArtworkOpen(false)}
            >
              Digital
            </NavLink>
            <span style={disabledNavItemStyle}>
              Whiteboard (WIP)
            </span>
          </div>
        )}
      </div>
      <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" style={externalLinkStyle}>
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

const activeIndicatorStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  height: 'auto',
  marginTop: 4,
  pointerEvents: 'none',
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

const artworkLabelStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  color: 'rgba(196,211,255,0.75)',
  fontSize: 18,
  letterSpacing: '0.03em',
  cursor: 'default',
}

const artworkArrowStyle: React.CSSProperties = {
  flexShrink: 0,
  marginTop: 2,
}

const disabledNavItemStyle: React.CSSProperties = {
  color: 'rgba(196,211,255,0.4)',
  fontSize: 18,
  letterSpacing: '0.03em',
  cursor: 'default',
}

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: '12px 16px',
  background: 'transparent',
  minWidth: 120,
}
