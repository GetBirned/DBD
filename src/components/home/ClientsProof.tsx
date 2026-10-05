import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

function Testimonials() {
  const motionOK = useMotionOK()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || !motionOK || QUOTES.length < 2) return
    const t = setTimeout(() => setI((n) => (n + 1) % QUOTES.length), INTERVAL * 1000)
    return () => clearTimeout(t)
  }, [i, paused, motionOK])

  if (QUOTES.length === 0) return null
  const q = QUOTES[i]

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mb-6 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">In their words</div>
      <div className="grid">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={q.name}
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
            transition={{ duration: 0.55, ease: EASE }}
            className="col-start-1 row-start-1"
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
        </AnimatePresence>
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
                  key={`${i}-${paused}`}
                  className="brand-gradient absolute inset-y-0 left-0"
                  initial={{ width: paused || !motionOK ? '100%' : '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: paused || !motionOK ? 0 : INTERVAL, ease: 'linear' }}
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
