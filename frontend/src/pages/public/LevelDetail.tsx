import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, Play, Copy, Send, ArrowLeft } from 'lucide-react'
import { useStudio } from '../../store/studio'
import { userById } from '../../mock/users'
import GamePlayer from '../../components/GamePlayer'
import Avatar from '../../ui/Avatar'
import Button from '../../ui/Button'
import Card from '../../ui/Card'
import EmptyState from '../../ui/EmptyState'

export default function LevelDetail() {
  const { id } = useParams()
  const lid = Number(id)
  const navigate = useNavigate()
  const level = useStudio((s) => s.levels.find((l) => l.id === lid))
  const allComments = useStudio((s) => s.comments)
  const comments = allComments.filter((c) => c.targetType === 'level' && c.targetId === lid)
  const isLiked = useStudio((s) => s.isLiked)
  const toggleLike = useStudio((s) => s.toggleLike)
  const addComment = useStudio((s) => s.addComment)
  const recordPlay = useStudio((s) => s.recordPlay)
  const forkLevel = useStudio((s) => s.forkLevel)
  const [text, setText] = useState('')

  useEffect(() => {
    if (lid) recordPlay(lid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lid])

  if (!level) return <EmptyState icon={Play} title="레벨을 찾을 수 없어요" />

  const owner = userById(level.ownerId)
  const liked = isLiked('level', lid)
  const fork = () => { forkLevel(lid); navigate('/studio/builder') }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-[var(--color-dim)] hover:text-[var(--color-ink)]">
        <ArrowLeft size={15} /> 뒤로
      </button>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* 플레이 */}
        <div className="aspect-video w-full overflow-hidden rounded-xl shadow-sm">
          <GamePlayer level={level} />
        </div>

        {/* 정보 + 댓글 */}
        <div className="space-y-4">
          <Card className="p-5">
            <h1 className="text-xl font-extrabold">{level.name}</h1>
            <button onClick={() => owner && navigate(`/u/${owner.handle}`)} className="mt-2 flex items-center gap-2">
              <Avatar name={level.ownerName} size={28} />
              <span className="text-sm font-medium">{level.ownerName}</span>
            </button>
            <p className="mt-3 text-sm text-[var(--color-dim)]">{level.description}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-[var(--color-faint)]">
              <span className="flex items-center gap-1"><Play size={14} /> {level.playCount}</span>
              <span className="flex items-center gap-1"><Heart size={14} /> {level.likeCount}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant={liked ? 'subtle' : 'ghost'} onClick={() => toggleLike('level', lid)} className="flex-1">
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> 좋아요
              </Button>
              <Button onClick={fork} className="flex-1"><Copy size={16} /> 내 스튜디오로 복제</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-sm font-bold">댓글 {comments.length}</h3>
            <div className="mb-3 flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) { addComment('level', lid, text.trim()); setText('') } }} placeholder="댓글 남기기…" className="input" />
              <Button onClick={() => { if (text.trim()) { addComment('level', lid, text.trim()); setText('') } }}><Send size={15} /></Button>
            </div>
            <div className="space-y-3">
              {comments.length === 0 && <p className="text-sm text-[var(--color-faint)]">첫 댓글을 남겨보세요.</p>}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.userName} src={c.avatarUrl} size={30} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold">{c.userName}</div>
                    <div className="text-sm text-[var(--color-dim)]">{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
