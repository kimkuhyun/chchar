import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Search, Images, Sparkles } from 'lucide-react'
import { useStudio } from '../../store/studio'
import AssetCard from '../../components/AssetCard'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import EmptyState from '../../ui/EmptyState'
import type { Role } from '../../types'

type Tab = 'all' | Role
const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: '전체' }, { key: 'char', label: '캐릭터' }, { key: 'bg', label: '배경' }, { key: 'platform', label: '플랫폼' },
]

export default function MyAssets() {
  const navigate = useNavigate()
  const uid = useStudio((s) => s.currentUserId)
  const assets = useStudio((s) => s.assets).filter((a) => a.ownerId === uid)
  const toggleFavorite = useStudio((s) => s.toggleFavorite)
  const [tab, setTab] = useState<Tab>('all')
  const [q, setQ] = useState('')
  const [favOnly, setFavOnly] = useState(false)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return assets.filter((a) => {
      if (tab !== 'all' && a.role !== tab) return false
      if (favOnly && !a.favorite) return false
      if (query && !a.tags.some((t) => t.toLowerCase().includes(query))) return false
      return true
    })
  }, [assets, tab, q, favOnly])

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader eyebrow="내 에셋" icon={Images} title={`갤러리 · ${filtered.length}`} actions={<Button onClick={() => navigate('/studio/generate')}><Sparkles size={16} /> 생성</Button>} />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl border border-[var(--color-line)] bg-white p-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-lg px-3 py-1.5 text-sm transition ${tab === t.key ? 'bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]' : 'text-[var(--color-dim)] hover:text-[var(--color-ink)]'}`}>{t.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-3 py-1.5">
          <Search size={15} className="text-[var(--color-faint)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="태그 검색…" className="w-36 bg-transparent text-sm outline-none" />
        </div>
        <button onClick={() => setFavOnly((v) => !v)} className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition ${favOnly ? 'border-[var(--color-danger)] bg-[#fff0f3] text-[var(--color-danger)]' : 'border-[var(--color-line)] bg-white text-[var(--color-dim)]'}`}>
          <Heart size={14} fill={favOnly ? 'currentColor' : 'none'} /> 즐겨찾기
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Images} title="에셋이 없어요" desc="생성으로 첫 에셋을 만들어보세요." action={<Button onClick={() => navigate('/studio/generate')}><Sparkles size={16} /> 생성하러 가기</Button>} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((a) => (
            <AssetCard key={a.id} asset={a} onOpen={() => navigate(`/studio/asset/${a.id}`)} onFav={() => toggleFavorite(a.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
