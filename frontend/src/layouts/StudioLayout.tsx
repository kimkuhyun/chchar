import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Sparkles, ListChecks, Images, Blocks, Gamepad2,
  SlidersHorizontal, Cpu, Workflow, Wand2, ArrowLeft, Scissors,
} from 'lucide-react'
import { useStudio } from '../store/studio'
import { userById } from '../mock/users'
import Avatar from '../ui/Avatar'

const NAV = [
  { to: '/studio', label: '대시보드', icon: LayoutDashboard, end: true },
  { to: '/studio/generate', label: '생성', icon: Sparkles },
  { to: '/studio/queue', label: '생성 큐', icon: ListChecks },
  { to: '/studio/assets', label: '내 갤러리', icon: Images },
  { to: '/studio/slicer', label: '스프라이트 슬라이서', icon: Scissors },
  { to: '/studio/builder', label: '씬 조립기', icon: Blocks },
  { to: '/studio/levels', label: '내 레벨', icon: Gamepad2 },
  { to: '/studio/presets', label: '프리셋', icon: SlidersHorizontal },
  { to: '/studio/pipeline', label: '파이프라인', icon: Workflow },
  { to: '/studio/gpu', label: 'GPU 연결', icon: Cpu },
]

export default function StudioLayout() {
  const gpu = useStudio((s) => s.gpu)
  const uid = useStudio((s) => s.currentUserId)
  const user = uid ? userById(uid) : null
  const online = gpu.status === 'online'

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
          <Link
            to="/studio/gpu"
            className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] px-3 py-2 text-[13px] transition hover:border-[var(--color-line2)]"
          >
            <span className={`dot ${online ? 'dot-on' : 'dot-off'}`} />
            <span className="font-medium">{online ? 'GPU 온라인' : 'GPU 오프라인'}</span>
            <Cpu size={14} className="ml-auto text-[var(--color-faint)]" />
          </Link>
          {user && (
            <Link to="/studio/settings" className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-[var(--color-surface2)]">
              <Avatar name={user.displayName} src={user.avatarUrl} size={30} />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[13px] font-semibold">{user.displayName}</div>
                <div className="text-[11px] text-[var(--color-faint)]">{user.plan === 'pro' ? 'Pro' : 'Free'}</div>
              </div>
            </Link>
          )}
          <Link to="/" className="flex items-center gap-1.5 px-3 text-[12px] text-[var(--color-faint)] hover:text-[var(--color-primary)]">
            <ArrowLeft size={13} /> 둘러보기로
          </Link>
        </div>
      </aside>

      <main className="min-h-screen min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
