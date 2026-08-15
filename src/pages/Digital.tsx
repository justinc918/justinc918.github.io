import ArtworkTimeline, { CreditHighlight as Hi, type TimelineEvent } from '../components/timeline/ArtworkTimeline'

const BASE = import.meta.env.BASE_URL
const CREDITS = (
  <>
    <Hi>Drawabox (drawabox.com):</Hi> Where I first learned to draw.{' '}
    <Hi>Proko (proko.com):</Hi> Figure drawing fundamentals, anatomy, and one-off tutorials.{' '}
    <Hi>Jeremy Fenske (artstation.com/jandrew):</Hi> Thanks for the brushes good sir.{' '}
    <Hi>FromSoftware (fromsoftware.jp):</Hi> One of my biggest sources of inspiration, and where some of my own characters originated.{' '}
    <Hi>Lastly,</Hi> the friends I sent my drawings to.
  </>
)

// Oldest first (left). Newest goes on the right as entries are appended.
const EVENTS: TimelineEvent[] = [
  {
    id: 'halfmoonbay',
    date: 'September 2024',
    title: 'Half Moon Bay',
    description: '☆ First ever digital drawing.',
    imageSrc: `${BASE}images/digital/halfmoonbay.webp`,
    imageAlt: 'Half Moon Bay',
  },
  {
    id: 'first_color',
    date: 'May 2025',
    title: 'First Color',
    description: '☆ First human I drew with color.',
    imageSrc: `${BASE}images/digital/first_color.webp`,
    imageAlt: 'First Color',
  },
  {
    id: 'asdfja',
    date: 'June 2025',
    title: '',
    description: '☆ First fanart. Also first drawing I am pretty embarrassed about :/.',
    imageSrc: `${BASE}images/digital/asdfja.webp`,
    imageAlt: 'Asdfja',
  },
  {
    id: 'selfp1',
    date: 'August 2025',
    title: 'Self Portrait',
    description: 'Some people said I look much older and more chopped in this portrait than in real life.',
    imageSrc: `${BASE}images/digital/selfp1.webp`,
    imageAlt: 'Self Portrait',
  },
  {
    id: 'nightfarers',
    date: 'December 2025',
    title: 'Nightfarers as the Night\'s Watch',
    description: '☆ Longest I\'ve spent on any drawing (30 hours).',
    imageSrc: `${BASE}images/digital/nightfarers.webp`,
    imageAlt: 'Nightfarers',
  },
  {
    id: 'faithchar_color',
    date: 'February 2026',
    title: 'Faith',
    description: '☆ First portrait that\'s not of myself.',
    imageSrc: `${BASE}images/digital/faithchar_color.webp`,
    imageAlt: 'Faith',
  },
  {
    id: 'strengthchar_color',
    date: 'February 2026',
    title: 'Strength',
    imageSrc: `${BASE}images/digital/strengthchar_color.webp`,
    imageAlt: 'Strength',
  },
  {
    id: 'harmonia_study',
    date: 'March 2026',
    title: 'Flowers Study',
    description: 'I drew this entirely during a Big ACM meeting. This was also a study for a certain whiteboard piece.',
    imageSrc: `${BASE}images/digital/Harmonia_study.webp`,
    imageAlt: 'Harmonia Study',
  },
  {
    id: 'jjk',
    date: 'May 2026',
    title: 'Toji',
    description: '☆ First thing I drew in 5-point perspective.',
    imageSrc: `${BASE}images/digital/jjk.webp`,
    imageAlt: 'JJK',
  },
  {
    id: 'caving',
    date: 'June 2026',
    title: 'Caving',
    imageSrc: `${BASE}images/digital/caving.webp`,
    imageAlt: 'Caving',
  },
  {
    id: 'artfight1',
    date: 'July 2026',
    title: 'Art Fight',
    description: '☆ The first and only attack I made for Art Fight 2026. Link: https://artfight.net/character/10597063.via',
    imageSrc: `${BASE}images/digital/artfight1.webp`,
    imageAlt: 'Art Fight',
  },
]

const ASSETS = {
  line: {
    segment: `${BASE}images/timeline/line/segment.svg`,
    startCap: `${BASE}images/timeline/line/start-cap.svg`,
    endCap: `${BASE}images/timeline/line/end-cap.svg`,
    connector: `${BASE}images/timeline/line/connector.svg`,
  },
  point: {
    marker: `${BASE}images/timeline/point/marker.svg`,
  },
  box: {
    border: {
      src: `${BASE}images/common/frame.svg`,
      slice: 16,
      width: 16,
      // The edge art is just straight lines running along each side, so we
      // 'stretch' rather than tile it. Stretching a straight line lengthwise
      // looks identical but has no tile boundaries, so no hairline gaps open
      // up between segments when the frame is scaled on hover.
      repeat: 'stretch' as const,
    },
  },
}

export default function Digital() {
  return (
    <div style={pageStyle}>
      <ArtworkTimeline events={EVENTS} assets={ASSETS} credits={CREDITS} />
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
}
