/**
 * Color + ring texture presets for each data-visualization scene.
 * Copy this folder into solar-dinosaur and point ringTexture paths at your public assets.
 */
export const BUILDING_THEMES = {
    energy: {
        baseColor: '#f4e9dc70',
        shadowColor: '#966432',
        coreColor: '#d68c28',
        highlightColor: '#fffaf0',
        rimColor: '#ffa43c',
        ringTexture: '/assets/matcaps/EnergyRIng.png'
    },
    co2: {
        baseColor: '#dcebff70',
        shadowColor: '#006aff',
        coreColor: '#4693ff',
        highlightColor: '#dcebff',
        rimColor: '#4693ff',
        ringTexture: '/assets/matcaps/Co2Ring.png'
    },
    savings: {
        baseColor: '#dbffdb70',
        shadowColor: '#006c00',
        coreColor: '#00ff00',
        highlightColor: '#dbffdb',
        rimColor: '#00ff00',
        ringTexture: '/assets/matcaps/MoneyRing.png'
    }
}

export const BUILDING_THEME_NAMES = Object.keys(BUILDING_THEMES)
