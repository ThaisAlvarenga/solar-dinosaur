import { TIMELINE_YEARS } from '../constants/timeline'

function getProgressWidth(year, lookAheadActive) {
  if (lookAheadActive) {
    return 100
  }

  const yearIndex = TIMELINE_YEARS.indexOf(year)
  return (yearIndex / (TIMELINE_YEARS.length - 1)) * 100
}

/**
 * Year markers + progress line — one unit for layout/transform.
 */
export default function TimelineYearStrip({ year, lookAheadActive, onYearChange }) {
  return (
    <div className="timeline-years-group">
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
      </ul>
    </div>
  )
}
