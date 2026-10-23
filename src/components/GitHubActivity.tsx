import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { useGitHubData, type ContributionsData, type ContributionDay } from '@/hooks/useGitHubData'
import { ArrowUpRight } from './icons'

// Starlight rather than GitHub's green — dim to bright white — so the board reads as part of the
// sky instead of a pasted-in widget. Index = GitHub's own 0–4 intensity bucket.
const LEVEL_COLORS = ['rgb(241 239 233 / 0.06)', 'rgb(241 239 233 / 0.24)', 'rgb(241 239 233 / 0.45)', 'rgb(241 239 233 / 0.7)', '#f4f6ff']

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Chunks the flat day list into calendar weeks, padding the first week so the rows line up
 * with real weekdays (the range rarely starts exactly on a Sunday). */
function toWeeks(days: ContributionDay[]): (ContributionDay | null)[][] {
  if (days.length === 0) return []
  const padded: (ContributionDay | null)[] = []
  const firstDow = new Date(`${days[0].date}T00:00:00`).getDay()
  for (let i = 0; i < firstDow; i++) padded.push(null)
  padded.push(...days)
  while (padded.length % 7 !== 0) padded.push(null)

  const weeks: (ContributionDay | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7))
  return weeks
}

/** The last year of GitHub contributions; the cells pop in week by week once it's reached. */
export default function GitHubActivity() {
  const { data } = useGitHubData<ContributionsData>('/api/github/contributions')
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })

  // Silent no-op when the fetch fails — same policy as the Spotify/Steam/PSN widgets.
  if (!data || data.days.length === 0) return <div ref={ref} />

  const weeks = toWeeks(data.days)

  // One label per month, placed above the week where that month first appears.
  const monthLabels = weeks.map((week, i) => {
    const first = week.find(Boolean)
    if (!first) return null
    const d = new Date(`${first.date}T00:00:00`)
    const prev = i > 0 ? weeks[i - 1].find(Boolean) : null
    const prevMonth = prev ? new Date(`${prev.date}T00:00:00`).getMonth() : -1
    return d.getMonth() !== prevMonth ? MONTHS[d.getMonth()] : null
  })

  return (
    <div ref={ref} className={`border border-line p-5 sm:p-8 ${inView ? 'gh-in' : ''}`}>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">GitHub, last 12 months</div>
          <div className="credit mt-2 text-[clamp(22px,2.4vw,40px)]">{data.total.toLocaleString()} contributions</div>
        </div>
        <a
          href={data.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-dim transition-colors hover:text-ink"
        >
          @{data.user} <ArrowUpRight />
        </a>
      </div>

      {/* The weeks share the full width — cells grow with the screen instead of sitting at a fixed
          12px and leaving half the frame empty. Below ~720px the cells would get too small to
          read, so there it holds that width and scrolls inside its own container instead (the
          page body never scrolls sideways). */}
      <div className="overflow-x-auto pb-1 [scrollbar-width:thin]">
        <div className="min-w-[720px]">
          <div className="mb-1.5 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
            {monthLabels.map((label, i) => (
              <div key={i} className="font-mono text-[10px] whitespace-nowrap text-ink-faint">
                {label}
              </div>
            ))}
          </div>
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={day ? `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}` : undefined}
                    className="gh-cell aspect-square w-full"
                    style={{
                      background: day ? (LEVEL_COLORS[day.level] ?? LEVEL_COLORS[0]) : 'transparent',
                      transitionDelay: `${wi * 14 + di * 8}ms`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5 font-mono text-[10px] text-ink-faint">
        <span>Less</span>
        {LEVEL_COLORS.map((c) => (
          <span key={c} className="h-[12px] w-[12px]" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
