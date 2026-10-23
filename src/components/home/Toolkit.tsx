import { motion } from 'framer-motion'
import ChapterHeading from './ChapterHeading'
import GitHubActivity from '@/components/GitHubActivity'
import { VelocityTrack } from '@/components/VelocityMarquee'
import { skills } from '@/data/skills'
import { EASE, useMotionOK } from '@/lib/motion'

/** One run of giant condensed type: words alternate solid and hollow, split by a slash. */
function Words({ words, offset }: { words: string[]; offset: number }) {
  return (
    <>
      {words.map((w, i) => (
        <span key={w} className="flex items-center whitespace-nowrap">
          <span className={`display text-[clamp(64px,13vw,220px)] ${(i + offset) % 2 ? 'outline-text' : 'text-ink'}`}>{w}</span>
          <span className="display mx-[0.3em] text-[clamp(64px,13vw,220px)] text-accent">/</span>
        </span>
      ))}
    </>
  )
}

/**
 * What I build with: the stack as three rows of oversized kinetic type that ride the scroll
 * velocity, then the same list as a spec table for skimming, then the GitHub board.
 */
export default function Toolkit() {
  const motionOK = useMotionOK()
  const [langs, platforms, tools, practice] = skills
  const rows = [langs.items, platforms.items, [...tools.items, ...practice.items.slice(4, 7)]]

  return (
    <section className="py-[14vh]">
      <div className="px-[4vw]">
        <ChapterHeading title="What I build *with.*" />
      </div>

      <div aria-hidden className="-space-y-[0.08em] border-y border-ink py-[2vw]">
        {rows.map((words, i) => (
          <VelocityTrack key={i} speed={i % 2 ? 1.6 : -1.6}>
            <Words words={words} offset={i} />
          </VelocityTrack>
        ))}
      </div>

      {/* The same stack, organized — the kinetic rows are for feel, this is for reading. */}
      <div className="mt-[10vh] grid grid-cols-2 gap-x-[4vw] px-[4vw] lg:grid-cols-4">
        {skills.map((g, gi) => (
          <motion.div
            key={g.label}
            initial={motionOK ? { opacity: 0, y: 30 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.7, ease: EASE, delay: gi * 0.08 }}
            className="border-t border-ink pt-4 pb-10"
          >
            <div className="display text-[clamp(26px,2.6vw,44px)] text-ink">{g.label}</div>
            <ul className="mt-4 space-y-1.5">
              {g.items.map((s) => (
                <li key={s} className="font-mono text-[12px] text-ink-dim sm:text-[13px]">
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="mt-[12vh] px-[4vw]">
        <GitHubActivity />
      </div>
    </section>
  )
}
