const QA_ITEMS = [
  {
    question: 'UCLA course recommendations?',
    answer: 'Both EC ENGR C147a (Deep Learning) and its sequel, C147b (Deep Learning II). The hype is real, but good luck getting into it lol (SUBMIT AN ECR!!). COM SCI M146 is also solid. For a lesser known course, EC ENGR 133a (Applied Numerical Computing) with Vandenberghe is a cool, albeit tough mathy class. For this last one, it might just be me, but ART HIS 21 (Medieval Art) was more fun than expected.',
  },
  {
    question: 'Coding Languages?',
    answer: 'Python for most things, C++ for ICPC and technicals.',
  },
  {
    question: 'What do you draw with?',
    answer: 'Procreate to sketch and draw in mostly everything, and Photoshop for tuning colors and special effects. I do a lot of my practice with fineliners, a holdover from Drawabox.',
  },
  {
    question: 'Is anything AI generated?',
    answer: 'If we\'re talking the stuff I drew, I have not used AI to create anything under Artworks. I also hand-made all the assets used on this website in Illustrator.',
  },
  {
    question: 'Why did you upload art pieces you\'re not proud of?',
    answer: 'More than anything, to demonstrate that everybody misfires, and that it\'s not rare. It also shows my progression, which I\'m especially proud of. I wasn\'t born with any artistic talent (trust me), and even if I was, I couldn\'t have made my favorite pieces without the ones that I felt disappointed in.',
  }
  ,
  {
    question: 'Get a haircut.',
    answer: 'Ok, not a question. It happens when I feel like it.',
  }
]

export default function FAQ() {
  return (
    <div className="page-scroll faq-page" style={pageStyle}>
      <div className="faq-content" style={contentStyle}>
        <h1 className="faq-title" style={titleStyle}>Questions?</h1>
        <dl className="faq-list" style={listStyle}>
          {QA_ITEMS.map(({ question, answer }) => (
            <div key={question} style={itemStyle}>
              <dt className="faq-question" style={questionStyle}>{question}</dt>
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
  alignItems: 'flex-start',
  justifyContent: 'center',
  overflow: 'auto',
  padding: '48px 32px',
  paddingTop: 'calc(var(--topbar-height, 60px) + 5vh)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: 640,
  width: '100%',
  textAlign: 'center',
}

const titleStyle: React.CSSProperties = {
  color: '#ffffff',
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
  color: '#ffffff',
  fontSize: 18,
  fontWeight: 500,
  letterSpacing: '0.02em',
  marginBottom: 8,
}

const answerStyle: React.CSSProperties = {
  color: '#c4d3ff',
  fontSize: 16,
  lineHeight: 1.6,
  margin: 0,
}
