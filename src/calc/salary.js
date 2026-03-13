import { COLLEGES, JOB_INCOME } from '../data/constants.js'
import { applyMultipliers } from './multipliers.js'

export function getTier(college) {
  for (const [tier, list] of Object.entries(COLLEGES)) {
    if (list.includes(college)) return tier
  }
  return null
}

export function getBaseIncome(tier, major, job) {
  return JOB_INCOME[tier]?.[major]?.[job] ?? 0
}

export function predictSalary(college, major, job, area, exp) {
  const tier = getTier(college)
  if (!tier) return null
  const base = getBaseIncome(tier, major, job)
  if (!base) return null
  return {
    tier,
    annual: applyMultipliers(base, major, area, exp),
  }
}

export function fmt(n) {
  return '$' + n.toLocaleString()
}
