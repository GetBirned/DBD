import { titleLetters } from './glyphs'
import type { Timeline } from './motion'

const TITLE = titleLetters('DART')
const STROKES = TITLE.flatMap((l) => l.strokes)
/** A stroke's place in the assembly order. */
const step = (rank: number) => STROKES.filter((o) => o.rank < rank).length

/**
 * DART across the top of the frame, spaced the width of the screen the way ALIEN is. It's there
 * for the whole journey: empty as the page opens, gaining a stroke every few screens, and whole
 * once the planet has all but passed. With `still` (reduced motion) it's simply whole.
 */
export default function Title({ still = false }: { still?: boolean }) {
  return (
    <div className={`pointer-events-none flex w-full items-start justify-between px-[7vw] ${still ? 'pt-[12vh]' : 'absolute inset-x-0 top-[10vh]'}`}>
      {TITLE.map((l, li) => (
        <svg
          key={li}
          viewBox={`-2 -4 ${l.width + 4} 108`}
          style={{ aspectRatio: `${l.width + 4} / 108` }}
          className="title-glyph h-[clamp(28px,4.6vw,88px)] w-auto overflow-visible"
          aria-hidden
        >
          {l.strokes.map((s, si) => (
            <path
              key={si}
              d={s.d}
              data-step={step(s.rank)}
              fill="#f4f6ff"
              // Hidden from the first paint, so nothing shows before the timeline takes over.
              style={still ? undefined : { opacity: 0 }}
            />
          ))}
        </svg>
      ))}
    </div>
  )
}

/**
 * Spreads the strokes from just after the page opens to `end`, a little closer together as it
 * goes. Each one stutters on in cold blue and settles to white, as the film's pieces do; scrolling
 * back takes them away again.
 */
export function buildTitle(tl: Timeline, root: Element, start: number, end: number) {
  const last = STROKES.length - 1
  root.querySelectorAll<SVGPathElement>('path[data-step]').forEach((p) => {
    const k = Number(p.dataset.step)
    const t = start + Math.pow(k / last, 0.9) * (end - start)
    tl.fromTo(p, { opacity: 0, fill: '#7ea2ff' }, { opacity: 1, duration: 0.05 }, t)
    tl.to(p, { opacity: 0.2, duration: 0.035 }, t + 0.05)
    tl.to(p, { opacity: 1, fill: '#f4f6ff', duration: 0.12 }, t + 0.085)
  })
}
