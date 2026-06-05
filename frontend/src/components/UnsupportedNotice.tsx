import { ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { useStudio } from '../store/studio'

interface Props {
  /** 'gate' = 게이트 화면 톤(크고 자세히) · 'inline' = 한 줄 배너 */
  variant?: 'gate' | 'inline'
  action?: ReactNode
}

export default function UnsupportedNotice({ variant = 'inline', action }: Props) {
  const cap = useStudio((s) => s.webgpu)
  const reason = cap?.level === 'no-webgpu'
    ? '이 브라우저는 WebGPU를 지원하지 않아요'
    : cap?.level === 'no-adapter'
      ? 'WebGPU는 지원되지만 GPU 어댑터를 찾지 못했어요'
      : 'WebGPU 사용 환경이 준비되지 않았어요'

  if (variant === 'gate') {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[rgba(255,84,112,0.12)] text-[var(--color-danger)]">
          <ShieldAlert size={26} />
        </div>
        <h2 className="mt-4 text-xl font-bold">파츠 생성은 지원되지 않는 환경이에요</h2>
        <p className="mt-2 text-sm text-[var(--color-dim)]">{reason}.</p>
        <p className="mt-1 text-sm text-[var(--color-dim)]">
          <b>Chrome · Edge · Safari 18+</b> 데스크톱에서 가장 잘 동작해요.
          탐색·플레이·다른 사람 파츠로 Pawn 만들기는 그대로 가능합니다.
        </p>
        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-[rgba(255,84,112,0.25)] bg-[rgba(255,84,112,0.06)] px-3 py-2 text-sm text-[var(--color-danger)]">
      <ShieldAlert size={15} />
      <span>{reason} · 파츠 생성만 비활성</span>
      {action && <span className="ml-auto">{action}</span>}
    </div>
  )
}
