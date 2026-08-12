const QA_ITEMS = [
  {
    question: 'What tools do you use for your artwork?',
    answer: 'Procreate to sketch and draw in mostly everything, and Photoshop for tuning colors and special effects.',
  },
  {
    question: 'Is anything AI generated?',
    answer: 'Well, I use AI for assistance while coding (mostly Cursor). That\'s pretty standard nowadays. However, I have not used AI to create any of the art pieces here.',
  }
]

export default function FAQ() {
  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={titleStyle}>FAQ</h1>
        <dl style={listStyle}>
          {QA_ITEMS.map(({ question, answer }) => (
            <div key={question} style={itemStyle}>
              <dt style={questionStyle}>{question}</dt>
              <dd style={answerStyle}>{answer || '…'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
  padding: '48px 32px',
}

const contentStyle: React.CSSProperties = {
  maxWidth: 640,
  width: '100%',
  textAlign: 'center',
}

const titleStyle: React.CSSProperties = {
  color: '#c4d3ff',
  fontSize: 28,
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 40,
}

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
  margin: 0,
}

const itemStyle: React.CSSProperties = {
  margin: 0,
}

const questionStyle: React.CSSProperties = {
  color: '#c4d3ff',
  fontSize: 18,
  fontWeight: 500,
  letterSpacing: '0.02em',
  marginBottom: 8,
}

const answerStyle: React.CSSProperties = {
  color: 'rgba(196,211,255,0.75)',
  fontSize: 16,
  lineHeight: 1.6,
  margin: 0,
}
