import { useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import ChapterHeading from './ChapterHeading'
import Shoutouts, { collectShoutouts } from './Shoutouts'
import { experience, type ExperienceEntry } from '@/data/experience'
import { EASE, useMotionOK } from '@/lib/motion'

/** Education closes out the timeline — kept here rather than in `experience` since it has none
 *  of a job's fields (referrals, card theming). Facts are from the résumé. */
const EDUCATION = {
  school: 'University of New Hampshire',
  degree: 'B.S. in Computer Science',
  detail: "Dean's List — Fall 2024 & Spring 2025",
  location: 'Durham, NH',
  date: 'May 2025',
}

type Row = { kind: 'job'; job: ExperienceEntry } | { kind: 'edu' }

const SHOUTOUTS = collectShoutouts(experience)

// Newest first, with the degree slotted in by its graduation date.
const ROWS: Row[] = [
  { kind: 'job', job: experience[0] },
  { kind: 'job', job: experience[1] },
  { kind: 'edu' },
  { kind: 'job', job: experience[2] },
]

const rowLabel = (r: Row) =>
  r.kind === 'job'
    ? { title: r.job.role, sub: r.job.company.replace(' Inc.', ''), date: r.job.dateRange }
    : { title: EDUCATION.degree, sub: 'UNH', date: EDUCATION.date }

function JobCard({ job }: { job: ExperienceEntry }) {
  const dark = job.cardDark
  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-transparent p-7 sm:p-9"
      style={{
        background: [
          `linear-gradient(${job.cardBg ?? 'var(--color-panel)'}, ${job.cardBg ?? 'var(--color-panel)'}) padding-box`,
          `linear-gradient(135deg, var(--color-grad-a), ${job.tint}) border-box`,
        ].join(', '),
      }}
    >
      {/* A soft brand-tinted bloom in the corner, so a flat fill reads as lit rather than painted. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 -right-1/4 h-[120%] w-[70%] rounded-full opacity-40 blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${job.tint}, transparent)` }}
      />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            {job.logo && (
              <img
                src={dark && job.logoDark ? job.logoDark : job.logo}
                alt=""
                className="h-11 w-11 shrink-0 object-contain"
              />
            )}
            <div>
              <div className={`mb-1.5 font-mono text-xs ${dark ? 'text-white/70' : 'text-grad-a'}`}>{job.role}</div>
              <h3 className={`text-[28px] leading-none sm:text-[34px] ${dark ? 'text-white' : ''}`}>{job.company}</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            {[job.location, job.dateRange].map((t) => (
              <span
                key={t}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] whitespace-nowrap ${dark ? 'border-white/20 text-white/80' : 'border-line text-ink-dim'}`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {job.badge && (
          <span
            className={`mt-5 inline-block rounded-full border px-3.5 py-1.5 font-mono text-[10px] tracking-wide uppercase ${dark ? 'border-white/25 bg-white/10 text-white' : 'border-line bg-bg-soft text-ink'}`}
          >
            ★ {job.badge}
          </span>
        )}

        <p className={`mt-5 max-w-[620px] text-[15px] leading-[1.7] ${dark ? 'text-white/85' : 'text-ink-dim'}`}>
          {job.desc}
        </p>

      </div>
    </div>
  )
}

function EducationCard() {
  return (
    <div className="rounded-[28px] bg-white/[0.04] p-7 ring-1 ring-line sm:p-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-4">
          <span className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-extrabold text-white">
            UNH
          </span>
          <div>
            <div className="mb-1.5 font-mono text-xs text-grad-a">{EDUCATION.degree}</div>
            <h3 className="text-[26px] leading-none sm:text-[30px]">{EDUCATION.school}</h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
          {[EDUCATION.location, EDUCATION.date].map((t) => (
            <span key={t} className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] whitespace-nowrap text-ink-dim">
              {t}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-5 text-[15px] text-ink-dim">{EDUCATION.detail}</p>
    </div>
  )
}

export default function CareerTimeline() {
  const motionOK = useMotionOK()
  const [active, setActive] = useState(0)
  const [quote, setQuote] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  // The rail fills top to bottom as the cards pass the middle of the screen.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 0.6', 'end 0.6'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const railScale = useTransform(fill, (v) => (motionOK ? v : 1))

  return (
    <section className="px-6 py-[12vh] sm:px-12">
      <div className="mx-auto max-w-[1120px]">
        <ChapterHeading
          title="From the support desk to leading *implementations.*"
        />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          {/* Sticky index of the timeline; the row being read lights up as you scroll. */}
          <aside className="hidden lg:block">
            <ol className="sticky top-32 space-y-1">
              {ROWS.map((r, i) => {
                const l = rowLabel(r)
                const on = i === active
                return (
                  <li key={i} className="relative pl-5">
                    <span
                      className={`absolute top-[9px] left-0 h-2 w-2 rounded-full transition-all duration-500 ${on ? 'brand-gradient scale-125' : 'bg-line'}`}
                    />
                    <div
                      className={`py-2 transition-all duration-500 ${on ? 'translate-x-1 opacity-100' : 'opacity-45'}`}
                    >
                      <div className="font-mono text-[11px] tracking-wide text-ink-faint">{l.date}</div>
                      <div className="mt-0.5 text-[15px] leading-snug font-semibold text-ink">{l.title}</div>
                      <div className="text-[13px] text-ink-dim">{l.sub}</div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </aside>

          <div ref={trackRef} className="relative pl-8 sm:pl-12">
            {/* The rail, and its gradient fill scaled by scroll progress. */}
            <div className="absolute top-2 bottom-2 left-[7px] w-[2px] rounded-full bg-line sm:left-[11px]" />
            <motion.div
              style={{ scaleY: railScale }}
              className="absolute top-2 bottom-2 left-[7px] w-[2px] origin-top rounded-full bg-gradient-to-b from-grad-a via-grad-b to-grad-c sm:left-[11px]"
            />

            <div className="space-y-10">
              {ROWS.map((r, i) => (
                <div key={i}>
                  {/* Two observers on purpose: this one keeps tracking which row is in the
                      middle band of the screen (both directions), while the reveal below fires
                      once and is done. */}
                  <motion.div
                    className="relative"
                    viewport={{ margin: '-45% 0px -45% 0px' }}
                    onViewportEnter={() => setActive(i)}
                  >
                    <span
                      className={`absolute top-9 -left-8 z-10 h-[16px] w-[16px] rounded-full ring-4 ring-bg transition-colors duration-500 sm:-left-12 sm:h-[24px] sm:w-[24px] ${i <= active ? 'brand-gradient' : 'bg-line'}`}
                    />
                    <motion.div
                      initial={motionOK ? { opacity: 0, y: 60, scale: 0.97 } : false}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: '-10% 0px' }}
                      transition={{ duration: 0.8, ease: EASE }}
                    >
                      {r.kind === 'job' ? <JobCard job={r.job} /> : <EducationCard />}
                    </motion.div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[16vh]">
          <Shoutouts items={SHOUTOUTS} active={quote} onChange={setQuote} />
        </div>
      </div>
    </section>
  )
}
