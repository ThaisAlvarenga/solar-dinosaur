/**
 * Scene registry for ThreePanel.
 *
 * Each scene lives in its own file under src/scenes/.
 * Keys must match the `variant` prop in App.jsx: energy | co2 | saving | future
 */
import { createCo2Scene } from './co2Scene'
import { createEnergyScene } from './energyScene'
import { createFutureScene } from './futureScene'
import { createSavingScene } from './savingScene'

export { createCo2Scene } from './co2Scene'
export { createEnergyScene } from './energyScene'
export { createFutureScene } from './futureScene'
export { createSavingScene } from './savingScene'

export const sceneFactories = {
  energy: createEnergyScene,
  co2: createCo2Scene,
  saving: createSavingScene,
  future: createFutureScene,
}
