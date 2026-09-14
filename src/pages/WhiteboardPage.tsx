import Whiteboard from '../Whiteboard'

const BASE = import.meta.env.BASE_URL

const IMAGES = [
  { id: 'harmonia', src: `${BASE}images/whiteboard/harmonia.webp`, x: 620, y: 80 },
  {id:'bloodguy', src: `${BASE}images/whiteboard/bloodguy.webp`, x: 1020, y: -280 },
  {id:'gladius', src: `${BASE}images/whiteboard/gladius.webp`, x: 1620, y: -380,width:950 },
]

const SECTIONS = [
  {
    id: 'grid',
    x: 700,
    y: 820,
    rows: 2,
    items: [
      { id: 'midra',  src: `${BASE}images/whiteboard/midra.webp`  },
      { id: 'genichiro',  src: `${BASE}images/whiteboard/genichiro.webp`  },
      { id: 'tswltw',   src: `${BASE}images/whiteboard/tswltw.webp`  },
      { id: 'bayle',    src: `${BASE}images/whiteboard/bayle.webp`    },
      { id: 'florence', src: `${BASE}images/whiteboard/florence.webp` },
      {id:'wylder', src: `${BASE}images/whiteboard/wylder.webp` },
      {id:'laocoon', src: `${BASE}images/whiteboard/laocoon.webp` },
      {id:'nameless', src: `${BASE}images/whiteboard/nameless.webp` },
      {id:'nightfarer', src: `${BASE}images/whiteboard/nightfareres.webp` },
      {id:'recluse', src: `${BASE}images/whiteboard/recluse.webp` },
      { id: 'fulghor',  src: `${BASE}images/whiteboard/fulghor.webp`  },
      { id: 'dragons',  src: `${BASE}images/whiteboard/dragons.webp`  },
      {id:'nightlord', src: `${BASE}images/whiteboard/nightlord.webp` },
      {id:'ludwig', src: `${BASE}images/whiteboard/ludwig.webp` },
    ],
  },
]

export default function WhiteboardPage() {
  return <Whiteboard images={IMAGES} sections={SECTIONS} />
}
