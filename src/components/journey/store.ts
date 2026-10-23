/**
 * State the scroll timeline writes and everything else reads, kept outside React so a scroll
 * frame never re-renders the page: the planet's position for the sky, and the timeline's playhead
 * for the few components that care which beat is on screen.
 */

/**
 * Where the planet is, as one number. 0→1: its left limb crosses the screen from the right edge to
 * the left; 1→2: its surface fills the frame; 2→3: its far limb crosses from right to left.
 */
export const sky = { pos: 0.26 }

let redraw = () => {}
/** The sky registers how to repaint itself; it renders only when asked, never on a clock. */
export const setRedraw = (fn: () => void) => {
  redraw = fn
}
export const requestRedraw = () => redraw()

type Listener = (time: number) => void
const listeners = new Set<Listener>()
let playhead = 0

/** The timeline's current time, in screens of scroll. */
export const getPlayhead = () => playhead
export const setPlayhead = (t: number) => {
  playhead = t
  listeners.forEach((l) => l(t))
}
export const onPlayhead = (l: Listener) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
