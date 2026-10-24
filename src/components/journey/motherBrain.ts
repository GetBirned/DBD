import { CHAPTER_LINKS, type ChapterId } from '@/components/chapters'
import { clients } from '@/data/clients'
import { experience } from '@/data/experience'
import { DOSSIERS, SITE } from '@/data/inquiry'
import { projects } from '@/data/projects'
import { skills } from '@/data/skills'
import type { ContributionsData } from '@/hooks/useGitHubData'
import type { ScreenId } from '@/lib/ship'

/*
 * What MU/TH/UR knows and how it answers: a directory of everything aboard — project and client
 * records, personnel files, the scenes' screens, the course through the site, the skill files and
 * every skill, the soundtrack — searched as you type, and a reply for each, printed line by line,
 * often ending in something it does (opening a record, setting a course).
 */

export type RecordKind = 'client' | 'project'

/** Something the computer does once it has answered. */
export type Action =
  | { type: 'record'; kind: RecordKind; index: number }
  | { type: 'screen'; id: ScreenId }
  | { type: 'goto'; id: ChapterId }
  | { type: 'group'; label: string }
  | { type: 'play' }
  | { type: 'stop' }

export type Line =
  | { kind: 'text'; text: string; tone?: 'dim' | 'head'; indent?: boolean; pause?: number }
  | { kind: 'act'; text: string; action: Action }
  | { kind: 'link'; text: string; href: string }
  | { kind: 'ask'; text: string }
  | { kind: 'gap' }

export interface Reply {
  lines: Line[]
  /** Done as soon as it's asked (sound has to start on the keypress that asked for it). */
  now?: Action
  /** Done once the answer has printed. */
  then?: Action
}

export type Kind = 'record' | 'client' | 'crew' | 'screen' | 'course' | 'file' | 'skill' | 'audio' | 'command'

/** How each kind of entry is labeled in the search results. */
export const KIND_LABEL: Record<Kind, string> = {
  record: 'project',
  client: 'client',
  crew: 'crew',
  screen: 'screen',
  course: 'course',
  file: 'file',
  skill: 'skill',
  audio: 'audio',
  command: 'command',
}

/** When matches tie, records come first and commands last. */
const ORDER: Kind[] = ['record', 'client', 'crew', 'screen', 'course', 'file', 'skill', 'audio', 'command']

export interface Entry {
  id: string
  kind: Kind
  label: string
  /** A short detail beside it in the results. */
  sub?: string
  /** Folded names it answers to. */
  keys: string[]
  /** Its folded words, any of which a search can start. */
  words: string[]
  reply: (echo: string, ctx: Context) => Reply
}

export interface Context {
  github: ContributionsData | null
}

/** Folds what's typed to a bare key, so "c sharp", "C#" and "csharp" all meet. */
export const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/#/g, 'sharp')
    .replace(/\+/g, 'plus')
    .replace(/[^a-z0-9]/g, '')

const wordsOf = (s: string) => s.split(/[^a-zA-Z0-9#+]+/).map(fold).filter(Boolean)

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const was = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = was
    }
  }
  return row[b.length]
}

const echoLine = (echo: string): Line => ({ kind: 'text', text: `> ${echo}` })
const searching = (what: string): Line => ({ kind: 'text', tone: 'dim', text: `Searching ${what} . . .`, pause: 30 })

// ---- the directory

const PROJECT_ALIASES: Record<string, string[]> = {
  FieldLogger: ['field logger', 'logger'],
  'B2W API Help Guide': ['b2w', 'b2w api', 'api guide', 'api help', 'b2w api site', 'b2wapi'],
  DartERP: ['erp', 'dart erp'],
  DeadLotto: ['dead lotto', 'deadlock'],
  FortLotto: ['fort lotto', 'fortnite'],
  'Die Or Die': ['dieordie', 'dice'],
  PiRail: ['pi rail', 'railroad', 'track chart', 'capstone'],
}

