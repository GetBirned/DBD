import express from 'express'

const router = express.Router()

// GitHub's public contribution calendar. This is the same endpoint the profile page itself
// renders from, so it needs no API key — which keeps this widget working without another
// secret to provision. The GraphQL API would be the "official" route but requires a PAT.
const CONTRIBUTIONS_URL = (user) => `https://github.com/users/${user}/contributions`

function getEnv() {
  return {
    // Defaulted so the widget still works if the env var was never set in the host.
    user: process.env.GITHUB_USERNAME || 'GetBirned',
  }
}

// Contribution data changes at most once a day in practice; cache generously so a burst of
// visitors doesn't repeatedly scrape GitHub.
let cache = { data: null, expiresAt: 0 }
const TTL_MS = 60 * 60 * 1000

/**
 * Pulls `data-date` / `data-level` off each day cell, and the contribution count out of the
 * matching <tool-tip> ("No contributions on …" / "3 contributions on …"). Parsed with regex
 * rather than a DOM library to avoid adding a dependency for one endpoint — and every field
 * is optional at the call site, so a markup change degrades to an empty widget, never a crash.
 */
function parseContributions(html) {
  const days = []
  const cellRe = /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="(contribution-day-component-[\d-]+)"[^>]*data-level="(\d)"[^>]*>/g

  const counts = new Map()
  const tipRe = /<tool-tip[^>]*for="(contribution-day-component-[\d-]+)"[^>]*>([^<]*)<\/tool-tip>/g
  let tip
  while ((tip = tipRe.exec(html)) !== null) {
    const text = tip[2]
    const num = /^(\d+)\s+contribution/.exec(text)
    counts.set(tip[1], num ? Number(num[1]) : 0)
  }

  let cell
  while ((cell = cellRe.exec(html)) !== null) {
    const [, date, id, level] = cell
    days.push({ date, level: Number(level), count: counts.get(id) ?? 0 })
  }

  days.sort((a, b) => (a.date < b.date ? -1 : 1))
  return days
}

router.get('/contributions', async (_req, res) => {
  try {
    if (cache.data && cache.expiresAt > Date.now()) {
      return res.json(cache.data)
    }

    const { user } = getEnv()
    const ghRes = await fetch(CONTRIBUTIONS_URL(user), {
      headers: {
        // GitHub returns 404 for requests without a browser-ish UA.
        'User-Agent': 'Mozilla/5.0 (compatible; dartbirnie.dev portfolio)',
        Accept: 'text/html',
      },
    })
    if (!ghRes.ok) throw new Error(`GitHub responded ${ghRes.status}`)

    const days = parseContributions(await ghRes.text())
    if (days.length === 0) throw new Error('no contribution cells found')

    const payload = {
      user,
      days,
      total: days.reduce((sum, d) => sum + d.count, 0),
      profileUrl: `https://github.com/${user}`,
    }

    cache = { data: payload, expiresAt: Date.now() + TTL_MS }
    res.json(payload)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

// The ship's log, for MU/TH/UR: the latest commits across the most recently pushed public repos.
// Without a token the REST API allows 60 requests an hour; a refresh costs six (the repo list,
// then each repo's commits), cached for a quarter of an hour. A GITHUB_TOKEN, if set, raises the
// limit. If GitHub refuses, the last good log is served instead.
let logCache = { data: null, expiresAt: 0 }
const LOG_TTL_MS = 15 * 60 * 1000
const LOG_REPOS = 5
const LOG_ENTRIES = 8

const api = (path) =>
  fetch(`https://api.github.com${path}`, {
    headers: {
      'User-Agent': 'dartbirnie.dev portfolio',
      Accept: 'application/vnd.github+json',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  })

router.get('/log', async (_req, res) => {
  try {
    if (logCache.data && logCache.expiresAt > Date.now()) {
      return res.json(logCache.data)
    }

    const { user } = getEnv()
    const reposRes = await api(`/users/${user}/repos?type=owner&sort=pushed&per_page=${LOG_REPOS}`)
    if (!reposRes.ok) throw new Error(`GitHub responded ${reposRes.status}`)
    const repos = (await reposRes.json()).filter((r) => !r.fork && !r.private)

    const perRepo = await Promise.all(
      repos.map(async (r) => {
        const commitsRes = await api(`/repos/${r.full_name}/commits?per_page=4`)
        if (!commitsRes.ok) return []
        return (await commitsRes.json()).map((c) => ({
          repo: r.name,
          // The summary line only.
          message: c.commit.message.split('\n')[0],
          date: c.commit.author?.date ?? c.commit.committer?.date ?? null,
          url: c.html_url,
        }))
      }),
    )

    const entries = perRepo
      .flat()
      .filter((e) => e.date)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, LOG_ENTRIES)
    const payload = { user, entries }

    logCache = { data: payload, expiresAt: Date.now() + LOG_TTL_MS }
    res.json(payload)
  } catch (err) {
    if (logCache.data) return res.json(logCache.data)
    res.status(502).json({ error: err.message })
  }
})

export default router
