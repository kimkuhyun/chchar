import { useCallback, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, RotateCcw, Trophy, Skull } from 'lucide-react'
import type { Level } from '../types'
import { assetById } from '../mock/assets'
import PhaserGame from '../game/PhaserGame'
import type { PlaySceneData } from '../game/PlayScene'
import Button from '../ui/Button'

/** 게임 플레이어 — 공개 레벨상세 + 스튜디오 플레이 공용. 부모가 크기 지정. */
export default function GamePlayer({ level }: { level: Level }) {
  const char = assetById(level.characterAssetId ?? -1)
  const bg = assetById(level.backgroundAssetId ?? -1)
  const [runId, setRunId] = useState(0)
  const [status, setStatus] = useState<'playing' | 'win' | 'lose'>('playing')
  const [lives, setLives] = useState(3)

  const restart = () => { setStatus('playing'); setLives(3); setRunId((n) => n + 1) }
  const onWin = useCallback(() => setStatus('win'), [])
  const onLose = useCallback(() => setStatus('lose'), [])
  const onLife = useCallback((n: number) => setLives(n), [])

  const data: PlaySceneData | null = useMemo(
    () =>
      char
        ? { scene: level, charSprite: char.processedUrl, bgSprite: bg?.processedUrl ?? null, onWin, onLose, onLife }
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [char, bg, level, runId],
  )

  if (!char) {
    return (
      <div className="grid h-full w-full place-items-center rounded-xl bg-[#15192e] text-white/70">
        캐릭터가 지정되지 않았습니다.
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#15192e]">
      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3">
        <div className="flex items-center gap-1 rounded-lg bg-black/30 px-3 py-1.5 backdrop-blur">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} size={16} className={i < lives ? 'text-[#ff5470]' : 'text-white/20'} fill={i < lives ? 'currentColor' : 'none'} />
          ))}
        </div>
        <div className="rounded-lg bg-black/30 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur">
          이동 ← → · 점프 Space · 검 J
        </div>
        <button onClick={restart} className="pointer-events-auto flex items-center gap-1 rounded-lg bg-black/30 px-3 py-1.5 text-[12px] text-white/80 backdrop-blur transition hover:text-white">
          <RotateCcw size={13} /> 다시
        </button>
      </div>

      {/* 게임 */}
      <div className="absolute inset-0 grid place-items-center p-2">
        <div className="aspect-video max-h-full w-full max-w-[1280px]">
          {data && <PhaserGame key={runId} data={data} />}
        </div>
      </div>

      {/* 승패 */}
      <AnimatePresence>
        {status !== 'playing' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 grid place-items-center bg-black/55 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.85, y: 16 }} animate={{ scale: 1, y: 0 }} className="card w-[min(88vw,360px)] p-7 text-center">
              {status === 'win' ? (
                <>
                  <Trophy size={42} className="mx-auto text-[var(--color-success)] anim-float" />
                  <h2 className="mt-3 text-2xl font-extrabold brand-text">클리어!</h2>
                  <p className="mt-1.5 text-sm text-[var(--color-dim)]">멋진 플레이였어요.</p>
                </>
              ) : (
                <>
                  <Skull size={42} className="mx-auto text-[var(--color-danger)]" />
                  <h2 className="mt-3 text-2xl font-extrabold text-[var(--color-danger)]">게임 오버</h2>
                  <p className="mt-1.5 text-sm text-[var(--color-dim)]">함정과 에너미를 조심하세요.</p>
                </>
              )}
              <Button onClick={restart} className="mt-5 w-full"><RotateCcw size={16} /> 다시 플레이</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
