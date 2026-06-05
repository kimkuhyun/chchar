# chchar — paper-doll Pawn 크리에이티브 SaaS (프론트 목업)

분리된 **투명 파츠(atlas)** 를 타원 몸체에 얹어 **Pawn**(paper-doll 캐릭터)을 조립하고,
방향은 8장 이미지가 아니라 **방향별 레이어/좌표/스케일 규칙**으로, 모션은 코드로 표현하는
크리에이티브 SaaS. (RimWorld·Battle Brothers·Wildermyth·Armello 톤)

- **생성(추론)** = 사용자 **브라우저 WebGPU** (web-stable-diffusion / transformers.js / onnxruntime-web). 무설치·즉시·안전.
- **워크플로우 정의·라이브러리·조립·저장·소셜** = 서버.
- 타깃 환경 = 일반 사용자 **VRAM 8GB** → SD1.5 / LCM / SDXL-Turbo 양자화 (FLUX·대형 모델 제외).
- **이 저장소는 화면(프론트엔드)만, 전부 목업 데이터로 구현된 단계.** (백엔드·WebGPU 추론·인증·스토리지 미연동)

## 산출물

| 경로 | 내용 |
|---|---|
| `frontend/` | Vite + React 19 + TS + Tailwind v4 + framer-motion + zustand + React Router 7. 디자인 시스템 "Studio Light" |
| `docs/SCREENS.md` | 전체 화면 설계(공개+스튜디오) + DB 12테이블 1:1 매핑 + WebGPU 미지원 동작 매트릭스 |
| `docs/ERD.md` | 서비스 DB v5 ERD(12테이블) + 역할 분담 + 생성/조립 흐름 |
| `docs/screens/` | 주요 화면 스크린샷 |
| `backend/models.py` | SQLModel 12테이블 (MariaDB 대상, 참고용) |

## 화면 (2영역)

**공개** (비로그인 OK) — WebGPU 불필요
`/` 랜딩 · `/explore` Pawn 탐색 · `/explore/parts` 파츠 · `/explore/scenes` 씬 · `/pawn/:id` Pawn 상세 · `/scene/:id` 씬 상세+플레이 · `/u/:handle` 프로필 · `/login`

**스튜디오** (`/studio/*`, 로그인)
온보딩 게이트 · 대시보드 · 파츠 생성 · 슬라이서 · 파츠 라이브러리 · Pawn 에디터 · 내 Pawn · 씬 빌더 · 내 씬 · 설정

## 실행

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

데모 편의 쿼리스트링: `?gpu=ok | no-webgpu | no-adapter` 로 WebGPU 환경 강제.

## 핵심 구조
- **클라우드 DB**(MariaDB) = 계정·파츠/Pawn/씬 메타·소셜 / **브라우저 WebGPU** = 추론 / **오브젝트 스토리지**(S3/R2) = 결과 PNG
- 생성 흐름: 서버에서 workflow 정의·모델 URL 수신 → 브라우저가 가중치 캐시(IndexedDB) → WebGPU 추론 → RMBG 투명화 → presigned URL 업로드 → `asset_part` 행
- 조립: `pawn_template`(슬롯+방향규칙) + 파츠 → `pawn.composition`. 방향=`direction_rules`, 모션=코드(PawnCanvas)
- 배치: `scene.placements`에 pawn/tile/prop 좌표 → 장르별(클릭·디펜스·서바이버·탑다운RPG·전술) 플레이·공유

## 핵심 엔티티 (12테이블)
`user` · `oauth_account` · `workflow` · **`asset_part`**(파츠 원자) · **`pawn`**(조립체) · **`pawn_template`**(방향 규칙) · `tag` · `part_tag` · `scene` · `like` · `comment` · `play_record`

## ⚠ 목업 범위 (실제 아님)
- 파츠 = 플레이스홀더 SVG(`frontend/src/mock/svg.ts`)
- "생성" = `store/studio.ts`의 setTimeout 시뮬레이션 (실제 WebGPU 추론 없음)
- 모델 다운로드/캐시 = localStorage 시뮬레이션 (`lib/modelCache.ts`)
- 로그인·좋아요·댓글·공개설정 = 클라이언트 상태
- 다음 단계: ① WebGPU 추론 PoC ② 백엔드(MariaDB·인증·CRUD·presigned URL)
