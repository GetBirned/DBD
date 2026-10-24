import { projects } from '@/data/projects'
import Credit from '../Credit'
import { pass, type Timeline } from '../motion'

/** Where a project sits in the case viewer's list. */
const at = (name: string) => Math.max(0, projects.findIndex((p) => p.name === name))

/** The few named on the card (some under a shorter name), each opening its own case study. */
const FEATURED = [
  { name: 'FieldLogger' },
  { name: 'B2W API Help Guide', label: 'B2W API' },
  { name: 'DartERP' },
].map((f) => ({ ...f, index: at(f.name) }))

/** More opens the first project the card doesn't name; the viewer's arrows go on from there. */
const MORE = Math.max(0, projects.findIndex((p) => !FEATURED.some((f) => f.name === p.name)))

/**
 * Personal projects as one title card: "making projects like | FieldLogger / B2W API / DartERP /
 * More", each opening that project's case study on the ship's screen.
 */
export default function Projects({ still = false, onOpen }: { still?: boolean; onOpen: (i: number) => void }) {
  return (
    <div className={`flex items-center justify-center px-[7vw] ${still ? 'py-[10vh]' : 'h-full pt-[12vh]'}`}>
      <div data-in>
        <Credit
          role="making projects like"
          names={[...FEATURED.map((f) => ({ text: f.label ?? f.name, onClick: () => onOpen(f.index) })), { text: 'More', onClick: () => onOpen(MORE) }]}
        />
      </div>
    </div>
  )
}

export function buildProjects(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelector('[data-in]'), start, len, { drift: 0.03, enter: 0.28, exit: 0.24 })
}
