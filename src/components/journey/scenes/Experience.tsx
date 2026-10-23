import { experience } from '@/data/experience'
import { beats, pass, type Timeline } from '../motion'

interface Entry {
  role: string
  org: string
  when: string
  where: string
  desc?: string
  note?: string
  /** A light mark, drawn for a dark ground. */
  logo?: string
}

const job = (i: number): Entry => {
  const e = experience[i]
  return {
    role: e.role,
    org: e.company.replace(' Inc.', ''),
    when: e.dateRange,
    where: e.location,
    desc: e.desc,
    note: e.badge,
    logo: e.logoDark,
  }
}

/** Newest first; the business runs alongside everything else, so it sits after Trimble. */
export const ENTRIES: Entry[] = [
  job(0),
  job(1),
  {
    role: 'Founder & Web Designer',
    org: 'Designs By Dart',
    when: '2022 – Present',
    where: 'Alton, NH',
    desc: 'Design and build websites for small businesses, from the first conversation through launch and the updates after. Approved web design contractor through the NH Small Business Development Center and the Grafton Regional Development Corporation.',
  },
  job(2),
  {
    role: 'B.S. Computer Science',
    org: 'University of New Hampshire',
    when: 'May 2025',
    where: 'Durham, NH',
    note: "Dean's List",
  },
]

/** Scroll, in screens, that each entry gets. */
export const EXPERIENCE_PER = 1.05

function EntryBlock({ e, i, still }: { e: Entry; i: number; still: boolean }) {
  return (
    <article
      data-beat
      className={`mx-auto w-[min(86vw,60rem)] text-center ${still ? 'py-[6vh]' : 'absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2'}`}
    >
      <div className="flex items-center justify-center gap-4 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase sm:text-[11px]">
        <span className="tabular-nums">
          {String(i + 1).padStart(2, '0')} / {String(ENTRIES.length).padStart(2, '0')}
        </span>
        <span className="h-px w-10 bg-accent/70" />
        <span>{e.when}</span>
      </div>
      {e.logo && <img src={e.logo} alt="" className="mx-auto mt-[3vh] h-5 w-auto opacity-80 sm:h-6" />}
      {/* Set as a title card: the role, then who it was for. */}
      <h3 className="credit mt-[2.4vh] text-[clamp(22px,2.7vw,48px)] leading-[1.18]">
        <span className="text-ink/75">{e.role.toLowerCase()}</span> {e.org}
      </h3>
      <div className="mt-[1.6vh] font-mono text-[11px] tracking-[0.08em] text-ink-faint">{e.where}</div>
      {e.desc && (
        <p className="mx-auto mt-[3vh] max-w-[44em] border-t border-line pt-[3vh] text-[clamp(14px,1.05vw,17px)] leading-relaxed text-ink-dim">
          {e.desc}
        </p>
      )}
      {e.note && <p className="mt-[2vh] font-mono text-[11px] tracking-[0.08em] text-accent">{e.note}</p>}
    </article>
  )
}

/** Career, one entry at a time, centered, each crossing the frame as the planet's surface takes over. */
export default function Experience({ still = false }: { still?: boolean }) {
  return (
    <div className={still ? 'px-[8vw]' : 'h-full'}>
      <h2 data-heading className={`scene-heading text-center ${still ? '' : 'absolute inset-x-0 top-[24vh]'}`}>
        Experience
      </h2>
      {ENTRIES.map((e, i) => (
        <EntryBlock key={i} e={e} i={i} still={still} />
      ))}
    </div>
  )
}

export function buildExperience(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelector('[data-heading]'), start, len, { drift: 0.02, enter: 0.06, exit: 0.05 })
  beats(tl, [...root.querySelectorAll('[data-beat]')], start + 0.1, len - 0.15)
}
