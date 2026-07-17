import { useEffect, useRef } from 'react'
import { yearProgress } from '../constants/timeline'
import { loadSceneCsv, mapSceneYearData } from '../data'
import { sceneFactories } from '../scenes'

/**
 * Mounts a Three.js scene and wires the timeline + CSV data pipeline.
 *
 * On year change:
 * 1. loadSceneCsv(variant)  → public/data/{variant}.csv
 * 2. mapSceneYearData()     → src/data/mapYearData.js
 * 3. applyYear({ year, data, progress }) → src/scenes/{variant}Scene.js
 */

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose()
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose())
      } else {
        child.material.dispose()
      }
    }
  })
}

export default function ThreePanel({ variant, label, year, particleTheme, onBuildingSelect }) {
  const containerRef = useRef(null)
  const applyYearRef = useRef(null)
  const setParticleThemeRef = useRef(null)
  const setBuildingSelectHandlerRef = useRef(null)
  const onBuildingSelectRef = useRef(onBuildingSelect)
  onBuildingSelectRef.current = onBuildingSelect

  useEffect(() => {
    const container = containerRef.current
    const createScene = sceneFactories[variant]
    if (!container || !createScene) return

    const {
      scene,
      camera,
      renderer,
      animate,
      applyYear,
      objects,
      setupInteraction,
      disposeInteraction,
      setParticleTheme,
      setBuildingSelectHandler,
    } = variant === 'future' ? createScene() : createScene(year)
    applyYearRef.current = applyYear
    setParticleThemeRef.current = setParticleTheme ?? null
    setBuildingSelectHandlerRef.current = setBuildingSelectHandler ?? null
    setBuildingSelectHandlerRef.current?.((building) => {
      onBuildingSelectRef.current?.(building)
    })
    renderer.domElement.setAttribute('aria-label', label)
    container.appendChild(renderer.domElement)
    setupInteraction?.(renderer.domElement)

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) return

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    let frameId = 0
    const renderLoop = () => {
      frameId = requestAnimationFrame(renderLoop)
      animate()
      renderer.render(scene, camera)
    }
    renderLoop()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      disposeInteraction?.()
      container.removeChild(renderer.domElement)
      objects.forEach(disposeObject)
      renderer.dispose()
      applyYearRef.current = null
      setParticleThemeRef.current = null
      setBuildingSelectHandlerRef.current = null
    }
    // year intentionally omitted — scene updates via applyYear effect, not remount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, label])

  // Timeline + CSV → scene: loads data for the year, then calls applyYear()
  useEffect(() => {
    if (year === undefined) return

    let cancelled = false

    const updateFromYear = async () => {
      const progress = yearProgress(year)
      let data = { year }

      if (variant !== 'future') {
        try {
          const rows = await loadSceneCsv(variant)
          if (cancelled) return
          data = mapSceneYearData(variant, rows, year)
        } catch (error) {
          console.warn(`[data] Failed to load CSV for "${variant}" year ${year}`, error)
        }
      }

      if (cancelled) return
      applyYearRef.current?.({ year, data, progress })
    }

    updateFromYear()

    return () => {
      cancelled = true
    }
  }, [year, variant])

  useEffect(() => {
    if (variant !== 'future' || !particleTheme) return
    setParticleThemeRef.current?.(particleTheme)
  }, [variant, particleTheme])

  return (
    <div className="three-panel" ref={containerRef} role="img" aria-label={label} />
  )
}
