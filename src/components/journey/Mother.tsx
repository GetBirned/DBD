import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { clients } from '@/data/clients'
import { DOSSIERS, SITE } from '@/data/inquiry'
import { projects } from '@/data/projects'
import { skills, type SkillGroup } from '@/data/skills'
import type { ContributionsData } from '@/hooks/useGitHubData'
import { useMotionOK } from '@/lib/motion'
import { terminal } from '@/lib/sound'

export type RecordKind = 'client' | 'project'

const BOOT = 'Interface 2037 ready for inquiry'
/** How fast the computer prints, in characters a second. */
const CPS = 105

/** Every skill on the card, with the group it's filed under. */
const ENTRIES = skills.flatMap((g) => g.sections.flatMap((s) => s.items.map((name) => ({ name, group: g.label }))))

/** Folds what's typed to a bare key, so "c sharp", "C#" and "csharp" all meet. */
const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/#/g, 'sharp')
    .replace(/\+/g, 'plus')
    .replace(/[^a-z0-9]/g, '')

const KEYED = ENTRIES.map((e) => ({ ...e, keys: [e.name, ...(DOSSIERS[e.name]?.aliases ?? [])].map(fold) }))

const lookup = (q: string) => {
  const k = fold(q)
  return k ? KEYED.find((e) => e.keys.includes(k)) : undefined
}

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

/** The closest files to something it doesn't know: what it starts, contains, or nearly spells. */
function nearest(q: string) {
  const k = fold(q)
  if (!k) return []
  return KEYED.map((e) => ({
    name: e.name,
    d: Math.min(...e.keys.map((key) => (key.startsWith(k) || (k.length > 2 && key.includes(k)) ? 0 : distance(k, key)))),
  }))
    .filter((e) => e.d <= Math.max(1, Math.floor(k.length / 3)))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((e) => e.name)
}

/** The project and client records a dossier can point to, by name. */
const RECORDS = new Map<string, { kind: RecordKind; index: number; tag: string }>([
  ...projects.map((p, index): [string, { kind: RecordKind; index: number; tag: string }] => [p.name, { kind: 'project', index, tag: p.tag }]),
  ...clients.map((c, index): [string, { kind: RecordKind; index: number; tag: string }] => [c.name, { kind: 'client', index, tag: c.tag }]),
])

type Line =
  | { kind: 'text'; text: string; tone?: 'dim' | 'head'; indent?: boolean; pause?: number }
  | { kind: 'record'; text: string; open: () => void }
  | { kind: 'link'; text: string; href: string }
  | { kind: 'ask'; text: string }
  | { kind: 'gap' }

interface Context {
  github: ContributionsData | null
  openRecord: (kind: RecordKind, index: number) => void
}

const SPECIAL: Record<string, () => Line[]> = {
  help: () => [
    { kind: 'text', tone: 'head', text: 'Instructions' },
    { kind: 'text', text: 'Type a skill and press enter, or pick one from the files above.' },
    { kind: 'text', tone: 'dim', text: 'Try:' },
    { kind: 'ask', text: 'C#' },
    { kind: 'ask', text: 'React' },
    { kind: 'ask', text: 'SQL Server' },
  ],
  mother: () => [
    { kind: 'text', tone: 'head', text: 'MU/TH/UR 182 online' },
    { kind: 'text', text: 'All systems nominal.' },
  ],
  specialorder937: () => [
    { kind: 'text', tone: 'head', text: 'Special order 937' },
    { kind: 'text', text: 'Science officer eyes only.' },
    { kind: 'text', tone: 'dim', text: 'Access denied.' },
  ],
  hire: () => [
    { kind: 'text', tone: 'head', text: 'Crew member available for assignment' },
    { kind: 'link', text: 'dartbirnie@gmail.com', href: 'mailto:dartbirnie@gmail.com' },
  ],
}
SPECIAL.muthur = SPECIAL.mother
SPECIAL['937'] = SPECIAL.specialorder937
SPECIAL.order937 = SPECIAL.specialorder937
SPECIAL.contact = SPECIAL.hire
SPECIAL.email = SPECIAL.hire
SPECIAL.commands = SPECIAL.help

