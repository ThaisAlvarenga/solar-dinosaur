import { useEffect, useRef, useState } from 'react'
import { TIMELINE_YEARS } from '../constants/timeline'
import ChromeCtaArrow from './ChromeCtaArrow'
import BuildingsCount from './BuildingsCount'
import TimelineYearStrip from './TimelineYearStrip'
import './Timeline.css'

const WHEEL_THRESHOLD = 90
const WHEEL_COOLDOWN_MS = 420
const SWIPE_THRESHOLD = 48
const COMET_TRAIL_MS = 275

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
  const previousYearRef = useRef(year)
  const [cometTrail, setCometTrail] = useState(null)

  useTimelineScrollCarousel({
    year,
    onYearChange,
    enabled: scrollEnabled && !lookAheadActive,
  })

  useEffect(() => {
    if (lookAheadActive) {
      previousYearRef.current = year
      setCometTrail(null)
      return
    }

    const fromYear = previousYearRef.current
    const fromIndex = TIMELINE_YEARS.indexOf(fromYear)
    const toIndex = TIMELINE_YEARS.indexOf(year)
    previousYearRef.current = year

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return

    const trailId = `${fromIndex}-${toIndex}-${Date.now()}`
    setCometTrail({ fromIndex, toIndex, id: trailId })

    const timeoutId = window.setTimeout(() => {
      setCometTrail((current) => (current?.id === trailId ? null : current))
    }, COMET_TRAIL_MS)

    return () => window.clearTimeout(timeoutId)
  }, [year, lookAheadActive])

  return (
    <section className="timeline" aria-label="Year timeline">
      <BuildingsCount year={year} />

      <div className="timeline-nav">
        <TimelineYearStrip
          year={year}
          lookAheadActive={lookAheadActive}
          cometTrail={cometTrail}
          onYearChange={onYearChange}
        />

        <div className="timeline-look-ahead">
          <button
            type="button"
            className={`chrome-cta timeline-cta${lookAheadActive ? ' is-active' : ''}`}
            onClick={onLookAhead}
            aria-pressed={lookAheadActive}
          >
            <span className="chrome-cta-label">Look Ahead</span>
            <ChromeCtaArrow direction="right" />
          </button>
        </div>
      </div>
    </section>
  )
}
