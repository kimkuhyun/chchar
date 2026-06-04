import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play, Save, Trash2, MousePointer2, Flag, Footprints, Grid3x3, RotateCcw,
  Check, Globe, Lock,
} from 'lucide-react'
import { useStudio } from '../../store/studio'
import Button from '../../ui/Button'
import { demoEnemies, demoHazards, goalSprite } from '../../mock/demo'
import { snap } from '../../lib/coords'
import type { PlacementKind } from '../../types'

type Brush =
  | { mode: 'place'; kind: PlacementKind; sprite: string; w: number; h: number; assetId: number | null }
  | { mode: 'player' } | { mode: 'goal' } | { mode: 'select' }
const SELECT: Brush = { mode: 'select' }

export default function Builder() {
  const navigate = useNavigate()
  const uid = useStudio((s) => s.currentUserId)
  const draft = useStudio((s) => s.draft)
  const assets = useStudio((s) => s.assets).filter((a) => a.ownerId === uid)
  const { setCharacter, setBackground, addPlacement, updatePlacement, removePlacement, setConfig, setPlayerStart, setGoal, clearPlacements, setDraftMeta, saveDraft } = useStudio.getState()

  const chars = assets.filter((a) => a.role === 'char')
  const bgs = assets.filter((a) => a.role === 'bg')
  const platforms = assets.filter((a) => a.role === 'platform')
  const { canvasW, canvasH } = draft.config
  const character = useStudio((s) => s.assets.find((a) => a.id === draft.characterAssetId))
  const background = useStudio((s) => s.assets.find((a) => a.id === draft.backgroundAssetId))

  const canvasRef = useRef<HTMLDivElement>(null)
  const dragId = useRef<string | null>(null)
  const [brush, setBrush] = useState<Brush>(SELECT)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { removePlacement(selectedId); setSelectedId(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, removePlacement])

  const toWorld = (cx: number, cy: number) => {
    const r = canvasRef.current!.getBoundingClientRect()
    const scale = r.width / canvasW
    return { x: snap((cx - r.left) / scale), y: snap((cy - r.top) / scale) }
  }
  const onCanvasDown = (e: React.PointerEvent) => {
    const { x, y } = toWorld(e.clientX, e.clientY)
    if (brush.mode === 'select') return setSelectedId(null)
    if (brush.mode === 'player') return setPlayerStart(x, y)
    if (brush.mode === 'goal') return setGoal(x, y)
    addPlacement({ kind: brush.kind, assetId: brush.assetId, sprite: brush.sprite, x, y, w: brush.w, h: brush.h, scale: 1 })
  }
  const onItemDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation(); setSelectedId(id); setBrush(SELECT); dragId.current = id
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const onItemMove = (e: React.PointerEvent, id: string) => {
    if (dragId.current !== id) return
    const { x, y } = toWorld(e.clientX, e.clientY)
    updatePlacement(id, { x, y })
  }
  const pct = (v: number, total: number) => `${(v / total) * 100}%`
  const save = () => { saveDraft(); setSaved(true); window.setTimeout(() => setSaved(false), 1800) }

  const Thumb = ({ sprite, label, active, onClick }: { sprite: string; label: string; active?: boolean; onClick: () => void }) => (
    <button onClick={onClick} title={label} className={`grid aspect-square place-items-center rounded-lg border p-1.5 transition ${active ? 'border-[var(--color-primary)] bg-[rgba(109,94,252,0.08)]' : 'border-[var(--color-line2)] hover:border-[var(--color-primary)]'}`}>
      <img src={sprite} alt={label} className="pixelated max-h-full max-w-full" />
    </button>
  )

  return (
    <div className="flex h-screen flex-col">
      {/* 상단 바 */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-line)] bg-white/85 px-5 py-2.5 backdrop-blur">
        <input value={draft.name} onChange={(e) => setDraftMeta({ name: e.target.value })} className="input max-w-[200px] font-semibold" />
        <button onClick={() => setDraftMeta({ visibility: draft.visibility === 'public' ? 'private' : 'public' })} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-line2)] bg-white px-3 py-1.5 text-sm">
          {draft.visibility === 'public' ? <><Globe size={14} className="text-[var(--color-success)]" /> 공개</> : <><Lock size={14} className="text-[var(--color-faint)]" /> 비공개</>}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowGrid((v) => !v)} className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition ${showGrid ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-line2)] text-[var(--color-dim)]'}`}><Grid3x3 size={14} /> 그리드</button>
          <button onClick={() => { clearPlacements(); setSelectedId(null) }} className="flex items-center gap-1 rounded-lg border border-[var(--color-line2)] px-2.5 py-1.5 text-xs text-[var(--color-dim)] hover:text-[var(--color-danger)]"><RotateCcw size={14} /> 비우기</button>
          <Button variant={saved ? 'subtle' : 'ghost'} onClick={save}>{saved ? <><Check size={16} /> 저장됨</> : <><Save size={16} /> 저장</>}</Button>
          <Button onClick={() => navigate('/studio/play')}><Play size={16} /> 플레이</Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 팔레트 */}
        <aside className="w-[280px] shrink-0 overflow-y-auto border-r border-[var(--color-line)] bg-white p-4">
          <div className="mb-1 text-xs font-semibold text-[var(--color-dim)]">도구</div>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[{ b: SELECT, icon: MousePointer2, label: '선택' }, { b: { mode: 'player' } as Brush, icon: Footprints, label: '시작' }, { b: { mode: 'goal' } as Brush, icon: Flag, label: '골' }].map(({ b, icon: Icon, label }) => (
              <button key={label} onClick={() => setBrush(b)} className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-[11px] transition ${brush.mode === b.mode ? 'border-[var(--color-primary)] bg-[rgba(109,94,252,0.08)] text-[var(--color-primary)]' : 'border-[var(--color-line2)] text-[var(--color-dim)]'}`}><Icon size={16} /> {label}</button>
            ))}
          </div>

          <div className="mb-1 text-xs font-semibold text-[var(--color-dim)]">캐릭터</div>
          <div className="mb-4 grid grid-cols-4 gap-2">
            {chars.map((a) => <Thumb key={a.id} sprite={a.thumbnailUrl} label={`#${a.id}`} active={draft.characterAssetId === a.id} onClick={() => setCharacter(a.id)} />)}
          </div>

          <div className="mb-1 text-xs font-semibold text-[var(--color-dim)]">배경</div>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {bgs.map((a) => (
              <button key={a.id} onClick={() => setBackground(a.id)} className={`aspect-video overflow-hidden rounded-lg border transition ${draft.backgroundAssetId === a.id ? 'border-[var(--color-primary)]' : 'border-[var(--color-line2)] hover:border-[var(--color-primary)]'}`}><img src={a.thumbnailUrl} alt="" className="h-full w-full object-cover" /></button>
            ))}
          </div>

          <div className="mb-1 text-xs font-semibold text-[var(--color-dim)]">플랫폼 <span className="font-normal text-[var(--color-faint)]">(클릭 후 캔버스 클릭)</span></div>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {platforms.map((a) => {
              const active = brush.mode === 'place' && brush.kind === 'platform' && brush.assetId === a.id
              return <Thumb key={a.id} sprite={a.thumbnailUrl} label={`#${a.id}`} active={active} onClick={() => setBrush({ mode: 'place', kind: 'platform', sprite: a.thumbnailUrl, w: a.width, h: a.height, assetId: a.id })} />
            })}
          </div>

          <div className="mb-1 text-xs font-semibold text-[var(--color-dim)]">함정 · 에너미</div>
          <div className="mb-4 grid grid-cols-4 gap-2">
            {[...demoHazards, ...demoEnemies].map((d) => {
              const active = brush.mode === 'place' && brush.sprite === d.sprite
              return <Thumb key={d.sprite} sprite={d.sprite} label={d.name} active={active} onClick={() => setBrush({ mode: 'place', kind: d.kind, sprite: d.sprite, w: d.w, h: d.h, assetId: null })} />
            })}
          </div>

          <div className="mb-2 text-xs font-semibold text-[var(--color-dim)]">물리 설정</div>
          <div className="space-y-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface2)] p-3">
            {([['중력', 'gravity', 300, 1600], ['점프력', 'jump', 300, 800], ['이동속도', 'speed', 100, 400]] as const).map(([label, key, min, max]) => (
              <div key={key}>
                <div className="mb-1 flex justify-between text-[11px]"><span className="text-[var(--color-dim)]">{label}</span><span className="font-semibold text-[var(--color-primary)]">{draft.config[key]}</span></div>
                <input type="range" min={min} max={max} value={draft.config[key]} onChange={(e) => setConfig({ [key]: Number(e.target.value) })} />
              </div>
            ))}
          </div>
        </aside>

        {/* 캔버스 */}
        <div className="flex min-w-0 flex-1 items-center justify-center overflow-auto bg-[var(--color-surface2)] p-6">
          <div className="w-full max-w-[1100px]">
            <div ref={canvasRef} onPointerDown={onCanvasDown} className="relative w-full overflow-hidden rounded-xl border border-[var(--color-line2)] shadow-sm" style={{ aspectRatio: `${canvasW} / ${canvasH}`, cursor: brush.mode === 'select' ? 'default' : 'crosshair', background: '#0b1020' }}>
              {background && <img src={background.thumbnailUrl} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />}
              {showGrid && <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(120,200,255,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(120,200,255,0.18) 1px,transparent 1px)', backgroundSize: `${(32 / canvasW) * 100}% ${(32 / canvasH) * 100}%` }} />}
              {draft.placements.map((p) => (
                <div key={p.id} onPointerDown={(e) => onItemDown(e, p.id)} onPointerMove={(e) => onItemMove(e, p.id)} onPointerUp={(e) => { dragId.current = null; (e.target as Element).releasePointerCapture?.(e.pointerId) }} className={`absolute touch-none ${selectedId === p.id ? 'z-20' : 'z-10'}`} style={{ left: pct(p.x, canvasW), top: pct(p.y, canvasH), width: pct(p.w * p.scale, canvasW), height: pct(p.h * p.scale, canvasH), cursor: 'grab', outline: selectedId === p.id ? '2px solid #ff5470' : 'none', outlineOffset: '1px' }}>
                  <img src={p.sprite} alt="" draggable={false} className="pixelated pointer-events-none h-full w-full object-fill" />
                </div>
              ))}
              {character && (
                <div className="pointer-events-none absolute z-30" style={{ left: pct(draft.playerStart.x, canvasW), top: pct(draft.playerStart.y, canvasH), width: pct(32, canvasW), height: pct(40, canvasH), transform: 'translate(-50%,-100%)' }}>
                  <img src={character.thumbnailUrl} alt="" className="pixelated h-full w-full object-contain drop-shadow-[0_0_8px_rgba(109,94,252,0.6)]" />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-[#8a7bff]">START</div>
                </div>
              )}
              <div className="pointer-events-none absolute z-30" style={{ left: pct(draft.goal.x, canvasW), top: pct(draft.goal.y, canvasH), width: pct(32, canvasW), height: pct(48, canvasH), transform: 'translate(-50%,-100%)' }}>
                <img src={goalSprite} alt="" className="pixelated h-full w-full object-contain" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-faint)]">
              <span>팔레트 선택 → 캔버스 클릭 배치 · 드래그로 이동 · Delete 삭제</span>
              {selectedId && <button onClick={() => { removePlacement(selectedId); setSelectedId(null) }} className="flex items-center gap-1 text-[var(--color-danger)] hover:underline"><Trash2 size={13} /> 선택 삭제</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
