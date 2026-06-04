export default function Avatar({
  name,
  src,
  size = 36,
}: {
  name: string
  src?: string | null
  size?: number
}) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? '?'
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="brand-bg grid place-items-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      title={name}
    >
      {initial}
    </div>
  )
}
