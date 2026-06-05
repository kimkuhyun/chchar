import { useState } from 'react'
import { Settings as SettingsIcon, Cpu, HardDrive, Trash2, Download, LogOut, RefreshCw } from 'lucide-react'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import Avatar from '../../ui/Avatar'
import { useStudio } from '../../store/studio'
import { allWeights } from '../../mock/workflows'
import { cacheState, removeCached, clearCache, simulateDownload, markCached } from '../../lib/modelCache'
import { fmtBytes, fmtTimeAgo } from '../../lib/format'

export default function SettingsPage() {
  const user = useStudio((s) => s.currentUser)!
  const logout = useStudio((s) => s.logout)
  const cap = useStudio((s) => s.webgpu)
  const refreshReady = useStudio((s) => s.refreshModelsReady)

  const [, force] = useState(0)
  const tick = () => force((x) => x + 1)
  const weights = allWeights()
  const cache = cacheState(weights)
  const total = cache.filter((c) => c.cachedAt).reduce((a, b) => a + b.bytes, 0)

  return (
    <div className="p-6 md:p-8">
      <PageHeader eyebrow="환경" icon={SettingsIcon} title="설정" desc="프로필·로컬 모델 캐시·계정" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 프로필 */}
        <section className="card p-6">
          <h2 className="mb-4 text-base font-bold">프로필</h2>
          <div className="flex items-center gap-4">
            <Avatar name={user.displayName} src={user.avatarUrl} size={64} />
            <div className="space-y-1">
              <div className="text-lg font-bold">{user.displayName}</div>
              <div className="text-sm text-[var(--color-dim)]">@{user.handle}</div>
              <div className="text-xs text-[var(--color-faint)]">{user.email}</div>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            <div>
              <div className="label">표시 이름</div>
              <input className="input" defaultValue={user.displayName} disabled />
            </div>
            <div>
              <div className="label">handle</div>
              <input className="input" defaultValue={user.handle} disabled />
            </div>
            <div className="text-xs text-[var(--color-faint)]">프로필 편집은 백엔드 연결 후 활성화돼요</div>
          </div>
          <Button variant="danger" className="mt-4" onClick={logout}><LogOut size={14} /> 로그아웃</Button>
        </section>

        {/* 환경 */}
        <section className="card p-6">
          <h2 className="mb-4 text-base font-bold">환경</h2>
          <div className="space-y-3 text-sm">
            <Row icon={<Cpu size={14} className="text-[var(--color-primary)]" />} label="WebGPU">
              {cap?.level === 'ok' ? `OK (${cap.vendor ?? 'unknown'})` : cap?.level === 'no-webgpu' ? '미지원 브라우저' : cap?.level === 'no-adapter' ? '어댑터 없음' : '확인 중'}
            </Row>
            <Row icon={<HardDrive size={14} className="text-[var(--color-primary)]" />} label="추정 VRAM">
              {cap?.level === 'ok' ? `≈ ${cap.vramGuessGb}GB` : '—'}
            </Row>
            <Row label="플랜">{user.plan === 'pro' ? 'Pro' : 'Free'}</Row>
          </div>
        </section>

        {/* 로컬 모델 관리 */}
        <section className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-base font-bold">로컬 모델 관리</h2>
              <p className="text-xs text-[var(--color-dim)]">브라우저 IndexedDB에 저장된 모델 가중치. 합계 <b>{fmtBytes(total)}</b> 사용중</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { clearCache(); refreshReady(); tick() }}>
                <Trash2 size={13} /> 전부 비우기
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--color-line)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface2)] text-left text-xs text-[var(--color-faint)]">
                <tr>
                  <th className="px-4 py-2">모델</th>
                  <th className="px-4 py-2">종류</th>
                  <th className="px-4 py-2">용량</th>
                  <th className="px-4 py-2">상태</th>
                  <th className="px-4 py-2 text-right">작업</th>
                </tr>
              </thead>
              <tbody>
                {cache.map((c) => (
                  <tr key={c.key} className="border-t border-[var(--color-line)]">
                    <td className="px-4 py-2 font-semibold">{c.label}</td>
                    <td className="px-4 py-2 text-[var(--color-dim)]">{weights.find((w) => w.key === c.key)?.kind}</td>
                    <td className="px-4 py-2 text-[var(--color-dim)]">{fmtBytes(c.bytes)}</td>
                    <td className="px-4 py-2">
                      {c.cachedAt
                        ? <span className="badge" style={{ color: 'var(--color-success)', background: 'rgba(21,189,142,0.1)', border: '1px solid rgba(21,189,142,0.25)' }}>캐시됨 · {fmtTimeAgo(c.cachedAt)}</span>
                        : <span className="badge badge-soft">없음</span>}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {c.cachedAt
                        ? <button onClick={() => { removeCached(c.key); refreshReady(); tick() }} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[var(--color-faint)] hover:bg-[var(--color-surface2)] hover:text-[var(--color-danger)]"><Trash2 size={12} /> 삭제</button>
                        : <button onClick={async () => {
                            const w = weights.find((x) => x.key === c.key)
                            if (!w) return
                            await simulateDownload(w, () => {})
                            markCached(w); refreshReady(); tick()
                          }} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[var(--color-primary)] hover:bg-[var(--color-surface2)]"><Download size={12} /> 받기</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-[var(--color-faint)] inline-flex items-center gap-1">
            <RefreshCw size={11} /> 캐시 상태는 즉시 반영돼요.
          </div>
        </section>
      </div>
    </div>
  )
}

function Row({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-surface2)] px-3 py-2">
      <span className="flex items-center gap-2 text-[var(--color-dim)]">{icon}{label}</span>
      <span className="font-semibold">{children}</span>
    </div>
  )
}
