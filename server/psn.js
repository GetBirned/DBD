import express from 'express'
import {
  exchangeNpssoForAccessCode,
  exchangeAccessCodeForAuthTokens,
  exchangeRefreshTokenForAuthTokens,
  getBasicPresence,
  getUserTitles,
} from 'psn-api'

const router = express.Router()

function getEnv() {
  return {
    npsso: process.env.PSN_NPSSO,
    refreshToken: process.env.PSN_REFRESH_TOKEN,
  }
}

// PSN doesn't hand back a clean per-title store URL from these endpoints, so
// link out to a store search instead of leaving the card unclickable.
function storeSearchUrl(name) {
  return `https://store.playstation.com/en-us/search/${encodeURIComponent(name)}`
}

function sumTrophies(counts) {
  if (!counts) return 0
  return (counts.bronze || 0) + (counts.silver || 0) + (counts.gold || 0) + (counts.platinum || 0)
}

// --- token handling ---
// Sony has no official public API — this runs on the well-established unofficial
// `psn-api` library, authenticated via an NPSSO token (see /setup below). Its
// refresh tokens run ~2 months; we keep the freshest one we've seen in memory in
// case PSN rotates it on every use, and only fall back to the .env value on a
// cold start. If it ever goes stale, these routes just fail silently (503) —
// re-run the /setup flow with a fresh NPSSO to mint a new refresh token.
let session = null // { accessToken, refreshToken, expiresAt }

async function getAccessToken() {
  if (session && session.expiresAt > Date.now()) return session.accessToken

  const refreshToken = session?.refreshToken || getEnv().refreshToken
  if (!refreshToken) throw new Error('PSN is not configured (missing refresh token)')

  const auth = await exchangeRefreshTokenForAuthTokens(refreshToken)
  session = {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiresAt: Date.now() + (auth.expiresIn - 60) * 1000,
  }
  return session.accessToken
}

let statusCache = { data: null, expiresAt: 0 }

router.get('/now-playing', async (_req, res) => {
  try {
    if (statusCache.data && statusCache.expiresAt > Date.now()) {
      return res.json(statusCache.data)
    }

    const authorization = { accessToken: await getAccessToken() }

    const presenceRes = await getBasicPresence(authorization, 'me')
    const presence = presenceRes.basicPresence
    const activeGame =
      presence?.availability === 'availableToPlay' ? presence.gameTitleInfoList?.[0] : null

    if (activeGame) {
      const payload = {
        isPlaying: true,
        title: activeGame.titleName,
        image: activeGame.npTitleIconUrl || activeGame.conceptIconUrl || null,
        url: storeSearchUrl(activeGame.titleName),
      }
      statusCache = { data: payload, expiresAt: Date.now() + 30_000 }
      return res.json(payload)
    }

    // Not in a game right now — fall back to the most recently updated trophy
    // title (i.e. the last game actually played; the trophy list never includes
    // streaming apps the way the raw "played games" history does).
    const trophyData = await getUserTitles(authorization, 'me', { limit: 1 })
    const title = trophyData.trophyTitles?.[0]
    const payload = title
      ? {
          isPlaying: false,
          title: title.trophyTitleName,
          image: title.trophyTitleIconUrl,
          url: storeSearchUrl(title.trophyTitleName),
          platinum: title.earnedTrophies?.platinum === 1,
        }
      : { isPlaying: false, title: null }
    statusCache = { data: payload, expiresAt: Date.now() + 30_000 }
    res.json(payload)
  } catch (err) {
    console.error('[psn] now-playing error:', err.message)
    res.status(503).json({ error: 'psn_unavailable' })
  }
})

let topCache = { data: null, expiresAt: 0 }

router.get('/top', async (_req, res) => {
  try {
    if (topCache.data && topCache.expiresAt > Date.now()) {
      return res.json(topCache.data)
    }

    const authorization = { accessToken: await getAccessToken() }
    const trophyData = await getUserTitles(authorization, 'me', { limit: 200 })
    const games = (trophyData.trophyTitles || [])
      .map((t) => ({ ...t, earned: sumTrophies(t.earnedTrophies) }))
      .filter((t) => t.earned > 0)
      .sort((a, b) => b.earned - a.earned)
      .slice(0, 4)
      .map((t) => ({
        id: t.npCommunicationId,
        name: t.trophyTitleName,
        image: t.trophyTitleIconUrl,
        earned: t.earned,
        total: sumTrophies(t.definedTrophies),
        platinum: t.earnedTrophies?.platinum === 1,
        url: storeSearchUrl(t.trophyTitleName),
      }))
    topCache = { data: games, expiresAt: Date.now() + 60 * 60_000 }
    res.json(games)
  } catch (err) {
    console.error('[psn] top error:', err.message)
    res.status(503).json({ error: 'psn_unavailable' })
  }
})

// --- one-time setup: set PSN_NPSSO in .env, restart the server, visit this
// route once, and copy the printed refresh token into PSN_REFRESH_TOKEN. Then
// remove PSN_NPSSO (it's single-use and short-lived) and protect/remove this route.
router.get('/setup', async (_req, res) => {
  try {
    const { npsso } = getEnv()
    if (!npsso) return res.status(400).send('Set PSN_NPSSO in .env, restart, then visit this route.')
    const accessCode = await exchangeNpssoForAccessCode(npsso)
    const auth = await exchangeAccessCodeForAuthTokens(accessCode)
    res.send(
      `<pre style="font:14px monospace;padding:24px;white-space:pre-wrap;">` +
        `Copy this into PSN_REFRESH_TOKEN, then remove PSN_NPSSO and protect/remove this route:\n\n${auth.refreshToken}</pre>`,
    )
  } catch (err) {
    res.status(500).send('NPSSO exchange failed: ' + err.message)
  }
})

export default router
