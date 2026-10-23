import { pass, type Timeline } from '../motion'

/** Who I am, in a few lines, floating over the planet's first edge. */
export default function About({ still = false }: { still?: boolean }) {
  return (
    <div className={`flex items-center px-[8vw] ${still ? '' : 'h-full'}`}>
      <div className="max-w-[min(56rem,100%)] sm:max-w-[min(56rem,64vw)]">
        <h2 data-in className="scene-heading">About</h2>
        <p data-in className="mt-[4vh] text-[clamp(22px,2.5vw,42px)] leading-[1.2] text-ink">
          I'm a software engineer who likes the hard part: getting systems that were never meant to
          talk to each other to work as one.
        </p>
        <p data-in className="mt-[3vh] max-w-[42em] text-[clamp(14px,1.05vw,17px)] leading-relaxed text-ink-dim">
          At Trimble I lead B2W Estimate implementations end to end — discovery, database population,
          training, and telematics integrations with John Deere, Komatsu and Samsara on the AEMP 2.0
          standard — and I'm the escalation point for licensing across the suite. Outside of work I
          build full-stack apps and multiplayer games, and I've designed websites for small
          businesses since 2022.
        </p>
        <p data-in className="scene-label mt-[4vh] text-[10px] text-ink-faint sm:text-[11px]">
          B.S. Computer Science, UNH · Alton, New Hampshire
        </p>
      </div>
    </div>
  )
}

export function buildAbout(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelectorAll('[data-in]'), start, len, { enter: 0.3, stagger: 0.04 })
}
