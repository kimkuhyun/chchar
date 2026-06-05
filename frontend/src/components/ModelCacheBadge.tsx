import { CheckCircle2, Download } from 'lucide-react'
import type { WorkflowWeight } from '../types'
import { isAllCached } from '../lib/modelCache'
import { fmtBytes } from '../lib/format'

export default function ModelCacheBadge({ weights }: { weights: WorkflowWeight[] }) {
  const cached = isAllCached(weights)
  const total = weights.reduce((a, b) => a + b.bytes, 0)
  if (cached) {
    return (
      <span className="badge" style={{ color: 'var(--color-success)', background: 'rgba(21,189,142,0.1)', border: '1px solid rgba(21,189,142,0.25)' }}>
        <CheckCircle2 size={11} /> 캐시됨 · {fmtBytes(total)}
      </span>
    )
  }
  return (
    <span className="badge" style={{ color: 'var(--color-warn)', background: 'rgba(245,158,46,0.1)', border: '1px solid rgba(245,158,46,0.25)' }}>
      <Download size={11} /> 다운로드 필요 · {fmtBytes(total)}
    </span>
  )
}
