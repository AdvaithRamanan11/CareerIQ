const BASE = '/api/cos'

async function get(endpoint, params = {}) {
  const qs  = new URLSearchParams({ endpoint, ...params })
  const res = await fetch(`${BASE}?${qs}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchWages(keyword, location = 'tx') {
  const data = await get('wages', { keyword, location })
  const detail = data.OccupationDetail          // object, not array
  if (!detail) return null

  const annual = (list) =>
    list?.find(w => w.RateType === 'Annual') ?? null

  const stateAnnual    = annual(detail.Wages?.StateWagesList)
  const nationalAnnual = annual(detail.Wages?.NationalWagesList)

  return {
    title:    detail.OccupationTitle,
    onetCode: detail.OccupationCode,
    national: nationalAnnual ? {
      p10:    Number(nationalAnnual.Pct10),
      p25:    Number(nationalAnnual.Pct25),
      median: Number(nationalAnnual.Median),
      p75:    Number(nationalAnnual.Pct75),
      p90:    Number(nationalAnnual.Pct90),
    } : null,
    state: stateAnnual ? {
      p10:    Number(stateAnnual.Pct10),
      p25:    Number(stateAnnual.Pct25),
      median: Number(stateAnnual.Median),
      p75:    Number(stateAnnual.Pct75),
      p90:    Number(stateAnnual.Pct90),
    } : null,
  }
}

export async function searchOccupations(keyword, location = 'tx') {
  const data = await get('occupations', { keyword, location })
  return (data.OccupationList ?? []).map(o => ({
    title:       o.OccupationTitle,
    onetCode:    o.OnetCode,
    description: o.OccupationDescription,
  }))
}

export async function fetchWageByLocation(keyword) {
  const data = await get('wagebylocation', { keyword })
  // wageloc returns OccupationsList[].LocationWageDetails[]
  return (data.OccupationsList ?? []).flatMap(occ =>
    (occ.LocationWageDetails ?? []).map(loc => ({
      location: loc.LocationName,
      median:   Number(loc.WageInfo?.find(w => w.RateType === 'Annual')?.Median ?? 0),
    }))
  )
}
