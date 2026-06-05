import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Blocks, Save, Play, Plus, Trash2, RotateCw } from 'lucide-react'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import SceneStage from '../../components/SceneStage'
import { useStudio } from '../../store/studio'
import type { Placement, Scene, Direction } from '../../types'
import { SCENE_GENRE_LABEL, PART_CATEGORY, DIRECTION_LABEL } from '../../types'

const DIRS: Direction[] = ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW']

export default function SceneBuilder() {
  const navigate = useNavigate()
  const { id: idStr } = useParams()
  const editingId = idStr ? Number(idStr) : null
  const user = useStudio((s) => s.currentUser)!
  const existing = useStudio((s) => s.scenes.find((x) => x.id === editingId))
  const parts = useStudio((s) => s.parts)
  const pawns = useStudio((s) => s.pawns)
  const saveScene = useStudio((s) => s.saveScene)

  const initial: Scene = useMemo(() => existing ?? {
    id: 0, ownerId: user.id, ownerName: user.displayName,
    name: '새 씬', description: '',
    genre: 'topdown_rpg',
    config: { bgColor: '#f5f6fb', canvasW: 512, canvasH: 384 },
    placements: [],
    isPublic: false, thumbnailUrl: null,
    playCount: 0, likeCount: 0, createdAt: new Date().toISOString(),
  }, [existing, user])

  const [scene, setScene] = useState<Scene>(initial)
  const [tab, setTab] = useState<'pawn' | 'tile' | 'prop'>('tile')
  const [selected, setSelected] = useState<string | null>(null)

  const tileParts = parts.filter((p) => PART_CATEGORY.world.includes(p.kind) && p.kind === 'tile' && (p.isPublic || p.ownerId === user.id || p.ownerId === null))
  const propParts = parts.filter((p) => p.kind === 'prop' && (p.isPublic || p.ownerId === user.id || p.ownerId === null))
  const pawnList = pawns.filter((p) => p.ownerId === user.id || p.isPublic)

  let pseq = useMemo(() => scene.placements.reduce((m, p) => Math.max(m, Number(p.id.replace(/\D/g, '')) || 0), 0) + 1, [scene.placements.length])

  const addPlacement = (kind: Placement['kind'], refId: number) => {
    const id = `pl-${pseq++}`
    setScene((s) => ({
      ...s,
      placements: [...s.placements, { id, kind, refId, x: 64, y: 64, direction: 'S', scale: 1 }],
    }))
    setSelected(id)
  }
  const remove = (id: string) => {
    setScene((s) => ({ ...s, placements: s.placements.filter((p) => p.id !== id) }))
    if (selected === id) setSelected(null)
  }
  const update = (id: string, patch: Partial<Placement>) => {
    setScene((s) => ({ ...s, placements: s.placements.map((p) => p.id === id ? { ...p, ...patch } : p) }))
  }
  const sel = selected ? scene.placements.find((p) => p.id === selected) : null

  const onSave = () => {
    const id = saveScene(scene)
    navigate(`/studio/scene/${id}`)
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow={editingId ? '편집' : '새 씬'}
        icon={Blocks}
        title="씬 빌더"
        desc="타일·prop·Pawn을 보드에 배치하고 장르를 골라 플레이"
        actions={
          <>
            <Button variant="ghost" onClick={() => editingId && navigate(`/scene/${editingId}`)} disabled={!editingId}>
              <Play size={15} /> 플레이
            </Button>
            <Button onClick={onSave}><Save size={15} /> 저장</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr_320px]">
        {/* 좌: 메타 + 배치 후보 */}
        <aside className="space-y-3">
          <div className="card p-4 space-y-3">
            <div>
              <div className="label">이름</div>
              <input className="input" value={scene.name} onChange={(e) => setScene((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <div className="label">설명</div>
              <textarea className="textarea" rows={2} value={scene.description} onChange={(e) => setScene((s) => ({ ...s, description: e.target.value }))} />
            </div>
            <div>
              <div className="label">장르</div>
              <select className="select" value={scene.genre} onChange={(e) => setScene((s) => ({ ...s, genre: e.target.value as Scene['genre'] }))}>
                {Object.entries(SCENE_GENRE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <div className="label">배경색</div>
              <input type="color" value={scene.config.bgColor} onChange={(e) => setScene((s) => ({ ...s, config: { ...s.config, bgColor: e.target.value } }))} className="h-9 w-full rounded-md border border-[var(--color-line2)]" />
            </div>
            <label className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-dim)]">공개</span>
              <input type="checkbox" checked={scene.isPublic} onChange={(e) => setScene((s) => ({ ...s, isPublic: e.target.checked }))} />
            </label>
          </div>

          <div className="card p-3">
            <div className="mb-2 flex gap-1 rounded-lg border border-[var(--color-line)] bg-white p-1">
              {(['tile', 'prop', 'pawn'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-md px-2 py-1 text-xs font-semibold ${tab === t ? 'bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]' : 'text-[var(--color-dim)]'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="grid max-h-[420px] grid-cols-3 gap-1.5 overflow-y-auto">
              {(tab === 'tile' ? tileParts : tab === 'prop' ? propParts : pawnList).map((it) => {
                const isPawn = tab === 'pawn'
                return (
                  <button
                    key={isPawn ? `pawn-${it.id}` : `part-${it.id}`}
                    onClick={() => addPlacement(tab, it.id)}
                    title={it.name}
                    className="grid aspect-square place-items-center rounded-lg border border-[var(--color-line)] bg-[var(--color-surface2)] hover:border-[var(--color-line2)]"
                  >
                    {isPawn ? (
                      <span className="text-[10px] font-semibold text-[var(--color-dim)]">{it.name}</span>
                    ) : (
                      <img src={(it as { thumbnailUrl?: string }).thumbnailUrl} alt={it.name} className="h-10 w-10" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* 중: 스테이지 */}
        <div className="card overflow-hidden">
          <SceneStage scene={scene} fit selected={selected} onPick={setSelected} animate="none" />
          <div className="border-t border-[var(--color-line)] bg-[var(--color-surface2)] px-3 py-2 text-xs text-[var(--color-dim)]">
            {scene.placements.length}개 배치 · 클릭으로 선택, 우측에서 좌표·방향 편집
          </div>
        </div>

        {/* 우: 선택 편집 */}
        <aside className="space-y-3">
          {sel ? (
            <div className="card p-4 space-y-3">
              <div className="text-sm font-bold">선택 · {sel.kind} #{sel.refId}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="label">X</div>
                  <input type="number" className="input" value={sel.x} onChange={(e) => update(sel.id, { x: Number(e.target.value) })} />
                </div>
                <div>
                  <div className="label">Y</div>
                  <input type="number" className="input" value={sel.y} onChange={(e) => update(sel.id, { y: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <div className="label">방향</div>
                <div className="flex flex-wrap gap-1">
                  {DIRS.map((d) => (
                    <button key={d} onClick={() => update(sel.id, { direction: d })} className={`chip ${sel.direction === d ? 'chip-active' : ''}`}>{DIRECTION_LABEL[d]}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="label">스케일 ({sel.scale.toFixed(2)})</div>
                <input type="range" min={0.5} max={2.5} step={0.1} value={sel.scale} onChange={(e) => update(sel.id, { scale: Number(e.target.value) })} />
              </div>
              <Button variant="danger" className="w-full" onClick={() => remove(sel.id)}><Trash2 size={14} /> 삭제</Button>
            </div>
          ) : (
            <div className="card p-4 text-xs text-[var(--color-faint)]">
              왼쪽에서 타일/prop/Pawn을 클릭해 보드에 추가하세요. 보드의 객체를 클릭하면 여기서 편집할 수 있어요.
            </div>
          )}

          <div className="card p-4 text-xs text-[var(--color-dim)]">
            <div className="flex items-center gap-1 font-semibold text-[var(--color-ink)]"><Plus size={12} /> 캔버스</div>
            <div className="mt-1">{scene.config.canvasW}×{scene.config.canvasH}px</div>
            <button onClick={() => setScene((s) => ({ ...s, placements: [] }))} className="mt-3 inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] px-2 py-1 hover:border-[var(--color-line2)]">
              <RotateCw size={11} /> 전부 비우기
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
