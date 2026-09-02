/**
 * Credential badge shown alongside the platform logos: the SBDC mark carries the issuing
 * body, so the text only has to say what the designation actually is.
 */
export default function SbdcBadge() {
  return (
    <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-line bg-panel px-5 py-3.5 backdrop-blur-lg">
      <img
        src="/logos/sbdc.svg"
        alt="America's SBDC New Hampshire"
        loading="lazy"
        decoding="async"
        className="h-13 w-auto shrink-0"
      />
      <div className="border-l border-line pl-4">
        <div className="font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
          Approved Contractor
        </div>
        <div className="mt-1 font-body text-sm font-semibold text-ink">Web Design</div>
      </div>
    </div>
  )
}
