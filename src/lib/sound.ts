// Synthesized UI sounds via the Web Audio API — no audio files to fetch or license,
// just a couple of short oscillator blips generated on the fly.

let audioCtx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
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
