import { useState } from 'react'
import { motion } from 'framer-motion'
import ChapterHeading from './ChapterHeading'
import Shoutouts, { collectShoutouts } from './Shoutouts'
import { experience } from '@/data/experience'
import { EASE, useMotionOK } from '@/lib/motion'

/** Education closes out the timeline — kept here rather than in `experience` since it has none
 *  of a job's fields (referrals, card theming). Facts are from the résumé. */
const EDUCATION = {
  school: 'University of New Hampshire',
  degree: 'B.S. in Computer Science',
  detail: "Dean's List — Fall 2024 & Spring 2025",
  location: 'Durham, NH',
  date: 'May 2025',
  // The shield alone — the row's heading already spells out the name. Cropped from the
  // official logo in the capstone deck (raw-media/pirail).
  logo: '/logos/company_logos/unhShield.png',
  tint: 'oklch(0.36 0.16 262)',
}

interface Row {
  date: string
  org: string
  logo?: string
  /** The organization's color, as a small swatch beside its name. */
  tint: string
  title: string
  location: string
  body: string
  badge?: string
}

const SHOUTOUTS = collectShoutouts(experience)

const job = (i: number): Row => {
  const e = experience[i]
  return {
    date: e.dateRange,
    org: e.company.replace(' Inc.', ''),
    logo: e.logo,
    tint: e.tint,
    title: e.role,
    location: e.location,
    body: e.desc,
    badge: e.badge,
  }
}

// Newest first, with the degree slotted in by its graduation date.
const ROWS: Row[] = [
  job(0),
  job(1),
  {
    date: EDUCATION.date,
    org: EDUCATION.school,
    logo: EDUCATION.logo,
    tint: EDUCATION.tint,
    title: EDUCATION.degree,
    location: EDUCATION.location,
    body: EDUCATION.detail,
  },
  job(2),
]

/**
 * One line of the ledger: dates on the left, the organization and role set large in the middle,
 * location on the right, and the detail underneath. Stacks on phones.
 */
function LedgerRow({ row, index }: { row: Row; index: number }) {
  const motionOK = useMotionOK()
  return (
    <motion.li
      initial={motionOK ? { opacity: 0, y: 48 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.04 * index }}
      className="group grid grid-cols-1 gap-x-[3vw] gap-y-4 border-t border-ink py-[5vw] sm:py-10 lg:grid-cols-12 lg:py-14"
    >
      <div className="flex items-baseline justify-between gap-4 font-mono text-[12px] tracking-[0.08em] text-ink-dim uppercase lg:col-span-3 lg:block">
        <div>{row.date}</div>
        <div className="text-right lg:hidden">{row.location}</div>
      </div>

      <div className="lg:col-span-7">
        <div className="flex items-center gap-3">
          {row.logo && <img src={row.logo} alt="" className="h-7 w-7 shrink-0 object-contain" />}
          <span className="font-mono text-[12px] tracking-[0.08em] text-ink uppercase">{row.org}</span>
          <span aria-hidden className="h-2.5 w-2.5 shrink-0 transition-transform duration-500 group-hover:scale-150" style={{ background: row.tint }} />
        </div>
        <h3 className="display mt-4 text-[clamp(40px,6.6vw,112px)] text-ink">{row.title}</h3>
        {row.badge && (
          <div className="mt-5 inline-block border border-ink px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] text-ink uppercase">
            ★ {row.badge}
          </div>
        )}
        <p className="mt-5 max-w-[64ch] text-[17px] leading-[1.6] text-ink-dim sm:text-[18px]">{row.body}</p>
      </div>

      <div className="hidden text-right font-mono text-[12px] tracking-[0.08em] text-ink-dim uppercase lg:col-span-2 lg:block">
        {row.location}
      </div>
    </motion.li>
  )
}

export default function CareerTimeline() {
  const [quote, setQuote] = useState(0)

  return (
    <section className="pt-[14vh]">
      <div className="px-[4vw]">
        <ChapterHeading title="From the support desk to leading *implementations.*" />
        <ol className="border-b border-ink">
          {ROWS.map((r, i) => (
            <LedgerRow key={`${r.org}-${r.title}`} row={r} index={i} />
          ))}
        </ol>
      </div>

      {/* The coworker shoutouts, full width on an ink band. */}
      <div className="mt-[12vh] bg-ink px-[4vw] py-[12vh] text-paper">
        <Shoutouts items={SHOUTOUTS} active={quote} onChange={setQuote} />
      </div>
    </section>
  )
}
