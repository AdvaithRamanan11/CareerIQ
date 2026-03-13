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
  const detail = data.OccupationDetail?.[0]
  if (!detail) return null

  const annual = (list) =>
    list?.filter(w => w.RateType === 'Annual') ?? []

  const stateWages  = annual(detail.Wages?.StateWagesList)
  const nationalWages = annual(detail.Wages?.NationalWagesList)
  const nat = nationalWages[0]

  return {
    title:    detail.OccupationTitle,
    onetCode: detail.OnetCode,
    national: nat ? {
      p10:    Number(nat.Pct10),
      p25:    Number(nat.Pct25),
      median: Number(nat.Median),
      p75:    Number(nat.Pct75),
      p90:    Number(nat.Pct90),
    } : null,
    state: stateWages[0] ? {
      p10:    Number(stateWages[0].Pct10),
      p25:    Number(stateWages[0].Pct25),
      median: Number(stateWages[0].Median),
      p75:    Number(stateWages[0].Pct75),
      p90:    Number(stateWages[0].Pct90),
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
  return (data.OccupationDetail ?? []).map(d => ({
    location: d.AreaName,
    median:   Number(d.Wages?.StateWagesList?.find(w => w.RateType === 'Annual')?.Median ?? 0),
  }))
}
