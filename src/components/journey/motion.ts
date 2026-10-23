export type Timeline = gsap.core.Timeline
type Targets = Element | Element[] | NodeListOf<Element> | null

/** A fraction of the screen width — a function, so it's re-measured when the screen resizes. */
export const vw = (f: number) => () => window.innerWidth * f

const empty = (t: Targets) => !t || ('length' in t && t.length === 0)

/**
 * Content passing through the frame: it fades in drifting left from the right, holds, then fades
 * out drifting on to the left — the same way the planet travels. `start` and `len` are in screens
 * of scroll; `enter`/`exit` are fractions of `len`. With `stay` it never leaves (the last scene).
 */
export function pass(
  tl: Timeline,
  targets: Targets,
  start: number,
  len: number,
  { drift = 0.05, enter = 0.24, exit = 0.22, stay = false, stagger = 0 } = {},
) {
  if (!targets || empty(targets)) return
  const els = targets instanceof Element ? [targets] : [...targets]
  // One tween per element rather than GSAP's `stagger`: a staggered fromTo only applies its
  // starting state to the first element up front, leaving the rest visible until they're reached.
  els.forEach((el, i) => {
    tl.fromTo(el, { autoAlpha: 0, x: vw(drift) }, { autoAlpha: 1, x: 0, duration: len * enter, ease: 'sine.out' }, start + i * stagger * len)
  })
  if (!stay) tl.to(els, { autoAlpha: 0, x: vw(-drift), duration: len * exit, ease: 'sine.in' }, start + len * (1 - exit))
}
