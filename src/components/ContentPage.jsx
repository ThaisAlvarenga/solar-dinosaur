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
    members: [
      {
        name: 'Kathleen Brown',
        title: 'Project Manager',
        description: 'Oversaw the project from concept to delivery, coordinating between the design and development teams, Fulton County\'s DREAM Sustainability Division, and the Public Art Futures Lab.',
        image: '/DesignAssets/TeamHeadshots/Kathleen.png',
      },
      {
        name: 'Thaís Alvarenga',
        title: 'Design Engineer',
        description: 'Led the technical build of the interactive visualization, architecting the site in Three.js, React, and Vite. Responsible for turning raw County datasets into a functioning, real-time visual system — from data processing to the 3D rendering of each building\'s orb.',
        image: '/DesignAssets/TeamHeadshots/Thais.png',
      },
      {
        name: 'Daksh Kapoor (DK)',
        title: 'Design Engineer',
        description: 'Directed the visual language and user experience of the project, from the color system and orb-based data encoding to the building design. Shaped how energy, emissions, and savings data translated into an intuitive, emotionally resonant visual story.',
        image: '/DesignAssets/TeamHeadshots/DK.png',
      },
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
          ) : view === 'team' ? (
            <>
              <h1 id={`${view}-title`} className="content-page-title">
                {page.title}
              </h1>
              <div className="team-members-grid">
                {page.members.map((member) => (
                  <div key={member.name} className="team-member-card">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="team-member-image"
                    />
                    <h2 className="team-member-name">{member.name}</h2>
                    <p className="team-member-title">{member.title}</p>
                    <p className="team-member-description">{member.description}</p>
                  </div>
                ))}
              </div>
            </>
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
