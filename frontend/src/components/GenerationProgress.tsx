import { Loader2, X, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import type { GenerationState } from '../types'
import { STAGE_LABEL } from '../types'

interface Props {
  open: boolean
  state: GenerationState
  onClose: () => void
  onCancel: () => void
  onRetry?: () => void
  onUse?: () => void
}

export default function GenerationProgress({ open, state, onClose, onCancel, onRetry, onUse }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, state.progress)) * 100)
  const isError = state.stage === 'error' || state.stage === 'oom'
  const isDone = state.stage === 'done'

  return (
    <Modal open={open} onClose={isDone || isError ? onClose : () => {}} title="파츠 생성" width={520}>
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface2)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {isDone ? <CheckCircle2 size={16} className="text-[var(--color-success)]" />
              : isError ? <AlertCircle size={16} className="text-[var(--color-danger)]" />
              : <Loader2 size={16} className="spin text-[var(--color-primary)]" />}
            <span>{STAGE_LABEL[state.stage]}</span>
            {state.stage === 'sampling' && state.totalSteps && (
              <span className="text-[var(--color-dim)]">· {state.step}/{state.totalSteps} step</span>
            )}
            <span className="ml-auto text-xs text-[var(--color-faint)]">{pct}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full transition-all"
              style={{ width: `${pct}%`, background: isError ? 'var(--color-danger)' : 'var(--brand)' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid place-items-center rounded-xl border border-[var(--color-line)] bg-white p-4">
            {state.preview
              ? <img src={state.preview} alt="preview" className="h-32 w-32" />
              : <div className="grid h-32 w-32 place-items-center text-xs text-[var(--color-faint)]">미리보기 준비중</div>}
          </div>
          <div className="space-y-1 text-sm text-[var(--color-dim)]">
            <div className="flex items-center justify-between">
              <span>모델 로딩</span>
              <DotState active={state.stage === 'loading-model'} done={passed(state.stage, 'loading-model')} />
            </div>
            <div className="flex items-center justify-between">
              <span>워밍업</span>
              <DotState active={state.stage === 'warmup'} done={passed(state.stage, 'warmup')} />
            </div>
            <div className="flex items-center justify-between">
              <span>샘플링</span>
              <DotState active={state.stage === 'sampling'} done={passed(state.stage, 'sampling')} />
            </div>
            <div className="flex items-center justify-between">
              <span>VAE 디코드</span>
              <DotState active={state.stage === 'vae'} done={passed(state.stage, 'vae')} />
            </div>
            <div className="flex items-center justify-between">
              <span>배경 제거</span>
              <DotState active={state.stage === 'rmbg'} done={passed(state.stage, 'rmbg')} />
            </div>
          </div>
        </div>

        {state.error && (
          <div className="rounded-xl border border-[rgba(255,84,112,0.2)] bg-[rgba(255,84,112,0.06)] p-3 text-xs text-[var(--color-danger)]">
            {state.error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          {!isDone && !isError && (
            <Button variant="ghost" onClick={onCancel}><X size={15} /> 취소</Button>
          )}
          {isError && onRetry && (
            <Button variant="ghost" onClick={onRetry}><RotateCcw size={15} /> 다시 시도</Button>
          )}
          {(isDone || isError) && (
            <Button variant="ghost" onClick={onClose}>닫기</Button>
          )}
          {isDone && onUse && (
            <Button onClick={onUse}>슬라이서로</Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

const ORDER = ['loading-model', 'warmup', 'sampling', 'vae', 'rmbg', 'done'] as const
function passed(cur: GenerationState['stage'], step: string) {
  const i = ORDER.indexOf(cur as typeof ORDER[number])
  const j = ORDER.indexOf(step as typeof ORDER[number])
  return i >= 0 && j >= 0 && i > j
}

function DotState({ active, done }: { active: boolean; done: boolean }) {
  if (done) return <CheckCircle2 size={14} className="text-[var(--color-success)]" />
  if (active) return <Loader2 size={13} className="spin text-[var(--color-primary)]" />
  return <span className="dot dot-off" />
}
