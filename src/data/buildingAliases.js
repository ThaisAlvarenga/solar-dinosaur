import { slugifyBuildingName } from './parseDataTest.js'

/**
 * Maps building names from the Fulton County Excel export to ids in
 * public/data/building-positions.json.
 *
 * Add entries here when a new site appears in the spreadsheet but does not
 * match an existing map position by slug alone.
 */
export const BUILDING_ALIASES = {
  'metropolitan-branch': 'metropolitan-library',
  'wolf-creek-branch': 'wolf-creek-library',
  'northwest-branch': 'northwest-library',
  'alpharetta-branch': 'alpharetta-library',
  'southeast-atlanta-branch': 'southeast-atlanta-library',
  'dorothy-c-benson-senior-multipurpose-complex': 'benson-senior-center',
  'southwest-regional-branch': 'cascade-sw-library',
  'animal-services-facility': 'animal-services',
  'helene-s-mills-senior-multipurpose-facility': 'mills-senior-center',
  'fulton-county-board-of-health': 'board-of-health',
  'powell-juvenile-justice-center-mechanicsville-lib': 'juvenile-justice-center',
  'east-roswell-branch': 'e-roswell-library',
  'neighborhood-union-health-center': 'neighborhood-union-health',
  'union-city-jail': 'union-city-jail',
  'gladys-s-dennard-library-at-south-fulton': 'gladys-dennard-library',
  'aviation-culture-center': 'aviation-cultural-center',
  'south-fulton-service-center': 'south-fulton-service-center',
  'medical-examiners-facility': 'medical-examiner',
  'sandy-springs-branch': 'sandy-springs-library',
  'hjc-bowden-senior-multi-purpose-facility': 'bowden-senior-center',
  'milton-branch': 'milton-library',
  'ponce-de-leon-branch': 'ponce-de-leon-jp-library',
  'qls-center-for-senior-citizens': 'qls-senior-center',
  'north-fulton-service-center': 'north-fulton-service-center',
  'new-beginnings-neighborhood-senior-center': 'new-beginnings-senior-center',
  'dogwood-branch': 'dogwood-library',
  'adamsville-collier-heights-branch': 'adamsville-ac-library',
  'palmetto-branch': 'palmetto-library',
  'college-park-branch': 'college-park-library',
  'college-park-health-center': 'college-park-regional-health',
  'dogwood-senior-center': 'dogwood-senior-center',
  'adams-park-branch': 'adams-park-library',
  'cleveland-avenue-branch': 'cleveland-ave-library',
  'southeast-neighborhood-senior-center': 'se-neighborhood-senior-center',
}

/**
 * @param {string} rawName - Building label from the spreadsheet
 * @returns {string} Stable id used by building-positions.json
 */
export function resolveBuildingId(rawName) {
  const slug = slugifyBuildingName(rawName)
  return BUILDING_ALIASES[slug] ?? slug
}
