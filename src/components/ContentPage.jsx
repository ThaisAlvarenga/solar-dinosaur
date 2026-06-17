import './ContentPage.css'

const CONTENT = {
  'artist-statement': {
    title: 'Artist statement / Context of the project / Overview',
    body: [
      'This project explores the relationship between energy, carbon, and conservation through an interactive visual timeline.',
      'Use the main site to move through years 2021–2026, then look ahead to imagine what comes next.',
    ],
  },
  research: {
    title: 'Research Links / Data points / References',
    body: [
      'Add research links, datasets, and references for the project here.',
      'This section can include citations, external resources, and supporting data points.',
    ],
  },
  team: {
    title: 'Team section',
    body: [
      'Add team member names, roles, and bios here if this section is needed for the project.',
    ],
  },
}

export default function ContentPage({ view }) {
  const page = CONTENT[view]
  if (!page) return null

  return (
    <section className="content-page" id={view} aria-labelledby={`${view}-title`}>
      <div className="content-page-inner">
        <h1 id={`${view}-title`} className="content-page-title">
          {page.title}
        </h1>
        {page.body.map((paragraph) => (
          <p key={paragraph} className="content-page-text">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
