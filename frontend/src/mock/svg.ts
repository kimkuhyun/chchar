/* ============================================================
   Mock 파츠 SVG 생성기 — 화면 디자인 데모용
   실제 생성된 PNG 대신, paper-doll 합성이 보이는 단순한 모양을 만든다.
   ============================================================ */

const enc = (s: string) => `data:image/svg+xml;utf8,` + encodeURIComponent(s)

/** 64x64 컨테이너로 통일 (PawnCanvas가 anchor·scale 적용) */
export const PART_SIZE = 64

/* ── 단색 도형 베이스 ── */
const wrap = (inner: string, w = PART_SIZE, h = PART_SIZE) =>
  enc(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`)

/* 캐릭터 파츠들 — 모두 32,40 근처에 중심을 두어 PawnCanvas 합성시 자연스럽게 겹친다 */

export const svgBody = (color = '#c8a07a') =>
  wrap(`<ellipse cx="32" cy="40" rx="14" ry="18" fill="${color}"/>`)

export const svgShadow = () =>
  wrap(`<ellipse cx="32" cy="58" rx="14" ry="3.5" fill="rgba(0,0,0,0.28)"/>`)

export const svgFaceFront = (skin = '#f4d3b8') =>
  wrap(`<circle cx="32" cy="28" r="10" fill="${skin}"/>
        <circle cx="29" cy="28" r="1.5" fill="#1b2140"/><circle cx="35" cy="28" r="1.5" fill="#1b2140"/>
        <path d="M29 32 Q32 34 35 32" stroke="#1b2140" stroke-width="1" fill="none" stroke-linecap="round"/>`)

export const svgFaceSide = (skin = '#f4d3b8') =>
  wrap(`<path d="M22 22 Q40 18 40 30 Q40 40 26 38 Z" fill="${skin}"/>
        <circle cx="33" cy="28" r="1.5" fill="#1b2140"/>`)

export const svgFaceBack = (hair = '#3a2f1f') =>
  wrap(`<path d="M22 22 Q40 18 42 32 Q40 42 24 38 Z" fill="${hair}"/>`)

export const svgHairFront = (color = '#3a2f1f') =>
  wrap(`<path d="M22 24 Q22 12 32 12 Q42 12 42 24 Q38 16 32 16 Q26 16 22 24 Z" fill="${color}"/>`)

export const svgHairSide = (color = '#3a2f1f') =>
  wrap(`<path d="M20 22 Q22 12 34 12 Q42 16 42 26 Q34 20 28 20 Q22 22 20 22 Z" fill="${color}"/>`)

export const svgHairBack = (color = '#3a2f1f') =>
  wrap(`<path d="M22 20 Q22 10 32 10 Q42 10 42 22 L42 38 Q32 36 22 38 Z" fill="${color}"/>`)

export const svgHelmetFront = (color = '#7c8295', accent = '#15c2e8') =>
  wrap(`<path d="M22 22 Q22 10 32 10 Q42 10 42 22 L42 26 L22 26 Z" fill="${color}"/>
        <path d="M22 22 L42 22" stroke="${accent}" stroke-width="1.4"/>`)

export const svgHelmetSide = (color = '#7c8295') =>
  wrap(`<path d="M20 22 Q22 10 36 12 Q42 16 42 26 L20 26 Z" fill="${color}"/>`)

export const svgHelmetBack = (color = '#7c8295') =>
  wrap(`<path d="M22 22 Q22 10 32 10 Q42 10 42 22 L42 28 L22 28 Z" fill="${color}"/>`)

export const svgWeaponSword = (color = '#c9d2e3', grip = '#6d4a2a') =>
  wrap(`<rect x="30" y="6" width="4" height="36" rx="1" fill="${color}"/>
        <rect x="25" y="42" width="14" height="3" rx="1" fill="${color}"/>
        <rect x="30" y="45" width="4" height="10" rx="1" fill="${grip}"/>`)

export const svgWeaponBow = (color = '#7a4b22') =>
  wrap(`<path d="M22 14 Q44 32 22 50" stroke="${color}" stroke-width="3" fill="none"/>
        <line x1="22" y1="14" x2="22" y2="50" stroke="#e7e9f3" stroke-width="0.8"/>`)

export const svgWeaponStaff = (color = '#6d4a2a', orb = '#8a7bff') =>
  wrap(`<rect x="30" y="14" width="4" height="42" rx="1" fill="${color}"/>
        <circle cx="32" cy="12" r="6" fill="${orb}"/>`)

export const svgShield = (color = '#6d5efc', rim = '#1b2140') =>
  wrap(`<path d="M16 18 Q32 14 48 18 L48 32 Q32 50 16 32 Z" fill="${color}"/>
        <path d="M16 18 Q32 14 48 18 L48 32 Q32 50 16 32 Z" fill="none" stroke="${rim}" stroke-width="1"/>`)

export const svgCape = (color = '#ff5470') =>
  wrap(`<path d="M16 30 L48 30 L52 58 L12 58 Z" fill="${color}"/>`)

export const svgFactionMark = (color = '#15c2e8') =>
  wrap(`<path d="M32 36 L36 44 L44 45 L38 50 L40 58 L32 54 L24 58 L26 50 L20 45 L28 44 Z" fill="${color}"/>`)

/* 월드 파츠 */
export const svgTileGrass = () =>
  wrap(`<rect width="64" height="64" fill="#84c97a"/>
        <path d="M0 18 L64 18" stroke="#5fa653" stroke-width="2"/>
        <circle cx="14" cy="34" r="2" fill="#5fa653"/><circle cx="44" cy="42" r="2" fill="#5fa653"/>`)
export const svgTileStone = () =>
  wrap(`<rect width="64" height="64" fill="#9aa0bd"/>
        <path d="M0 0 L64 0 M0 32 L64 32 M0 64 L64 64 M32 0 L32 64" stroke="#7e83a4" stroke-width="2"/>`)
export const svgTileSand = () =>
  wrap(`<rect width="64" height="64" fill="#f0d28a"/>
        <circle cx="20" cy="20" r="2" fill="#d6b269"/><circle cx="44" cy="38" r="2" fill="#d6b269"/><circle cx="28" cy="48" r="2" fill="#d6b269"/>`)
export const svgTileWood = () =>
  wrap(`<rect width="64" height="64" fill="#b78b5a"/>
        <path d="M0 12 L64 12 M0 28 L64 28 M0 44 L64 44 M0 60 L64 60" stroke="#8a6238" stroke-width="1.5"/>`)

export const svgPropBarrel = () =>
  wrap(`<rect x="20" y="14" width="24" height="40" rx="4" fill="#8a6238"/>
        <path d="M20 22 L44 22 M20 36 L44 36 M20 50 L44 50" stroke="#5a3e1d" stroke-width="1.5"/>`)
export const svgPropTree = () =>
  wrap(`<rect x="28" y="36" width="8" height="22" fill="#6d4a2a"/>
        <circle cx="32" cy="26" r="16" fill="#65b75f"/>`)
export const svgPropChest = () =>
  wrap(`<rect x="14" y="28" width="36" height="26" rx="2" fill="#8a6238"/>
        <path d="M14 28 Q14 14 32 14 Q50 14 50 28" fill="#c08552"/>
        <rect x="30" y="32" width="4" height="8" fill="#f5c34a"/>`)
export const svgPropTorch = () =>
  wrap(`<rect x="30" y="28" width="4" height="32" fill="#6d4a2a"/>
        <path d="M26 22 Q32 8 38 22 Q32 28 26 22 Z" fill="#ff8a3d"/>
        <path d="M28 22 Q32 14 36 22 Q32 26 28 22 Z" fill="#ffd24d"/>`)
export const svgEffectSpark = () =>
  wrap(`<g fill="#ffd24d" opacity="0.9">
          <circle cx="32" cy="32" r="3"/>
          <path d="M32 14 L34 28 L32 30 L30 28 Z"/>
          <path d="M32 50 L34 36 L32 34 L30 36 Z"/>
          <path d="M14 32 L28 30 L30 32 L28 34 Z"/>
          <path d="M50 32 L36 30 L34 32 L36 34 Z"/>
        </g>`)
