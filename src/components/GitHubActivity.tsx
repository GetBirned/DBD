import { useGitHubData, type ContributionsData, type ContributionDay } from '@/hooks/useGitHubData'

// Site palette rather than GitHub's green, so the board reads as part of the page instead of
// a pasted-in widget. Index = GitHub's own 0–4 intensity bucket.
const LEVEL_COLORS = [
  'oklch(0.91 0.008 260)',
  'oklch(0.80 0.07 268)',
  'oklch(0.70 0.12 276)',
  'oklch(0.60 0.16 288)',
  'oklch(0.51 0.20 300)',
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

export default function GitHubActivity() {
  const { data } = useGitHubData<ContributionsData>('/api/github/contributions')

  // Silent no-op when the fetch fails — same policy as the Spotify/Steam/PSN widgets.
  if (!data || data.days.length === 0) return null

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
    <div>
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-mono text-xs text-ink-dim">
          <b className="font-semibold text-ink">{data.total.toLocaleString()}</b> contributions in the last year
        </div>
        <a
          href={data.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] text-grad-a hover:underline"
        >
          @{data.user} →
        </a>
      </div>

      {/* Wide content scrolls inside its own container so the page body never scrolls sideways. */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          <div className="mb-1 flex gap-[3px]">
            {monthLabels.map((label, i) => (
              <div key={i} className="w-[11px] shrink-0 font-mono text-[9px] text-ink-faint">
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
                    className="h-[11px] w-[11px] rounded-[2px]"
                    style={{ background: day ? LEVEL_COLORS[day.level] ?? LEVEL_COLORS[0] : 'transparent' }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[10px] text-ink-faint">
        <span>Less</span>
        {LEVEL_COLORS.map((c) => (
          <span key={c} className="h-[11px] w-[11px] rounded-[2px]" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
