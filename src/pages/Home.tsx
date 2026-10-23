import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import CaseViewer from '@/components/CaseViewer'
import { goToChapter, CHAPTER_LINKS, type ChapterId } from '@/components/chapters'
import Journey from '@/components/journey/Journey'
import { clientCases, projectCases } from '@/lib/cases'

type Open = { kind: 'client' | 'project'; index: number } | null

/**
 * The whole site as one continuous shot through space (see Journey), with any client site or
 * project opening as a full case study over it.
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

  return (
    <>
      <Journey onOpen={(kind, index) => setOpen({ kind, index })} />
      <CaseViewer
        items={open?.kind === 'client' ? clientCases : projectCases}
        index={open?.index ?? null}
        onIndex={(index) => setOpen((o) => (o ? { ...o, index } : o))}
        onClose={close}
      />
    </>
  )
}