const projectEntries: Entry[] = projects.map((p, index) => ({
  id: `record:${p.name}`,
  kind: 'record',
  label: p.name,
  sub: p.tag,
  keys: [p.name, ...(PROJECT_ALIASES[p.name] ?? [])].map(fold),
  words: wordsOf(p.name),
  reply: (echo) => ({
    lines: [
      echoLine(echo),
      searching('ship records'),
      { kind: 'text', tone: 'head', text: `Project record · ${p.name}` },
      { kind: 'text', text: p.pitch },
      { kind: 'text', tone: 'dim', text: p.stack },
      { kind: 'gap' },
      { kind: 'text', tone: 'dim', text: 'Opening record . . .' },
    ],
    then: { type: 'record', kind: 'project', index },
  }),
}))

const host = (url?: string) => (url ? new URL(url).hostname.replace(/^www\./, '').split('.')[0] : '')

const clientEntries: Entry[] = clients.map((c, index) => ({
  id: `client:${c.name}`,
  kind: 'client',
  label: c.name,
  sub: c.tag,
  keys: [c.name, host(c.url)].filter(Boolean).map(fold),
  words: wordsOf(c.name),
  reply: (echo) => ({
    lines: [
      echoLine(echo),
      searching('client records'),
      { kind: 'text', tone: 'head', text: `Client record · ${c.name}` },
      { kind: 'text', tone: 'dim', text: [c.tag, c.loc].filter(Boolean).join(' · ') },
      { kind: 'text', text: c.desc },
      { kind: 'gap' },
      { kind: 'text', tone: 'dim', text: 'Opening record . . .' },
    ],
    then: { type: 'record', kind: 'client', index },
  }),
}))

const company = (name: string) => name.replace(' Inc.', '')

const crewEntries: Entry[] = experience.map((e, index) => ({
  id: `crew:${index}`,
  kind: 'crew',
  label: `${company(e.company)} · ${e.role}`,
  sub: e.dateRange,
  keys: [company(e.company), e.role, `${company(e.company)} ${e.role}`].map(fold),
  words: wordsOf(`${company(e.company)} ${e.role}`),
  reply: (echo) => ({
    lines: [
      echoLine(echo),
      searching('personnel files'),
      { kind: 'text', tone: 'head', text: `Personnel file · ${company(e.company)}` },
      { kind: 'text', text: e.role },
      { kind: 'text', tone: 'dim', text: `${e.dateRange} · ${e.location}` },
      { kind: 'gap' },
      { kind: 'text', tone: 'dim', text: 'Opening file . . .' },
    ],
    then: { type: 'screen', id: `personnel:${index}` },
  }),
}))

const screen = (id: ScreenId, label: string, sub: string, keys: string[]): Entry => ({
  id: `screen:${id}`,
  kind: 'screen',
  label,
  sub,
  keys: [label, ...keys].map(fold),
  words: wordsOf(label),
  reply: (echo) => ({
    lines: [echoLine(echo), { kind: 'text', tone: 'head', text: label }, { kind: 'text', tone: 'dim', text: 'Switching screens . . .' }],
    then: { type: 'screen', id },
  }),
})

const screenEntries: Entry[] = [
  screen('map', 'Survey map · Alton Bay, NH', 'where this was filmed', ['map', 'alton', 'alton nh', 'alton bay', 'survey', 'filmed in', 'home']),
  screen('log:games', 'Recreation log · Games', 'Steam and PlayStation', ['games', 'gaming', 'steam', 'playstation', 'psn', 'video games']),
  screen('log:music', 'Recreation log · Music', 'Spotify', ['music', 'spotify', 'listening', 'songs']),
  screen('log:movies', 'Recreation log · Movies', 'four favorites', ['movies', 'films', 'posters', 'favorite movies', 'favorite films']),
  screen('words:coworkers', 'Transmissions · Coworkers', 'in their words', ['coworkers', 'references', 'recommendations']),
  screen('words:clients', 'Transmissions · Clients', 'in their words', ['client reviews', 'reviews', 'testimonials', 'in their words']),
]

