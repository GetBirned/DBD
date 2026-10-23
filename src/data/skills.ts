export interface SkillGroup {
  label: string
  items: string[]
}

/**
 * Everything from the résumé's Technical Skills section, plus the tools behind the projects on
 * this site (Godot, Socket.IO, Tailwind, Framer Motion…), sorted by what they're for. Keep the
 * items in sync with the résumé.
 */
export const skills: SkillGroup[] = [
  {
    label: 'Languages',
    items: ['C#', 'Python', 'Java', 'C', 'SQL', 'JavaScript', 'TypeScript', 'PHP', 'GDScript'],
  },
  {
    label: 'Frontend',
    items: ['React', 'HTML5 / CSS', 'Tailwind CSS', 'Framer Motion', 'Vite'],
  },
  {
    label: 'Backend',
    items: ['.NET 8', '.NET Framework', 'Node.js', 'Express', 'Socket.IO', 'IIS'],
  },
  {
    label: 'Databases',
    items: ['SQL Server', 'SSRS', 'SSMS', 'PostgreSQL', 'MongoDB'],
  },
  {
    label: 'Integrations & APIs',
    items: ['REST APIs', 'AEMP 2.0 · ISO 15143-3', 'OAuth 2.0', 'Salesforce', 'Dialogflow', 'OpenStreetMap / GIS'],
  },
  {
    label: 'Tools & Practice',
    items: [
      'Git',
      'GitHub',
      'Visual Studio',
      'JIRA',
      'Railway',
      'Godot',
      'Raspberry Pi',
      'GPS · IMU · LIDAR',
      'Agile / Scrum',
      'Defect lifecycle',
      'Root-cause analysis',
      'Requirements (BRDs)',
    ],
  },
]
