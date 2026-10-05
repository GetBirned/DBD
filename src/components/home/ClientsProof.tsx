import { useEffect, useRef, useState } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import VelocityMarquee from '@/components/VelocityMarquee'
import { clients } from '@/data/clients'
import { companies } from '@/data/companies'
import { EASE, useMotionOK } from '@/lib/motion'

// Alternate the roster across two rows so each row mixes logo shapes rather than clumping.
const ROW_A = companies.filter((_, i) => i % 2 === 0)
const ROW_B = companies.filter((_, i) => i % 2 === 1)

// Only clients who actually gave a testimonial — nothing placeholder.
const QUOTES = clients.filter((c) => c.quote)
const INTERVAL = 7

// Outgoing fades up and out first, then the next rises in from below.
const swap: Variants = {
  shown: { opacity: 1, y: [18, 0], filter: 'blur(0px)', transition: { duration: 0.55, ease: EASE, delay: 0.25 } },
  hidden: { opacity: 0, y: -12, filter: 'blur(6px)', transition: { duration: 0.25, ease: EASE } },
}

function Testimonials() {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLDivElement>(null)
  // Only rotates while on screen — nobody's reading it otherwise, and nobody arrives mid-rotation.
  const inView = useInView(ref, { margin: '-20% 0px' })
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const running = motionOK && inView && !paused && QUOTES.length > 1

  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => setI((n) => (n + 1) % QUOTES.length), INTERVAL * 1000)
    return () => clearTimeout(t)
  }, [i, running])

  if (QUOTES.length === 0) return null

  return (
    <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Every quote stacked in one grid cell, so the block always takes the height of the
          longest. Swapping one quote for another used to resize it — Monzione's short quote
          pulled everything below up ~160px and the next one pushed it back, every rotation. */}
      <div className="grid">
        {QUOTES.map((q, n) => (
          <motion.figure
            key={q.name}
            aria-hidden={n !== i}
            initial={false}
            animate={n === i ? 'shown' : 'hidden'}
            variants={motionOK ? swap : undefined}
            style={motionOK ? undefined : { opacity: n === i ? 1 : 0 }}
            className={`col-start-1 row-start-1 ${n === i ? '' : 'pointer-events-none'}`}
          >
            <blockquote className="accent text-[clamp(28px,3.6vw,48px)] leading-[1.18] text-ink">
              <span className="grad-text">“</span>
              {q.quote}
              <span className="grad-text">”</span>
            </blockquote>
            <figcaption className="mt-7 flex items-center gap-3">
              {q.logo && <img src={q.logo} alt="" className="h-10 w-10 rounded-full bg-white object-contain p-1" />}
              <span className="font-mono text-xs text-ink-dim">{q.attr}</span>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      {QUOTES.length > 1 && (
        <div className="mt-8 flex gap-2.5">
          {QUOTES.map((c, n) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Testimonial from ${c.name}`}
              className="relative h-1.5 w-12 overflow-hidden rounded-full bg-white/15"
            >
              {/* The active pill fills over the auto-advance interval, so it doubles as a timer. */}
              {n === i && (
                <motion.span
                  key={`${i}-${running}`}
                  className="brand-gradient absolute inset-y-0 left-0"
                  initial={{ width: running ? '0%' : '100%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: running ? INTERVAL : 0, ease: 'linear' }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** After the gallery: the testimonials, then every business I've built for as a logo wall. */
export default function ClientsProof() {
  return (
    <section className="pt-[10vh] pb-[14vh]">
      <div className="mx-auto max-w-[1000px] px-6 sm:px-12">
        <Testimonials />
      </div>
      <div className="mt-[12vh]">
        <div className="mx-auto mb-6 max-w-[1120px] px-6 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase sm:px-12">
          Everyone I've built for
        </div>
        <div className="space-y-4">
          <VelocityMarquee items={ROW_A} speed={-2.2} />
          <VelocityMarquee items={ROW_B} speed={2.2} />
        </div>
      </div>
    </section>
  )
}
