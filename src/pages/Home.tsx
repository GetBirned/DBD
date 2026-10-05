import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import PageTransition from '@/components/PageTransition'
import CaseViewer from '@/components/CaseViewer'
import { Chapter } from '@/components/chapters'
import HeroScroll from '@/components/home/HeroScroll'
import Manifesto from '@/components/home/Manifesto'
import Stats from '@/components/home/Stats'
import CareerTimeline from '@/components/home/CareerTimeline'
import ClientsGallery from '@/components/home/ClientsGallery'
import ClientsProof from '@/components/home/ClientsProof'
import ProjectStack from '@/components/home/ProjectStack'
import Toolkit from '@/components/home/Toolkit'
import OffTheClock from '@/components/home/OffTheClock'
import { clientCases, projectCases } from '@/lib/cases'

type Open = { kind: 'client' | 'project'; index: number } | null

/**
 * The whole site as one scroll story, in chapters: the mark becomes the name, then the career,
 * the clients, the projects, the toolkit, and what I do off the clock. Any client site or project
 * opens as a full case study over the page.
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

  // `#chapter` scrolls to it — deferred past App's ScrollToTop, which runs on the same route change.
  useEffect(() => {
    const id = hash.slice(1)
    if (!id) return
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 250)
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
    <PageTransition>
      <Chapter id="top">
        <HeroScroll />
        <Manifesto />
        <Stats />
      </Chapter>
      <Chapter id="career">
        <CareerTimeline />
      </Chapter>
      <Chapter id="clients">
        <ClientsGallery onOpen={(index) => setOpen({ kind: 'client', index })} />
        <ClientsProof />
      </Chapter>
      <Chapter id="projects">
        <ProjectStack onOpen={(index) => setOpen({ kind: 'project', index })} />
      </Chapter>
      <Chapter id="toolkit">
        <Toolkit />
      </Chapter>
      <Chapter id="life">
        <OffTheClock />
      </Chapter>

      <CaseViewer
        items={open?.kind === 'client' ? clientCases : projectCases}
        index={open?.index ?? null}
        onIndex={(index) => setOpen((o) => (o ? { ...o, index } : o))}
        onClose={close}
      />
    </PageTransition>
  )
}
