import { skills } from '@/data/skills'
import { openMother } from '@/lib/ship'
import Credit from '../Credit'
import { pass, type Timeline } from '../motion'

/**
 * The stack as one title card — "i work with these | Languages / Integrations / Tools / Databases"
 * — where each name brings up MU/TH/UR, the ship's computer, with that skill file open and ready
 * for inquiries.
 */
export default function Skills({ still = false }: { still?: boolean }) {
  return (
    <div className={`flex items-center justify-center px-[7vw] ${still ? 'py-[10vh]' : 'h-full pt-[12vh]'}`}>
      <div data-in>
        <Credit role="i work with these" names={skills.map((g) => ({ text: g.label, onClick: () => openMother(g.label) }))} />
      </div>
    </div>
  )
}

export function buildSkills(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelector('[data-in]'), start, len, { drift: 0.03, enter: 0.28, exit: 0.24 })
}
