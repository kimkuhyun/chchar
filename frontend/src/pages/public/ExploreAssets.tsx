import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Images, Search } from 'lucide-react'
import { useStudio } from '../../store/studio'
import { userById } from '../../mock/users'
import AssetCard from '../../components/AssetCard'
import PageHeader from '../../ui/PageHeader'
import type { Role } from '../../types'

type Tab = 'all' | Role
const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: '전체' }, { key: 'char', label: '캐릭터' }, { key: 'bg', label: '배경' }, { key: 'platform', label: '플랫폼' },
]

export default function ExploreAssets() {
  const navigate = useNavigate()
  const assets = useStudio((s) => s.assets).filter((a) => a.isPublic)
  const [tab, setTab] = useState<Tab>('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return assets.filter((a) => {
      if (tab !== 'all' && a.role !== tab) return false
      if (query && !a.tags.some((t) => t.toLowerCase().includes(query))) return false
      return true
    })
  }, [assets, tab, q])

  return (
    <div>
      <PageHeader eyebrow="에셋 탐색" icon={Images} title="커뮤니티 에셋" desc="공개된 캐릭터·배경·플랫폼을 구경하세요." />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl border border-[var(--color-line)] bg-white p-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-lg px-3 py-1.5 text-sm transition ${tab === t.key ? 'bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]' : 'text-[var(--color-dim)] hover:text-[var(--color-ink)]'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-3 py-1.5">
          <Search size={15} className="text-[var(--color-faint)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="태그 검색…" className="w-36 bg-transparent text-sm outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((a) => {
          const handle = userById(a.ownerId)?.handle
          return <AssetCard key={a.id} asset={a} showOwner onOpen={() => handle && navigate(`/u/${handle}`)} />
        })}
      </div>
    </div>
  )
}
