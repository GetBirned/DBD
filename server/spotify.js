import express from 'express'

const router = express.Router()

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

function getEnv() {
  return {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
    playlistIds: (process.env.SPOTIFY_PLAYLIST_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  }
}

function basicAuthHeader(clientId, clientSecret) {
  return 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
}

// --- token caching (in-memory; fine for a single small server instance) ---
let userToken = null // { accessToken, expiresAt }
let appToken = null

async function getUserAccessToken() {
  const { clientId, clientSecret, refreshToken } = getEnv()
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Spotify user auth is not configured (missing client id/secret/refresh token)')
  }
  if (userToken && userToken.expiresAt > Date.now()) return userToken.accessToken

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(clientId, clientSecret),
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  })
  if (!res.ok) throw new Error(`Spotify token refresh failed: ${res.status}`)
  const data = await res.json()
  userToken = { accessToken: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 }
  return userToken.accessToken
}

async function getAppAccessToken() {
  const { clientId, clientSecret } = getEnv()
  if (!clientId || !clientSecret) {
    throw new Error('Spotify app auth is not configured (missing client id/secret)')
  }
  if (appToken && appToken.expiresAt > Date.now()) return appToken.accessToken

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(clientId, clientSecret),
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  })
  if (!res.ok) throw new Error(`Spotify app token request failed: ${res.status}`)
  const data = await res.json()
  appToken = { accessToken: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 }
  return appToken.accessToken
}

function trackToJSON(track, isPlaying) {
  return {
    isPlaying,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    album: track.album?.name ?? null,
    albumArt: track.album?.images?.[0]?.url ?? null,
    url: track.external_urls?.spotify ?? null,
  }
}

// simple response cache so a burst of visitors doesn't hammer Spotify
let nowPlayingCache = { data: null, expiresAt: 0 }

router.get('/now-playing', async (_req, res) => {
  try {
    if (nowPlayingCache.data && nowPlayingCache.expiresAt > Date.now()) {
      return res.json(nowPlayingCache.data)
    }

    const token = await getUserAccessToken()

    const currentRes = await fetch(`${SPOTIFY_API_URL}/me/player/currently-playing`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (currentRes.status === 200) {
      const data = await currentRes.json()
      if (data?.item) {
        const payload = trackToJSON(data.item, true)
        nowPlayingCache = { data: payload, expiresAt: Date.now() + 30_000 }
        return res.json(payload)
      }
    }

    const recentRes = await fetch(`${SPOTIFY_API_URL}/me/player/recently-played?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!recentRes.ok) throw new Error(`Spotify recently-played request failed: ${recentRes.status}`)
    const recentData = await recentRes.json()
    const track = recentData.items?.[0]?.track
    const payload = track ? trackToJSON(track, false) : { isPlaying: false, title: null }
    nowPlayingCache = { data: payload, expiresAt: Date.now() + 30_000 }
    res.json(payload)
  } catch (err) {
    console.error('[spotify] now-playing error:', err.message)
    res.status(503).json({ error: 'spotify_unavailable' })
  }
})

let playlistCache = { data: null, expiresAt: 0 }

router.get('/playlists', async (_req, res) => {
  try {
    const { playlistIds } = getEnv()
    if (playlistIds.length === 0) {
      return res.json([])
    }
    if (playlistCache.data && playlistCache.expiresAt > Date.now()) {
      return res.json(playlistCache.data)
    }

    const token = await getAppAccessToken()
    const playlists = await Promise.all(
      playlistIds.map(async (id) => {
        const r = await fetch(
          `${SPOTIFY_API_URL}/playlists/${id}?fields=id,name,description,images,external_urls`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (!r.ok) return null
        const data = await r.json()
        return {
          id: data.id,
          name: data.name,
          description: data.description || '',
          image: data.images?.[0]?.url ?? null,
          url: data.external_urls?.spotify ?? null,
        }
      }),
    )
    const filtered = playlists.filter(Boolean)
    playlistCache = { data: filtered, expiresAt: Date.now() + 10 * 60_000 }
    res.json(filtered)
  } catch (err) {
    console.error('[spotify] playlists error:', err.message)
    res.status(503).json({ error: 'spotify_unavailable' })
  }
})

let topCache = { data: null, expiresAt: 0 }

router.get('/top', async (_req, res) => {
  try {
    if (topCache.data && topCache.expiresAt > Date.now()) {
      return res.json(topCache.data)
    }

    const token = await getUserAccessToken()
    const r = await fetch(`${SPOTIFY_API_URL}/me/top/tracks?time_range=medium_term&limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!r.ok) throw new Error(`Spotify top tracks request failed: ${r.status}`)
    const data = await r.json()
    const items = data.items || []

    const tracks = items.slice(0, 5).map((t) => ({
      name: t.name,
      artist: t.artists.map((a) => a.name).join(', '),
      albumArt: t.album?.images?.[0]?.url ?? null,
      url: t.external_urls?.spotify ?? null,
    }))

    // Spotify has no "top albums" endpoint, so derive it: count how often each
    // album shows up across the top 50 tracks, break ties by best track rank.
    const albumMap = new Map()
    items.forEach((t, rank) => {
      const album = t.album
      if (!album?.id) return
      const existing = albumMap.get(album.id)
      if (existing) {
        existing.count += 1
      } else {
        albumMap.set(album.id, {
          count: 1,
          bestRank: rank,
          name: album.name,
          artist: t.artists.map((a) => a.name).join(', '),
          image: album.images?.[0]?.url ?? null,
          url: album.external_urls?.spotify ?? null,
        })
      }
    })
    const albums = [...albumMap.values()]
      .sort((a, b) => b.count - a.count || a.bestRank - b.bestRank)
      .slice(0, 5)
      .map(({ name, artist, image, url }) => ({ name, artist, image, url }))

    const payload = { tracks, albums }
    topCache = { data: payload, expiresAt: Date.now() + 60 * 60_000 }
    res.json(payload)
  } catch (err) {
    console.error('[spotify] top error:', err.message)
    res.status(503).json({ error: 'spotify_unavailable' })
  }
})

// --- one-time setup flow: visit /api/spotify/login, approve, get a refresh token back ---
const SCOPES = ['user-read-currently-playing', 'user-read-recently-played', 'user-top-read'].join(' ')

router.get('/login', (req, res) => {
  const { clientId, redirectUri } = getEnv()
  if (!clientId || !redirectUri) {
    return res
      .status(500)
      .send('Set SPOTIFY_CLIENT_ID and SPOTIFY_REDIRECT_URI before visiting this route.')
  }
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
  })
  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`)
})

router.get('/callback', async (req, res) => {
  const { clientId, clientSecret, redirectUri } = getEnv()
  const code = req.query.code
  if (!code) return res.status(400).send('Missing ?code from Spotify redirect.')
  try {
    const tokenRes = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: basicAuthHeader(clientId, clientSecret),
      },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
    })
    if (!tokenRes.ok) throw new Error(`Token exchange failed: ${tokenRes.status}`)
    const data = await tokenRes.json()
    res.send(
      `<pre style="font:14px monospace;padding:24px;white-space:pre-wrap;">` +
        `Copy this into SPOTIFY_REFRESH_TOKEN, then remove/protect this route:\n\n${data.refresh_token}</pre>`,
    )
  } catch (err) {
    res.status(500).send('Token exchange failed: ' + err.message)
  }
})

export default router
