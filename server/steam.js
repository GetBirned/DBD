import express from 'express'

const router = express.Router()

const STEAM_API_URL = 'https://api.steampowered.com'

function getEnv() {
  return {
    apiKey: process.env.STEAM_API_KEY,
    steamId: process.env.STEAM_ID,
  }
}

// Predictable Steam CDN path — no API key needed, works for any app that has store art.
function headerImage(appid) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`
}

function storeUrl(appid) {
  return `https://store.steampowered.com/app/${appid}`
}

function formatHours(minutes) {
  if (!minutes) return null
  const hours = minutes / 60
  return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)} hrs`
}

// simple response cache so a burst of visitors doesn't hammer Steam
let statusCache = { data: null, expiresAt: 0 }

router.get('/now-playing', async (_req, res) => {
  try {
    const { apiKey, steamId } = getEnv()
    if (!apiKey || !steamId) throw new Error('Steam is not configured (missing api key / steam id)')
    if (statusCache.data && statusCache.expiresAt > Date.now()) {
      return res.json(statusCache.data)
    }

    const summaryRes = await fetch(
      `${STEAM_API_URL}/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`,
    )
    if (!summaryRes.ok) throw new Error(`Steam summary request failed: ${summaryRes.status}`)
    const summaryData = await summaryRes.json()
    const player = summaryData.response?.players?.[0]

    if (player?.gameid && player?.gameextrainfo) {
      const payload = {
        isPlaying: true,
        title: player.gameextrainfo,
        subtitle: 'Playing now',
        image: headerImage(player.gameid),
        url: storeUrl(player.gameid),
      }
      statusCache = { data: payload, expiresAt: Date.now() + 30_000 }
      return res.json(payload)
    }

    // Not in a game right now — fall back to the most recently played one.
    const recentRes = await fetch(
      `${STEAM_API_URL}/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamId}&count=1`,
    )
    if (!recentRes.ok) throw new Error(`Steam recently-played request failed: ${recentRes.status}`)
    const recentData = await recentRes.json()
    const game = recentData.response?.games?.[0]
    const payload = game
      ? {
          isPlaying: false,
          title: game.name,
          subtitle: formatHours(game.playtime_forever) ? `${formatHours(game.playtime_forever)} played` : null,
          image: headerImage(game.appid),
          url: storeUrl(game.appid),
        }
      : { isPlaying: false, title: null }
    statusCache = { data: payload, expiresAt: Date.now() + 30_000 }
    res.json(payload)
  } catch (err) {
    console.error('[steam] now-playing error:', err.message)
    res.status(503).json({ error: 'steam_unavailable' })
  }
})

// "Recently played" (last 2 weeks) is too sparse on a quiet week to fill a
// 4-up grid, so this ranks the whole owned-games library by all-time playtime
// instead — always has something to show, and it's the more honest "most played".
let topGamesCache = { data: null, expiresAt: 0 }

router.get('/top', async (_req, res) => {
  try {
    const { apiKey, steamId } = getEnv()
    if (!apiKey || !steamId) throw new Error('Steam is not configured (missing api key / steam id)')
    if (topGamesCache.data && topGamesCache.expiresAt > Date.now()) {
      return res.json(topGamesCache.data)
    }

    const r = await fetch(
      `${STEAM_API_URL}/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_played_free_games=1&include_appinfo=1`,
    )
    if (!r.ok) throw new Error(`Steam owned-games request failed: ${r.status}`)
    const data = await r.json()
    const games = (data.response?.games || [])
      .filter((g) => g.playtime_forever > 0)
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .slice(0, 4)
      .map((g) => ({
        appid: g.appid,
        name: g.name,
        image: headerImage(g.appid),
        hoursTotal: formatHours(g.playtime_forever),
        url: storeUrl(g.appid),
      }))
    topGamesCache = { data: games, expiresAt: Date.now() + 60 * 60_000 }
    res.json(games)
  } catch (err) {
    console.error('[steam] top error:', err.message)
    res.status(503).json({ error: 'steam_unavailable' })
  }
})

export default router