const CHAPTER_KEYS: Record<ChapterId, string[]> = {
  top: ['top', 'start', 'beginning', 'opening', 'credits', 'opening credits'],
  words: ['words', 'in their words'],
  clients: ['clients', 'client work', 'sites', 'websites'],
  projects: ['projects', 'personal projects'],
  skills: ['skills', 'stack'],
  life: ['life', 'off the clock', 'hobbies', 'recreation', 'fun'],
  contact: ['contact', 'contact me'],
}

const courseEntries: Entry[] = CHAPTER_LINKS.map(({ id, label }) => ({
  id: `course:${id}`,
  kind: 'course',
  label: `Course · ${label}`,
  sub: 'fly there',
  keys: [label, ...CHAPTER_KEYS[id]].flatMap((k) => [k, `goto ${k}`, `go to ${k}`]).map(fold),
  words: wordsOf(label),
  reply: (echo) => ({
    lines: [echoLine(echo), { kind: 'text', tone: 'head', text: `Course set · ${label}` }, { kind: 'text', tone: 'dim', text: 'Engaging . . .' }],
    then: { type: 'goto', id },
  }),
}))

const fileEntries: Entry[] = skills.map((g) => {
  const count = g.sections.reduce((n, s) => n + s.items.length, 0)
  return {
    id: `file:${g.label}`,
    kind: 'file',
    label: g.label,
    sub: `${count} skills`,
    keys: [g.label].map(fold),
    words: wordsOf(g.label),
    reply: (echo) => ({
      lines: [
        echoLine(echo),
        { kind: 'text', tone: 'head', text: `File · ${g.label} · ${count} entries` },
        { kind: 'text', tone: 'dim', text: 'Listed above. Pick one, or type it.' },
      ],
      now: { type: 'group', label: g.label },
    }),
  }
})

/** The project and client records a dossier can point to, by name. */
const RECORDS = new Map<string, { kind: RecordKind; index: number; tag: string }>()
projects.forEach((p, index) => RECORDS.set(p.name, { kind: 'project', index, tag: p.tag }))
clients.forEach((c, index) => RECORDS.set(c.name, { kind: 'client', index, tag: c.tag }))

/** What the computer says about a skill: everything in its dossier. */
function dossier(name: string, group: string, echo: string, ctx: Context): Reply {
  const d = DOSSIERS[name] ?? { about: '' }
  const lines: Line[] = [echoLine(echo), searching('crew file'), { kind: 'text', tone: 'head', text: `File · ${name} · ${group}` }]
  if (d.about) lines.push({ kind: 'text', text: d.about })

  const built = (d.built ?? []).map((b) => (typeof b === 'string' ? ([b, undefined] as const) : b))
  if (built.length) {
    lines.push({ kind: 'gap' }, { kind: 'text', tone: 'dim', text: 'Built with it' })
    for (const [what, note] of built) {
      if (what === SITE) {
        lines.push({ kind: 'text', text: `› dartbirnie.dev · ${note ?? 'this ship. you are here'}` })
        continue
      }
      const r = RECORDS.get(what)
      if (r) lines.push({ kind: 'act', text: `${what} · ${note ?? r.tag}`, action: { type: 'record', kind: r.kind, index: r.index } })
    }
  }
  if (d.service?.length) {
    lines.push({ kind: 'gap' }, { kind: 'text', tone: 'dim', text: 'In service' })
    for (const [post, what] of d.service) lines.push({ kind: 'text', text: `· ${post}` }, { kind: 'text', tone: 'dim', indent: true, text: what })
  }
  if (d.live === 'github') {
    lines.push({ kind: 'gap' }, { kind: 'text', tone: 'dim', text: 'Activity · last 12 months' })
    if (ctx.github && ctx.github.total > 0) lines.push({ kind: 'text', text: `${ctx.github.total.toLocaleString()} contributions` })
    lines.push({ kind: 'link', text: `github.com/${ctx.github?.user ?? 'GetBirned'}`, href: ctx.github?.profileUrl ?? 'https://github.com/GetBirned' })
  }
  if (d.archive?.length) {
    lines.push({ kind: 'gap' }, { kind: 'text', tone: 'dim', text: 'Archive · GitHub' })
    for (const [repo, what, href] of d.archive) lines.push({ kind: 'link', text: `${repo} · ${what}`, href })
  }
  if (!built.length && !d.service?.length && !d.archive?.length && !d.live)
    lines.push({ kind: 'gap' }, { kind: 'text', tone: 'dim', text: 'No mission records on file. Listed under technical skills.' })
  lines.push({ kind: 'gap' }, { kind: 'text', tone: 'dim', text: 'End of file.' })
  return { lines }
}

