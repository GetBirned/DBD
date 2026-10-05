import { clients } from '@/data/clients'
import { projects } from '@/data/projects'
import { projectSlug } from './slug'

/** A client site or a project, in the one shape the case-study viewer renders. */
export interface CaseItem {
  key: string
  kind: 'client' | 'project'
  name: string
  /** Small square mark, shown in a white disc. */
  logo?: string
  /** A wordmark that stands in for the name heading, when the brand has one that reads on dark. */
  titleImage?: string
  /** The title image is dark artwork made for a light card — invert it to read on the viewer. */
  titleInvert?: boolean
  /** Location for a client, tech stack for a project. */
  meta: string
  tag: string
  desc: string
  quote?: string
  attr?: string
  url?: string
  repo?: string
  /** Walkthrough video first (when there is one), then screenshots. */
  media: string[]
  tint: string
  /** Shown in the browser-chrome URL bar around a client site. */
  domain?: string
}

const domainOf = (url?: string) => (url ? new URL(url).hostname.replace(/^www\./, '') : undefined)
const present = (xs: (string | undefined)[]) => xs.filter((x): x is string => !!x)

export const clientCases: CaseItem[] = clients.map((c) => ({
  key: projectSlug(c.name),
  kind: 'client',
  name: c.name,
  logo: c.logo,
  meta: c.loc,
  tag: c.tag,
  desc: c.desc,
  quote: c.quote,
  attr: c.attr,
  url: c.url,
  media: present([c.video, ...(c.screenshots ?? [])]),
  tint: c.tint,
  domain: domainOf(c.url),
}))

export const projectCases: CaseItem[] = projects.map((p) => {
  // On the dark viewer: the wordmark if there is one (they're all drawn for dark cards), else the
  // light logo variant, else the standard logo inverted.
  const titleImage = p.nameLogo ?? p.logoDark ?? p.logo
  return {
    key: projectSlug(p.name),
    kind: 'project',
    name: p.name,
    titleImage,
    titleInvert: !p.nameLogo && !p.logoDark,
    meta: p.stack,
    tag: p.tag,
    desc: p.desc,
    url: p.url,
    repo: p.repo,
    media: present([p.video, ...(p.screenshots ?? [])]),
    tint: p.tint,
    domain: domainOf(p.url),
  }
})

export const isVideo = (src: string) => src.endsWith('.webm')
