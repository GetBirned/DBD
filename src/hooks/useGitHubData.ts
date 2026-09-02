import { useEffect, useState } from 'react'

/** Fetches a JSON endpoint; fails silently (no data) rather than surfacing an error UI —
 * the GitHub widget is a nice-to-have and shouldn't ever visibly break the page. */
export function useGitHubData<T>(endpoint: string) {
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

export interface ContributionDay {
  date: string
  /** GitHub's own 0–4 intensity bucket. */
  level: number
  count: number
}

export interface ContributionsData {
  user: string
  days: ContributionDay[]
  total: number
  profileUrl: string
}
