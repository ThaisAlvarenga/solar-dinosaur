import { TIMELINE_YEARS } from '../constants/timeline'
import ChromeCtaArrow from './ChromeCtaArrow'
import './Timeline.css'

function getProgressWidth(year, lookAheadActive) {
  if (lookAheadActive) {
    return 100
  }

  const yearIndex = TIMELINE_YEARS.indexOf(year)
  return (yearIndex / (TIMELINE_YEARS.length - 1)) * 100
}

export default function Timeline({ year, onYearChange, lookAheadActive = false, onLookAhead }) {
  return (
    <section className="timeline" aria-label="Year timeline">
      <div className="timeline-track">
        <div className="timeline-line" aria-hidden="true">
          <div
            className="timeline-progress"
            style={{ width: `${getProgressWidth(year, lookAheadActive)}%` }}
          />
        </div>
        <ul className="timeline-years">
          {TIMELINE_YEARS.map((timelineYear) => (
            <li key={timelineYear} className="timeline-item">
              <button
                type="button"
                className={`timeline-year${timelineYear === year && !lookAheadActive ? ' is-active' : ''}`}
                onClick={() => onYearChange(timelineYear)}
                aria-pressed={timelineYear === year && !lookAheadActive}
              >
                <span className="timeline-marker" aria-hidden="true" />
                <span className="timeline-label">{timelineYear}</span>
              </button>
            </li>
          ))}
          <li className="timeline-item timeline-item--cta">
            <button
              type="button"
              className={`chrome-cta timeline-cta${lookAheadActive ? ' is-active' : ''}`}
              onClick={onLookAhead}
              aria-pressed={lookAheadActive}
            >
              <span className="chrome-cta-label">Look Ahead</span>
              <ChromeCtaArrow direction="right" />
            </button>
          </li>
        </ul>
      </div>
    </section>
  )
}
