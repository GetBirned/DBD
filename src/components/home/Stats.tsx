import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView } from 'framer-motion'
import { companies } from '@/data/companies'
import { projects } from '@/data/projects'
import { EASE, useMotionOK } from '@/lib/motion'

interface Stat {
  value: number
  /** Rendered after the counting number, e.g. "+" or " mo". */
  suffix?: string
  label: string
}

const STATS: Stat[] = [
  { value: 1400, suffix: '+', label: "Production issues resolved in six months on Trimble's support team" },
  { value: 6, suffix: ' mo', label: 'From support engineer to implementation consultant' },
  { value: companies.length, label: 'Local businesses put online with Designs By Dart' },
  { value: projects.length, label: 'Projects built — games, apps, an ERP, and a rail-inspection platform' },
]

/**
 * Counts up from zero the first time it scrolls into view. With motion off it just shows the
 * value — and with motion on it starts at 0, not the value, so it never flashes the final number
 * and then snaps back down when counting begins.
 */
function Counter({ value, suffix = '', counts, run }: { value: number; suffix?: string; counts: boolean; run: boolean }) {
  const [shown, setShown] = useState(counts ? 0 : value)

  useEffect(() => {
    if (!counts || !run) return
    const controls = animate(0, value, {
      duration: value > 100 ? 1.8 : 1.1,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    })
    return () => controls.stop()
  }, [counts, run, value])

  return (
    <>
      {shown.toLocaleString()}
      {suffix}
    </>
  )
}

export default function Stats() {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })

  return (
    <section className="px-6 pb-[14vh] sm:px-12">
      <div
        ref={ref}
        className="mx-auto grid max-w-[1120px] grid-cols-2 gap-x-6 gap-y-12 border-t border-line pt-12 lg:grid-cols-4"
      >
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={motionOK ? { opacity: 0, y: 30 } : false}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
          >
            <div className="grad-text font-display text-[clamp(44px,6vw,84px)] leading-none font-extrabold tracking-[-0.04em] tabular-nums">
              {/* Counting only starts once in view, so the number lands while someone is looking. */}
              <Counter value={s.value} suffix={s.suffix} counts={motionOK} run={inView} />
            </div>
            <p className="mt-3 max-w-[230px] text-[14px] leading-snug text-ink-dim">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
