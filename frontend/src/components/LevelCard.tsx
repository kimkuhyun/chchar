import { Play, Heart, Lock, Globe } from 'lucide-react'
import type { Level } from '../types'
import Avatar from '../ui/Avatar'

export default function LevelCard({ level, onOpen }: { level: Level; onOpen?: () => void }) {
  return (
    <div className="card card-hover cursor-pointer overflow-hidden" onClick={onOpen}>
      <div className="relative aspect-video overflow-hidden">
        <img src={level.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <div className="truncate font-bold text-white drop-shadow">{level.name}</div>
        </div>
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
          {level.visibility === 'public' ? (
            <><Globe size={11} className="text-[var(--color-success)]" /> 공개</>
          ) : (
            <><Lock size={11} className="text-[var(--color-faint)]" /> 비공개</>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2 p-3">
        <Avatar name={level.ownerName} size={24} />
        <span className="truncate text-[13px] text-[var(--color-dim)]">{level.ownerName}</span>
        <div className="ml-auto flex items-center gap-2.5 text-[12px] text-[var(--color-faint)]">
          <span className="flex items-center gap-1"><Play size={12} /> {level.playCount}</span>
          <span className="flex items-center gap-1"><Heart size={12} /> {level.likeCount}</span>
        </div>
      </div>
    </div>
  )
}
