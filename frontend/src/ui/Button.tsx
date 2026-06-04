import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'subtle' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const V: Record<Variant, string> = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  subtle: 'btn-subtle',
  danger: 'btn-danger',
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: Props) {
  const s = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''
  return (
    <button className={`btn ${V[variant]} ${s} ${className}`} {...rest}>
      {children}
    </button>
  )
}
