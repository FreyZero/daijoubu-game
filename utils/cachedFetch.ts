import { $fetch as ofetch, type FetchOptions } from 'ofetch'

type Primitive = string | number | boolean | null | undefined
type QueryLike = Record<string, Primitive | Primitive[] | Record<string, Primitive>> | undefined

const DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_TTL = 7 * DAY_MS

function isClient() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function normalizeQuery(query: QueryLike): string {
  if (!query || typeof query !== 'object') return ''
  const entries: [string, string][] = []
  for (const key of Object.keys(query).sort()) {
    const v = (query as Record<string, Primitive | Primitive[] | Record<string, Primitive>>)[key]
    if (v == null) continue
    if (Array.isArray(v)) {
      for (const item of v) entries.push([key, String(item)])
    } else if (typeof v === 'object') {
      entries.push([key, JSON.stringify(v)])
    } else {
      entries.push([key, String(v)])
    }
  }
  const usp = new URLSearchParams(entries)
  return usp.toString()
}

function buildKey(url: string, method: string, query: QueryLike): string {
  const q = normalizeQuery(query)
  return `cf:${method.toUpperCase()}:${url}${q ? '?' + q : ''}`
}

export async function cachedFetch<T>(url: string, opts?: FetchOptions<'json'> & { query?: QueryLike }, ttlMs = DEFAULT_TTL): Promise<T> {
  const method = (opts?.method || 'GET').toUpperCase()
  // Only cache GET requests
  const shouldCache = method === 'GET'

  if (!shouldCache) {
    // fall back to direct fetch for non-GET
    return ofetch<T>(url, opts)
  }

  const key = buildKey(url, method, opts?.query)

  if (isClient()) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const { data, expiresAt } = JSON.parse(raw) as { data: T; expiresAt: number }
        if (Date.now() < expiresAt) return data
        // stale
        localStorage.removeItem(key)
      }
    } catch {
      // ignore cache read errors
    }
  }

  // Server or cache miss
  const data = await ofetch<T>(url, opts)

  if (isClient()) {
    try {
      const payload = JSON.stringify({ data, expiresAt: Date.now() + ttlMs })
      localStorage.setItem(key, payload)
    } catch {
      // ignore quota/serialization errors
    }
  }
  return data
}
