export default function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="mb-6 font-mono text-[13px] tracking-[0.14em] text-ink-dim uppercase">
      <b className="font-semibold text-ink">{title}</b>
      {detail && <> · {detail}</>}
    </div>
  )
}