const skillEntries: Entry[] = skills.flatMap((g) =>
  g.sections.flatMap((s) =>
    s.items.map(
      (name): Entry => ({
        id: `skill:${name}`,
        kind: 'skill',
        label: name,
        sub: g.label,
        keys: [name, ...(DOSSIERS[name]?.aliases ?? [])].map(fold),
        words: wordsOf(name),
        reply: (echo, ctx) => dossier(name, g.label, echo, ctx),
      }),
    ),
  ),
)

const HELP: Line[] = [
  { kind: 'text', tone: 'head', text: 'Instructions' },
  { kind: 'text', text: 'Type anything aboard and press enter: a project, a client, a job, a skill, a place to go.' },
  { kind: 'text', tone: 'dim', text: 'Try:' },
  { kind: 'ask', text: 'DeadLotto' },
  { kind: 'ask', text: 'Trimble' },
  { kind: 'ask', text: 'goto contact' },
  { kind: 'ask', text: 'play alien' },
  { kind: 'ask', text: 'C#' },
]

const HIRE: Line[] = [
  { kind: 'text', tone: 'head', text: 'Crew member available for assignment' },
  { kind: 'link', text: 'dartbirnie@gmail.com', href: 'mailto:dartbirnie@gmail.com' },
  { kind: 'link', text: 'Resume · PDF', href: '/resume.pdf' },
]

const command = (id: string, label: string, sub: string, keys: string[], reply: Entry['reply']): Entry => ({
  id: `command:${id}`,
  kind: 'command',
  label,
  sub,
  keys: [label, ...keys].map(fold),
  words: wordsOf(label),
  reply,
})

const otherEntries: Entry[] = [
  {
    id: 'audio:play',
    kind: 'audio',
    label: 'Play soundtrack',
    sub: 'Alien (1979) · main title',
    keys: ['play', 'play alien', 'play music', 'play soundtrack', 'play theme', 'soundtrack', 'alien', 'theme', 'main title', 'sound on', 'music on', 'unmute'].map(fold),
    words: ['play', 'soundtrack'],
    reply: (echo) => ({
      lines: [echoLine(echo), { kind: 'text', tone: 'head', text: 'Audio · Alien (1979) · main title' }, { kind: 'text', text: 'Playing.' }],
      now: { type: 'play' },
    }),
  },
  {
    id: 'audio:stop',
    kind: 'audio',
    label: 'Stop soundtrack',
    sub: 'and the sound effects',
    keys: ['stop', 'stop music', 'stop soundtrack', 'mute', 'silence', 'quiet', 'sound off', 'music off', 'pause'].map(fold),
    words: ['stop', 'soundtrack'],
    reply: (echo) => ({
      lines: [echoLine(echo), { kind: 'text', tone: 'head', text: 'Audio' }, { kind: 'text', text: 'Silenced.' }],
      now: { type: 'stop' },
    }),
  },
  command('resume', 'Resume', 'PDF', ['cv', 'resume pdf'], (echo) => ({
    lines: [echoLine(echo), { kind: 'text', tone: 'head', text: 'Crew resume' }, { kind: 'link', text: 'Resume · PDF', href: '/resume.pdf' }],
  })),
  command('hire', 'Email', 'dartbirnie@gmail.com', ['hire', 'hire me', 'contact me', 'mail', 'reach'], (echo) => ({ lines: [echoLine(echo), ...HIRE] })),
  command('help', 'Help', 'what to ask', ['commands', 'instructions'], (echo) => ({ lines: [echoLine(echo), ...HELP] })),
]

/** Everything aboard, as one searchable list. */
export const DIRECTORY: Entry[] = [
  ...projectEntries,
  ...clientEntries,
  ...crewEntries,
  ...screenEntries,
  ...courseEntries,
  ...fileEntries,
  ...skillEntries,
  ...otherEntries,
]
const BY_ID = new Map(DIRECTORY.map((e) => [e.id, e]))
export const entryById = (id: string) => BY_ID.get(id)

