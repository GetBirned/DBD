import { ArrowUpRight, GitHubIcon, LinkedInIcon } from './icons'

/** Approved-contractor designations. The marks name their own issuing bodies. They're drawn for
 *  a white ground, so they sit on white tiles here. */
const CREDENTIALS = [
  { src: '/logos/sbdc.svg', alt: "America's SBDC New Hampshire", href: 'https://www.nhsbdc.org/', className: 'h-10' },
  { src: '/logos/grdc.webp', alt: 'Grafton Regional Development Corporation', href: 'https://graftonrdc.org/', className: 'h-8' },
]

export default function Footer() {
  // Base pill shared by all three actions — these are the primary conversion point of the
  // whole site, so they're sized as the focal element rather than as trailing links.
  const action =
    'inline-flex items-center gap-2.5 px-7 py-5 font-mono text-[13px] tracking-[0.1em] uppercase transition-colors'

  return (
    <footer className="relative z-[1] bg-ink px-[4vw] pb-12 text-paper">
      <div className="border-t border-paper/20 pt-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:dartbirnie@gmail.com"
              className={`${action} bg-accent text-white hover:bg-white hover:text-ink`}
            >
              Send Email <ArrowUpRight />
            </a>
            <a href="tel:+16038331781" className={`${action} border border-paper/40 hover:border-paper hover:bg-paper hover:text-ink`}>
              Call Me
            </a>
            <a
              href="/resume.pdf"
              download="Dartagnan_Birnie_Resume.pdf"
              className={`${action} border border-paper/40 hover:border-paper hover:bg-paper hover:text-ink`}
            >
              Download Résumé
            </a>
          </div>

          <div className="lg:text-right">
            <div className="font-mono text-[11px] tracking-[0.1em] text-paper/60 uppercase">Approved Web Design Contractor</div>
            <div className="mt-4 flex flex-wrap items-center gap-3 lg:justify-end">
              {CREDENTIALS.map((c) => (
                <a
                  key={c.src}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  title={c.alt}
                  className="flex h-16 items-center bg-white px-4 transition-transform hover:-translate-y-0.5"
                >
                  <img src={c.src} alt={c.alt} loading="lazy" decoding="async" className={`${c.className} w-auto`} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-paper/20 pt-7 font-mono text-xs tracking-[0.06em] text-paper/55 uppercase">
          <span>© Dartagnan Birnie — Alton, NH</span>
          <span className="flex items-center gap-5">
            <a href="https://github.com/GetBirned" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-paper">
              <GitHubIcon size={14} /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/dartagnan-birnie/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-paper">
              <LinkedInIcon size={13} /> LinkedIn
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
