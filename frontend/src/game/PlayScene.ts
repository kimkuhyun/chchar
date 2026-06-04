import Phaser from 'phaser'
import type { Level } from '../types'

export interface PlaySceneData {
  scene: Level
  charSprite: string
  bgSprite: string | null
  onWin: () => void
  onLose: () => void
  onLife: (lives: number) => void
}

/** sprite URL → 안전한 텍스처 키 */
const keyFor = (url: string) => 'tex_' + url.replace(/[^a-z0-9]/gi, '_')
const GOAL = '/sample-assets/flag.svg'

export default class PlayScene extends Phaser.Scene {
  private payload!: PlaySceneData
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keyW!: Phaser.Input.Keyboard.Key
  private keyA!: Phaser.Input.Keyboard.Key
  private keyD!: Phaser.Input.Keyboard.Key
  private keyJ!: Phaser.Input.Keyboard.Key
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private hazards!: Phaser.Physics.Arcade.StaticGroup
  private enemies!: Phaser.Physics.Arcade.Group
  private sword!: Phaser.GameObjects.Rectangle
  private facing = 1
  private lives = 3
  private invulnUntil = 0
  private attackUntil = 0
  private finished = false

  constructor() {
    super('play')
  }

  init(data: PlaySceneData) {
    this.payload = data
    this.lives = 3
    this.facing = 1
    this.invulnUntil = 0
    this.attackUntil = 0
    this.finished = false
  }

  preload() {
    const { scene, charSprite, bgSprite } = this.payload
    const { canvasW, canvasH } = scene.config
    if (bgSprite) this.load.svg(keyFor(bgSprite), bgSprite, { width: canvasW, height: canvasH })
    this.load.svg(keyFor(charSprite), charSprite, { width: 32, height: 40 })
    this.load.svg('tex_goal', GOAL, { width: 32, height: 48 })
    const seen = new Set<string>()
    for (const p of scene.placements) {
      if (seen.has(p.sprite)) continue
      seen.add(p.sprite)
      this.load.svg(keyFor(p.sprite), p.sprite, { width: Math.round(p.w), height: Math.round(p.h) })
    }
  }

  create() {
    const { scene, charSprite, bgSprite } = this.payload
    const { canvasW, canvasH, gravity, jump } = scene.config

    this.physics.world.setBounds(0, 0, canvasW, canvasH)
    this.physics.world.gravity.y = gravity

    if (bgSprite) {
      this.add.image(0, 0, keyFor(bgSprite)).setOrigin(0, 0).setDisplaySize(canvasW, canvasH).setDepth(-10)
    }

    this.platforms = this.physics.add.staticGroup()
    this.hazards = this.physics.add.staticGroup()
    this.enemies = this.physics.add.group()

    for (const p of scene.placements) {
      if (p.kind === 'platform') {
        const img = this.platforms.create(p.x, p.y, keyFor(p.sprite)) as Phaser.Physics.Arcade.Sprite
        img.setOrigin(0, 0).setDisplaySize(p.w, p.h).refreshBody()
      } else if (p.kind === 'spike') {
        const s = this.hazards.create(p.x, p.y, keyFor(p.sprite)) as Phaser.Physics.Arcade.Sprite
        s.setOrigin(0, 0).setDisplaySize(p.w, p.h).refreshBody()
        ;(s.body as Phaser.Physics.Arcade.StaticBody).setSize(p.w, p.h * 0.5).setOffset(0, p.h * 0.5)
      } else if (p.kind === 'enemy') {
        const fly = p.sprite.includes('bat')
        const e = this.physics.add.sprite(p.x + p.w / 2, p.y + p.h / 2, keyFor(p.sprite))
        e.setDisplaySize(p.w, p.h)
        e.setData('homeX', p.x)
        e.setData('fly', fly)
        e.setVelocityX(fly ? 70 : 55)
        ;(e.body as Phaser.Physics.Arcade.Body).setAllowGravity(!fly)
        this.enemies.add(e)
      }
    }

    // 플레이어
    const st = scene.playerStart
    this.player = this.physics.add.sprite(st.x, st.y, keyFor(charSprite))
    this.player.setOrigin(0.5, 1)
    this.player.setCollideWorldBounds(false)
    ;(this.player.body as Phaser.Physics.Arcade.Body).setSize(22, 38).setOffset(5, 2)
    this.player.setDepth(5)

    // 골 존
    this.add.image(scene.goal.x, scene.goal.y, 'tex_goal').setOrigin(0.5, 1).setDepth(4)
    const goalZone = this.add.zone(scene.goal.x, scene.goal.y - 24, 40, 64)
    this.physics.add.existing(goalZone, true)

    // 검 히트박스(보이는 연출)
    this.sword = this.add.rectangle(0, 0, 26, 30, 0x4deeea, 0.5).setVisible(false).setDepth(6)

    // 충돌
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.enemies, this.platforms)
    this.physics.add.overlap(this.player, this.hazards, () => this.killPlayer())
    this.physics.add.overlap(this.player, this.enemies, (_pl, en) => {
      if (this.time.now < this.attackUntil) this.killEnemy(en as Phaser.Physics.Arcade.Sprite)
      else this.killPlayer()
    })
    this.physics.add.overlap(this.player, goalZone, () => this.reachGoal())