/** Answers only to their exact words, and never show up in a search. */
const SECRETS: Record<string, () => Line[]> = {
  mother: () => [
    { kind: 'text', tone: 'head', text: 'MU/TH/UR 182 online' },
    { kind: 'text', text: 'All systems nominal.' },
  ],
  specialorder937: () => [
    { kind: 'text', tone: 'head', text: 'Special order 937' },
    { kind: 'text', text: 'Science officer eyes only.' },
    { kind: 'text', tone: 'dim', text: 'Access denied.' },
  ],
}
SECRETS.muthur = SECRETS.mother
SECRETS['937'] = SECRETS.specialorder937
SECRETS.order937 = SECRETS.specialorder937

// ---- search

/** Phrasings people put in front of what they're after. */
const LEAD = /^(?:open|show(?: me)?|find|search(?: for)?|ask(?: about)?|about|what(?:'?s| is| are)|tell me about|who is|where is|look up)\s+/
const COURSE_LEAD = /^(?:go ?to|go|take me to|fly to|head to|set course for|course for|course)\s+/

/** How well an entry matches a folded query: 0 is exact; Infinity is no match. */
function score(e: Entry, q: string) {
  let best = Infinity
  for (const k of e.keys) {
    if (k === q) return 0
    if (k.startsWith(q)) best = Math.min(best, 1)
    else if (q.length >= 3 && k.includes(q)) best = Math.min(best, 3)
    else if (q.length >= 4 && Math.abs(k.length - q.length) <= 2) {
      const d = distance(q, k)
      if (d <= (q.length >= 7 ? 2 : 1)) best = Math.min(best, 4 + d)
    }
  }
  if (best > 2 && e.words.some((w) => w.startsWith(q))) best = 2
  return best
}

/** The best matches for what's typed, best first. */
export function search(raw: string, limit = 6): Entry[] {
  let s = raw.toLowerCase().trim()
  const course = COURSE_LEAD.test(s)
  s = s.replace(COURSE_LEAD, '').replace(LEAD, '')
  const q = fold(s)
  if (!q) return []
  let hits = DIRECTORY.map((e) => ({ e, s: score(e, q) })).filter((h) => h.s < Infinity)
  if (course) {
    const places = hits.filter((h) => h.e.kind === 'course' || h.e.kind === 'screen')
    if (places.length) hits = places
  }
  hits.sort((a, b) => a.s - b.s || ORDER.indexOf(a.e.kind) - ORDER.indexOf(b.e.kind))
  return hits.slice(0, limit).map((h) => h.e)
}

/** The nearest things to something it doesn't know, by spelling. */
function nearest(raw: string) {
  const q = fold(raw.toLowerCase().replace(COURSE_LEAD, '').replace(LEAD, ''))
  if (!q) return []
  return DIRECTORY.map((e) => ({ e, d: Math.min(...e.keys.map((k) => distance(q, k))) }))
    .filter((h) => h.d <= Math.max(2, Math.floor(q.length / 2)))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((h) => h.e)
}

/** The computer's reply to anything typed at the prompt. */
export function respond(raw: string, ctx: Context): Reply {
  const k = fold(raw)
  if (!k) return { lines: [echoLine(raw), ...HELP] }
  const secret = SECRETS[k]
  if (secret) return { lines: [echoLine(raw), ...secret()] }
  const [top] = search(raw, 1)
  if (top) return top.reply(raw, ctx)
  const near = nearest(raw)
  return {
    lines: [
      echoLine(raw),
      searching('ship records'),
      { kind: 'text', tone: 'head', text: 'Unable to clarify' },
      ...(near.length
        ? [{ kind: 'text', tone: 'dim', text: 'Nearest records:' } as Line, ...near.map((e): Line => ({ kind: 'ask', text: e.label }))]
        : [{ kind: 'text', tone: 'dim', text: 'Type help for instructions.' } as Line]),
    ],
  }
}
