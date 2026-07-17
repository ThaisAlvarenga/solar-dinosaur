import { TIMELINE_YEARS } from '../constants/timeline'

const DOTS_BETWEEN_YEARS = 3

function getTrailDotStrength(gapIndex, dotIndex, trail) {
  if (!trail) return 0

  const { fromIndex, toIndex } = trail
  const lo = Math.min(fromIndex, toIndex)
  const hi = Math.max(fromIndex, toIndex)
  if (gapIndex < lo || gapIndex >= hi) return 0

  const forward = toIndex > fromIndex
  const span = hi - lo
  // 0 at old year (tail tip) → 1 at new year (near the sun)
  const progress = forward
    ? (gapIndex - lo + (dotIndex + 1) / (DOTS_BETWEEN_YEARS + 1)) / span
    : (hi - gapIndex - 1 + (DOTS_BETWEEN_YEARS - dotIndex) / (DOTS_BETWEEN_YEARS + 1)) / span

  return Math.max(1, Math.min(3, Math.ceil(progress * 3)))
}

/**
 * Year markers + dotted track — one unit for layout/transform.
 * On year change, a comet-tail trail glows behind the sun for a few seconds.
 */
export default function TimelineYearStrip({
  year,
  lookAheadActive,
  cometTrail = null,
  onYearChange,
}) {
  const trail = lookAheadActive ? null : cometTrail
  const trailForward = trail ? trail.toIndex > trail.fromIndex : true

  return (
    <div className="timeline-years-group">
      <ul className="timeline-years">
        <li className="timeline-gap-dots timeline-leading-dot" aria-hidden="true">
          <span className="timeline-dot" />
        </li>

        {TIMELINE_YEARS.map((timelineYear, index) => {
          const isActive = timelineYear === year && !lookAheadActive
          const trailStrengthSample = getTrailDotStrength(index, 1, trail)
          const isTrailingGap = trailStrengthSample > 0

          return (
            <li key={timelineYear} className="timeline-segment">
              <button
                type="button"
                className={`timeline-year${isActive ? ' is-active' : ''}`}
                onClick={() => onYearChange(timelineYear)}
                aria-pressed={isActive}
              >
                <span className="timeline-label">{timelineYear}</span>
                <span className="timeline-marker" aria-hidden="true" />
              </button>

              {index < TIMELINE_YEARS.length - 1 && (
                <div
                  className={`timeline-gap-dots${isTrailingGap ? ' is-trailing' : ''}${
                    isTrailingGap ? (trailForward ? ' is-trailing-forward' : ' is-trailing-backward') : ''
                  }`}
                  aria-hidden="true"
                >
                  {Array.from({ length: DOTS_BETWEEN_YEARS }, (_, dotIndex) => {
                    const strength = getTrailDotStrength(index, dotIndex, trail)

                    return (
                      <span
                        key={`${trail?.id ?? 'idle'}-${dotIndex}`}
                        className={`timeline-dot${strength ? ` is-trail is-trail-${strength}` : ''}`}
                      />
                    )
                  })}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
