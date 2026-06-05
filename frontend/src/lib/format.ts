export const fmtBytes = (b: number) => {
  if (b >= 1_000_000_000) return `${(b / 1_000_000_000).toFixed(1)}GB`
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(0)}MB`
  if (b >= 1_000) return `${(b / 1_000).toFixed(0)}KB`
  return `${b}B`
}

export const fmtCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return `${n}`
}

export const fmtTimeAgo = (iso: string) => {
  const t = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - t)
  const m = Math.floor(diff / 60_000)
  if (m < 1) return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}일 전`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}달 전`
  return `${Math.floor(mo / 12)}년 전`
}
