export interface ProjectData {
  name: string
  /** Short initials shown on the Home page's small interactive icon tiles. */
  glyph: string
  tag: string
  /** Subtle per-card accent color. */
  tint: string
  stack: string
  desc: string
  vidLabel: string
  repo: string
}

export const projects: ProjectData[] = [
  {
    name: 'DartBot',
    glyph: 'DB',
    tag: 'Chatbot',
    tint: 'oklch(0.6 0.18 320)',
    stack: 'React · Node.js · Dialogflow · TypeScript',
    desc: 'A humorous, personality-rich chatbot built to mimic my tone — a quick way for visitors to get a feel for me and my hobbies before they ever get on a call.',
    vidLabel: 'Demo video — DartBot in conversation',
    repo: '#',
  },
  {
    name: 'FortLotto',
    glyph: 'FL',
    tag: 'Web Game',
    tint: 'oklch(0.58 0.19 275)',
    stack: 'HTML5 · CSS3 · JavaScript · LocalStorage',
    desc: 'A strat-roulette companion for Fortnite squads — randomized drop locations, unique challenges, and session-long win/loss tracking.',
    vidLabel: 'Demo — FortLotto',
    repo: '#',
  },
  {
    name: 'DartERP',
    glyph: 'DE',
    tag: '[ Add category ]',
    tint: 'oklch(0.56 0.15 250)',
    stack: '[ Add tech stack ]',
    desc: '[ Add a 1–2 sentence description — what problem does DartERP solve, and for who? ]',
    vidLabel: 'Demo — DartERP',
    repo: '#',
  },
  {
    name: 'DeadLotto',
    glyph: 'DL',
    tag: '[ Add category ]',
    tint: 'oklch(0.5 0.18 25)',
    stack: '[ Add tech stack ]',
    desc: '[ Add a 1–2 sentence description — what problem does DeadLotto solve, and for who? ]',
    vidLabel: 'Demo — DeadLotto',
    repo: '#',
  },
]
