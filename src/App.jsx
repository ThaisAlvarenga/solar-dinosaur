import { useEffect, useState } from 'react'
import ThreePanel from './components/ThreePanel'
import Timeline from './components/Timeline'
import SiteMenu from './components/SiteMenu'
import ContentPage from './components/ContentPage'
import { DEFAULT_YEAR, TIMELINE_YEARS } from './constants/timeline'
import './App.css'

function App() {
  const [year, setYear] = useState(DEFAULT_YEAR)
  const [lookAheadActive, setLookAheadActive] = useState(false)
  const [showFuture, setShowFuture] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [siteView, setSiteView] = useState('main')

  const resetToMainSite = () => {
    setLookAheadActive(false)
    setYear(DEFAULT_YEAR)
    setSiteView('main')
  }

  const handleYearChange = (nextYear) => {
    setLookAheadActive(false)
    setYear(nextYear)
    setSiteView('main')
  }

  const handleGoBack = () => {
    resetToMainSite()
  }

  const handleLookAhead = () => {
    setLookAheadActive(true)
    setShowFuture(true)
    setYear(TIMELINE_YEARS[TIMELINE_YEARS.length - 1])
    setSiteView('main')
  }

  const handleNavigate = (viewId) => {
    if (viewId === 'main') {
      resetToMainSite()
      return
    }

    setLookAheadActive(false)
    setSiteView(viewId)
  }

  useEffect(() => {
    if (!menuOpen) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [menuOpen])

  const isMainView = siteView === 'main'

  return (
    <>
      <header className="site-header">
        <SiteMenu
          isOpen={menuOpen}
          onToggle={setMenuOpen}
          onNavigate={handleNavigate}
        />
      </header>

      <main className="site-main">
        {isMainView && <div className="ticks"></div>}

        {isMainView ? (
          <div className={`scene-carousel${lookAheadActive ? ' scene-carousel--future' : ''}`}>
            <section id="main" className="triptych" aria-hidden={lookAheadActive}>
              <div id="energy" className="triptych-panel triptych-panel--energy">
                <ThreePanel variant="energy" label="Energy scene" year={year} />
              </div>

              <div id="co2" className="triptych-panel triptych-panel--co2">
                <ThreePanel variant="co2" label="CO2 scene" year={year} />
              </div>

              <div id="saving" className="triptych-panel triptych-panel--saving">
                <ThreePanel variant="saving" label="Saving scene" year={year} />
              </div>
            </section>

            {showFuture && (
              <section className="future-stage" aria-label="Future scene">
                <ThreePanel variant="future" label="Future scene" />
              </section>
            )}
          </div>
        ) : (
          <ContentPage view={siteView} />
        )}
      </main>

      {isMainView && (
        <div className={`chrome-carousel${lookAheadActive ? ' chrome-carousel--future' : ''}`}>
          <div className="timeline-stage">
            <Timeline
              year={year}
              onYearChange={handleYearChange}
              lookAheadActive={lookAheadActive}
              onLookAhead={handleLookAhead}
            />
          </div>

          {showFuture && (
            <div className="back-stage">
              <button type="button" className="chrome-cta" onClick={handleGoBack}>
                <span className="chrome-cta-arrow" aria-hidden="true">&lt;--</span>
                <span className="chrome-cta-label">Back</span>
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} solar-dinosaur. Built with React and Vite.</p>
      </footer>
    </>
  )
}

export default App
