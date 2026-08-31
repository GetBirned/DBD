import { useEffect, useState } from 'react'

/** Fetches a JSON endpoint; fails silently (no data) rather than surfacing an error UI —
 * the PSN widget is a nice-to-have and shouldn't ever visibly break the page. */
export function usePsnData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(endpoint)
      .then((r) => {
        if (!r.ok) throw new Error('request failed')
        return r.json() as Promise<T>
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [endpoint])

  return { data, loading }
}

export interface PsnStatusData {
  isPlaying: boolean
  title: string | null
  image?: string | null
  url?: string | null
  /** Only known when this came from trophy data (the "last played" fallback) —
   * omitted for the live "playing now" case, which has no trophy info to draw on. */
  platinum?: boolean
}

export interface PsnTopGame {
  id: string
  name: string
  image: string | null
  earned: number
  total: number
  platinum: boolean
  url: string | null
}
