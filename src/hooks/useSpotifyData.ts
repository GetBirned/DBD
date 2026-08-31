import { useEffect, useState } from 'react'

/** Fetches a JSON endpoint; fails silently (no data) rather than surfacing an error UI —
 * Spotify widgets are a nice-to-have and shouldn't ever visibly break the page. */
export function useSpotifyData<T>(endpoint: string) {
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

export interface NowPlayingData {
  isPlaying: boolean
  title: string | null
  artist?: string
  album?: string | null
  albumArt?: string | null
  url?: string | null
}

export interface PlaylistData {
  id: string
  name: string
  description: string
  image: string | null
  url: string | null
  trackCount: number
}
