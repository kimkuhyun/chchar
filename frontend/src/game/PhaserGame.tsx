import { useLayoutEffect, useRef } from 'react'
import Phaser from 'phaser'
import PlayScene, { type PlaySceneData } from './PlayScene'

/** Phaser 인스턴스를 1회만 생성하는 브리지. 재시작은 부모가 key 로 리마운트. */
export default function PhaserGame({ data }: { data: PlaySceneData }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useLayoutEffect(() => {
    if (!containerRef.current || gameRef.current) return
    const { canvasW, canvasH, gravity } = data.scene.config

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: canvasW,
      height: canvasH,
      backgroundColor: '#0b1020',
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: gravity }, debug: false },
      },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    })
    gameRef.current = game
    game.scene.add('play', PlayScene, true, data)
    if (import.meta.env.DEV) (window as unknown as { __chchar?: Phaser.Game }).__chchar = game

    return () => {
      game.destroy(true)
      gameRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} className="grid h-full w-full place-items-center" />
}
