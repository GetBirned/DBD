import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight, GitHubIcon, LinkedInIcon } from './icons'
import { useMotionOK } from '@/lib/motion'

/** Approved-contractor designations. The marks name their own issuing bodies. They're drawn for
 *  a white ground, so they sit on white tiles here. */
const CREDENTIALS = [
  { src: '/logos/sbdc.svg', alt: "America's SBDC New Hampshire", href: 'https://www.nhsbdc.org/', className: 'h-10' },
  { src: '/logos/grdc.webp', alt: 'Grafton Regional Development Corporation', href: 'https://graftonrdc.org/', className: 'h-8' },
]

export default function Footer() {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLElement>(null)
  // The closing wordmark rises into place over the last stretch of scroll.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const rise = useSpring(useTransform(scrollYProgress, [0.25, 1], ['55%', '0%']), { stiffness: 120, damping: 28 })

  // Base pill shared by all three actions — these are the primary conversion point of the
  // whole site, so they're sized as the focal element rather than as trailing links.
  const action =
    'inline-flex items-center gap-2.5 rounded-full px-7 py-4 font-mono text-[12px] tracking-wide uppercase transition-transform hover:-translate-y-0.5'

  return (
    <footer ref={ref} className="relative z-[1] overflow-hidden border-t border-line bg-[oklch(0.11_0.02_282)] px-6 pt-20 sm:px-12">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:dartbirnie@gmail.com"
              className={`${action} brand-gradient text-white shadow-[0_14px_40px_-10px_oklch(0.55_0.2_295_/_0.7)]`}
            >
              Send Email <ArrowUpRight />
            </a>
            <a href="tel:+16038331781" className={`${action} text-ink ring-1 ring-white/20 hover:bg-white/5`}>
              Call Me
            </a>
            <a
              href="/resume.pdf"
              download="Dartagnan_Birnie_Resume.pdf"
              className={`${action} text-ink ring-1 ring-white/20 hover:bg-white/5`}
            >
              Download Résumé
            </a>
          </div>

          <div className="lg:text-right">
            <div className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">Approved Web Design Contractor</div>
            <div className="mt-4 flex flex-wrap items-center gap-3 lg:justify-end">
              {CREDENTIALS.map((c) => (
                <a
                  key={c.src}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  title={c.alt}
                  className="flex h-16 items-center rounded-2xl bg-white px-4 transition-transform hover:-translate-y-0.5"
                >
                  <img src={c.src} alt={c.alt} loading="lazy" decoding="async" className={`${c.className} w-auto`} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7 font-mono text-xs tracking-wide text-ink-faint">
          <span>© Dartagnan Birnie — Alton, NH</span>
          <span className="flex items-center gap-5">
            <a href="https://github.com/GetBirned" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-ink">
              <GitHubIcon size={14} /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/dartagnan-birnie/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-ink">
              <LinkedInIcon size={13} /> LinkedIn
            </a>
          </span>
        </div>
      </div>

      {/* The sign-off: the name, set as large as the page is wide. */}
      <div aria-hidden className="mt-10 overflow-hidden select-none">
        <motion.div
          style={motionOK ? { y: rise } : undefined}
          className="grad-text text-center font-display text-[15.2vw] leading-[0.86] font-extrabold tracking-[-0.06em] whitespace-nowrap opacity-90"
        >
          Dart Birnie
        </motion.div>
      </div>
    </footer>
  )
}
