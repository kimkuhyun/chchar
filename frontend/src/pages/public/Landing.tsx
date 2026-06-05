import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Users2, Compass, Shield, Wand2 } from 'lucide-react'
import Button from '../../ui/Button'
import PawnCard from '../../components/PawnCard'
import SceneCard from '../../components/SceneCard'
import { publicPawns } from '../../mock/pawns'
import { publicScenes } from '../../mock/scenes'

export default function Landing() {
  const navigate = useNavigate()
  const pawns = publicPawns().slice(0, 6)
  const scenes = publicScenes().slice(0, 4)

  return (
    <div className="space-y-14 py-4">
      {/* Hero */}
      <section className="relative grid items-center gap-8 rounded-3xl bg-white p-10 shadow-sm md:grid-cols-2 md:p-14">
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[rgba(109,94,252,0.1)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
            <Sparkles size={13} /> paper-doll · WebGPU 무설치
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.15] md:text-5xl">
            <span className="brand-text">파츠로 조립</span>하는<br />
            나만의 게임 캐릭터
          </h1>
          <p className="mt-4 max-w-md text-[15px] text-[var(--color-dim)]">
            브라우저에서 직접 만든 투명 파츠를 슬롯에 얹어 Pawn을 조립하고, 다양한 장르의 씬에 배치해 플레이·공유하세요.
            설치는 0, 추론은 본인 GPU.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button size="lg" onClick={() => navigate('/studio')}>
              <Wand2 size={16} /> 만들기 시작
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/explore')}>
              <Compass size={16} /> 둘러보기
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[var(--color-faint)]">
            <span className="flex items-center gap-1"><Shield size={12} /> 로컬호스트 권한 요청 없음</span>
            <span>· 결제 없음 (MVP)</span>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {pawns.slice(0, 6).map((p) => (
            <div key={p.id} className="anim-float" style={{ animationDelay: `${p.id * 0.4}s` }}>
              <PawnCard pawn={p} size={96} onClick={() => navigate(`/pawn/${p.id}`)} />
            </div>
          ))}
        </div>
      </section>

      {/* 인기 Pawn */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">인기 Pawn</h2>
            <p className="text-sm text-[var(--color-dim)]">사람들이 가장 많이 좋아하는 조립체</p>
          </div>
          <Link to="/explore" className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">
            전체 보기 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {pawns.map((p) => (
            <PawnCard key={p.id} pawn={p} size={120} onClick={() => navigate(`/pawn/${p.id}`)} />
          ))}
        </div>
      </section>

      {/* 인기 씬 */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">플레이할 씬</h2>
            <p className="text-sm text-[var(--color-dim)]">장르별 미니 보드 — 클릭·디펜스·서바이버·RPG·전술</p>
          </div>
          <Link to="/explore/scenes" className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">
            전체 보기 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scenes.map((s) => (
            <SceneCard key={s.id} scene={s} onClick={() => navigate(`/scene/${s.id}`)} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="grid items-center gap-6 rounded-3xl bg-gradient-to-br from-[#eee9ff] to-[#dff7fb] p-10 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl font-extrabold">스튜디오에 들어가서 첫 Pawn을 만들어 보세요</h2>
          <p className="mt-2 text-sm text-[var(--color-dim)]">
            첫 방문엔 모델 1.6GB만 한 번 받아두면 다음부터 즉시 사용 가능합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="lg" onClick={() => navigate('/studio')}>
            <Wand2 size={16} /> 스튜디오 진입
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/explore/parts')}>
            <Users2 size={16} /> 파츠 보기
          </Button>
        </div>
      </section>
    </div>
  )
}
