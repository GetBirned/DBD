/**
 * The ship's screens at work: for a moment while a computer thinks — turning a page, searching — its
 * screen floods with data noise, as MU/TH/UR's do in the film. Anything can call for a burst; every
 * screen that's up shows it.
 */
const bus = new EventTarget()

/** Floods the screens with data noise for `ms`. */
export function crtBurst(ms: number) {
  bus.dispatchEvent(new CustomEvent<number>('burst', { detail: ms }))
}

/** Calls `handler` with each burst's length; returns the unsubscribe. */
export function onCrtBurst(handler: (ms: number) => void) {
  const on = (e: Event) => handler((e as CustomEvent<number>).detail)
  bus.addEventListener('burst', on)
  return () => bus.removeEventListener('burst', on)
}
