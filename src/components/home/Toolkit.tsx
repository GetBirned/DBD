import { motion } from 'framer-motion'
import Credit from './Credit'
import GitHubActivity from '@/components/GitHubActivity'
import { skills } from '@/data/skills'
import { EASE, useMotionOK } from '@/lib/motion'

/**
 * The stack as end credits: each skill group a credit — the group on the left of the axis, the
 * names stacked on the right — two to a row on wide screens, dissolving in as they're reached.
 * Then the GitHub board.
 */
export default function Toolkit() {
  const motionOK = useMotionOK()

  return (
    <section className="px-[6vw] py-[16vh]">
      <div className="mx-auto grid max-w-[1300px] gap-y-[12vh] lg:grid-cols-2 lg:gap-x-[4vw]">
        {skills.map((g) => (
          <motion.div
            key={g.label}
            initial={motionOK ? { opacity: 0 } : false}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-15% 0px' }}
            transition={{ duration: 1.4, ease: EASE }}
          >
            <Credit role={g.label.toLowerCase().replace('&', 'and')} names={g.items} size="text-[clamp(17px,1.8vw,30px)]" />
          </motion.div>
        ))}
      </div>

      <div className="mx-auto mt-[18vh] max-w-[1300px]">
        <GitHubActivity />
      </div>
    </section>
  )
}
