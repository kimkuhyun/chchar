/* ============================================================
   좌표 1:1 계약 (DESIGN.md §5 정합 리스크 해소)
   ------------------------------------------------------------
   S5 씬 조립기(드래그 배치)와 S6 Phaser 플레이가 *동일한 월드 좌표계*를
   쓰도록 강제하는 단일 소스. 둘 다 이 모듈만 사용한다.

   규약:
   - 월드 좌표 = 픽셀, 원점 = 좌상단(0,0), Y축 = 아래로 증가(Phaser/DOM 동일)
   - TILE = 32px 그리드. 배치는 스냅됨.
   - 플랫폼/스파이크/에너미 placement 의 (x,y) = *좌상단* 모서리(world px).
     → S5 렌더, S6 Phaser 모두 origin(0,0) 기준으로 배치 ⇒ 화면 일치.
   - 캐릭터 앵커(anchorX/anchorY, 0..1) = 발 중심. Phaser setOrigin(anchorX,anchorY).
   ============================================================ */

export const TILE = 32

/** 값을 그리드에 스냅 */
export const snap = (v: number, size: number = TILE): number =>
  Math.round(v / size) * size

/** 에디터: 포인터(클라이언트 좌표) → 월드 좌표.
 *  displayScale = 에디터가 월드를 화면에 그리는 배율(보통 fit-to-width). */
export function pointerToWorld(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  displayScale: number,
): { x: number; y: number } {
  return {
    x: (clientX - rect.left) / displayScale,
    y: (clientY - rect.top) / displayScale,
  }
}

/** 월드 좌표 → 에디터 화면 좌표(미리보기 배치용) */
export function worldToDisplay(
  wx: number,
  wy: number,
  displayScale: number,
): { x: number; y: number } {
  return { x: wx * displayScale, y: wy * displayScale }
}

/** 포인터 → 스냅된 월드 좌표(배치 확정용) */
export function snapPointerToWorld(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  displayScale: number,
  size: number = TILE,
): { x: number; y: number } {
  const w = pointerToWorld(clientX, clientY, rect, displayScale)
  return { x: snap(w.x, size), y: snap(w.y, size) }
}

/** 월드를 주어진 폭에 맞추는 배율 */
export const fitScale = (worldW: number, viewW: number): number =>
  viewW / worldW

/** 값 범위 제한 */
export const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v))
