export interface CreditName {
  text: string
  href?: string
}

/**
 * One title card, set like the credits in Alien (1979): a lowercase role, then the names stacked
 * beside it — "produced by | Gordon Carroll / David Giler / and / Walter Hill" — the whole block
 * centered on the screen. With no role it's just the name, like the film's cast cards. On phones
 * the role sits above the names. `note` is a small line of detail underneath.
 */
export default function Credit({ role, names, note }: { role?: string; names: (string | CreditName)[]; note?: string }) {
  return (
    <div className="credit text-center text-[clamp(20px,2.6vw,46px)] leading-[1.18]">
      <div className={`grid justify-center gap-y-1 ${role ? 'sm:grid-cols-[auto_auto] sm:gap-x-[0.34em]' : ''}`}>
        {role && <div className="text-ink/75 sm:text-right">{role}</div>}
        <div className={role ? 'sm:text-left' : ''}>
          {names.map((n, i) => {
            const name = typeof n === 'string' ? { text: n } : n
            return (
              <div key={i}>
                {name.href ? (
                  <a
                    href={name.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-ink/25 decoration-1 underline-offset-[0.18em] transition-colors hover:text-accent hover:decoration-accent"
                  >
                    {name.text}
                  </a>
                ) : (
                  name.text
                )}
              </div>
            )
          })}
        </div>
      </div>
      {note && <div className="mt-4 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase [text-shadow:none] sm:text-[11px]">{note}</div>}
    </div>
  )
}
