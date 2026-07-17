import './ContentPage.css'
import BackButton from './BackButton'
import ReferencePage from './ReferencePage'

const CONTENT = {
  'artist-statement': {
    title: 'Artist statement / Context of the project / Overview',
    body: [
      'This project explores the relationship between energy, carbon, and conservation through an interactive visual timeline.',
      'Use the main site to move through years 2021–2026, then look ahead to imagine what comes next.',
    ],
  },
  team: {
    title: 'Team section',
    body: [
      'Add team member names, roles, and bios here if this section is needed for the project.',
    ],
  },
}

export default function ContentPage({ view, onBack }) {
  const isReferences = view === 'research'
  const page = CONTENT[view]

  if (!isReferences && !page) return null

  return (
    <section
      className="content-page"
      id={view}
      aria-labelledby={isReferences ? 'research-title' : `${view}-title`}
    >
      <div className="content-page-layout">
        <aside className="content-page-aside" aria-label="Page actions">
          <BackButton onClick={onBack} />
        </aside>

        <div className="content-page-inner">
          {isReferences ? (
            <ReferencePage />
          ) : (
            <>
              <h1 id={`${view}-title`} className="content-page-title">
                {page.title}
              </h1>
              {page.body.map((paragraph) => (
                <p key={paragraph} className="content-page-text">
                  {paragraph}
                </p>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
