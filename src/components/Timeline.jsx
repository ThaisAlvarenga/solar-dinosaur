import { useEffect, useRef } from 'react'
import { TIMELINE_YEARS } from '../constants/timeline'
import ChromeCtaArrow from './ChromeCtaArrow'
import BuildingsCount from './BuildingsCount'
import './Timeline.css'

const WHEEL_THRESHOLD = 90
const WHEEL_COOLDOWN_MS = 420
const SWIPE_THRESHOLD = 48

function getProgressWidth(year, lookAheadActive) {
  if (lookAheadActive) {
    return 100
  }

  const yearIndex = TIMELINE_YEARS.indexOf(year)
  return (yearIndex / (TIMELINE_YEARS.length - 1)) * 100
}

function useTimelineScrollCarousel({ year, onYearChange, enabled }) {
  const yearRef = useRef(year)
  const onYearChangeRef = useRef(onYearChange)

  yearRef.current = year
  onYearChangeRef.current = onYearChange

  useEffect(() => {
    if (!enabled) return

    let accumulated = 0
    let cooldown = false
    let cooldownId = null
    let touchStartY = 0

    const stepYear = (direction) => {
      const currentIndex = TIMELINE_YEARS.indexOf(yearRef.current)
      const nextIndex = currentIndex + direction
      if (nextIndex < 0 || nextIndex >= TIMELINE_YEARS.length) return false

      onYearChangeRef.current(TIMELINE_YEARS[nextIndex])
      accumulated = 0
      cooldown = true
      cooldownId = window.setTimeout(() => {
        cooldown = false
      }, WHEEL_COOLDOWN_MS)
      return true
    }

    const shouldIgnoreEvent = (target) =>
      target instanceof Element &&
      Boolean(
        target.closest(
          '.site-menu-panel, .content-page, .future-overlay, input, textarea, select, [data-no-timeline-scroll]',
        ),
      )

    const onWheel = (event) => {
      if (shouldIgnoreEvent(event.target)) return

      event.preventDefault()
      if (cooldown) return

      accumulated += event.deltaY
      if (Math.abs(accumulated) < WHEEL_THRESHOLD) return

      stepYear(accumulated > 0 ? 1 : -1)
    }

    const onTouchStart = (event) => {
      if (shouldIgnoreEvent(event.target)) return
      touchStartY = event.touches[0]?.clientY ?? 0
    }

    const onTouchEnd = (event) => {
      if (shouldIgnoreEvent(event.target)) return
      if (cooldown) return

      const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY
      const deltaY = touchStartY - touchEndY
      if (Math.abs(deltaY) < SWIPE_THRESHOLD) return

      stepYear(deltaY > 0 ? 1 : -1)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      if (cooldownId) window.clearTimeout(cooldownId)
    }
  }, [enabled])
}

export default function Timeline({
  year,
  onYearChange,
  lookAheadActive = false,
  onLookAhead,
  scrollEnabled = false,
}) {
  useTimelineScrollCarousel({ year, onYearChange, enabled: scrollEnabled })
  return (
    <section className="timeline" aria-label="Year timeline">
      <BuildingsCount year={year} />

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
