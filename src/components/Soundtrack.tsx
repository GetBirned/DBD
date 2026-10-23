import { useEffect, useRef, useState } from 'react'
import { SpeakerIcon } from './icons'
import { setMuted } from '@/lib/sound'

const SRC = '/audio/alien-main-title.mp3'
/** The track as mastered — no turning it down. */
const VOLUME = 1
/** Remembers someone turning it off, so it stays off on their next visit. */
const KEY = 'soundtrack'

/** The events browsers count as the visitor's permission to play sound. */
const PRESSES = new Set(['pointerdown', 'keydown', 'touchend'])

const remembered = () => {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

const remember = (on: boolean) => {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // Private windows can refuse storage; the toggle still works for this visit.
  }
}

/**
 * The film's main title theme, looping under the page, with a small speaker icon in the corner to
 * turn it off and on. It starts, fading in, as soon as the visitor scrolls or presses anything —
 * as far as the browser allows (see below). It pauses while the tab is hidden.
 */
export default function Soundtrack() {
  const audio = useRef<HTMLAudioElement | null>(null)
  const ramp = useRef(0)
  const wanted = useRef(remembered())
  /** A play() is in flight — scroll fires constantly, and one attempt at a time is plenty. */
  const trying = useRef(false)
  const [playing, setPlaying] = useState(false)

  /** Eases the volume to `to` over `ms`, then runs `done`. */
  const fade = (to: number, ms: number, done?: () => void) => {
    const a = audio.current
    if (!a) return
    cancelAnimationFrame(ramp.current)
    const from = a.volume
    const t0 = performance.now()
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms)
      a.volume = from + (to - from) * k
      if (k < 1) ramp.current = requestAnimationFrame(step)
      else done?.()
    }
    ramp.current = requestAnimationFrame(step)
  }

  /** Starts playback. `press` marks a real click, tap or key — always worth a try, even if a
   *  scroll's attempt is still in flight, since only a press is sure to be allowed. */
  const start = (press = false) => {
    if (!audio.current) {
      const a = new Audio(SRC)
      a.loop = true
      a.volume = 0
      audio.current = a
    }
    const a = audio.current
    if (trying.current && !press) return
    trying.current = true
    a.play()
      .then(() => {
        setPlaying(true)
        fade(VOLUME, 3500)
      })
      .catch(() => {
        // Blocked until the visitor interacts — the listeners below try again.
      })
      .finally(() => {
        trying.current = false
      })
  }

  const stop = () => {
    setPlaying(false)
    fade(0, 600, () => audio.current?.pause())
  }

  useEffect(() => {
    setMuted(!wanted.current)
    if (wanted.current) start()

    // Start as soon as the visitor does anything: the first scroll, click, tap or key press.
    // Browsers only count a click, tap or key press as permission to play sound, so a scroll with
    // the wheel or trackpad starts it only where the browser already allows sound (a returning
    // visitor, or autoplay switched on); otherwise it starts on the first click, tap or key — and
    // keyboard scrolling counts. The toggle handles its own presses, so they're left to it.
    const onGesture = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.('[data-soundtrack-toggle]')) return
      if (wanted.current && audio.current?.paused !== false) start(PRESSES.has(e.type))
    }
    const events = ['scroll', 'wheel', 'touchmove', 'pointerdown', 'keydown', 'touchend'] as const
    events.forEach((ev) => window.addEventListener(ev, onGesture, { capture: true, passive: true }))

    // No sound from a tab nobody's looking at.
    const onVisibility = () => {
      const a = audio.current
      if (!a || !wanted.current) return
      if (document.hidden) a.pause()
      else a.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onGesture, { capture: true }))
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(ramp.current)
      audio.current?.pause()
    }
    // Runs once: start() only touches refs and a state setter, so it never goes stale.
  }, [])

  const toggle = () => {
    wanted.current = !playing
    remember(wanted.current)
    // The sound effects follow the same switch.
    setMuted(!wanted.current)
    if (playing) stop()
    else start(true)
  }

  return (
    <button
      type="button"
      data-soundtrack-toggle
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Turn the soundtrack off' : 'Turn the soundtrack on'}
      title={playing ? 'Sound off' : 'Sound on'}
      className={`fixed bottom-4 left-[4vw] z-[991] flex h-10 w-10 items-center justify-center transition-[color,filter] duration-300 ${playing ? 'text-ink drop-shadow-[0_0_6px_rgb(255_226_180/0.6)]' : 'text-ink/50 hover:text-ink'}`}
    >
      <SpeakerIcon size={20} muted={!playing} />
    </button>
  )
}
