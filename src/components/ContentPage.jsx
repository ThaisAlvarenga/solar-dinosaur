import './ContentPage.css'
import BackButton from './BackButton'
import ReferencePage from './ReferencePage'
import BuildingCollage from '../../DesignAssets/BuildingCollage.png'
import StaticBuildingIcon from './building/StaticBuildingIcon'

const CONTENT = {
  'artist-statement': {
    title: 'Overview',
    body: [
      'Fulton Brighter Futures is an interactive data visualization representing the solar panel adoption across the Fulton county since 2021. Each solar-equipped building appears as a glowing orb sized by their footprint; together the orbs cluster into the county\'s shape. A timeline lets viewers watch adoption grow year by year, alongside energy generated, CO2 reduced, and money saved.', 
      'The project exists online and as an interactive, digital installation at the Fulton County Government Center.his project explores the relationship between energy, carbon, and conservation through an interactive visual timeline.',
      'Use the main site to move through years 2021\–2026, then look ahead to imagine what comes next.',
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
              <div className="content-page-visual">
                <StaticBuildingIcon className="content-page-building-visual" theme="energy" />
                <img
                  src={BuildingCollage}
                  alt="Collage of the building visualization"
                  className="content-page-image"
                />
              </div>
              <p className="content-page-caption">
                Fulton County Buildings with solar panels installed.
              </p>
              <h2 className="content-page-title">Artist statement</h2>
              <p className="content-page-text">
                Our vision for this project is to ultimately raise awareness among the general public 
                regarding the beneficial use of solar energy. As Atlanta residents ourselves, we were 
                not aware of the government efforts being made toward renewable energy, especially 
                at a time when energy is constantly being drawn from the community to power data centers.
              </p>
              <p className="content-page-text">
                We have observed people visit public areas such as parks and libraries, and our hope is 
                that by placing this work in such a high-traffic public space, we can draw the attention 
                of those people, even slightly, toward the work being done by Fulton County on solar 
                energy.In addition to informing people, we also want viewers to take something home with 
                them: a sense of accomplishment, and the understanding that their efforts can and will 
                lead to meaningful change for their community. 
              </p>
              <p className="content-page-text">
                The final project sits at the intersection of art and technology, adapting foundational 
                concepts of design to deliver an interactive installation. Viewers can come interact with 
                it, play with it, view it, and most importantly, learn something about their community's 
                efforts from it.
              </p>
              <div className="content-page-image-row">
                <img src="/DesignAssets/TeamImages/DKT1.jpg" alt="Thais and DK in the field" className="content-page-inline-image" />
                <img src="/DesignAssets/TeamImages/DKT2.jpg" alt="Thais and DK in the field" className="content-page-inline-image" />
                <img src="/DesignAssets/TeamImages/DKT3.jpg" alt="Thais and DK in the field" className="content-page-inline-image" />
              </div>
              <p className="content-page-caption">
                Thais &amp; DK in the field.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
