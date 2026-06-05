import { Navigate } from 'react-router-dom'
import { useStudio } from '../../store/studio'
import WebGpuGate from '../../components/WebGpuGate'

/** 단독 진입용 — 모델 다운로드만 보여주고, 끝나면 대시보드로 보냄 */
export default function Onboarding() {
  const ready = useStudio((s) => s.modelsReady)
  if (ready) return <Navigate to="/studio" replace />
  return (
    <div className="p-6">
      <WebGpuGate>
        <div className="text-sm text-[var(--color-dim)]">준비 완료. 대시보드로 이동합니다…</div>
      </WebGpuGate>
    </div>
  )
}
