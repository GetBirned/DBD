import { useState } from 'react'
import { Readout, ReadoutLabel } from '@/components/Monitor'
import { skills, type SkillGroup } from '@/data/skills'
import { useGitHubData, type ContributionsData } from '@/hooks/useGitHubData'
import Credit from '../Credit'
import { pass, type Timeline } from '../motion'
import Popup from '../Popup'

/** One group's lists on the ship's screen, as numbered readouts. */
function Index({ group, github }: { group: SkillGroup; github: ContributionsData | null }) {
  return (
    <div>
      {group.sections.map((s, si) => (
        <div key={si} className="mt-5 first:mt-0">
          {s.label && <ReadoutLabel>{s.label}</ReadoutLabel>}
          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {s.items.map((item, i) => (
              <Readout key={item} n={i + 1} name={item} />
            ))}
          </div>
        </div>
      ))}
      {/* The tools include where the code lives — with the last year's count, once it's in. */}
      {group.label === 'Tools' && github && github.total > 0 && (
        <>
          <ReadoutLabel>activity</ReadoutLabel>
          <Readout name={`github · @${github.user} · last year`} value={`${github.total.toLocaleString()} contributions`} href={github.profileUrl} />
        </>
      )}
    </div>
  )
}

/**
 * The stack as one title card — "i work with these | Languages / Integrations / Tools / Databases"
 * — where each name opens its list on the ship's screen.
 */
export default function Skills({ still = false }: { still?: boolean }) {
  const [open, setOpen] = useState<SkillGroup | null>(null)
  const { data: github } = useGitHubData<ContributionsData>('/api/github/contributions')

  return (
    <div className={`flex items-center justify-center px-[7vw] ${still ? 'py-[10vh]' : 'h-full pt-[12vh]'}`}>
      <div data-in>
        <Credit role="i work with these" names={skills.map((g) => ({ text: g.label, onClick: () => setOpen(g) }))} />
      </div>
      <Popup open={!!open} onClose={() => setOpen(null)} title={open ? `skill index · ${open.label}` : ''}>
        {open && <Index group={open} github={github} />}
      </Popup>
    </div>
  )
}

export function buildSkills(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelector('[data-in]'), start, len, { drift: 0.03, enter: 0.28, exit: 0.24 })
}
