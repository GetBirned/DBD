import Credit from '../Credit'
import { pass, type Timeline } from '../motion'

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
            { text: 'Resume', href: '/resume.pdf', download: 'Dartagnan_Birnie_Resume.pdf' },
            { text: '(603) 833-1781', href: 'tel:+16038331781' },
          ]}
        />
      </div>
    </div>
  )
}

export function buildContact(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelectorAll('[data-in]'), start, len, { drift: 0.04, enter: 0.45, stagger: 0.04, stay: true })
}
