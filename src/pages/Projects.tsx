const BASE = import.meta.env.BASE_URL
const LONG_HORIZ = `${BASE}images/common/long_horiz.svg`

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.'

type Project = {
  title: string
  description: string
  hasImage?: boolean
}

const PROJECTS: Project[] = [
  { title: 'Canary', description: LOREM },
  { title: 'Argion', description: LOREM },
  { title: '35L Project', description: LOREM, hasImage: true },
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
                {project.hasImage && (
                  <div style={imagePlaceholderStyle}>
                    <span style={imagePlaceholderLabelStyle}>Add image here</span>
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
  gap: 16,
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

const imagePlaceholderStyle: React.CSSProperties = {
  width: '100%',
  height: 140,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px dashed rgba(196,211,255,0.4)',
  borderRadius: 4,
  backgroundColor: 'rgba(196,211,255,0.04)',
}

const imagePlaceholderLabelStyle: React.CSSProperties = {
  color: 'rgba(196,211,255,0.5)',
  fontSize: 14,
  letterSpacing: '0.03em',
}

const dividerStyle: React.CSSProperties = {
  display: 'block',
  width: '75%',
  height: 'auto',
  margin: '0 auto',
  pointerEvents: 'none',
}