/** The computer's reply to a query, line by line. */
function reply(q: string, ctx: Context): Line[] {
  const echo: Line = { kind: 'text', text: `> ${q}` }
  const special = SPECIAL[fold(q)] ?? (fold(q) ? undefined : SPECIAL.help)
  if (special) return [echo, ...special()]

  const lines: Line[] = [echo, { kind: 'text', tone: 'dim', text: 'Searching crew file . . .', pause: 30 }]
  const hit = lookup(q)
  if (!hit) {
    const near = nearest(q)
    lines.push({ kind: 'text', tone: 'head', text: 'Unable to clarify' })
    if (near.length) lines.push({ kind: 'text', tone: 'dim', text: 'Nearest files:' }, ...near.map((text): Line => ({ kind: 'ask', text })))
    else lines.push({ kind: 'text', tone: 'dim', text: 'Type help for instructions.' })
    return lines
  }

  const d = DOSSIERS[hit.name] ?? { about: '' }
  lines.push({ kind: 'text', tone: 'head', text: `File · ${hit.name} · ${hit.group}` })
  if (d.about) lines.push({ kind: 'text', text: d.about })

  const built = (d.built ?? []).map((b) => (typeof b === 'string' ? ([b, undefined] as const) : b))
  if (built.length) {
    lines.push({ kind: 'gap' }, { kind: 'text', tone: 'dim', text: 'Built with it' })
    for (const [name, note] of built) {
      if (name === SITE) {
        lines.push({ kind: 'text', text: `› dartbirnie.dev · ${note ?? 'this ship. you are here'}` })
        continue
      }
      const r = RECORDS.get(name)
      if (r) lines.push({ kind: 'record', text: `${name} · ${note ?? r.tag}`, open: () => ctx.openRecord(r.kind, r.index) })
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
    for (const [name, what, repo] of d.archive) lines.push({ kind: 'link', text: `${name} · ${what}`, href: repo })
  }
  if (!built.length && !d.service?.length && !d.archive?.length && !d.live)
    lines.push({ kind: 'gap' }, { kind: 'text', tone: 'dim', text: 'No mission records on file. Listed under technical skills.' })
  lines.push({ kind: 'gap' }, { kind: 'text', tone: 'dim', text: 'End of file.' })
  return lines
}

/** What a line prints, character for character. */
const printed = (l: Line) => (l.kind === 'gap' ? '' : l.kind === 'record' || l.kind === 'ask' ? `› ${l.text}` : l.kind === 'link' ? `↗ ${l.text}` : l.text)
/** How long the printer dwells on a line, in characters: its text, plus any beat after it. */
const span = (l: Line) => printed(l).length + (l.kind === 'gap' ? 10 : l.kind === 'text' ? (l.pause ?? 0) : 0)

/** Scrolls the screen (not the page behind it) just enough to keep an element in view. */
function keepInView(el: HTMLElement | null) {
  const box = el?.closest<HTMLElement>('.overflow-y-auto')
  if (!el || !box) return
  const r = el.getBoundingClientRect()
  const b = box.getBoundingClientRect()
  if (r.bottom > b.bottom - 8) box.scrollTop += r.bottom - b.bottom + 8
}

const Cursor = ({ at }: { at?: (el: HTMLSpanElement | null) => void }) => <span ref={at} aria-hidden className="crt-cursor" />

/**
 * MU/TH/UR, the Nostromo's computer, as the skills screen: it boots with the film's prompt, lists
 * the skills in the chosen file, and takes inquiries — picked from the list or typed at the
 * blinking cursor. Each answer prints line by line: what the skill is, the records on this site
 * built with it (which open on the ship's screen), where it was used on the job, and older work on
 * GitHub. Everything it knows is in data/inquiry.ts.
 */
export default function Mother({
  group,
  onGroup,
  asked,
  onAsk,
  instant,
  github,
  onOpenRecord,
}: {
  group: SkillGroup
  onGroup: (g: SkillGroup) => void
  /** The current inquiry, kept by the scene so it's still on screen after visiting a record. */
  asked: { q: string; at: number } | null
  onAsk: (q: string) => void
  /** Show everything at once: coming back from a record, nothing needs printing again. */
  instant: boolean
  github: ContributionsData | null
  onOpenRecord: (kind: RecordKind, index: number) => void
}) {
  const motionOK = useMotionOK()
  const still = instant || !motionOK

  // Booting: the film's prompt prints, then the files and the cursor come up.
  const [boot, setBoot] = useState(still ? BOOT.length : 0)
  const booted = boot >= BOOT.length
  useEffect(() => {
    if (booted) return
    const t = window.setTimeout(() => setBoot((n) => n + 1), boot === 0 ? 380 : 32)
    return () => clearTimeout(t)
  }, [boot, booted])

  const lines = useMemo(() => (asked ? reply(asked.q, { github, openRecord: onOpenRecord }) : []), [asked, github, onOpenRecord])
  const starts = useMemo(() => lines.reduce<number[]>((acc, _, i) => [...acc, i === 0 ? 0 : acc[i - 1] + span(lines[i - 1])], []), [lines])
  const total = lines.length ? starts[lines.length - 1] + span(lines[lines.length - 1]) : 0

  // Printing an answer, a few characters a frame; each new line blips as it starts.
  const [shown, setShown] = useState(Infinity)
  // The inquiry already printed: the one on screen when this mounted, back from a record.
  const printedAt = useRef(instant ? asked?.at : undefined)
  useEffect(() => {
    if (!asked || asked.at === printedAt.current) return
    printedAt.current = asked.at
    terminal.page()
    if (!motionOK) {
      setShown(Infinity)
      return
    }
    setShown(0)
    const t0 = performance.now()
    let raf = requestAnimationFrame(function step(now) {
      const n = Math.floor(((now - t0) / 1000) * CPS)
      setShown(n)
      if (n < total) raf = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(raf)
    // `asked.at` marks each inquiry, even the same one asked twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asked?.at])

  const printing = shown < total
  const current = printing ? lines.findIndex((l, i) => shown >= starts[i] && shown < starts[i] + span(l)) : -1
  const blipped = useRef(-1)
  useEffect(() => {
    if (current > 0 && current !== blipped.current && lines[current].kind !== 'gap') terminal.select()
    blipped.current = current
  }, [current, lines])

  const cursorEl = useRef<HTMLSpanElement | null>(null)
  useEffect(() => keepInView(cursorEl.current), [current, booted])

  // The prompt.
  const [value, setValue] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const history = useRef<string[]>([])
  const back = useRef(-1)
  const ghost = useMemo(() => {
    if (!value.trim()) return ''
    const v = value.toLowerCase()
    const inGroup = (name: string) => group.sections.some((s) => s.items.includes(name))
    const hit = [...ENTRIES].sort((a, b) => Number(inGroup(b.name)) - Number(inGroup(a.name))).find((e) => e.name.toLowerCase().startsWith(v))
    return hit ? hit.name.slice(value.length) : ''
  }, [value, group])

  useEffect(() => {
    if (booted && matchMedia('(pointer: fine)').matches) input.current?.focus({ preventScroll: true })
  }, [booted])

  const ask = (q: string) => {
    history.current = [q, ...history.current.filter((h) => h !== q)].slice(0, 20)
    back.current = -1
    setValue('')
    onAsk(q)
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const q = value.trim()
      if (q) ask(q)
      else if (printing) setShown(Infinity)
    } else if ((e.key === 'Tab' || (e.key === 'ArrowRight' && input.current?.selectionStart === value.length)) && ghost) {
      e.preventDefault()
      setValue(value + ghost)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const h = history.current
      back.current = Math.max(-1, Math.min(h.length - 1, back.current + (e.key === 'ArrowUp' ? 1 : -1)))
      setValue(back.current < 0 ? '' : h[back.current])
    }
  }

  // Typing anywhere on the screen goes to the prompt.
  const toPrompt = (e: KeyboardEvent) => {
    if (e.target !== input.current && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) input.current?.focus({ preventScroll: true })
  }

  const items = group.sections.flatMap((s) => s.items)
  const askedName = asked ? lookup(asked.q)?.name : undefined

  const renderLine = (l: Line, i: number): ReactNode => {
    if (printing && shown < starts[i]) return null
    const text = printed(l)
    const cut = printing ? text.slice(0, Math.max(0, shown - starts[i])) : text
    const cur =
      i === current && l.kind !== 'gap' ? (
        <Cursor
          at={(el) => {
            cursorEl.current = el
          }}
        />
      ) : null
    switch (l.kind) {
      case 'gap':
        return <div key={i} className="h-[0.9em]" />
      case 'record':
        return (
          <button key={i} type="button" onClick={l.open} className="crt-link block w-full px-1 text-left uppercase">
            {cut}
            {cur}
          </button>
        )
      case 'ask':
        return (
          <button key={i} type="button" onClick={() => ask(l.text)} className="crt-link block px-1 text-left uppercase">
            {cut}
            {cur}
          </button>
        )
      case 'link':
        return (
          <a key={i} href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})} className="crt-link block px-1 uppercase">
            {cut}
            {cur}
          </a>
        )
      default:
        return (
          <div key={i} className={`px-1 ${l.tone === 'dim' ? 'crt-dim' : ''} ${l.indent ? 'pl-[2.4ch]' : ''}`}>
            {l.tone === 'head' ? <span className="bg-[#8dffbf] px-1 text-[#03241a] [text-shadow:none]">{cut}</span> : cut}
            {cur}
          </div>
        )
    }
  }

  return (
    <div onKeyDown={toPrompt} className="min-h-[min(68svh,660px)] uppercase">
      <div className="text-[1.15em]">
        {BOOT.slice(0, boot)}
        {!booted && <Cursor />}
      </div>

      {booted && (
        <>
          <div className="crt-dim">Crew file · Birnie, D. · type or pick a skill</div>

          <div role="tablist" aria-label="Files" className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="crt-dim mr-1">Files</span>
            {skills.map((g) => (
              <button
                key={g.label}
                type="button"
                role="tab"
                aria-selected={g.label === group.label}
                onClick={() => {
                  if (g.label === group.label) return
                  terminal.select()
                  onGroup(g)
                }}
                className={`crt-link px-1 uppercase ${g.label === group.label ? 'bg-[#8dffbf] text-[#03241a] [text-shadow:none]' : ''}`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-6 md:grid-cols-3">
            {items.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => ask(name)}
                aria-current={name === askedName ? 'true' : undefined}
                className={`crt-link flex min-w-0 gap-3 px-1 text-left uppercase ${name === askedName ? 'bg-[#8dffbf] text-[#03241a] [text-shadow:none]' : ''}`}
              >
                <span className={name === askedName ? '' : 'crt-dim'}>{String(i + 1).padStart(2, '0')}</span>
                <span className="truncate">{name}</span>
              </button>
            ))}
          </div>

          <label className="relative mt-6 flex cursor-text items-baseline px-1">
            <span aria-hidden className="whitespace-pre">{'> '}</span>
            <span aria-hidden className="whitespace-pre">{value}</span>
            {!printing && (
              <Cursor
                at={(el) => {
                  cursorEl.current = el
                }}
              />
            )}
            <span aria-hidden className="crt-dim whitespace-pre">{ghost}</span>
            <input
              ref={input}
              value={value}
              onChange={(e) => {
                back.current = -1
                setValue(e.target.value)
              }}
              onKeyDown={onKey}
              aria-label="Ask MU/TH/UR about a skill"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="send"
              maxLength={40}
              className="absolute inset-0 w-full cursor-text text-[16px] opacity-0"
            />
          </label>

          <div aria-live="polite" className="mt-3" onClick={() => printing && setShown(Infinity)}>
            {lines.map(renderLine)}
          </div>
        </>
      )}
    </div>
  )
}
