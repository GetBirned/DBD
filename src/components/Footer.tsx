export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-[1120px]">
        <div className="font-mono text-xs tracking-widest text-ink-faint uppercase">Let's Chat</div>
        <h2 className="mt-3.5 max-w-[520px] text-[44px] leading-[1.1]">Let's build something.</h2>
        <div className="mt-7 flex gap-3.5">
          <a
            href="mailto:hello@dartbirnie.dev"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-grad-a to-grad-b px-5.5 py-3 font-mono text-[11px] tracking-wide text-white uppercase shadow-[0_8px_26px_-8px_oklch(0.5_0.17_290_/_0.5)] transition-transform hover:-translate-y-0.5"
          >
            Send Email
          </a>
          <a
            href="tel:"
            className="inline-flex items-center gap-2 rounded-full border border-line px-5.5 py-3 font-mono text-[11px] tracking-wide text-ink-dim uppercase transition-colors hover:border-grad-b hover:text-ink"
          >
            Call Me
          </a>
        </div>
        <div className="mt-14 border-t border-line pt-7 font-mono text-xs tracking-wide text-ink-faint">
          © Dartagnan Birnie — Alton, NH
        </div>
      </div>
    </footer>
  )
}
