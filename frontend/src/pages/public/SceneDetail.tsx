import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Play, Heart, Copy, Send } from 'lucide-react'
import Button from '../../ui/Button'
import Avatar from '../../ui/Avatar'
import Badge from '../../ui/Badge'
import EmptyState from '../../ui/EmptyState'
import SceneStage from '../../components/SceneStage'
import { useStudio } from '../../store/studio'
import { SCENE_GENRE_LABEL } from '../../types'
import { fmtTimeAgo } from '../../lib/format'
import { commentsFor } from '../../mock/comments'

export default function SceneDetail() {
  const { id: idStr } = useParams()
  const navigate = useNavigate()
  const id = Number(idStr)
  const scene = useStudio((s) => s.scenes.find((sc) => sc.id === id))
  const user = useStudio((s) => s.currentUser)
  const liked = useStudio((s) => s.isLiked('scene', id))
  const toggleLike = useStudio((s) => s.toggleLike)
  const fork = useStudio((s) => s.forkScene)
  const addComment = useStudio((s) => s.addComment)
  const recordPlay = useStudio((s) => s.recordPlay)
  const [playing, setPlaying] = useState(false)
  const [body, setBody] = useState('')

  useEffect(() => { if (playing) recordPlay(id) }, [playing, id, recordPlay])

  if (!scene) {
    return <EmptyState icon={ArrowLeft} title="씬을 찾을 수 없어요" action={<Link to="/explore/scenes"><Button>탐색으로</Button></Link>} />
  }

  const cmts = commentsFor('scene', id)

  return (
    <div>
      <Link to="/explore/scenes" className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-dim)] hover:text-[var(--color-primary)]">
        <ArrowLeft size={14} /> 씬 탐색으로
      </Link>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div>
          <div className="card overflow-hidden">
            <SceneStage scene={scene} fit animate={playing ? 'walk' : 'idle'} />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setPlaying((v) => !v)}>
              <Play size={15} /> {playing ? '멈추기' : '플레이'}
            </Button>
            <Button variant={liked ? 'subtle' : 'ghost'} onClick={() => toggleLike('scene', id)}>
              <Heart size={15} /> {scene.likeCount}
            </Button>
            <Button variant="ghost" onClick={() => { const nid = fork(id); navigate(`/studio/scene/${nid}`) }}>
              <Copy size={15} /> 복제
            </Button>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 text-lg font-bold">댓글 {cmts.length}</h2>
            <div className="card mb-3 p-3">
              <div className="flex items-start gap-2">
                {user && <Avatar name={user.displayName} src={user.avatarUrl} size={32} />}
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={user ? '플레이 후 한 줄 남기기' : '댓글은 로그인 후'}
                  disabled={!user}
                  rows={2}
                  className="textarea flex-1"
                />
                <Button size="sm" disabled={!user || !body.trim()} onClick={() => { addComment('scene', id, body.trim()); setBody('') }}>
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
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <Badge color="#6d5efc">{SCENE_GENRE_LABEL[scene.genre]}</Badge>
            <h1 className="mt-2 text-xl font-bold">{scene.name}</h1>
            <p className="mt-1 text-sm text-[var(--color-dim)]">{scene.description || '설명이 없어요'}</p>
            <div className="mt-3 text-xs text-[var(--color-dim)]">
              by <Link className="text-[var(--color-primary)]" to={`/u/${scene.ownerName}`}>{scene.ownerName}</Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface2)] py-2">
                <div className="text-[var(--color-faint)]">플레이</div>
                <div className="font-bold text-[var(--color-ink)]">{scene.playCount.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface2)] py-2">
                <div className="text-[var(--color-faint)]">배치</div>
                <div className="font-bold text-[var(--color-ink)]">{scene.placements.length}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
