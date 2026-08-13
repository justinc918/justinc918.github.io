import Whiteboard from '../Whiteboard'

const BASE = import.meta.env.BASE_URL

const IMAGES = [
  { id: 'dragons',  src: `${BASE}images/whiteboard/dragons.webp`,  x: 80,  y: 120 },
  { id: 'harmonia', src: `${BASE}images/whiteboard/harmonia.webp`,  x: 620, y: 80  },
  { id: 'tswltw',   src: `${BASE}images/whiteboard/tswltw.webp`,    x: 340, y: 420 },
]

export default function WhiteboardPage() {
  return <Whiteboard images={IMAGES} />
}
