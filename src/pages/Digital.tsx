import ArtworkTimeline, { type TimelineEvent } from '../components/timeline/ArtworkTimeline'

// Oldest first (left). Newest goes on the right as entries are appended.
const EVENTS: TimelineEvent[] = [
  {
    id: 'placeholder-1',
    date: '2023',
    title: 'First Piece',
    description: 'Placeholder entry. Replace with the earliest artwork.',
  },
  {
    id: 'placeholder-2',
    date: '2024',
    title: 'Second Piece',
    description: 'Placeholder entry. Alternates below the line.',
  },
  {
    id: 'placeholder-3',
    date: '2025',
    title: 'Third Piece',
    description: 'Placeholder entry. Back above the line.',
  },
  {
    id: 'placeholder-4',
    date: '2026',
    title: 'Latest Piece',
    description: 'Placeholder entry. Newest, at the far right.',
  },
]

export default function Digital() {
  return (
    <div style={pageStyle}>
      <ArtworkTimeline events={EVENTS} />
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
}
