import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Compass, Sparkles, Users2, LogOut, Wand2 } from 'lucide-react'
import { useStudio } from '../store/studio'
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
  const user = useStudio((s) => s.currentUser)
  const logout = useStudio((s) => s.logout)

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
            <NavLink to="/explore" className={navCls}><Compass size={14} className="mr-1 inline" />Pawn 탐색</NavLink>
            <NavLink to="/explore/parts" className={navCls}><Sparkles size={14} className="mr-1 inline" />파츠</NavLink>
            <NavLink to="/explore/scenes" className={navCls}><Users2 size={14} className="mr-1 inline" />씬</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/studio')}>
                  <Wand2 size={15} /> 스튜디오
                </Button>
                <button onClick={() => navigate(`/u/${user.handle}`)} title={user.displayName}>
                  <Avatar name={user.displayName} src={user.avatarUrl} size={34} />
                </button>
                <button title="로그아웃" onClick={logout} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-dim)] hover:bg-[var(--color-surface2)]">
                  <LogOut size={15} />
                </button>
              </>
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
