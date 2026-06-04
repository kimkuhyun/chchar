import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Gamepad2, Wand2 } from 'lucide-react'
import { useStudio } from '../store/studio'
import { userById } from '../mock/users'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

const navCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? 'bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]'
      : 'text-[var(--color-dim)] hover:bg-[var(--color-surface2)] hover:text-[var(--color-ink)]'
  }`

export default function PublicLayout() {
  const navigate = useNavigate()
  const uid = useStudio((s) => s.currentUserId)
  const user = uid ? userById(uid) : null

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="brand-bg grid h-8 w-8 place-items-center rounded-lg text-white shadow-[0_4px_12px_rgba(109,94,252,0.35)]">
              <Wand2 size={17} />
            </div>
            <span className="brand-text text-lg font-extrabold">chchar</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            <NavLink to="/explore" className={navCls}>레벨 탐색</NavLink>
            <NavLink to="/explore/assets" className={navCls}>에셋 탐색</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/studio')}>
              <Gamepad2 size={16} /> 만들기
            </Button>
            {user ? (
              <button onClick={() => navigate('/studio')} title={user.displayName}>
                <Avatar name={user.displayName} src={user.avatarUrl} size={34} />
              </button>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>로그인</Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  )
}
