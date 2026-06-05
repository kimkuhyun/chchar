import { Heart, Play, Lock, User2 } from 'lucide-react'
import type { Scene } from '../types'
import { SCENE_GENRE_LABEL } from '../types'
import SceneStage from './SceneStage'
import Badge from '../ui/Badge'
import { fmtCount } from '../lib/format'

export default function SceneCard({ scene, onClick }: { scene: Scene; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="card card-hover block w-full overflow-hidden text-left">
      <div className="aspect-[4/3] overflow-hidden">
        <SceneStage scene={scene} fit width={384} animate="none" />
      </div>
      <div className="p-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{scene.name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--color-faint)]">
              <User2 size={11} /> {scene.ownerName ?? '익명'}
            </div>
          </div>
          {!scene.isPublic && <Lock size={12} className="text-[var(--color-faint)]" />}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-dim)]">
          <Badge color="#6d5efc">{SCENE_GENRE_LABEL[scene.genre]}</Badge>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><Play size={11} /> {fmtCount(scene.playCount)}</span>
            <span className="flex items-center gap-1"><Heart size={11} /> {fmtCount(scene.likeCount)}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
