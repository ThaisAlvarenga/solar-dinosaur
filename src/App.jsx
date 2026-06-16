import ThreePanel from './components/ThreePanel'
import './App.css'

function App() {
  return (
    <>
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#" className="site-logo">
            solar-dinosaur
          </a>
          <ul className="nav-links">
            <li>
              <a href="#center">Solar</a>
            </li>
            <li>
              <a href="#docs">Crystal</a>
            </li>
            <li>
              <a href="#social">Dinosaur</a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="site-main">
        <div className="ticks"></div>

        <section id="main" className="triptych">
          <div id="center" className="triptych-panel">
            <ThreePanel variant="solar" label="Solar scene" />
          </div>

          <div id="docs" className="triptych-panel">
            <ThreePanel variant="crystal" label="Crystal scene" />
          </div>

          <div id="social" className="triptych-panel">
            <ThreePanel variant="dinosaur" label="Dinosaur scene" />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} solar-dinosaur. Built with React and Vite.</p>
      </footer>
    </>
  )
}

export default App
