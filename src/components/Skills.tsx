import { skills } from '@/data/skills'

export default function Skills() {
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-6">
      {skills.map((group) => (
        <div key={group.label}>
          <div className="mb-3 font-mono text-[11px] tracking-wide text-ink-faint uppercase">{group.label}</div>
          <div className="flex flex-wrap gap-2.5">
            {group.items.map((item) => (
              <span
                key={item}
                className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[12px] text-ink-dim"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
