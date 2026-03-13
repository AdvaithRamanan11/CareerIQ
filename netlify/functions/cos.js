export default async (req) => {
  const url      = new URL(req.url)
  const endpoint = url.searchParams.get('endpoint')
  const keyword  = url.searchParams.get('keyword') ?? ''
  const location = url.searchParams.get('location') ?? 'tx'

  const userId = process.env.COS_USER_ID
  const token  = process.env.COS_TOKEN

  if (!userId || !token) {
    return new Response(JSON.stringify({ error: 'Missing API credentials' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const kw  = encodeURIComponent(keyword)
  const loc = encodeURIComponent(location)

  const endpointMap = {
    wages:          `https://api.careeronestop.org/v1/comparesalaries/${userId}/wage?keyword=${kw}&location=${loc}&enableMetaData=false`,
    occupations:    `https://api.careeronestop.org/v1/occupation/${userId}/${kw}/${loc}/0/10`,
    wagebylocation: `https://api.careeronestop.org/v1/comparesalaries/${userId}/wageloc?keyword=${kw}&location=${loc}&sortColumns=0&sortOrder=0&sortBy=Annual&enableMetaData=false`,
  }

  const apiUrl = endpointMap[endpoint]
  if (!apiUrl) {
    return new Response(JSON.stringify({ error: `Unknown endpoint: ${endpoint}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const res  = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, url: apiUrl }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = { path: '/api/cos' }