    // 입력
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keyW = this.input.keyboard!.addKey('W')
    this.keyA = this.input.keyboard!.addKey('A')
    this.keyD = this.input.keyboard!.addKey('D')
    this.keyJ = this.input.keyboard!.addKey('J')

    this.player.setData('jump', jump)
    this.payload.onLife(this.lives)
  }

  private killEnemy(e: Phaser.Physics.Arcade.Sprite) {
    if (!e.active) return
    e.disableBody(true, false)
    this.tweens.add({ targets: e, scaleX: 0, scaleY: 0, alpha: 0, duration: 180, onComplete: () => e.destroy() })
  }

  private killPlayer() {
    if (this.finished || this.time.now < this.invulnUntil) return
    this.lives -= 1
    this.payload.onLife(Math.max(0, this.lives))
    if (this.lives <= 0) {
      this.finished = true
      this.player.setTint(0xff4d6d)
      this.player.setVelocity(0, 0)
      ;(this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
      this.payload.onLose()
      return
    }
    // 리스폰
    this.invulnUntil = this.time.now + 1200
    const st = this.payload.scene.playerStart
    this.player.setPosition(st.x, st.y)
    this.player.setVelocity(0, 0)
    this.tweens.add({ targets: this.player, alpha: 0.3, yoyo: true, repeat: 4, duration: 120, onComplete: () => this.player.setAlpha(1) })
  }

  private reachGoal() {
    if (this.finished) return
    this.finished = true
    this.player.setVelocity(0, 0)
    this.payload.onWin()
  }

  private doAttack() {
    this.attackUntil = this.time.now + 220
    const x = this.player.x + this.facing * 22
    const y = this.player.y - 20
    this.sword.setPosition(x, y).setVisible(true)
    this.time.delayedCall(160, () => this.sword.setVisible(false))
    const rect = new Phaser.Geom.Rectangle(x - 13, y - 15, 26, 30)
    this.enemies.getChildren().forEach((obj) => {
      const e = obj as Phaser.Physics.Arcade.Sprite
      if (e.active && Phaser.Geom.Intersects.RectangleToRectangle(rect, e.getBounds())) this.killEnemy(e)
    })
  }

  update() {
    if (this.finished) {
      this.player.setVelocityX(0)
      return
    }
    const speed = this.payload.scene.config.speed
    const jump = this.player.getData('jump') as number
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const left = this.cursors.left.isDown || this.keyA.isDown
    const right = this.cursors.right.isDown || this.keyD.isDown
    const up = this.cursors.up.isDown || this.keyW.isDown
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keyW) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space)

    if (left && !right) {
      this.player.setVelocityX(-speed)
      this.facing = -1
      this.player.setFlipX(true)
    } else if (right && !left) {
      this.player.setVelocityX(speed)
      this.facing = 1
      this.player.setFlipX(false)
    } else {
      this.player.setVelocityX(0)
    }
    void up

    if (jumpPressed && body.blocked.down) this.player.setVelocityY(-jump)
    if (Phaser.Input.Keyboard.JustDown(this.keyJ)) this.doAttack()

    // 낙사
    if (this.player.y > this.payload.scene.config.canvasH + 60) this.killPlayer()

    // 에너미 AI
    this.enemies.getChildren().forEach((obj) => {
      const e = obj as Phaser.Physics.Arcade.Sprite
      if (!e.active) return
      const home = e.getData('homeX') as number
      const fly = e.getData('fly') as boolean
      const sp = fly ? 70 : 55
      if (e.x < home - 90) e.setVelocityX(sp)
      else if (e.x > home + 90) e.setVelocityX(-sp)
      e.setFlipX((e.body as Phaser.Physics.Arcade.Body).velocity.x < 0)
      if (fly) e.setVelocityY(Math.sin(this.time.now / 280 + home) * 40)
    })
  }
}
