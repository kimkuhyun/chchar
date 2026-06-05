import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wand2, ArrowRight, Mail, KeyRound } from 'lucide-react'
import Button from '../../ui/Button'
import { useStudio } from '../../store/studio'

export default function Login() {
  const navigate = useNavigate()
  const login = useStudio((s) => s.login)
  const [email, setEmail] = useState('rngus225@gmail.com')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email)
    navigate('/studio')
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-12 px-6 py-12 md:grid-cols-2">
        <div>
          <Link to="/" className="mb-8 inline-flex items-center gap-2">
            <div className="brand-bg grid h-9 w-9 place-items-center rounded-xl text-white shadow-[0_4px_12px_rgba(109,94,252,0.35)]">
              <Wand2 size={18} />
            </div>
            <span className="brand-text text-xl font-extrabold">chchar</span>
          </Link>
          <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
            <span className="brand-text">로그인</span>하고<br /> 첫 Pawn을 만들어 보세요
          </h1>
          <p className="mt-3 max-w-sm text-sm text-[var(--color-dim)]">
            MVP 단계라 이메일만 입력하면 바로 들어갈 수 있어요. 구글 OAuth는 곧 추가될 예정.
          </p>
        </div>

        <div className="card p-8">
          <h2 className="text-lg font-bold">계정으로 들어가기</h2>
          <p className="mt-1 text-sm text-[var(--color-dim)]">이메일을 입력하면 자동 가입/로그인 됩니다.</p>

          <form className="mt-5 space-y-3" onSubmit={submit}>
            <label className="label">이메일</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
            <Button type="submit" className="w-full"><Mail size={15} /> 이메일로 시작 <ArrowRight size={14} /></Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-[var(--color-faint)]">
            <div className="h-px flex-1 bg-[var(--color-line)]" /> 또는 <div className="h-px flex-1 bg-[var(--color-line)]" />
          </div>

          <Button variant="ghost" className="w-full" disabled>
            <KeyRound size={15} /> Google로 시작 (곧)
          </Button>

          <p className="mt-6 text-center text-xs text-[var(--color-faint)]">
            계정을 만들면 chchar 서비스 약관과 개인정보 처리방침에 동의합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
