import Whiteboard from '../Whiteboard'

const BASE = import.meta.env.BASE_URL

const IMAGES = [
  { id: 'harmonia', src: `${BASE}images/whiteboard/harmonia.webp`, x: 620, y: 80 },
  { id: 'tswltw',   src: `${BASE}images/whiteboard/tswltw.webp`,   x: 340, y: 420 },
]

const SECTIONS = [
  {
    id: 'grid',
    columns: 2,
    items: [
      { id: 'fulghor',  src: `${BASE}images/whiteboard/fulghor.webp`  },
      { id: 'florence', src: `${BASE}images/whiteboard/florence.webp` },
      { id: 'bayle',    src: `${BASE}images/whiteboard/bayle.webp`    },
      { id: 'dragons',  src: `${BASE}images/whiteboard/dragons.webp`  },
    ],
  },
]

export default function WhiteboardPage() {
  return <Whiteboard images={IMAGES} sections={SECTIONS} />
}
