const BASE    = 'https://api.careeronestop.org/v1'
const USER_ID = process.env.COS_USER_ID
const TOKEN   = process.env.COS_TOKEN

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  if (!USER_ID || !TOKEN) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'API credentials not configured' }) }
  }

  const { endpoint, ...params } = event.queryStringParameters ?? {}

  if (!endpoint) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing endpoint param' }) }
  }

  const ALLOWED = ['wages', 'occupations', 'wagebylocation']
  if (!ALLOWED.includes(endpoint)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `Unknown endpoint: ${endpoint}` }) }
  }

  let cosUrl

  if (endpoint === 'wages') {
    const { keyword, location = 'tx' } = params
    if (!keyword) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing keyword' }) }
    const qs = new URLSearchParams({ keyword, location, enableMetaData: false })
    cosUrl = `${BASE}/comparesalaries/${USER_ID}/wage?${qs}`
  }

  if (endpoint === 'occupations') {
    const { keyword, location = 'tx' } = params
    if (!keyword) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing keyword' }) }
    cosUrl = `${BASE}/occupation/${USER_ID}/${encodeURIComponent(keyword)}/${location}`
  }

  if (endpoint === 'wagebylocation') {
    const { keyword } = params
    if (!keyword) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing keyword' }) }
    const qs = new URLSearchParams({ keyword, enableMetaData: false })
    cosUrl = `${BASE}/comparesalaries/${USER_ID}/wageloc?${qs}`
  }

  try {
    const res  = await fetch(cosUrl, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type':  'application/json',
      },
    })

    const body = await res.text()

    return {
      statusCode: res.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body,
    }
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS,
      body: JSON.stringify({ error: 'Upstream fetch failed', detail: err.message }),
    }
  }
}
