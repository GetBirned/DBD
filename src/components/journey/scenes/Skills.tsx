import { useCallback, useState } from 'react'
import CaseViewer from '@/components/CaseViewer'
import { skills, type SkillGroup } from '@/data/skills'
import { useGitHubData, type ContributionsData } from '@/hooks/useGitHubData'
import { clientCases, projectCases } from '@/lib/cases'
import Credit from '../Credit'
import Mother, { type RecordKind } from '../Mother'
import { pass, type Timeline } from '../motion'
import Popup from '../Popup'

/**
 * The stack as one title card — "i work with these | Languages / Integrations / Tools / Databases"
 * — where each name brings up MU/TH/UR on the ship's screen with that file open, ready for
 * inquiries. A record it points to takes over the screen, and closing the record brings the
 * computer back with its answer still up.
 */
export default function Skills({ still = false }: { still?: boolean }) {
  const [group, setGroup] = useState<SkillGroup | null>(null)
  const [asked, setAsked] = useState<{ q: string; at: number } | null>(null)
  const [record, setRecord] = useState<{ kind: RecordKind; index: number } | null>(null)
  // Coming back from a record, the computer picks up where it was instead of booting again.
  const [resume, setResume] = useState(false)
  const { data: github } = useGitHubData<ContributionsData>('/api/github/contributions')

  const openRecord = useCallback((kind: RecordKind, index: number) => {
    setResume(true)
    setRecord({ kind, index })
  }, [])

  const close = () => {
    setGroup(null)
    setAsked(null)
    setResume(false)
  }

  return (
    <div className={`flex items-center justify-center px-[7vw] ${still ? 'py-[10vh]' : 'h-full pt-[12vh]'}`}>
      <div data-in>
        <Credit role="i work with these" names={skills.map((g) => ({ text: g.label, onClick: () => setGroup(g) }))} />
      </div>
      <Popup
        open={!!group && !record}
        onClose={close}
        title={group ? `mu/th/ur 182 · ${group.label}` : ''}
        hint="type or pick a skill | enter: ask | esc: exit"
      >
        {group && (
          <Mother
            group={group}
            onGroup={setGroup}
            asked={asked}
            onAsk={(q) => {
              setResume(false)
              setAsked({ q, at: Date.now() })
            }}
            instant={resume}
            github={github}
            onOpenRecord={openRecord}
          />
        )}
      </Popup>
      <CaseViewer
        items={record?.kind === 'client' ? clientCases : projectCases}
        index={record?.index ?? null}
        onIndex={(index) => setRecord((r) => (r ? { ...r, index } : r))}
        onClose={() => setRecord(null)}
      />
    </div>
  )
}

export function buildSkills(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelector('[data-in]'), start, len, { drift: 0.03, enter: 0.28, exit: 0.24 })
}
