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
  /** Real screenshots pulled from the project's GitHub repo, when available. */
  screenshots?: string[]
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
    repo: 'https://github.com/GetBirned/DartBot',
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
    repo: 'https://github.com/GetBirned/FortLotto',
  },
  {
    name: 'DartERP',
    glyph: 'DE',
    logo: '/logos/project_logos/dartERP_logo.png',
    tag: 'Desktop ERP',
    tint: 'hsl(42, 65%, 45%)',
    stack: 'C# · .NET 8 · WinForms · SQL Server',
    desc: 'A desktop manufacturing ERP built for a fictional firearms manufacturer — inventory, purchase orders, work orders, and serialized finished-goods tracking with full audit trails, built to show professional .NET application architecture end to end.',
    vidLabel: 'Demo — DartERP',
    repo: 'https://github.com/GetBirned/DartERP',
    screenshots: [
      '/screenshots/darterp/01-dashboard.webp',
      '/screenshots/darterp/02-login.webp',
      '/screenshots/darterp/03-customers.webp',
      '/screenshots/darterp/04-inventory.webp',
    ],
  },
  {
    name: 'DeadLotto',
    glyph: 'DL',
    logo: '/logos/project_logos/deadLotto_logo.png',
    tag: 'Companion App',
    tint: 'hsl(38, 65%, 45%)',
    stack: 'React · Express · Socket.IO · PostgreSQL',
    desc: "A strat-roulette companion for Valve's Deadlock — spin or draft a random hero, take on a random challenge, and see if your team can pull off the run, with real-time multiplayer lobbies, achievements, and leaderboards.",
    vidLabel: 'Demo — DeadLotto',
    repo: 'https://github.com/GetBirned/DeadLotto',
    screenshots: [
      '/screenshots/deadlotto/01-landing.webp',
      '/screenshots/deadlotto/02-lobby.webp',
      '/screenshots/deadlotto/03-game.webp',
      '/screenshots/deadlotto/04-leaderboard.webp',
    ],
  },
  {
    name: 'Die Or Die',
    glyph: 'DD',
    logo: '/logos/project_logos/dieordie.png',
    tag: 'Deck-Builder',
    tint: 'hsl(0, 65%, 45%)',
    stack: 'Godot · GDScript · Shader · UI/UX',
    desc: 'A rogue-like deck-builder featuring physics-based dice mechanics and poker-hand inspired multipliers and abilities. Build up a dice bag, roll wisely, and defeat the likes of King Chess.',
    vidLabel: 'Demo — Die Or Die',
    repo: 'https://github.com/GetBirned/Die-Or-Die',
  },
  {
    name: 'PiRail',
    glyph: 'PR',
    logo: '/logos/project_logos/pirailBlack.png',
    tag: '[ Add category ]',
    tint: 'hsl(0, 65%, 45%)',
    stack: '[ Add tech stack ]',
    desc: '[ Add a 1–2 sentence description — what problem does PiRail solve, and for who? ]',
    vidLabel: 'Demo — PiRail',
    repo: '#',
  },
]
