import './FutureOverlay.css'
import ChromeCtaArrow from './ChromeCtaArrow'

const METRICS = [
  { id: 'energy', label: 'ENERGY PRODUCED', dotClass: 'future-bottom-nav-dot--energy' },
  { id: 'co2', label: 'C02 EMISSION REDUCED', dotClass: 'future-bottom-nav-dot--co2' },
  { id: 'money', label: 'MONEY SAVED', dotClass: 'future-bottom-nav-dot--money' },
]

const BUILDING_LOG = [
  { id: 1, title: 'Building Added', message: 'Some message left here' },
  { id: 2, title: 'Building Added', message: 'Some message left here' },
  { id: 3, title: 'Building Added', message: 'Some message left here' },
  { id: 4, title: 'Building Added', message: 'Some message left here' },
]

const BUILDING_TYPES = [
  { id: 'office', label: 'OFFICE' },
  { id: 'home', label: 'HOME' },
  { id: 'school', label: 'SCHOOL' },
  { id: 'shop', label: 'SHOP' },
]

function BuildingTypeIcon({ type }) {
  switch (type) {
    case 'office':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20V6L12 3L20 6V20H4ZM8 18H10V14H8V18ZM14 18H16V14H14V18ZM8 12H10V10H8V12ZM14 12H16V10H14V12Z" />
        </svg>
      )
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4L3 11V20H9V14H15V20H21V11L12 4Z" />
        </svg>
      )
    case 'school':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3L2 8L12 13L22 8L12 3ZM4 10.5V17L12 21L20 17V10.5L12 15L4 10.5Z" />
        </svg>
      )
    case 'shop':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 18C5.9 18 5 17.1 5 16C5 14.9 5.9 14 7 14C8.1 14 9 14.9 9 16C9 17.1 8.1 18 7 18ZM17 18C15.9 18 15 17.1 15 16C15 14.9 15.9 14 17 14C18.1 14 19 14.9 19 16C19 17.1 18.1 18 17 18ZM6.2 6H19.8L18.6 11H7.4L6.2 6ZM5 4L6 9H20L21 4H5Z" />
        </svg>
      )
    default:
      return null
  }
}

export default function FutureOverlay({ onBack, activeMetric = 'energy', onMetricChange }) {
  return (
    <div className="future-overlay" aria-label="Look Ahead controls">
      <aside className="future-stats">
        <div className="future-legend">
          <p className="future-legend-title">ENERGY GENERATION</p>
          <div className="future-legend-scale" aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => (
              <span key={index} className="future-legend-dot" />
            ))}
          </div>
          <div className="future-legend-labels">
            <span>| LOW(&lt;20,000)</span>
            <span>| HIGH(&gt;200,000)</span>
          </div>
        </div>

        <div className="future-metric">
          <p className="future-metric-label">ENERGY GENERATED</p>
          <p className="future-metric-value">230,000 Kwh</p>
          <p className="future-metric-sub">Baseline 2026</p>
        </div>
      </aside>

      <aside className="future-sidebar">
        <header className="future-sidebar-header">
          <h2 className="future-sidebar-title">IMAGINE THE FUTURE OF SOLAR</h2>
          <p className="future-sidebar-subtitle">
            Add buildings to see the impact of solar adoption in Fulton county
          </p>
        </header>

        <ul className="future-building-log">
          {BUILDING_LOG.map((entry) => (
            <li key={entry.id} className="future-building-card">
              <span className="future-building-card-icon" aria-hidden="true" />
              <div className="future-building-card-text">
                <p className="future-building-card-title">{entry.title}</p>
                <p className="future-building-card-message">{entry.message}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="future-building-types">
          <p className="future-building-types-label">CHOOSE BUILDING TYPE</p>
          <div className="future-building-types-grid">
            {BUILDING_TYPES.map((type) => (
              <button key={type.id} type="button" className="future-building-type">
                <span className="future-building-type-icon">
                  <BuildingTypeIcon type={type.id} />
                </span>
                <span className="future-building-type-label">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="future-sticker-btn">
          <span className="future-sticker-icon" aria-hidden="true">☾</span>
          Add a sticker with your building
        </button>

        <button type="button" className="future-add-btn">
          + Add Solar Building
        </button>
      </aside>

      <nav className="future-bottom-nav" aria-label="Future metrics">
        {METRICS.map((metric) => (
          <button
            key={metric.id}
            type="button"
            className={[
              'future-bottom-nav-item',
              `future-bottom-nav-item--${metric.id}`,
              activeMetric === metric.id ? 'future-bottom-nav-item--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onMetricChange?.(metric.id)}
          >
            <span className={`future-bottom-nav-dot ${metric.dotClass}`} aria-hidden="true" />
            {metric.label}
          </button>
        ))}
      </nav>

      <button type="button" className="chrome-cta future-overlay-back" onClick={onBack}>
        <ChromeCtaArrow direction="left" />
        <span className="chrome-cta-label">Back</span>
      </button>
    </div>
  )
}
