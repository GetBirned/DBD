import { motion } from 'framer-motion'
import ChapterHeading from './ChapterHeading'
import GitHubActivity from '@/components/GitHubActivity'
import { VelocityTrack } from '@/components/VelocityMarquee'
import { skills } from '@/data/skills'
import { EASE, useMotionOK } from '@/lib/motion'

/** One run of giant type: words alternate solid and hollow, separated by small gradient stars. */
function Words({ words, offset }: { words: string[]; offset: number }) {
  return (
    <>
      {words.map((w, i) => (
        <span key={w} className="flex items-center whitespace-nowrap">
          <span
            className={`font-display text-[clamp(44px,8vw,116px)] leading-[1.05] font-extrabold tracking-[-0.04em] ${(i + offset) % 2 ? 'outline-text' : 'text-ink'}`}
          >
            {w}
          </span>
          <span className="grad-text mx-[0.45em] text-[clamp(20px,3vw,40px)]">✦</span>
        </span>
      ))}
    </>
  )
}

/**
 * What I build with: the stack as three rows of oversized kinetic type that ride the scroll
 * velocity, then the same list organized for skimming, then the GitHub board.
 */
export default function Toolkit() {
  const motionOK = useMotionOK()
  const [langs, platforms, tools, practice] = skills
  const rows = [langs.items, platforms.items, [...tools.items, ...practice.items.slice(4, 7)]]

  return (
    <section className="py-[14vh]">
      <div className="mx-auto max-w-[1120px] px-6 sm:px-12">
        <ChapterHeading
          index="04"
          eyebrow="Toolkit"
          title="What I build *with.*"
          kicker="From .NET and SQL Server at work to React, Node, and Godot after hours."
        />
      </div>

      <div aria-hidden className="space-y-1 sm:space-y-2">
        {rows.map((words, i) => (
          <VelocityTrack key={i} speed={i % 2 ? 1.6 : -1.6}>
            <Words words={words} offset={i} />
          </VelocityTrack>
        ))}
      </div>

      {/* The same stack, organized — the kinetic rows are for feel, this is for reading. */}
      <div className="mx-auto mt-[10vh] grid max-w-[1120px] gap-10 px-6 sm:grid-cols-2 sm:px-12 lg:grid-cols-4">
        {skills.map((g, gi) => (
          <motion.div
            key={g.label}
            initial={motionOK ? { opacity: 0, y: 30 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.7, ease: EASE, delay: gi * 0.08 }}
          >
            <div className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">
              <span className="brand-gradient h-1.5 w-1.5 rounded-full" />
              {g.label}
            </div>
            <ul className="flex flex-wrap gap-2">
              {g.items.map((s) => (
                <li
                  key={s}
                  className="rounded-full bg-white/[0.04] px-3 py-1.5 font-mono text-[12px] text-ink-dim ring-1 ring-line transition-colors hover:bg-white/10 hover:text-ink"
                >
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="mx-auto mt-[10vh] max-w-[1120px] px-6 sm:px-12">
        <GitHubActivity />
      </div>
    </section>
  )
}
