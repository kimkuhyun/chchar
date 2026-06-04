import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Images, AlertTriangle, Cpu, ListChecks } from 'lucide-react'
import { useStudio } from '../../store/studio'
import StatusBadge from '../../components/StatusBadge'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import { ROLE_LABEL } from '../../types'

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

export default function Queue() {
  const navigate = useNavigate()
  const uid = useStudio((s) => s.currentUserId)
  const jobs = useStudio((s) => s.jobs).filter((j) => j.userId === uid)
  const presets = useStudio((s) => s.presets)
  const active = jobs.filter((j) => j.status !== 'done' && j.status !== 'failed').length

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        eyebrow="내 GPU에서 진행 중"
        icon={ListChecks}
        title={`생성 큐 · ${active}건`}
        actions={<Button onClick={() => navigate('/studio/generate')}><Plus size={16} /> 새 생성</Button>}
      />

      <div className="flex flex-col gap-3">
        {jobs.map((job) => {
          const preset = presets.find((p) => p.id === job.presetId)
          const pct = Math.round(job.progress * 100)
          const failed = job.status === 'failed'
          return (
            <motion.div key={job.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={job.status} />
                <span className="font-medium">{job.userPrompt}</span>
                <span className="badge badge-soft">{preset ? ROLE_LABEL[preset.role] : '—'} · {preset?.name}</span>
                <span className="text-[12px] text-[var(--color-faint)]">×{job.batchSize}</span>
                <span className="ml-auto text-[12px] text-[var(--color-faint)]">{hhmm(job.updatedAt)}</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e8eaf4]">
                  <motion.div className="h-full rounded-full" style={{ background: failed ? 'linear-gradient(90deg,#ff5470,#b15efc)' : 'var(--brand)' }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                </div>
                <span className="w-10 text-right text-[12px] font-semibold text-[var(--color-primary)]">{pct}%</span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[12px] text-[var(--color-faint)]">
                {job.comfyPromptId && <span className="flex items-center gap-1"><Cpu size={11} /> {job.comfyPromptId}</span>}
                {failed && <span className="flex items-center gap-1 text-[var(--color-danger)]"><AlertTriangle size={11} /> {job.error}</span>}
                {job.status === 'done' && (
                  <button onClick={() => navigate('/studio/assets')} className="ml-auto flex items-center gap-1 font-medium text-[var(--color-primary)]"><Images size={12} /> 갤러리에서 보기</button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
