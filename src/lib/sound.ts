// Synthesized UI sounds via the Web Audio API — no audio files to fetch or license,
// just short oscillator blips and noise bursts generated on the fly.

let audioCtx: AudioContext | null = null
/** Set by the speaker toggle: when the visitor turns sound off, the effects go quiet too. */
let muted = false

export function setMuted(m: boolean) {
  muted = m
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || muted) return null
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) audioCtx = new Ctx()
  // Browsers start a freshly-created context "suspended" until a user gesture; a
  // click handler counts as one, so resume defensively in case it didn't auto-start.
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
  return audioCtx
}

/** A short, subtle descending "tick" — for button presses. */
export function playClick() {
  const ctx = getContext()
  if (!ctx) return
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(920, now)
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.09)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.13)
}

/* ───────────────────── The ship's computer ───────────────────── */

/** One tone, `at` seconds from now, sliding to `to` Hz if given. */
function tone(ctx: AudioContext, at: number, dur: number, freq: number, { type = 'square' as OscillatorType, level = 0.04, to = 0 } = {}) {
  const t = ctx.currentTime + at
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(level, t + 0.004)
  gain.gain.setValueAtTime(level, t + Math.max(0.005, dur - 0.012))
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

/** A burst of filtered noise — the electrical thump of a tube coming on or going off. */
function thump(ctx: AudioContext, at: number, dur: number, { level = 0.22, cutoff = 220 } = {}) {
  const t = ctx.currentTime + at
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = cutoff
  const gain = ctx.createGain()
  gain.gain.value = level
  src.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  src.start(t)
}

/** The computer thinking: a run of quick, random beeps, like its readouts printing. */
function chatter(ctx: AudioContext, at: number, count: number) {
  const notes = [660, 880, 990, 1175, 1320, 1568, 1760, 2093]
  for (let i = 0; i < count; i++) {
    const freq = notes[Math.floor(Math.random() * notes.length)]
    tone(ctx, at + i * 0.042, 0.022 + Math.random() * 0.02, freq, { level: 0.022 })
  }
}

/** The sounds of the Nostromo's screens, for the popups. */
export const terminal = {
  /** A screen switching on: a thump, the faint whine of the tube, then the computer chattering. */
  on() {
    const ctx = getContext()
    if (!ctx) return
    thump(ctx, 0, 0.12)
    tone(ctx, 0.02, 0.45, 7800, { type: 'sine', level: 0.006, to: 8300 })
    chatter(ctx, 0.12, 9)
  },
  /** A screen switching off: the picture collapsing, and a falling tone. */
  off() {
    const ctx = getContext()
    if (!ctx) return
    tone(ctx, 0, 0.22, 1400, { type: 'sine', level: 0.05, to: 90 })
    thump(ctx, 0.04, 0.08, { level: 0.12, cutoff: 400 })
  },
  /** Stepping to another page: a rising "bip-bip", then a little chatter as it draws. */
  page() {
    const ctx = getContext()
    if (!ctx) return
    tone(ctx, 0, 0.035, 1046, { level: 0.045 })
    tone(ctx, 0.05, 0.045, 1568, { level: 0.045 })
    chatter(ctx, 0.12, 4)
  },
  /** Choosing something on the screen: a single blip. */
  select() {
    const ctx = getContext()
    if (!ctx) return
    tone(ctx, 0, 0.05, 1320, { level: 0.045 })
  },
}
