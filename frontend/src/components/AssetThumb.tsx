import type { Asset } from '../types'

/** 배경은 cover, 캐릭터/플랫폼은 밝은 보드에 contain */
export default function AssetThumb({ asset, className = '' }: { asset: Asset; className?: string }) {
  const cover = asset.role === 'bg'
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: cover ? '#0b1020' : '#eef0f7' }}
    >
      <img
        src={asset.thumbnailUrl}
        alt=""
        draggable={false}
        className={`pixelated h-full w-full ${cover ? 'object-cover' : 'object-contain p-4'}`}
      />
    </div>
  )
}
