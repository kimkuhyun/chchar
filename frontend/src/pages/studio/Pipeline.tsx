import { useMemo } from 'react'
import ReactFlow, { Background, Controls, Handle, Position, type Node, type Edge, type NodeProps } from 'reactflow'
import 'reactflow/dist/style.css'
import { MessageSquare, BrainCircuit, Cpu, Eraser, Grid2x2, Tags, Database, Workflow } from 'lucide-react'
import { useStudio } from '../../store/studio'
import type { JobStatus } from '../../types'

type StageData = { label: string; sub: string; icon: typeof Cpu; color: string; active: boolean }

function StageNode({ data }: NodeProps<StageData>) {
  const { label, sub, icon: Icon, color, active } = data
  return (
    <div className="card w-48 px-4 py-3" style={{ borderColor: active ? color : undefined, boxShadow: active ? `0 0 0 3px ${color}33` : undefined }}>
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${color}18`, color }}><Icon size={16} /></div>
        <div className="min-w-0"><div className="truncate text-sm font-semibold">{label}</div><div className="truncate text-[11px] text-[var(--color-faint)]">{sub}</div></div>
      </div>
      {active && <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold" style={{ color }}><span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: color }} /> 진행 중</div>}
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </div>
  )
}

const STAGES: { id: string; label: string; sub: string; icon: typeof Cpu; color: string; status?: JobStatus }[] = [
  { id: 'prompt', label: '프롬프트', sub: 'user_prompt', icon: MessageSquare, color: '#9aa0bd', status: 'queued' },
  { id: 'expand', label: 'expand_concept', sub: 'Ollama qwen3.5:9b', icon: BrainCircuit, color: '#8a7bff', status: 'expanding' },
  { id: 'generate', label: 'generate', sub: 'ComfyUI · SDXL + pixel-art-xl', icon: Cpu, color: '#6d5efc', status: 'generating' },
  { id: 'bg', label: 'bg_removal', sub: 'rembg', icon: Eraser, color: '#15c2e8', status: 'postprocessing' },
  { id: 'normalize', label: 'normalize', sub: 'Pillow NEAREST', icon: Grid2x2, color: '#15c2e8' },
  { id: 'tag', label: 'auto_tag', sub: '태그 추출', icon: Tags, color: '#b15efc', status: 'tagging' },
  { id: 'persist', label: 'persist', sub: '스토리지 + asset', icon: Database, color: '#15bd8e', status: 'done' },
]

export default function Pipeline() {
  const jobs = useStudio((s) => s.jobs)
  const nodeTypes = useMemo(() => ({ stage: StageNode }), [])
  const activeStatus = jobs.find((j) => ['expanding', 'generating', 'postprocessing', 'tagging'].includes(j.status))?.status

  const nodes: Node<StageData>[] = useMemo(
    () => STAGES.map((s, i) => ({ id: s.id, type: 'stage', position: { x: i * 240, y: 110 + (i % 2) * 70 }, data: { label: s.label, sub: s.sub, icon: s.icon, color: s.color, active: !!s.status && s.status === activeStatus } })),
    [activeStatus],
  )
  const edges: Edge[] = useMemo(() => STAGES.slice(0, -1).map((s, i) => ({ id: `${s.id}-${STAGES[i + 1].id}`, source: s.id, target: STAGES[i + 1].id, animated: true, style: { stroke: '#c7cbe0' } })), [])

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b border-[var(--color-line)] bg-white/85 px-6 py-4 backdrop-blur">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]"><Workflow size={16} /> LangGraph 파이프라인</div>
        <h1 className="text-2xl font-bold">생성 오케스트레이션</h1>
        <p className="mt-1 text-sm text-[var(--color-dim)]">내 GPU에서 노드 순차 실행. 진행 중 잡이 있으면 해당 단계가 점등됩니다.</p>
      </div>
      <div className="min-h-0 flex-1">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }} nodesDraggable={false} nodesConnectable={false}>
          <Background color="#d8dbeb" gap={28} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  )
}
