import { useState } from 'react'
import ThreePanel from './components/ThreePanel'
import Timeline from './components/Timeline'
import { DEFAULT_YEAR } from './constants/timeline'
import './App.css'

function App() {
  const [year, setYear] = useState(DEFAULT_YEAR)

  return (
    <>
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#" className="site-logo">
            solar-dinosaur
          </a>
          <ul className="nav-links">
            <li>
              <a href="#energy">Energy</a>
            </li>
            <li>
              <a href="#co2">CO2</a>
            </li>
            <li>
              <a href="#saving">Saving</a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="site-main">
        <div className="ticks"></div>

        <section id="main" className="triptych">
          <div id="energy" className="triptych-panel">
            <ThreePanel variant="energy" label="Energy scene" year={year} />
          </div>

          <div id="co2" className="triptych-panel">
            <ThreePanel variant="co2" label="CO2 scene" year={year} />
          </div>

          <div id="saving" className="triptych-panel">
            <ThreePanel variant="saving" label="Saving scene" year={year} />
          </div>
        </section>
      </main>

      <Timeline year={year} onYearChange={setYear} />

      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} solar-dinosaur. Built with React and Vite.</p>
      </footer>
    </>
  )
}

export default App
