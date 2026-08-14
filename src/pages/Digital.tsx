import ArtworkTimeline, { type TimelineEvent } from '../components/timeline/ArtworkTimeline'

const BASE = import.meta.env.BASE_URL
const CREDITS = 'Artwork by Justin Chen.'

// Oldest first (left). Newest goes on the right as entries are appended.
const EVENTS: TimelineEvent[] = [
  {
    id: 'halfmoonbay',
    date: '',
    title: 'Half Moon Bay',
    imageSrc: `${BASE}images/digital/halfmoonbay.webp`,
    imageAlt: 'Half Moon Bay',
  },
  {
    id: 'first_color',
    date: '',
    title: 'First Color',
    imageSrc: `${BASE}images/digital/first_color.webp`,
    imageAlt: 'First Color',
  },
  {
    id: 'asdfja',
    date: '',
    title: 'Asdfja',
    imageSrc: `${BASE}images/digital/asdfja.webp`,
    imageAlt: 'Asdfja',
  },
  {
    id: 'selfp1',
    date: '',
    title: 'Self Portrait',
    imageSrc: `${BASE}images/digital/selfp1.webp`,
    imageAlt: 'Self Portrait',
  },
  {
    id: 'nightfarers',
    date: '',
    title: 'Nightfarers',
    imageSrc: `${BASE}images/digital/nightfarers.webp`,
    imageAlt: 'Nightfarers',
  },
  {
    id: 'faithchar_color',
    date: '',
    title: 'Faith',
    imageSrc: `${BASE}images/digital/faithchar_color.webp`,
    imageAlt: 'Faith',
  },
  {
    id: 'strengthchar_color',
    date: '',
    title: 'Strength',
    imageSrc: `${BASE}images/digital/strengthchar_color.webp`,
    imageAlt: 'Strength',
  },
  {
    id: 'harmonia_study',
    date: '',
    title: 'Harmonia Study',
    imageSrc: `${BASE}images/digital/Harmonia_study.webp`,
    imageAlt: 'Harmonia Study',
  },
  {
    id: 'jjk',
    date: '',
    title: 'JJK',
    imageSrc: `${BASE}images/digital/jjk.webp`,
    imageAlt: 'JJK',
  },
  {
    id: 'caving',
    date: '',
    title: 'Caving',
    imageSrc: `${BASE}images/digital/caving.webp`,
    imageAlt: 'Caving',
  },
  {
    id: 'artfight1',
    date: '',
    title: 'Art Fight',
    imageSrc: `${BASE}images/digital/artfight1.webp`,
    imageAlt: 'Art Fight',
  },
]

export default function Digital() {
  return (
    <div style={pageStyle}>
      <div style={timelineStyle}>
        <ArtworkTimeline events={EVENTS} />
      </div>
      <div style={creditsBoxStyle}>
        <p style={creditsTextStyle}>
          <strong style={creditsLabelStyle}>Credits</strong> {CREDITS}
        </p>
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const timelineStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
}

const creditsBoxStyle: React.CSSProperties = {
  flex: '0 0 auto',
  margin: '0 40px 24px',
  padding: '12px 16px',
  overflowX: 'auto',
  overflowY: 'hidden',
  borderRadius: 4,
  backgroundColor: 'rgba(20, 24, 39, 0.45)',
}

const creditsTextStyle: React.CSSProperties = {
  width: 'max-content',
  color: 'rgba(255, 255, 255, 0.78)',
  fontSize: 15,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
}

const creditsLabelStyle: React.CSSProperties = {
  color: '#fff',
  fontWeight: 700,
}
