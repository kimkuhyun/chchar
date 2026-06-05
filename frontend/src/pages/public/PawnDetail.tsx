import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Heart, Copy, ArrowLeft, Send } from 'lucide-react'
import Button from '../../ui/Button'
import Avatar from '../../ui/Avatar'
import EmptyState from '../../ui/EmptyState'
import PawnCanvas from '../../components/PawnCanvas'
import { useStudio } from '../../store/studio'
import { fmtTimeAgo } from '../../lib/format'
import { commentsFor } from '../../mock/comments'

export default function PawnDetail() {
  const { id: idStr } = useParams()
  const navigate = useNavigate()
  const id = Number(idStr)
  const pawn = useStudio((s) => s.pawns.find((p) => p.id === id))
  const template = useStudio((s) => s.pawnTemplates.find((t) => t.id === pawn?.templateId))
  const user = useStudio((s) => s.currentUser)
  const liked = useStudio((s) => s.isLiked('pawn', id))
  const toggleLike = useStudio((s) => s.toggleLike)
  const fork = useStudio((s) => s.forkPawn)
  const addComment = useStudio((s) => s.addComment)
  const [body, setBody] = useState('')

  if (!pawn || !template) {
    return <EmptyState icon={ArrowLeft} title="Pawn을 찾을 수 없어요" action={<Link to="/explore"><Button>둘러보기로</Button></Link>} />
  }

  const cmts = commentsFor('pawn', id)

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div>
        <Link to="/explore" className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-dim)] hover:text-[var(--color-primary)]">
          <ArrowLeft size={14} /> 탐색으로
        </Link>
        <div className="card p-8">
          <div className="grid place-items-center">
            <PawnCanvas pawn={pawn} template={template} size={280} animate="idle" showDirectionToggle bg="var(--color-surface2)" />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold">댓글 {cmts.length}</h2>
          <div className="card mb-3 p-3">
            <div className="flex items-start gap-2">
              {user && <Avatar name={user.displayName} src={user.avatarUrl} size={32} />}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={user ? '댓글을 남겨보세요' : '댓글은 로그인 후'}
                disabled={!user}
                rows={2}
                className="textarea flex-1"
              />
              <Button
                size="sm"
                disabled={!user || !body.trim()}
                onClick={() => { addComment('pawn', id, body.trim()); setBody('') }}
              >
                <Send size={14} />
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {cmts.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <Avatar name={c.userName} src={c.avatarUrl} size={32} />
                <div className="flex-1 rounded-xl border border-[var(--color-line)] bg-white p-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-faint)]">
                    <span className="font-semibold text-[var(--color-ink)]">{c.userName}</span>
                    <span>{fmtTimeAgo(c.createdAt)}</span>
                  </div>
                  <div className="mt-1 text-sm">{c.body}</div>
                </div>
              </div>
            ))}
            {!cmts.length && <p className="text-sm text-[var(--color-faint)]">첫 댓글을 남겨보세요.</p>}
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <h1 className="text-xl font-bold">{pawn.name}</h1>
          <div className="mt-1 text-sm text-[var(--color-dim)]">by {pawn.ownerName}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="badge badge-soft">템플릿: {template.name}</span>
            <span className="badge badge-soft">스케일 {pawn.scale}</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-full border" style={{ background: pawn.bodyColor, borderColor: 'var(--color-line)' }} />
            <span className="text-xs text-[var(--color-dim)]">몸체 {pawn.bodyColor}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-full border" style={{ background: pawn.factionColor, borderColor: 'var(--color-line)' }} />
            <span className="text-xs text-[var(--color-dim)]">진영 {pawn.factionColor}</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button onClick={() => toggleLike('pawn', id)} variant={liked ? 'subtle' : 'ghost'}>
              <Heart size={15} /> {pawn.likeCount}
            </Button>
            <Button onClick={() => { const nid = fork(id); navigate(`/studio/pawn/${nid}`) }}>
              <Copy size={15} /> 복제
            </Button>
          </div>
        </div>

        <div className="card p-5 text-sm text-[var(--color-dim)]">
          <div className="mb-2 font-semibold text-[var(--color-ink)]">구성</div>
          <ul className="space-y-1 text-xs">
            {Object.entries(pawn.composition).map(([slot, partId]) => (
              <li key={slot} className="flex justify-between gap-2">
                <span>{slot}</span>
                <span className="text-[var(--color-faint)]">#{partId}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
