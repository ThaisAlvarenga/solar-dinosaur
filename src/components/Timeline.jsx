import { TIMELINE_YEARS } from '../constants/timeline'
import './Timeline.css'

export default function Timeline({ year, onYearChange }) {
  return (
    <section className="timeline" aria-label="Year timeline">
      <div className="timeline-track">
        <div className="timeline-line" aria-hidden="true">
          <div
            className="timeline-progress"
            style={{
              width: `${((TIMELINE_YEARS.indexOf(year) / (TIMELINE_YEARS.length - 1)) * 100)}%`,
            }}
          />
        </div>
        <ul className="timeline-years">
          {TIMELINE_YEARS.map((timelineYear) => (
            <li key={timelineYear}>
              <button
                type="button"
                className={`timeline-year${timelineYear === year ? ' is-active' : ''}`}
                onClick={() => onYearChange(timelineYear)}
                aria-pressed={timelineYear === year}
              >
                <span className="timeline-marker" aria-hidden="true" />
                <span className="timeline-label">{timelineYear}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
