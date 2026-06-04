import { Heart } from 'lucide-react'
import type { Asset } from '../types'
import { ROLE_LABEL } from '../types'
import AssetThumb from './AssetThumb'

export default function AssetCard({
  asset,
  onOpen,
  onFav,
  showOwner = false,
}: {
  asset: Asset
  onOpen?: () => void
  onFav?: () => void
  showOwner?: boolean
}) {
  return (
    <div className="card card-hover cursor-pointer overflow-hidden" onClick={onOpen}>
      <div className="relative">
        <AssetThumb asset={asset} className="aspect-[4/3]" />
        <span className="badge absolute left-2 top-2 bg-white/90 text-[var(--color-dim)] backdrop-blur">
          {ROLE_LABEL[asset.role]}
        </span>
        {onFav ? (
          <button
            onClick={(e) => { e.stopPropagation(); onFav() }}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:scale-110"
            aria-label="즐겨찾기"
          >
            <Heart size={15} className={asset.favorite ? 'text-[var(--color-danger)]' : 'text-[var(--color-faint)]'} fill={asset.favorite ? 'currentColor' : 'none'} />
          </button>
        ) : (
          asset.isPublic && (
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-danger)] backdrop-blur">
              <Heart size={11} fill="currentColor" /> {asset.likeCount}
            </span>
          )
        )}
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-1">
          {asset.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[12px] text-[var(--color-dim)]">#{t}</span>
          ))}
        </div>
        <div className="mt-1.5 truncate text-[12px] text-[var(--color-faint)]">
          {showOwner ? asset.ownerName : `#${asset.id}`}
        </div>
      </div>
    </div>
  )
}
