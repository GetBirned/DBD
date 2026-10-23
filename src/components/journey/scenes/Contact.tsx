import Credit from '../Credit'
import { pass, type Timeline } from '../motion'

/** Approved-contractor designations, knocked out to white so they sit in the sky with the type. */
const CREDENTIALS = [
  { src: '/logos/sbdc.svg', alt: "America's SBDC New Hampshire", href: 'https://www.nhsbdc.org/', className: 'h-9' },
  { src: '/logos/grdc.webp', alt: 'Grafton Regional Development Corporation', href: 'https://graftonrdc.org/', className: 'h-6' },
]

/**
 * The last card: the ways to reach me, stacked on the credits' axis the way the film stacks its
 * producers. It stays — there's no reset.
 */
export default function Contact({ still = false }: { still?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center px-[8vw] ${still ? 'py-[14vh]' : 'h-full pt-[12vh]'}`}>
      <div data-in>
        <Credit
          role="contact me at"
          names={[
            { text: 'Email', href: 'mailto:dartbirnie@gmail.com' },
            { text: 'GitHub', href: 'https://github.com/GetBirned' },
            { text: 'LinkedIn', href: 'https://www.linkedin.com/in/dartagnan-birnie/' },
            { text: 'Résumé', href: '/resume.pdf', download: 'Dartagnan_Birnie_Resume.pdf' },
            { text: '(603) 833-1781', href: 'tel:+16038331781' },
          ]}
        />
      </div>
      <div data-in className="mt-[9vh] flex flex-col items-center gap-4">
        <div className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">Approved web design contractor</div>
        <div className="flex items-center gap-8">
          {CREDENTIALS.map((c) => (
            <a key={c.src} href={c.href} target="_blank" rel="noreferrer" title={c.alt} className="opacity-60 transition-opacity hover:opacity-100">
              <img src={c.src} alt={c.alt} loading="lazy" className={`${c.className} w-auto brightness-0 invert`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export function buildContact(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelectorAll('[data-in]'), start, len, { drift: 0.04, enter: 0.45, stagger: 0.04, stay: true })
}
