import { useEffect, useRef, useState } from 'react'

const SRC = '/audio/alien-main-title.mp3'
/** Very faint — a bed under the page, not a feature. */
const VOLUME = 0.1
/** Remembers someone turning it off, so it stays off on their next visit. */
const KEY = 'soundtrack'

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
 * The film's main title theme, very faintly, looping under the page, with a small toggle in the
 * corner. Browsers won't let a page start sound on its own, so it starts on the visitor's first
 * click, tap or key press (or straight away, where the browser allows it), fading in. It pauses
 * while the tab is hidden.
 */
export default function Soundtrack() {
  const audio = useRef<HTMLAudioElement | null>(null)
  const ramp = useRef(0)
  const wanted = useRef(remembered())
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

  const start = () => {
    if (!audio.current) {
      const a = new Audio(SRC)
      a.loop = true
      a.volume = 0
      audio.current = a
    }
    const a = audio.current
    a.play()
      .then(() => {
        setPlaying(true)
        fade(VOLUME, 3500)
      })
      .catch(() => {
        // Blocked until the visitor interacts — the gesture listener below tries again.
      })
  }

  const stop = () => {
    setPlaying(false)
    fade(0, 600, () => audio.current?.pause())
  }

  useEffect(() => {
    if (wanted.current) start()

    // The first click, tap or key press anywhere is what browsers count as permission to play.
    // The toggle handles its own presses, so they're left to it.
    const onGesture = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.('[data-soundtrack-toggle]')) return
      if (wanted.current && audio.current?.paused !== false) start()
    }
    const events = ['pointerdown', 'keydown', 'touchend'] as const
    events.forEach((ev) => window.addEventListener(ev, onGesture, true))

    // No sound from a tab nobody's looking at.
    const onVisibility = () => {
      const a = audio.current
      if (!a || !wanted.current) return
      if (document.hidden) a.pause()
      else a.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onGesture, true))
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(ramp.current)
      audio.current?.pause()
    }
    // Runs once: start() only touches refs and a state setter, so it never goes stale.
  }, [])

  const toggle = () => {
    wanted.current = !playing
    remember(wanted.current)
    if (playing) stop()
    else start()
  }

  return (
    <button
      type="button"
      data-soundtrack-toggle
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Turn the soundtrack off' : 'Turn the soundtrack on'}
      className={`credit fixed bottom-5 left-[4vw] z-[991] px-1 py-1 text-[14px] transition-[color,text-shadow] duration-300 ${playing ? 'nav-glow text-ink' : 'text-ink/50 [text-shadow:none] hover:text-ink'}`}
    >
      sound {playing ? 'on' : 'off'}
    </button>
  )
}
