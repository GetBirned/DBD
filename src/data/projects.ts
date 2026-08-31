export interface ProjectData {
  name: string
  /** Short initials shown on the Home page's small interactive icon tiles when there's no logo. */
  glyph: string
  /** Real logo image, when available — takes priority over the glyph. */
  logo?: string
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
    logo: '/logos/project_logos/FortLottoBlack.png',
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
    logo: '/logos/project_logos/dartERP_logo.png',
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
    logo: '/logos/project_logos/deadLotto_logo.png',
    tag: '[ Add category ]',
    tint: 'oklch(0.5 0.18 25)',
    stack: '[ Add tech stack ]',
    desc: '[ Add a 1–2 sentence description — what problem does DeadLotto solve, and for who? ]',
    vidLabel: 'Demo — DeadLotto',
    repo: '#',
  },
  {
    name: 'Die Or Die',
    glyph: 'DD',
    logo: '/logos/project_logos/dieordie.png',
    tag: 'Deck-Builder',
    tint: 'oklch(0.55 0.2 20)',
    stack: 'Godot · GDScript · Shader · UI/UX',
    desc: 'A rogue-like deck-builder featuring physics-based dice mechanics and poker-hand inspired multipliers and abilities. Build up a dice bag, roll wisely, and defeat the likes of King Chess.',
    vidLabel: 'Demo — Die Or Die',
    repo: '#',
  },
  {
    name: 'PiRail',
    glyph: 'PR',
    logo: '/logos/project_logos/pirailBlack.png',
    tag: '[ Add category ]',
    tint: 'oklch(0.6 0.16 165)',
    stack: '[ Add tech stack ]',
    desc: '[ Add a 1–2 sentence description — what problem does PiRail solve, and for who? ]',
    vidLabel: 'Demo — PiRail',
    repo: '#',
  },
]
