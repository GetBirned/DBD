import Credit from './home/Credit'
import { GitHubIcon, LinkedInIcon } from './icons'

/** Approved-contractor designations, linked to the bodies that issue them. Knocked out to white
 *  so they sit in the sky like the rest of the type. */
const CREDENTIALS = [
  { src: '/logos/sbdc.svg', alt: "America's SBDC New Hampshire", href: 'https://www.nhsbdc.org/', className: 'h-11' },
  { src: '/logos/grdc.webp', alt: 'Grafton Regional Development Corporation', href: 'https://graftonrdc.org/', className: 'h-8' },
]

/**
 * The last card: how to reach me, set as a credit — the ways in stacked on the axis the way the
 * film stacks its producers — then the contractor marks and the small print.
 */
export default function Footer() {
  return (
    <footer className="relative z-[1] px-[6vw] pt-[14vh] pb-10">
      <Credit
        role="get in touch"
        names={[
          { text: 'dartbirnie@gmail.com', href: 'mailto:dartbirnie@gmail.com' },
          { text: '(603) 833-1781', href: 'tel:+16038331781' },
          'and',
          { text: 'my résumé', href: '/resume.pdf', download: 'Dartagnan_Birnie_Resume.pdf' },
        ]}
      />

      <div className="mt-[14vh] flex flex-col items-center gap-5">
        <div className="font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">Approved web design contractor</div>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {CREDENTIALS.map((c) => (
            <a key={c.src} href={c.href} target="_blank" rel="noreferrer" title={c.alt} className="opacity-70 transition-opacity hover:opacity-100">
              <img src={c.src} alt={c.alt} loading="lazy" decoding="async" className={`${c.className} w-auto brightness-0 invert`} />
            </a>
          ))}
        </div>
      </div>

      <div className="mt-[10vh] flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 font-mono text-[11px] tracking-[0.1em] text-ink-faint uppercase">
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
    </footer>
  )
}
