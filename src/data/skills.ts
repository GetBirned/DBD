export interface SkillGroup {
  label: string
  items: string[]
}

/**
 * Matches the résumé's Technical Skills section, plus the tools behind the projects on this site
 * (Godot, Socket.IO, Tailwind, Framer Motion…). Keep the two in sync.
 */
export const skills: SkillGroup[] = [
  {
    label: 'Languages',
    items: ['C#', 'Python', 'Java', 'C', 'SQL', 'JavaScript', 'TypeScript', 'HTML5 / CSS', 'PHP', 'GDScript'],
  },
  {
    label: 'Platforms & Data',
    items: [
      '.NET 8',
      '.NET Framework',
      'SQL Server',
      'SSRS',
      'IIS',
      'REST APIs',
      'Node.js',
      'Express',
      'React',
      'PostgreSQL',
      'MongoDB',
      'Socket.IO',
    ],
  },
  {
    label: 'Tools',
    items: [
      'Git',
      'GitHub',
      'Visual Studio',
      'SSMS',
      'JIRA',
      'Salesforce',
      'Vite',
      'Tailwind CSS',
      'Framer Motion',
      'Godot',
      'Railway',
      'Dialogflow',
    ],
  },
  {
    label: 'Systems & Practice',
    items: [
      'Agile / Scrum',
      'Defect lifecycle',
      'Root-cause analysis',
      'Requirements (BRDs)',
      'AEMP 2.0 · ISO 15143-3',
      'GPS · IMU · LIDAR',
      'Raspberry Pi',
      'OpenStreetMap / GIS',
      'OAuth 2.0',
    ],
  },
]
