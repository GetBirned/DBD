import { ArrowUpRight, GitHubIcon, LinkedInIcon } from '@/components/icons'
import { pass, type Timeline } from '../motion'

/** Approved-contractor designations, knocked out to white so they sit in the sky with the type. */
const CREDENTIALS = [
  { src: '/logos/sbdc.svg', alt: "America's SBDC New Hampshire", href: 'https://www.nhsbdc.org/', className: 'h-9' },
  { src: '/logos/grdc.webp', alt: 'Grafton Regional Development Corporation', href: 'https://graftonrdc.org/', className: 'h-6' },
]

const link = 'inline-flex items-center gap-2 border-b border-line pb-1.5 transition-colors hover:border-ink hover:text-ink'

/** The end of the journey: open space, and the ways to reach me. It stays — there's no reset. */
export default function Contact({ still = false }: { still?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center px-[8vw] text-center ${still ? 'py-[14vh]' : 'h-full'}`}>
      <h2 data-in className="display text-[clamp(30px,5.2vw,92px)] leading-[1.05] tracking-[0.14em]">Let's build something.</h2>
      <p data-in className="mt-[3.5vh] max-w-[34em] text-[clamp(14px,1.1vw,18px)] leading-relaxed text-ink-dim">
        Hiring, starting a project, or just want to talk shop — I'd like to hear from you.
      </p>
      <div data-in className="mt-[5vh] flex flex-wrap justify-center gap-x-8 gap-y-4 font-mono text-[11px] tracking-[0.16em] text-ink-dim uppercase sm:text-[12px]">
        <a href="mailto:dartbirnie@gmail.com" className={link}>
          Email <ArrowUpRight />
        </a>
        <a href="https://github.com/GetBirned" target="_blank" rel="noreferrer" className={link}>
          <GitHubIcon size={13} /> GitHub
        </a>
        <a href="https://www.linkedin.com/in/dartagnan-birnie/" target="_blank" rel="noreferrer" className={link}>
          <LinkedInIcon size={12} /> LinkedIn
        </a>
        <a href="/resume.pdf" download="Dartagnan_Birnie_Resume.pdf" className={link}>
          Résumé <ArrowUpRight />
        </a>
        <a href="tel:+16038331781" className={link}>
          (603) 833-1781
        </a>
      </div>
      <div data-in className="mt-[8vh] flex flex-col items-center gap-4">
        <div className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">Approved web design contractor</div>
        <div className="flex items-center gap-8">
          {CREDENTIALS.map((c) => (
            <a key={c.src} href={c.href} target="_blank" rel="noreferrer" title={c.alt} className="opacity-60 transition-opacity hover:opacity-100">
              <img src={c.src} alt={c.alt} loading="lazy" className={`${c.className} w-auto brightness-0 invert`} />
            </a>
          ))}
        </div>
      </div>
      <div data-in className={`font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase ${still ? 'mt-[8vh]' : 'absolute inset-x-0 bottom-6'}`}>
        © Dart Birnie — Alton, NH
      </div>
    </div>
  )
}

export function buildContact(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelectorAll('[data-in]'), start, len, { drift: 0.04, enter: 0.45, stagger: 0.04, stay: true })
}
