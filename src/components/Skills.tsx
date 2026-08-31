import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { skills } from '@/data/skills'
import { ChevronDown } from './icons'

export default function Skills() {
  // Closed by default — click a category to reveal it.
  const [open, setOpen] = useState<Set<string>>(() => new Set())

  const toggle = (label: string) => {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <div className="flex flex-wrap gap-x-12 gap-y-5">
      {skills.map((group) => {
        const isOpen = open.has(group.label)
        return (
          <div key={group.label} className="min-w-[170px]">
            <button
              type="button"
              onClick={() => toggle(group.label)}
              aria-expanded={isOpen}
              className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-ink-faint uppercase transition-colors hover:text-ink-dim"
            >
              {group.label}
              <ChevronDown size={12} className={`transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2.5 pt-3">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[12px] text-ink-dim"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
