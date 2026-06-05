import { Cpu } from 'lucide-react'
import { useStudio } from '../store/studio'

export default function VramHud() {
  const cap = useStudio((s) => s.webgpu)
  if (!cap || cap.level !== 'ok') return null
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] bg-white px-2 py-1 text-[11px] text-[var(--color-dim)]">
      <Cpu size={12} className="text-[var(--color-primary)]" />
      <span className="font-medium">WebGPU</span>
      <span className="text-[var(--color-faint)]">·</span>
      <span>VRAM ≈ {cap.vramGuessGb}GB</span>
    </div>
  )
}
