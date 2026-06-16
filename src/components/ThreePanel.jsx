import { useEffect, useRef } from 'react'
import { sceneFactories } from '../scenes'

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

export default function ThreePanel({ variant, label }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const createScene = sceneFactories[variant]
    if (!container || !createScene) return

    const { scene, camera, renderer, animate, objects } = createScene()
    renderer.domElement.setAttribute('aria-label', label)
    container.appendChild(renderer.domElement)

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
      container.removeChild(renderer.domElement)
      objects.forEach(disposeObject)
      renderer.dispose()
    }
  }, [variant, label])

  return (
    <div className="three-panel" ref={containerRef} role="img" aria-label={label} />
  )
}
