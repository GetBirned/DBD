import { ArrowUpRight } from '@/components/icons'
import { skills } from '@/data/skills'
import { useGitHubData, type ContributionsData } from '@/hooks/useGitHubData'
import { pass, type Timeline } from '../motion'

/** The stack, as small labels laid out over open space as the planet leaves the frame. */
export default function Skills({ still = false }: { still?: boolean }) {
  const { data } = useGitHubData<ContributionsData>('/api/github/contributions')

  return (
    <div className={`flex flex-col justify-center px-[8vw] ${still ? 'py-[8vh]' : 'h-full pt-[56px]'}`}>
      <h2 data-in className="scene-heading">Technical skills</h2>
      <div className="mt-[2.5vh] grid max-w-[1200px] grid-cols-2 gap-x-[5vw] gap-y-[2vh] sm:mt-[4vh] sm:gap-y-[3.2vh] lg:grid-cols-3">
        {skills.map((g) => (
          <div key={g.label} data-group>
            <div className="scene-label border-b border-line pb-2 text-[10px] text-ink-dim sm:text-[11px]">{g.label}</div>
            <ul className="mt-2 flex flex-wrap gap-1 sm:mt-3 sm:gap-1.5">
              {g.items.map((s) => (
                <li key={s} className="border border-line px-1.5 py-0.5 font-mono text-[9.5px] text-ink/85 sm:px-2 sm:py-1 sm:text-[11px]">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* The GitHub line only appears once there's a real number to show. */}
      <div data-in className="mt-[3vh] min-h-[1em] sm:mt-[5vh] font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase sm:text-[11px]">
        {data && data.total > 0 && (
          <a href={data.profileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-ink">
            {data.total.toLocaleString()} GitHub contributions in the last year · @{data.user} <ArrowUpRight />
          </a>
        )}
      </div>
    </div>
  )
}

export function buildSkills(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelectorAll('[data-in]'), start, len, { drift: 0.03 })
  pass(tl, root.querySelectorAll('[data-group]'), start + len * 0.04, len * 0.96, { drift: 0.06, enter: 0.3, stagger: 0.03 })
}
