import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { useGitHubData, type ContributionsData, type ContributionDay } from '@/hooks/useGitHubData'
import { ArrowUpRight } from './icons'

// Site palette rather than GitHub's green, so the board reads as part of the page instead of
// a pasted-in widget. Index = GitHub's own 0–4 intensity bucket.
const LEVEL_COLORS = [
  'oklch(1 0 0 / 0.06)',
  'oklch(0.45 0.13 285)',
  'oklch(0.55 0.17 292)',
  'oklch(0.65 0.2 305)',
  'oklch(0.76 0.17 330)',
]

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
    <div ref={ref} className={`rounded-[28px] bg-white/[0.035] p-6 ring-1 ring-line sm:p-8 ${inView ? 'gh-in' : ''}`}>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">GitHub, last 12 months</div>
          <div className="mt-1.5 font-display text-2xl font-bold text-ink">
            {data.total.toLocaleString()} <span className="text-ink-dim">contributions</span>
          </div>
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

      {/* Wide content scrolls inside its own container so the page body never scrolls sideways. */}
      <div className="overflow-x-auto pb-1 [scrollbar-width:thin]">
        <div className="inline-block min-w-full">
          <div className="mb-1 flex gap-[3px]">
            {monthLabels.map((label, i) => (
              <div key={i} className="w-[12px] shrink-0 font-mono text-[9px] text-ink-faint">
                {label}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex shrink-0 flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={day ? `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}` : undefined}
                    className="gh-cell h-[12px] w-[12px] rounded-[3px]"
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
          <span key={c} className="h-[12px] w-[12px] rounded-[3px]" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
