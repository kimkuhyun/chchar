import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Zap, Globe, Gamepad2, Cpu } from 'lucide-react'
import { useStudio } from '../../store/studio'
import LevelCard from '../../components/LevelCard'
import AssetCard from '../../components/AssetCard'
import Button from '../../ui/Button'

const CHIPS = [
  { icon: Zap, label: '즉시 생성' },
  { icon: Cpu, label: '내 GPU로 무료' },
  { icon: Gamepad2, label: '바로 플레이' },
  { icon: Globe, label: '공유·탐색' },
]

export default function Landing() {
  const navigate = useNavigate()
  const levels = useStudio((s) => s.levels).filter((l) => l.visibility === 'public').sort((a, b) => b.playCount - a.playCount)
  const assets = useStudio((s) => s.assets).filter((a) => a.isPublic).slice(0, 10)

  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-white p-9 shadow-sm md:p-14">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(700px 320px at 90% -10%, rgba(109,94,252,0.14), transparent 60%), radial-gradient(600px 300px at -5% 110%, rgba(21,194,232,0.12), transparent 55%)' }} />
        <div className="pointer-events-none absolute right-8 top-10 hidden gap-4 md:flex">
          {['char-knight.svg', 'char-mage.svg', 'char-ninja.svg'].map((f, i) => (
            <img key={f} src={`/sample-assets/${f}`} className="pixelated anim-float h-20 w-20 drop-shadow-xl" style={{ animationDelay: `${i * 0.6}s` }} alt="" />
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line2)] bg-white px-3 py-1 text-[13px] font-semibold text-[var(--color-primary)]">
            <Sparkles size={14} /> 로컬 · 무료 · AMD GPU
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.12] md:text-6xl">
            아이디어 하나로,<br />
            <span className="brand-text">게임이 된다</span>
          </h1>
          <p className="mt-4 max-w-lg text-[15px] text-[var(--color-dim)] md:text-base">
            프롬프트로 캐릭터·배경·플랫폼을 만들고, 브라우저에서 바로 조립해 플레이하세요.
            생성은 내 PC의 ComfyUI에서 — 클라우드 비용 0.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate('/studio/generate')}>
              <Sparkles size={18} /> 무료로 시작하기
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate('/explore')}>
              레벨 둘러보기 <ArrowRight size={16} />
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {CHIPS.map(({ icon: Icon, label }) => (
              <span key={label} className="badge badge-soft gap-1.5 px-3 py-1.5"><Icon size={13} className="text-[var(--color-primary)]" /> {label}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 인기 레벨 */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]"><Gamepad2 size={15} /> 인기 레벨</div>
            <h2 className="text-2xl font-bold">지금 많이 플레이하는</h2>
          </div>
          <button onClick={() => navigate('/explore')} className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">전체 <ArrowRight size={14} /></button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {levels.slice(0, 3).map((l) => (
            <LevelCard key={l.id} level={l} onOpen={() => navigate(`/level/${l.id}`)} />
          ))}
        </div>
      </section>

      {/* 새 에셋 */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)]"><Sparkles size={15} /> 커뮤니티 에셋</div>
            <h2 className="text-2xl font-bold">방금 만들어진</h2>
          </div>
          <button onClick={() => navigate('/explore/assets')} className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">전체 <ArrowRight size={14} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {assets.slice(0, 5).map((a) => (
            <AssetCard key={a.id} asset={a} showOwner />
          ))}
        </div>
      </section>
    </div>
  )
}
