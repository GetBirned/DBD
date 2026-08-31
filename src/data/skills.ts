export interface SkillGroup {
  label: string
  items: string[]
}

/**
 * Compiled from what's actually shown across the site — this project's own stack,
 * and the tech listed on each Fun-page project. Review and edit freely; this is a
 * starting draft, not a verified-complete list of everything you know.
 */
export const skills: SkillGroup[] = [
  { label: 'Languages', items: ['JavaScript', 'TypeScript', 'Java', 'C', 'C#', 'GDScript'] },
  { label: 'Frontend', items: ['React', 'Tailwind CSS', 'Framer Motion', 'HTML5 / CSS3'] },
  { label: 'Backend', items: ['Node.js', 'Express', 'REST APIs', 'OAuth 2.0'] },
  { label: 'Tools & Platforms', items: ['Git', 'GitHub', 'Vite', 'Railway', 'Godot', 'Dialogflow'] },
]
