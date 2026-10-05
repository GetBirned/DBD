import type { ReactNode } from 'react'

/**
 * A browser window around anything that lives on the web, so a client site reads at a glance as
 * "a website I built". Desktop apps and games get a plain frame instead of pretend browser chrome.
 */
export default function MediaFrame({ chrome, domain, children }: { chrome: boolean; domain?: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#17151f] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
      {chrome && (
        <div className="flex h-9 items-center gap-3 border-b border-white/[0.07] px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          {domain && (
            <div className="mx-auto truncate rounded-md bg-white/[0.06] px-3 py-0.5 font-mono text-[11px] text-white/55">
              {domain}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
