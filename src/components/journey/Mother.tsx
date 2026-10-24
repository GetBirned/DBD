import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Ascii } from '@/components/Monitor'
import { MOTHER_ASCII } from '@/data/motherArt'
import { skills, type SkillGroup } from '@/data/skills'
import type { ContributionsData } from '@/hooks/useGitHubData'
import { useMotionOK } from '@/lib/motion'
import { terminal } from '@/lib/sound'
import { entryById, KIND_LABEL, respond, search, type Action, type Entry, type Line, type Reply } from './motherBrain'

const BOOT = 'Interface 2037 ready for inquiry'
/** How fast the computer prints, in characters a second. */
const CPS = 105
const TRY = ['DeadLotto', 'Trimble', 'goto contact', 'play alien', 'C#']

/** One question put to the computer: what was typed, and the entry picked for it, if one was. */
export interface Asked {
  q: string
  id?: string
  at: number
}

/** What a line prints, character for character. */
const printed = (l: Line) => (l.kind === 'gap' ? '' : l.kind === 'act' || l.kind === 'ask' ? `› ${l.text}` : l.kind === 'link' ? `↗ ${l.text}` : l.text)
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

const INVERSE = 'bg-[#8dffbf] text-[#03241a] [text-shadow:none]'

const Cursor = ({ at }: { at?: (el: HTMLSpanElement | null) => void }) => <span ref={at} aria-hidden className="crt-cursor" />

/** The time in Alton, NH, kept current. */
function useAltonTime() {
  const read = () => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' }).format(new Date())
  const [time, setTime] = useState(read)
  useEffect(() => {
    const t = window.setInterval(() => setTime(read()), 15000)
    return () => clearInterval(t)
  }, [])
  return time
}

/**
 * MU/TH/UR, the Nostromo's computer, as the site's own: the DB mark and its name across the top,
 * the film's prompt, and a cursor that searches everything aboard as you type — projects,
 * clients, jobs, the scenes' screens, places to go, every skill, the soundtrack. Each answer
 * prints line by line, and many end by doing something: opening a record, switching screens,
 * setting a course. With a skill file open, its skills are listed to pick from. What it knows and
 * how it answers is in motherBrain.ts.
 */
