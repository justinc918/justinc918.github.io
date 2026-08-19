const BASE = import.meta.env.BASE_URL
const VERTICAL = `${BASE}images/common/vertical.svg`
const ME = `${BASE}images/other/me.png`
const EMAIL_ICON = `${BASE}images/other/email.svg`

const ICON_COLOR = '#c4d3ff'

function GitHubIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={ICON_COLOR} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22 0 1.61-.02 2.9-.02 3.29 0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={ICON_COLOR} aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

function EmailIcon() {
  return <img src={EMAIL_ICON} alt="" width={30} height={30} style={{ display: 'block' }} aria-hidden="true" />
}

type LinkItem = {
  label: string
  href: string
  Icon: () => React.ReactElement
}

const LINKS: LinkItem[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/justin-chen-79256432b/', Icon: LinkedInIcon },
  { label: 'GitHub', href: 'https://github.com/justinc918', Icon: GitHubIcon },
  { label: 'Email', href: 'mailto:justinc918@g.ucla.edu', Icon: EmailIcon },
]

export default function Home() {
  return (
    <div className="page-scroll home-page" style={pageStyle}>
      <div className="home-content" style={contentStyle}>
        <div className="home-left-column" style={leftColumnStyle}>
          <img src={ME} alt="Justin" style={profileImageStyle} />
          <div className="home-links" style={linksStyle}>
            {LINKS.map((link) => {
              const isMail = link.href.startsWith('mailto:')
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={isMail ? undefined : '_blank'}
                  rel={isMail ? undefined : 'noopener noreferrer'}
                  aria-label={link.label}
                  style={linkStyle}
                >
                  <link.Icon />
                </a>
              )
            })}
          </div>
        </div>
        <img src={VERTICAL} alt="" aria-hidden="true" className="home-divider" style={dividerStyle} />
        <div className="home-right-column" style={rightColumnStyle}>
          <h1 className="home-name" style={nameStyle}>Hello, I'm Justin</h1>
          <p className="home-description" style={descriptionStyle}>
  I'm currently a rising junior at UCLA studying Computer Science, with a focus on machine learning and NLP. I am also a Kleiner Perkins Engineering Fellow and an officer for ACM ICPC at UCLA.
  <br />
  <br />
    Outside of my studies, research projects, and hackathon things (see Projects), I cook, gym, and draw. Do stop by the Artwork page for my creations.
    
    <br />
    <br />
    ! More stuff is coming at a later date, including my whiteboard drawings, and maybe another self portrait !
</p>
        </div>
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  overflowY: 'auto',
  padding: '48px 0',
}

const contentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 56,
  width: '80%',
  maxWidth: 1100,
  margin: 'auto',
}

const leftColumnStyle: React.CSSProperties = {
  flexShrink: 0,
  width: 300,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
}

const profileImageStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  objectFit: 'contain',
  borderRadius: 4,
  display: 'block',
}

const linksStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
}

const linkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#c4d3ff',
  textDecoration: 'none',
}

const dividerStyle: React.CSSProperties = {
  alignSelf: 'stretch',
  width: 4,
  minHeight: 0,
  objectFit: 'fill',
  flexShrink: 0,
  opacity: 0.5,
  pointerEvents: 'none',
}

const rightColumnStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
}

const nameStyle: React.CSSProperties = {
  color: '#c4d3ff',
  fontSize: 40,
  fontWeight: 700,
  letterSpacing: '0.02em',
  margin: 0,
}

const descriptionStyle: React.CSSProperties = {
  color: 'rgba(196,211,255,0.8)',
  fontSize: 18,
  fontWeight: 400,
  lineHeight: 1.6,
  margin: 0,
}
