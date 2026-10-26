import { useEffect, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import CaseViewer from '@/components/CaseViewer'
import Destruct from '@/components/Destruct'
import { goToChapter, CHAPTER_LINKS, type ChapterId } from '@/components/chapters'
import { soundtrack } from '@/components/Soundtrack'
import Journey from '@/components/journey/Journey'
import Mother, { type Asked } from '@/components/journey/Mother'
import type { Action } from '@/components/journey/motherBrain'
import Popup from '@/components/journey/Popup'
import { skills, type SkillGroup } from '@/data/skills'
import { useGitHubData, type ContributionsData, type LogData } from '@/hooks/useGitHubData'
import { clientCases, projectCases } from '@/lib/cases'
import { closeScreens, destruct, openScreen, useMotherCalls } from '@/lib/ship'

type Open = { kind: 'client' | 'project'; index: number; view?: 'schematic' } | null

/** Whether a key press belongs to something being typed into, rather than the page. */
const typing = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]')

/**
 * The whole site as one continuous shot through space (see Journey), with any client site or
 * project opening as a full case study over it, and MU/TH/UR, the ship's computer, a keypress
 * away (/) to search and steer the whole thing.
 */
export default function Home() {
  const [params, setParams] = useSearchParams()
  const { hash } = useLocation()
  const [open, setOpen] = useState<Open>(null)

  // `?p=<project>` opens that project's case study — old /fun?p= links redirect here with it.
  useEffect(() => {
    const p = params.get('p')
    if (!p) return
    const i = projectCases.findIndex((c) => c.key === p)
    if (i >= 0) setOpen({ kind: 'project', index: i })
  }, [params])

  // `#chapter` jumps straight to that point in the journey — deferred past App's ScrollToTop,
  // which runs on the same route change.
  useEffect(() => {
    const id = hash.slice(1) as ChapterId
    if (!CHAPTER_LINKS.some((c) => c.id === id)) return
    const t = setTimeout(() => goToChapter(id, true), 300)
    return () => clearTimeout(t)
  }, [hash])

  const close = () => {
    setOpen(null)
    if (params.has('p')) {
      params.delete('p')
      setParams(params, { replace: true })
    }
  }

  // The ship's computer: open with a skill file or none, the question on screen, and whether
  // it's coming back from a record it opened (so it shows its answer again rather than rebooting).
  const [mother, setMother] = useState<{ group: SkillGroup | null } | null>(null)
  const [asked, setAsked] = useState<Asked | null>(null)
  const [resume, setResume] = useState(false)
  const { data: github } = useGitHubData<ContributionsData>('/api/github/contributions')
  const { data: log } = useGitHubData<LogData>('/api/github/log')

  const callMother = (group?: string) => {
    setMother({ group: skills.find((g) => g.label === group) ?? null })
    setAsked(null)
    setResume(false)
  }
  const closeMother = () => {
    setMother(null)
    setAsked(null)
    setResume(false)
  }
  useMotherCalls(callMother)

  // Read by the key handler below, which is set up once.
  const now = useRef({ mother, open, close })
  now.current = { mother, open, close }

  // "/" calls it up from anywhere ("\" too) — any screen that's up switches off on the way. Not
  // while something's being typed, so it can still go into a search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== '/' && e.key !== '\\') || e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return
      const screenUp = !!document.querySelector('[role="dialog"]')
      e.preventDefault()
      const { mother: m, open: record, close: closeRecord } = now.current
      if (m && !record) return
      if (record) {
        closeRecord()
        // It's waiting behind the record it opened: closing the record is the way back.
        if (m) return
      }
      closeScreens()
      setTimeout(callMother, screenUp ? 300 : 0)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const act = (a: Action) => {
    switch (a.type) {
      case 'record':
        // The record takes over the screen; closing it brings the computer back.
        setResume(true)
        setOpen({ kind: a.kind, index: a.index, view: a.view })
        break
      case 'screen':
        closeMother()
        setTimeout(() => openScreen(a.id), 120)
        break
      case 'goto':
        // Once the screen has switched off and the page can scroll again.
        closeMother()
        setTimeout(() => goToChapter(a.id), 420)
        break
      case 'group':
        setMother((m) => m && { group: skills.find((g) => g.label === a.label) ?? m.group })
        break
      case 'play':
        soundtrack.play()
        break
      case 'stop':
        soundtrack.stop()
        break
      case 'destruct':
        destruct(true)
        break
      case 'abort':
        destruct(false)
        break
    }
  }

  return (
    <>
      <Journey onOpen={(kind, index) => setOpen({ kind, index })} />
      <CaseViewer
        items={open?.kind === 'client' ? clientCases : projectCases}
        index={open?.index ?? null}
        view={open?.view}
        onIndex={(index) => setOpen((o) => (o ? { ...o, index, view: undefined } : o))}
        onClose={close}
      />
      <Popup
        open={!!mother && !open}
        onClose={closeMother}
        title={mother?.group ? `mu/th/ur 182 · ${mother.group.label}` : "mu/th/ur 182 · ship's computer"}
        hint="type to search | ↑↓ enter: ask | esc: exit"
        shortcut={false}
      >
        {mother && (
          <Mother
            group={mother.group}
            onGroup={(g) => setMother({ group: g })}
            asked={asked}
            onAsk={(a) => {
              setResume(false)
              setAsked(a)
            }}
            instant={resume}
            github={github}
            log={log}
            onAction={act}
          />
        )}
      </Popup>
      <button
        type="button"
        onClick={() => callMother()}
        aria-haspopup="dialog"
        aria-label="Ask MU/TH/UR, the ship's computer (press /)"
        title="Ask MU/TH/UR  ( / )"
        className="fixed bottom-4 left-[calc(4vw+44px)] z-[991] flex h-10 items-center px-1.5 text-[22px] leading-none text-ink/50 transition-[color,filter] duration-300 [font-family:'VT323',monospace] hover:text-ink hover:drop-shadow-[0_0_6px_rgb(255_226_180/0.6)]"
      >
        &gt;_
      </button>
      <Destruct
        onReset={() => {
          // The ship starts over: every screen off, back to the opening credits.
          closeMother()
          if (open) close()
          closeScreens()
          goToChapter('top', true)
        }}
      />
    </>
  )
}
