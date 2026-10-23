import { clients } from '@/data/clients'
import { projects } from '@/data/projects'
import { projectSlug } from './slug'

/** A client site or a project, in the one shape the case-study viewer renders. */
export interface CaseItem {
  key: string
  kind: 'client' | 'project'
  name: string
  /** A wordmark that stands in for the name heading, when the brand has one drawn for a dark
   *  ground. */
  titleImage?: string
  desc: string
  quote?: string
  attr?: string
  url?: string
  repo?: string
  /** Walkthrough video first (when there is one), then screenshots. */
  media: string[]
  /** Shown in the browser-chrome URL bar around a client site. */
  domain?: string
}

const domainOf = (url?: string) => (url ? new URL(url).hostname.replace(/^www\./, '') : undefined)
const present = (xs: (string | undefined)[]) => xs.filter((x): x is string => !!x)

export const clientCases: CaseItem[] = clients.map((c) => ({
  key: projectSlug(c.name),
  kind: 'client',
  name: c.name,
  desc: c.desc,
  quote: c.quote,
  attr: c.attr,
  url: c.url,
  media: present([c.video, ...(c.screenshots ?? [])]),
  domain: domainOf(c.url),
}))

export const projectCases: CaseItem[] = projects.map((p) => {
  return {
    key: projectSlug(p.name),
    kind: 'project',
    name: p.name,
    // The viewer is dark, so only a wordmark drawn for a dark ground; otherwise the name is set.
    titleImage: p.nameLogo ?? p.logoDark,
    desc: p.desc,
    url: p.url,
    repo: p.repo,
    media: present([p.video, ...(p.screenshots ?? [])]),
    domain: domainOf(p.url),
  }
})

export const isVideo = (src: string) => src.endsWith('.webm')
