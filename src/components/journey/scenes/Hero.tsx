import { layoutWord } from '../glyphs'
import { vw, type Timeline } from '../motion'

const TITLE = layoutWord('DART')
/** Each stroke's place in the assembly order. */
const STEP = TITLE.strokes.map((s) => TITLE.strokes.filter((o) => o.rank < s.rank).length)

/** This many strokes are already up when the page opens — a couple of stray fragments. */
const INITIAL = 2
/** Share of the scene the title takes to finish assembling. */
const ASSEMBLE = 0.5

/** The opening frame: DART, in fragments, beside the edge of the planet. Complete when `still`. */
export default function Hero({ still = false }: { still?: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-[6vw]">
      <div data-hero className="flex flex-col items-center">
        <h1 className="sr-only">Dart Birnie — software engineer and developer</h1>
        <svg viewBox={`-2 -4 ${TITLE.width + 4} 108`} className="title-glyph h-auto w-[min(80vw,760px)] overflow-visible" aria-hidden>
          {TITLE.strokes.map((s, i) => (
            <path
              key={i}
              d={s.d}
              transform={`translate(${s.x} 0)`}
              data-step={STEP[i]}
              fill="#f4f6ff"
              // Hidden from the first paint, so nothing flashes before the timeline takes over.
              style={still || STEP[i] < INITIAL ? undefined : { opacity: 0 }}
            />
          ))}
        </svg>
        <p data-sub className="scene-label mt-[6vh] text-center text-ink-dim" style={still ? undefined : { opacity: 0 }}>
          Software engineer &amp; developer
        </p>
      </div>
      {!still && (
        <div data-hint className="scene-label absolute inset-x-0 bottom-8 text-center text-[10px] text-ink-faint">
          Scroll
        </div>
      )}
    </div>
  )
}

/**
 * Scrolling assembles the title a stroke at a time — each one stutters on in cold blue and
 * settles to white, as the film's pieces do — then the subtitle arrives, and the title drifts off
 * left with the planet. Scrolling back takes it apart again.
 */
export function buildHero(tl: Timeline, root: Element, start: number, len: number) {
  const later = TITLE.strokes.length - INITIAL - 1
  root.querySelectorAll<SVGPathElement>('path[data-step]').forEach((p) => {
    const step = Number(p.dataset.step)
    if (step < INITIAL) return
    // Spaced out at first and quickening, the way the film's title comes together.
    const t = start + 0.04 + Math.pow((step - INITIAL) / later, 0.8) * len * ASSEMBLE
    tl.fromTo(p, { opacity: 0, fill: '#7ea2ff' }, { opacity: 1, duration: 0.03 }, t)
    tl.to(p, { opacity: 0.2, duration: 0.02 }, t + 0.03)
    tl.to(p, { opacity: 1, fill: '#f4f6ff', duration: 0.07 }, t + 0.05)
  })
  tl.fromTo(root.querySelector('[data-sub]'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: len * 0.12, ease: 'sine.out' }, start + len * (ASSEMBLE + 0.06))
  tl.to(root.querySelector('[data-hint]'), { autoAlpha: 0, duration: len * 0.1 }, start)
  tl.to(root.querySelector('[data-hero]'), { autoAlpha: 0, x: vw(-0.05), duration: len * 0.2, ease: 'sine.in' }, start + len * 0.8)
}
