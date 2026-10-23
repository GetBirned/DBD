import QuoteReel, { type ReelQuote } from './QuoteReel'
import { experience, type ExperienceEntry } from '@/data/experience'

/**
 * Every referral across the career entries, dealt round-robin by role so the first few to come
 * up aren't all from one job.
 */
function collectShoutouts(entries: ExperienceEntry[]): ReelQuote[] {
  const lists = entries.map((e) =>
    (e.referrals ?? []).map((r): ReelQuote => {
      const company = e.company.replace(' Inc.', '')
      const [name, title] = (r.name ?? '').split(/,\s*/)
      return {
        quote: r.quote,
        caption: `${name || `A ${company} coworker`} · ${title ? `${title}, ` : ''}${company}`,
      }
    }),
  )
  const total = lists.reduce((n, l) => n + l.length, 0)
  const out: ReelQuote[] = []
  for (let i = 0; out.length < total; i++) for (const l of lists) if (l[i]) out.push(l[i])
  return out
}

const SHOUTOUTS = collectShoutouts(experience)

/** The coworker shoutouts, straight after the opening credits. */
export default function Shoutouts() {
  return (
    <section className="flex min-h-[100svh] items-center px-[6vw] py-[14vh]">
      <QuoteReel label="in my coworkers' words" items={SHOUTOUTS} noun="Shoutout" />
    </section>
  )
}
