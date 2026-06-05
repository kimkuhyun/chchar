interface Props {
  value: string
  onChange: (v: string) => void
  label?: string
  presets?: string[]
}

const DEFAULTS = ['#c8a07a', '#e9c1a0', '#f4d3b8', '#6d5efc', '#15c2e8', '#15bd8e', '#ff5470', '#f59e2e', '#1b2140', '#fff']

export default function ColorSwatch({ value, onChange, label, presets = DEFAULTS }: Props) {
  return (
    <div>
      {label && <div className="label">{label}</div>}
      <div className="flex items-center gap-1.5">
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            title={c}
            className={`h-7 w-7 rounded-full border-2 transition ${value.toLowerCase() === c.toLowerCase() ? 'border-[var(--color-primary)] scale-110' : 'border-white shadow-sm'}`}
            style={{ background: c }}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ml-1 h-7 w-9 cursor-pointer rounded-md border border-[var(--color-line2)] bg-white"
          aria-label="사용자 색"
        />
      </div>
    </div>
  )
}
