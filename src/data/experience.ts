export interface Referral {
  quote: string
  name?: string
}

export interface ExperienceEntry {
  company: string
  logo?: string
  /** A light-colored variant of `logo`, used instead when `cardDark` is set. */
  logoDark?: string
  role: string
  location: string
  dateRange: string
  desc: string
  /** A short callout for a specific honor/award — rendered as a small badge. */
  badge?: string
  /** Accent for the card's gradient border and corner glow. */
  tint: string
  /** Overrides the card's panel fill (default: the standard translucent panel). */
  cardBg?: string
  /** Switches the card's text/border colors to their light-on-dark equivalents. */
  cardDark?: boolean
  /** A looping muted video behind the entire card, under a dark scrim. */
  cardBgVideo?: string
  /** A static image behind the entire card, under a dark scrim — the still-image
   * equivalent of `cardBgVideo`. */
  cardBgImage?: string
  /** Scrim darkness (0-100) over `cardBgVideo`/`cardBgImage`, default 60. */
  cardScrim?: number
  /** Extra background-image layer(s) painted over `cardBg`. */
  cardTexture?: string
  /** Coworker shoutouts — when present, rendered as a cycling carousel. */
  referrals?: Referral[]
}

const TRIMBLE_BLUE = 'oklch(0.486 0.128 247)'
const TRIMBLE_BLUE_CARD = 'oklch(0.486 0.128 247 / 0.96)'

export const experience: ExperienceEntry[] = [
  {
    company: 'Trimble Inc.',
    logo: '/logos/company_logos/trimble.png',
    logoDark: '/logos/company_logos/trimbleWhite.png',
    role: 'Software Implementation Consultant',
    location: 'Portsmouth, NH · Hybrid',
    dateRange: 'May 2026 – Present',
    desc: "Leading end-to-end B2W Estimate implementations — discovery through deployment, database population, training, and customer adoption — with integrations for telematics providers (John Deere, Komatsu, Samsara) on the AEMP2 standard. Also lead the licensing department as the primary escalation point for B2W activation and provisioning across the product suite.",
    tint: TRIMBLE_BLUE,
    cardBg: TRIMBLE_BLUE_CARD,
    cardDark: true,
    referrals: [
      {
        quote:
          'Rarely have I worked with someone here at B2W who was so locked in during their onboarding. You gave everything you had to the time I could spend with you, and I am so glad to see you already thriving in your role!',
        name: 'MC Connor',
      },
      {
        quote:
          "Congrats on your promotion to the implementation team, you're going to do great. Thank you for all your hard work and assistance while you were on the support team. You were a huge help to my team! Looking forward to seeing you crush it on the onboarding side of the house.",
      },
    ],
  },
  {
    company: 'Trimble Inc.',
    logo: '/logos/company_logos/trimble.png',
    logoDark: '/logos/company_logos/trimbleWhite.png',
    role: 'Technical Support Engineer',
    location: 'Portsmouth, NH · Hybrid',
    dateRange: 'Sept. 2025 – May 2026',
    desc: "Resolved 1,400+ support cases in my first six months — L1/L2 technical resolution across the entire B2W software suite (Estimate, Track, Maintain, Schedule) for heavy civil construction clients, covering SQL, C#, bug discovery, and database management through the full ticket lifecycle in Salesforce. Promoted to Implementation Consultant within six months.",
    tint: TRIMBLE_BLUE,
    cardBg: TRIMBLE_BLUE_CARD,
    cardDark: true,
    referrals: [
      {
        quote:
          'A LONG overdue thank you for stellar service, in whatever role you are in Dart. Thank you specifically for doing your part to help on support cases as we continue to rebuild that group.',
        name: 'Jared Carlson',
      },
      {
        quote: 'Thank you for all of your hard work and dedication to our customers!',
        name: 'Kevin Gray',
      },
      {
        quote: 'Thank you for your amazing work, help and support. You are best at what you do and always appreciate the hard work you do :)',
        name: 'Kajalben Patel',
      },
      {
        quote: 'Dartagnan is a rockstar! He goes above and beyond for our customers and our internal team. Thank you for being a great teammate!',
        name: 'Jonathan DiTroia',
      },
      {
        quote: 'Dartagnan, thank you for your dedication to our customers, and quick turnaround when they need licenses provisioned. I sincerely appreciate it!',
        name: 'Aaron Whittet',
      },
      {
        quote: "Thanks for always putting in the work and effort against all overwhelming odds of workflow. I'll always appreciate working alongside you.",
        name: 'Phillip Luong',
      },
      {
        quote: 'Thank you for working so hard during this troublesome time.',
        name: 'Shawn Clifford',
      },
      {
        quote:
          'I am having a difficult time finding words to express how incredibly awesome you are, sir. It was a privilege watching and listening to you handle that call.',
      },
      {
        quote: 'Dart — thank you for helping take care of all of our customers and everything that you do on a daily basis.',
      },
      {
        quote: 'You are always providing awesome support!!! Thank you!',
      },
      {
        quote: 'Thank you so much for all of the help you provide to my customers!',
      },
      {
        quote: 'Thank you for stepping up and being willing to learn B2W Integration support!',
      },
      {
        quote: 'You have been A BRIGHT LIGHT in the rebuild time and you jumping in to help us streamline processes.',
      },
    ],
  },
  {
    company: 'Account Tree',
    logo: '/logos/company_logos/accountTreeLogo.webp',
    logoDark: '/logos/company_logos/accountTreeLogoWhite.webp',
    role: 'Software Development & Marketing Intern',
    location: 'Dover, NH',
    dateRange: 'May 2024 – Aug. 2024',
    desc: "Paid student internship through UNH's Peter T. Paul Entrepreneurship Center — developed software features and debugged PHP/JavaScript issues using Agile methodology, and rebranded the company with a same-day website rebuild for a K–12 student activity fund platform.",
    badge: 'Featured Intern — 2024 Paid Student Internship at Start-Ups Program',
    // Their own purple/indigo, matching the badge/border to the card fill.
    tint: 'oklch(0.55 0.16 277)',
    cardBg: 'oklch(0.2 0.09 277 / 0.96)',
    cardDark: true,
    referrals: [
      {
        quote:
          "I can't say enough good things about Dart, but this might say it all — we are going to do everything we can to get him to work with us when he graduates this spring.",
        name: 'Tom Rossi, Co-Founder',
      },
      {
        quote:
          "Dart's contributions to our company have been nothing short of exceptional. His keen analytical mind, coupled with a practical approach to problem-solving, has been instrumental in driving our projects forward. Dart is a true asset to our team.",
        name: 'Kevin Rossi, Co-Founder',
      },
      {
        quote:
          'Most mornings, he\'ll ask if there\'s anything specific I want him to do. Sometimes, I\'ll say, "No — go to the Ideas page and find something that interests you." On one of those mornings, he designed a new website, which you can view at accounttree.com.',
        name: 'Tom Rossi, Co-Founder',
      },
      {
        quote:
          "Dart's ability to balance structured tasks with independent exploration was remarkable. Time and again, we were astounded by the innovative solutions and strategic insights he brought to the table.",
        name: 'Kevin Rossi, Co-Founder',
      },
    ],
  },
]
