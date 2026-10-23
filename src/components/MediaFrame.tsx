import type { ReactNode } from 'react'

/**
 * A browser window around anything that lives on the web, so a client site reads at a glance as
 * "a website I built" — drawn as thin hairlines in the page's own palette rather than as a glossy
 * Mac window.
 * Desktop apps and games get a plain frame instead of pretend browser chrome.
 */
export default function MediaFrame({ chrome, domain, children }: { chrome: boolean; domain?: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden border border-line bg-bg-soft">
      {chrome && (
        <div className="flex h-8 items-center gap-3 border-b border-line px-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-full border border-ink/35" />
            ))}
          </div>
          {domain && <div className="mx-auto truncate font-mono text-[11px] tracking-[0.04em] text-ink-faint">{domain}</div>}
          <div className="w-[42px]" />
        </div>
      )}
      {children}
    </div>
  )
}
