import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, LogOut, Check } from 'lucide-react'
import { useStudio } from '../../store/studio'
import { userById } from '../../mock/users'
import PageHeader from '../../ui/PageHeader'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Avatar from '../../ui/Avatar'
import Badge from '../../ui/Badge'

export default function Settings() {
  const navigate = useNavigate()
  const uid = useStudio((s) => s.currentUserId)
  const logout = useStudio((s) => s.logout)
  const user = uid ? userById(uid) : null
  const [name, setName] = useState(user?.displayName ?? '')
  const [saved, setSaved] = useState(false)
  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 md:px-10">
      <PageHeader eyebrow="계정" icon={SettingsIcon} title="설정" />

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.displayName} src={user.avatarUrl} size={64} />
          <div>
            <div className="flex items-center gap-2"><span className="font-bold">{user.displayName}</span><Badge color={user.plan === 'pro' ? '#6d5efc' : undefined}>{user.plan === 'pro' ? 'Pro' : 'Free'}</Badge></div>
            <div className="text-sm text-[var(--color-faint)]">@{user.handle}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><label className="label">표시 이름</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="label">이메일</label><input className="input" value={user.email} disabled /></div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button variant={saved ? 'subtle' : 'primary'} onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1500) }}>{saved ? <><Check size={16} /> 저장됨</> : '저장'}</Button>
        </div>
      </Card>

      <Card className="mt-5 flex items-center justify-between p-5">
        <div><div className="font-semibold">로그아웃</div><div className="text-sm text-[var(--color-faint)]">데모 계정에서 나갑니다.</div></div>
        <Button variant="danger" onClick={() => { logout(); navigate('/') }}><LogOut size={16} /> 로그아웃</Button>
      </Card>
    </div>
  )
}
