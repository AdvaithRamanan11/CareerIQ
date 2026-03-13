import { AREA_MULTIPLIERS, EXP_MULTIPLIERS } from '../data/constants.js'

export function areaMultiplier(major, area) {
  return AREA_MULTIPLIERS[major]?.[area] ?? 1
}

export function expMultiplier(major, exp) {
  return EXP_MULTIPLIERS[major]?.[exp] ?? 1
}

export function applyMultipliers(base, major, area, exp) {
  return Math.round(base * areaMultiplier(major, area) * expMultiplier(major, exp))
}
