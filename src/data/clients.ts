export interface ClientData {
  name: string
  loc: string
  tag: string
  /** Subtle per-card accent, loosely matched to the business — not a verified brand color. */
  tint: string
  desc: string
  quote: string
  attr: string
  vidLabel: string
  logo?: string
}

export const clients: ClientData[] = [
  {
    name: 'Thresher Divers Surf Shop',
    loc: 'Alton, NH',
    tag: 'Retail / Outdoor',
    tint: 'oklch(0.62 0.13 200)',
    desc: 'Surf shop rooted in Lake Winnipesaukee, offering gear, apparel, and a lifestyle built around the water.',
    quote:
      'From the very beginning, Dartagnan demonstrated exceptional professionalism and expertise. His attention to detail and creative approach transformed my vision into a stunning reality.',
    attr: 'Thresher Divers Surf Shop — ★★★★★',
    vidLabel: 'Site walkthrough — thresherdivers.com',
    logo: '/logos/company_logos/thresherLogo.png',
  },
  {
    name: 'Account Tree',
    loc: 'Dover, NH',
    tag: 'EdTech / FinTech',
    tint: 'oklch(0.6 0.14 240)',
    desc: 'K–12 student activity fund management platform built to keep schools compliant, transparent, and audit-ready.',
    quote: '[ Add a message from Account Tree about the experience working together ]',
    attr: '[ Name ] — Account Tree',
    vidLabel: 'Product walkthrough — accounttree.com',
  },
  {
    name: 'Marble Perfect',
    loc: 'Alton, NH',
    tag: 'Home Services',
    tint: 'oklch(0.68 0.11 75)',
    desc: 'Stone restoration company specializing in polishing, repair, and maintenance of marble, granite, and other natural stone.',
    quote: '[ Add a message from Marble Perfect about the experience working together ]',
    attr: '[ Name ] — Marble Perfect',
    vidLabel: 'Site walkthrough — Marble Perfect',
  },
  {
    name: 'Evolve PT',
    loc: 'Manchester, NH + Boston, MA',
    tag: 'Healthcare',
    tint: 'oklch(0.65 0.13 155)',
    desc: 'Whole-person physical therapy practice founded by Dr. Annika Michaels, focused on evidence-based, long-term wellness care.',
    quote: '[ Add a message from Evolve PT about the experience working together ]',
    attr: 'Dr. Annika Michaels — Evolve PT',
    vidLabel: 'Site walkthrough — Evolve PT',
    logo: '/logos/company_logos/evolvePT_logo.webp',
  },
]
