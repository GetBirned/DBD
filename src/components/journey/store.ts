/**
 * State the scroll timeline writes and the sky reads, kept outside React so a scroll frame never
 * re-renders the page.
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
