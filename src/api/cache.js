const TTL   = 10 * 60 * 1000
const store = new Map()

export function cacheGet(key) {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > TTL) { store.delete(key); return null }
  return entry.data
}

export function cacheSet(key, data) {
  store.set(key, { data, ts: Date.now() })
  return data
}

export async function cached(key, fn) {
  const hit = cacheGet(key)
  if (hit) return hit
  const data = await fn()
  return cacheSet(key, data)
}
