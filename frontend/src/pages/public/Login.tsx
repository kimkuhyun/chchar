import { useNavigate } from 'react-router-dom'
import { Wand2, ArrowLeft } from 'lucide-react'
import { useStudio } from '../../store/studio'
import Button from '../../ui/Button'
import Card from '../../ui/Card'

export default function Login() {
  const navigate = useNavigate()
  const login = useStudio((s) => s.login)
  const go = () => {
    login()
    navigate('/studio')
  }
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate('/')} className="mb-4 flex items-center gap-1 text-sm text-[var(--color-dim)] hover:text-[var(--color-ink)]">
          <ArrowLeft size={15} /> 홈으로
        </button>
        <Card className="p-8 text-center">
          <div className="brand-bg mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg">
            <Wand2 size={26} />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">chchar 시작하기</h1>
          <p className="mt-2 text-sm text-[var(--color-dim)]">
            아이디어 한 줄로 픽셀 게임을 만들고 공유하세요.
          </p>
          <Button onClick={go} variant="ghost" className="mt-6 w-full">
            <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9c-.3 1.4-1 2.5-2.2 3.3v2.8h3.6c2.1-2 3.2-4.8 3.2-8z"/><path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.9C4.1 20.6 7.8 23 12 23z"/><path fill="#FBBC05" d="M6 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7H2.3C1.5 8.5 1 10.2 1 12s.5 3.5 1.3 5z"/><path fill="#EA4335" d="M12 5.5c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.8 1 4.1 3.4 2.3 7l3.7 2.9c.9-2.6 3.2-4.4 6-4.4z"/></svg>
            Google로 계속하기
          </Button>
          <p className="mt-3 text-xs text-[var(--color-faint)]">
            목업 — 클릭하면 데모 계정(김구현)으로 로그인됩니다.
          </p>
        </Card>
      </div>
    </div>
  )
}