export default function Mother({
  group,
  onGroup,
  asked,
  onAsk,
  instant,
  github,
  onAction,
}: {
  group: SkillGroup | null
  onGroup: (g: SkillGroup) => void
  /** The current question, kept by the host so it's still on screen after visiting a record. */
  asked: Asked | null
  onAsk: (a: Asked) => void
  /** Show everything at once: coming back from a record, nothing needs printing again. */
  instant: boolean
  github: ContributionsData | null
  onAction: (a: Action) => void
}) {
  const motionOK = useMotionOK()
  const still = instant || !motionOK
  const time = useAltonTime()
  const ctx = useMemo(() => ({ github }), [github])

  // Booting: the header prints, then the film's prompt types out. Nothing waits on it.
  const [boot, setBoot] = useState(still ? BOOT.length : 0)
  const booted = boot >= BOOT.length
  useEffect(() => {
    if (booted) return
    const t = window.setTimeout(() => setBoot((n) => n + 1), boot === 0 ? 650 : 32)
    return () => clearTimeout(t)
  }, [boot, booted])

  const reply: Reply = useMemo(() => {
    if (!asked) return { lines: [] }
    const entry = asked.id ? entryById(asked.id) : undefined
    return entry ? entry.reply(asked.q, ctx) : respond(asked.q, ctx)
  }, [asked, ctx])
  const lines = reply.lines
  const starts = useMemo(() => lines.reduce<number[]>((acc, _, i) => [...acc, i === 0 ? 0 : acc[i - 1] + span(lines[i - 1])], []), [lines])
  const total = lines.length ? starts[lines.length - 1] + span(lines[lines.length - 1]) : 0

  // Printing an answer, a few characters a frame; each new line blips as it starts.
  const [shown, setShown] = useState(Infinity)
  // The question already answered: the one on screen when this mounted, back from a record.
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
    // `asked.at` marks each question, even the same one asked twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asked?.at])

  const printing = shown < total

  // Once the answer is out, whatever it ends in happens — a beat later, so it can be read.
  const actedAt = useRef(instant ? asked?.at : undefined)
  const act = useRef(onAction)
  useEffect(() => {
    act.current = onAction
  })
  useEffect(() => {
    if (!asked || printing || !reply.then || actedAt.current === asked.at) return
    const then = reply.then
    const t = window.setTimeout(
      () => {
        actedAt.current = asked.at
        act.current(then)
      },
      motionOK ? 450 : 900,
    )
    return () => clearTimeout(t)
  }, [asked, printing, reply, motionOK])

  const current = printing ? lines.findIndex((l, i) => shown >= starts[i] && shown < starts[i] + span(l)) : -1
  const blipped = useRef(-1)
  useEffect(() => {
    if (current > 0 && current !== blipped.current && lines[current].kind !== 'gap') terminal.select()
    blipped.current = current
  }, [current, lines])

  const cursorEl = useRef<HTMLSpanElement | null>(null)
  useEffect(() => keepInView(cursorEl.current), [current])

  // The prompt, which searches as you type.
  const [value, setValue] = useState('')
  const [hi, setHi] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const history = useRef<string[]>([])
  const back = useRef(-1)
  const results = useMemo(() => search(value, 6), [value])

  // Ready to type the moment it's up — the boot line printing doesn't hold anything back.
  useEffect(() => {
    if (matchMedia('(pointer: fine)').matches) input.current?.focus({ preventScroll: true })
  }, [])

  /** Puts a question to the computer. Anything it does at once (sound) happens right here, inside
   *  the click or keypress, since browsers only let sound start from one. */
  const ask = (q: string, entry?: Entry) => {
    const r = entry ? entry.reply(q, ctx) : respond(q, ctx)
    if (r.now) onAction(r.now)
    history.current = [q, ...history.current.filter((h) => h !== q)].slice(0, 20)
    back.current = -1
    setValue('')
    setHi(0)
    onAsk({ q, id: entry?.id, at: Date.now() })
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const q = value.trim()
      if (q) ask(q, results[hi])
      else if (printing) setShown(Infinity)
    } else if (e.key === 'Tab' && results[hi]) {
      e.preventDefault()
      setValue(results[hi].label)
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && results.length) {
      e.preventDefault()
      setHi((h) => (h + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const h = history.current
      back.current = Math.max(-1, Math.min(h.length - 1, back.current + (e.key === 'ArrowUp' ? 1 : -1)))
      setValue(back.current < 0 ? '' : h[back.current])
    } else if (e.key === 'Escape' && value) {
      // The first escape clears the line; the next closes the screen.
      e.stopPropagation()
      setValue('')
    }
  }

  // Typing anywhere on the screen goes to the prompt.
  const toPrompt = (e: KeyboardEvent) => {
    if (e.target !== input.current && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) input.current?.focus({ preventScroll: true })
  }

  const items = group ? group.sections.flatMap((s) => s.items) : []

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
      case 'act':
        return (
          <button key={i} type="button" onClick={() => onAction(l.action)} className="crt-link block w-full px-1 text-left uppercase">
            {cut}
            {cur}
          </button>
        )
      case 'ask':
        return (
          <button key={i} type="button" onClick={() => ask(l.text, search(l.text, 1)[0])} className="crt-link block px-1 text-left uppercase">
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
            {l.tone === 'head' ? <span className={`px-1 ${INVERSE}`}>{cut}</span> : cut}
            {cur}
          </div>
        )
    }
  }

  return (
    <div onKeyDown={toPrompt} className="min-h-[min(68svh,660px)] uppercase">
      <div aria-hidden className={`mx-auto w-full max-w-[44rem] ${still ? '' : 'mother-art'}`}>
        <Ascii art={MOTHER_ASCII} />
      </div>

      <div className="mt-5 min-h-[1.35em] text-[1.15em]">
        {BOOT.slice(0, boot)}
        {!booted && boot > 0 && <Cursor />}
      </div>
      <div className="crt-dim">Crew · Birnie, D. · Alton, NH · {time} · all systems nominal</div>

      <div role="tablist" aria-label="Skill files" className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="crt-dim mr-1">Skill files</span>
        {skills.map((g) => (
          <button
            key={g.label}
            type="button"
            role="tab"
            aria-selected={g.label === group?.label}
            onClick={() => {
              if (g.label === group?.label) return
              terminal.select()
              onGroup(g)
            }}
            className={`crt-link px-1 uppercase ${g.label === group?.label ? INVERSE : ''}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {group && (
        <div className="mt-3 grid grid-cols-2 gap-x-6 md:grid-cols-3">
          {items.map((name, i) => {
            const on = asked?.id === `skill:${name}`
            return (
              <button
                key={name}
                type="button"
                onClick={() => ask(name, entryById(`skill:${name}`))}
                aria-current={on ? 'true' : undefined}
                className={`crt-link flex min-w-0 gap-3 px-1 text-left uppercase ${on ? INVERSE : ''}`}
              >
                <span className={on ? '' : 'crt-dim'}>{String(i + 1).padStart(2, '0')}</span>
                <span className="truncate">{name}</span>
              </button>
            )
          })}
        </div>
      )}

      <label className="relative mt-6 flex cursor-text items-baseline px-1">
        <span aria-hidden className="whitespace-pre">{'> '}</span>
        <span aria-hidden className="whitespace-pre">{value}</span>
        {!printing && (booted || value) && (
          <Cursor
            at={(el) => {
              cursorEl.current = el
            }}
          />
        )}
        <input
          ref={input}
          value={value}
          onChange={(e) => {
            back.current = -1
            setHi(0)
            setValue(e.target.value)
          }}
          onKeyDown={onKey}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="mother-results"
          aria-activedescendant={results.length ? `mother-result-${hi}` : undefined}
          aria-label="Ask MU/TH/UR: search the site"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="send"
          maxLength={60}
          className="absolute inset-0 w-full cursor-text text-[16px] opacity-0"
        />
      </label>

      {results.length > 0 && (
        <div id="mother-results" role="listbox" aria-label="Matches" className="mt-1">
          {results.map((r, i) => (
            <button
              key={r.id}
              id={`mother-result-${i}`}
              type="button"
              role="option"
              aria-selected={i === hi}
              onMouseEnter={() => setHi(i)}
              onClick={() => ask(value.trim() || r.label, r)}
              className={`crt-link flex w-full min-w-0 items-baseline gap-3 px-1 text-left uppercase ${i === hi ? INVERSE : ''}`}
            >
              <span className={`w-[8ch] shrink-0 ${i === hi ? '' : 'crt-dim'}`}>{KIND_LABEL[r.kind]}</span>
              <span className="min-w-0 truncate">{r.label}</span>
              {r.sub && <span className={`ml-auto hidden shrink-0 truncate sm:block ${i === hi ? '' : 'crt-dim'}`}>{r.sub}</span>}
            </button>
          ))}
        </div>
      )}

      {!asked && !group && results.length === 0 && (
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
          <span className="crt-dim">Try</span>
          {TRY.map((t) => (
            <button key={t} type="button" onClick={() => ask(t, search(t, 1)[0])} className="crt-link px-1 uppercase">
              › {t}
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite" className="mt-3" onClick={() => printing && setShown(Infinity)}>
        {lines.map(renderLine)}
      </div>
    </div>
  )
}
