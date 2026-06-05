import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Sparkles, Images, UserCog, Blocks, ArrowRight,
  Users2, Map, Cpu,
} from 'lucide-react'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import Stat from '../../ui/Stat'
import { Image as ImageIcon, Sparkles as SparkIcon, Map as MapIcon, Cpu as CpuIcon } from 'lucide-react'
import PartCard from '../../components/PartCard'
import PawnCard from '../../components/PawnCard'
import SceneCard from '../../components/SceneCard'
import UnsupportedNotice from '../../components/UnsupportedNotice'
import { useStudio } from '../../store/studio'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useStudio((s) => s.currentUser)!
  const parts = useStudio((s) => s.parts).filter((p) => p.ownerId === user.id)
  const pawns = useStudio((s) => s.pawns).filter((p) => p.ownerId === user.id)
  const scenes = useStudio((s) => s.scenes).filter((s) => s.ownerId === user.id)
  const cap = useStudio((s) => s.webgpu)
  const generationDisabled = cap && cap.level !== 'ok'

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        eyebrow={`안녕하세요, ${user.displayName}님`}
        icon={LayoutDashboard}
        title="대시보드"
        desc="내가 만든 파츠·Pawn·씬을 한눈에. 새 작업도 여기서 시작하세요."
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate('/studio/pawn')}>
              <UserCog size={15} /> 새 Pawn
            </Button>
            <Button onClick={() => navigate('/studio/generate')} disabled={!!generationDisabled}>
              <Sparkles size={15} /> 파츠 생성
            </Button>
          </>
        }
      />

      {generationDisabled && <UnsupportedNotice variant="inline" />}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={ImageIcon} label="내 파츠" value={parts.length} />
        <Stat icon={UserCog} label="내 Pawn" value={pawns.length} accent="#15c2e8" />
        <Stat icon={MapIcon} label="내 씬" value={scenes.length} accent="#15bd8e" />
        <Stat icon={CpuIcon} label="환경" value={cap?.level === 'ok' ? `VRAM ${cap.vramGuessGb}GB` : (cap?.level ?? '확인 중')} accent="#f59e2e" />
      </section>

      {/* 빠른 시작 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Quick to="/studio/generate" icon={Sparkles} title="파츠 생성" desc="워크플로우 선택 + 프롬프트로 새 파츠 만들기" disabled={!!generationDisabled} />
        <Quick to="/studio/pawn" icon={UserCog} title="Pawn 에디터" desc="라이브러리 파츠를 슬롯에 얹어 조립" />
        <Quick to="/studio/scenes" icon={Blocks} title="씬 빌더" desc="장르 보드에 Pawn·타일·prop 배치" />
      </section>

      {/* 최근 내 작업 */}
      {!!pawns.length && (
        <section>
          <Header title="내 Pawn" link="/studio/pawns" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {pawns.slice(0, 5).map((p) => <PawnCard key={p.id} pawn={p} onClick={() => navigate(`/studio/pawn/${p.id}`)} />)}
          </div>
        </section>
      )}
      {!!parts.length && (
        <section>
          <Header title="내 파츠" link="/studio/parts" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {parts.slice(0, 5).map((p) => <PartCard key={p.id} part={p} />)}
          </div>
        </section>
      )}
      {!!scenes.length && (
        <section>
          <Header title="내 씬" link="/studio/my-scenes" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenes.slice(0, 3).map((s) => <SceneCard key={s.id} scene={s} onClick={() => navigate(`/studio/scene/${s.id}`)} />)}
          </div>
        </section>
      )}

      {/* 영감 */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h3 className="text-lg font-bold">영감 얻기</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Inspire to="/explore" icon={Users2} text="공개 Pawn 둘러보기" />
          <Inspire to="/explore/parts" icon={Images} text="공식 파츠 라이브러리" />
          <Inspire to="/explore/scenes" icon={Map} text="장르별 씬 플레이" />
        </div>
      </section>

      <section className="card flex items-center gap-3 p-4 text-sm text-[var(--color-dim)]">
        <Cpu size={16} className="text-[var(--color-primary)]" />
        <div>이 환경: <b>{cap?.level === 'ok' ? `WebGPU ${cap.vendor ?? ''} · VRAM ≈ ${cap.vramGuessGb}GB` : (cap?.level ?? '확인 중')}</b>. 캐시는 <Link to="/studio/settings" className="text-[var(--color-primary)]">설정</Link>에서 관리.</div>
      </section>
    </div>
  )
}

function Quick({ to, icon: Icon, title, desc, disabled }: { to: string; icon: typeof SparkIcon; title: string; desc: string; disabled?: boolean }) {
  const navigate = useNavigate()
  return (
    <button
      disabled={disabled}
      onClick={() => navigate(to)}
      className={`card card-hover flex items-start gap-4 p-5 text-left ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold">{title}</div>
        <div className="mt-0.5 text-xs text-[var(--color-dim)]">{desc}</div>
      </div>
      <ArrowRight size={16} className="ml-auto text-[var(--color-faint)]" />
    </button>
  )
}

function Header({ title, link }: { title: string; link: string }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h3 className="text-lg font-bold">{title}</h3>
      <Link to={link} className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">
        전체 보기 <ArrowRight size={13} />
      </Link>
    </div>
  )
}

function Inspire({ to, icon: Icon, text }: { to: string; icon: typeof Users2; text: string }) {
  return (
    <Link to={to} className="card card-hover flex items-center gap-3 p-4 text-sm">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--color-surface2)] text-[var(--color-primary)]">
        <Icon size={16} />
      </div>
      <span className="font-semibold">{text}</span>
      <ArrowRight size={14} className="ml-auto text-[var(--color-faint)]" />
    </Link>
  )
}
