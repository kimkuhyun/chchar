import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Sparkles, Images, UserCog, Blocks, Map, ArrowLeft, Wand2,
  Scissors, Settings, Users2,
} from 'lucide-react'
import { useStudio } from '../store/studio'
import Avatar from '../ui/Avatar'
import VramHud from '../components/VramHud'
import WebGpuGate from '../components/WebGpuGate'

const NAV = [
  { to: '/studio', label: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/studio/generate', label: '파츠 생성', icon: Sparkles },
  { to: '/studio/slicer', label: '슬라이서', icon: Scissors },
  { to: '/studio/parts', label: '파츠 라이브러리', icon: Images },
  { to: '/studio/pawns', label: '내 Pawn', icon: Users2 },
  { to: '/studio/pawn', label: 'Pawn 에디터', icon: UserCog },
  { to: '/studio/scenes', label: '씬 빌더', icon: Blocks },
  { to: '/studio/my-scenes', label: '내 씬', icon: Map },
  { to: '/studio/settings', label: '설정', icon: Settings },
]

export default function StudioLayout() {
  const user = useStudio((s) => s.currentUser)
  const location = useLocation()

  // 온보딩 페이지 자체는 게이트 없이
  const isOnboarding = location.pathname.startsWith('/studio/onboarding')

  const body = isOnboarding ? <Outlet /> : <WebGpuGate><Outlet /></WebGpuGate>

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 z-20 flex h-screen w-[240px] shrink-0 flex-col border-r border-[var(--color-line)] bg-white/75 p-3 backdrop-blur-xl">
        <Link to="/studio" className="mb-3 flex items-center gap-2 px-2 pt-2">
          <div className="brand-bg grid h-9 w-9 place-items-center rounded-xl text-white shadow-[0_4px_12px_rgba(109,94,252,0.35)]">
            <Wand2 size={18} />
          </div>
          <div className="leading-tight">
            <div className="brand-text text-lg font-extrabold">chchar</div>
            <div className="text-[11px] text-[var(--color-faint)]">스튜디오</div>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]'
                    : 'text-[var(--color-dim)] hover:bg-[var(--color-surface2)] hover:text-[var(--color-ink)]'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-2 space-y-2">
          <VramHud />
          {user && (
            <Link to="/studio/settings" className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-[var(--color-surface2)]">
              <Avatar name={user.displayName} src={user.avatarUrl} size={30} />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[13px] font-semibold">{user.displayName}</div>
                <div className="text-[11px] text-[var(--color-faint)]">@{user.handle} · {user.plan === 'pro' ? 'Pro' : 'Free'}</div>
              </div>
            </Link>
          )}
          <Link to="/" className="flex items-center gap-1.5 px-3 text-[12px] text-[var(--color-faint)] hover:text-[var(--color-primary)]">
            <ArrowLeft size={13} /> 둘러보기로
          </Link>
        </div>
      </aside>

      <main className="min-h-screen min-w-0 flex-1">{body}</main>
    </div>
  )
}
