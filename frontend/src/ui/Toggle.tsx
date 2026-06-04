export default function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`toggle ${checked ? 'on' : ''}`}
      aria-pressed={checked}
    />
  )
}
