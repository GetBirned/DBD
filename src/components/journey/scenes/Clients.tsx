import { clientCases } from '@/lib/cases'
import Credit from '../Credit'
import { pass, type Timeline } from '../motion'

/** Where a client sits in the case viewer's list, by the start of its name. */
const at = (name: string) => Math.max(0, clientCases.findIndex((c) => c.name.startsWith(name)))

const THRESHER = at('Thresher')

/** The few named on the card, each opening its own case study. */
const FEATURED = [
  { label: 'NESTA', index: at('Nesta') },
  { label: 'You Know', index: at('You Know') },
  { label: 'Thresher', index: THRESHER },
]

/**
 * Client work as one title card: "i've done sites for | NESTA / You Know / Thresher / More". Each
 * name opens that site's case study; More opens the one after Thresher, and the viewer's arrows go
 * on through the rest.
 */
export default function Clients({ still = false, onOpen }: { still?: boolean; onOpen: (i: number) => void }) {
  return (
    <div className={`flex items-center justify-center px-[7vw] ${still ? 'py-[10vh]' : 'h-full pt-[12vh]'}`}>
      <div data-in>
        <Credit
          role="i've done sites for"
          names={[
            ...FEATURED.map((f) => ({ text: f.label, onClick: () => onOpen(f.index) })),
            { text: 'More', onClick: () => onOpen((THRESHER + 1) % clientCases.length) },
          ]}
        />
      </div>
    </div>
  )
}

export function buildClients(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelector('[data-in]'), start, len, { drift: 0.03, enter: 0.28, exit: 0.24 })
}
