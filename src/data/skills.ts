export interface SkillGroup {
  label: string
  /** One or more lists, each with an optional small heading. */
  sections: { label?: string; items: string[] }[]
}

/**
 * Everything from the résumé's Technical Skills section, plus the tools behind the projects on
 * this site (Godot, Socket.IO, Tailwind, Framer Motion…), in the four groups the skills card
 * names. Keep the items in sync with the résumé.
 */
export const skills: SkillGroup[] = [
  {
    label: 'Languages',
    sections: [{ items: ['C#', 'Python', 'Java', 'C', 'SQL', 'JavaScript', 'TypeScript', 'PHP', 'GDScript', 'HTML5 / CSS'] }],
  },
  {
    label: 'Integrations',
    sections: [
      {
        items: ['REST APIs', 'AEMP 2.0 · ISO 15143-3', 'OAuth 2.0', 'Salesforce', 'Dialogflow', 'Socket.IO', 'OpenStreetMap / GIS', 'GPS · IMU · LIDAR'],
      },
    ],
  },
  {
    label: 'Tools',
    sections: [
      { label: 'frameworks', items: ['React', '.NET 8', '.NET Framework', 'Node.js', 'Express', 'Tailwind CSS', 'Framer Motion', 'Vite'] },
      { label: 'platforms', items: ['IIS', 'Railway', 'Raspberry Pi', 'Godot'] },
      { label: 'software', items: ['Git', 'GitHub', 'Visual Studio', 'JIRA'] },
      { label: 'practice', items: ['Agile / Scrum', 'Defect lifecycle', 'Root-cause analysis', 'Requirements (BRDs)'] },
    ],
  },
  {
    label: 'Databases',
    sections: [{ items: ['SQL Server', 'SSRS', 'SSMS', 'PostgreSQL', 'MongoDB'] }],
  },
]
