import type { ReactNode } from 'react'

export default function Badge({
  children,
  color,
  className = '',
}: {
  children: ReactNode
  color?: string
  className?: string
}) {
  if (color) {
    return (
      <span
        className={`badge ${className}`}
        style={{ color, background: `${color}1a`, border: `1px solid ${color}33` }}
      >
        {children}
      </span>
    )
  }
  return <span className={`badge badge-soft ${className}`}>{children}</span>
}
