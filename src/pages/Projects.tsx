const BASE = import.meta.env.BASE_URL
const LONG_HORIZ = `${BASE}images/common/long_horiz.svg`
const VIETCONG = `${BASE}images/other/vietcong.png`

const ICON_COLOR = '#c4d3ff'

function GitHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={ICON_COLOR} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22 0 1.61-.02 2.9-.02 3.29 0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z"
      />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

type Project = {
  title: string
  description: string
  href: string
  liveHref?: string
  image?: string
}

const PROJECTS: Project[] = [
  { title: 'Canary', description: 'Canary is a tool that lets users track their AI agent\'s development and roll back to previous versions in case of behavior issues. So in a nutshell, version control for agents. Made for LAHacks 2026. \\o to my teammates Rithvik, Arnav, and Bryan!', href: 'https://github.com/arnav0202006/Canary' },
  { title: 'Argion', description: 'Argion is an all-in-one app for monitoring asteroids. Included are AI-driven classifications for asteroid severity and the best ways for astronomers to observe them, including locations and telescope settings. We also included some fun features like how you could theoretically travel to other planets by shooting off asteroids. Made for Berkeley AI Hackathon 2026. \\o to my teammates Arnav (a different one) and William!', href: 'https://github.com/justinc918/Argion' },
  { title: '35L Project', description: 'Our team project for the infamous UCLA CS 35L course. We built a website featuring two rather obscure card games. We support multiplayer, stats tracking, and match recording. Check it out, the site\'s still online: https://35-lproject.vercel.app. \\o to my teammates Tyler, Ethan, Prabhvir, and Tejas!', href: 'https://github.com/lordboba/35Lproject', liveHref: 'https://35-lproject.vercel.app/app/lobby', image: VIETCONG },
]

export default function Projects() {
  return (
    <div style={pageStyle}>
      {PROJECTS.map((project, index) => (
        <div key={project.title} style={{ display: 'contents' }}>
          {index > 0 && (
            <img src={LONG_HORIZ} alt="" aria-hidden="true" style={dividerStyle} />
          )}
          <section style={sectionStyle}>
            <div style={contentStyle}>
              <div style={titleColumnStyle}>
                <h2 style={titleStyle}>{project.title}</h2>
                <div style={iconRowStyle}>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} on GitHub`}
                    style={linkStyle}
                  >
                    <GitHubIcon />
                  </a>
                  {project.liveHref && (
                    <a
                      href={project.liveHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} live site`}
                      style={linkStyle}
                    >
                      <ExternalLinkIcon />
                    </a>
                  )}
                </div>
                {project.image && (
                  <div style={imageFrameStyle}>
                    <img src={project.image} alt={`${project.title} preview`} style={imageStyle} />
                  </div>
                )}
              </div>
              <p style={descriptionStyle}>{project.description}</p>
            </div>
          </section>
        </div>
      ))}
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'safe center',
  overflowY: 'auto',
  padding: '48px 0',
}

const sectionStyle: React.CSSProperties = {
  width: '100%',
  padding: '32px 0',
}

const contentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 48,
  width: '75%',
  margin: '0 auto',
}

const titleColumnStyle: React.CSSProperties = {
  flexShrink: 0,
  width: 220,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 10,
}

const iconRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

const linkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: ICON_COLOR,
  textDecoration: 'none',
}

const titleStyle: React.CSSProperties = {
  color: '#c4d3ff',
  fontSize: 30,
  fontWeight: 700,
  letterSpacing: '0.02em',
  margin: 0,
}

const descriptionStyle: React.CSSProperties = {
  flex: 1,
  color: 'rgba(196,211,255,0.8)',
  fontSize: 18,
  fontWeight: 400,
  lineHeight: 1.6,
  margin: 0,
}

const imageFrameStyle: React.CSSProperties = {
  width: '100%',
  padding: 8,
  border: '1px solid rgba(196,211,255,0.4)',
  borderRadius: 4,
}

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
  borderRadius: 4,
}

const dividerStyle: React.CSSProperties = {
  display: 'block',
  width: '75%',
  height: 'auto',
  margin: '0 auto',
  pointerEvents: 'none',
}
