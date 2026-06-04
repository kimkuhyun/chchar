# chchar — AI 픽셀 게임 메이커 (서비스 프론트, 목업)

"텍스트 → 픽셀 에셋 생성 → 브라우저에서 조립 → 그 자리 플레이" 되는 게임 메이커 **서비스**.
**생성은 각 사용자의 개인 GPU(로컬 ComfyUI)** 에서 실행되고, 클라우드는 계정·메타·공유만 담당합니다.
**이 저장소는 화면(프론트엔드)만, 전부 목업 데이터로 구현된 단계.** (백엔드·ComfyUI·인증·스토리지 미연동)

## 산출물

| 경로 | 내용 |
|---|---|
| `frontend/` | Vite + React 19 + TS + Tailwind v4 + framer-motion + **Phaser 4** + zustand + React Router 7. 라이트 디자인 시스템 "Studio Light" |
| `docs/SCREENS.md` | 전체 화면 설계(공개+스튜디오) + DB 매핑 + 디자인 시스템 |
| `docs/ERD.md` | 서비스 DB v2 ERD(13테이블) + 상호검증 + 좌표 계약 |
| `docs/WORKFLOW_AND_MODELS.md` | 7800XT ComfyUI/모델/LangGraph 워크플로우 |
| `backend/models.py` | SQLModel 13테이블 스텁(참고용, 미실행) |
| `DESIGN.md` | 사용자 설계 확정본(원본) |

## 화면 (2영역)

**공개** (비로그인 OK)
`/` 랜딩 · `/explore` 레벨 탐색 · `/explore/assets` 에셋 탐색 · `/level/:id` 레벨상세+플레이 · `/u/:handle` 프로필 · `/login` 로그인

**스튜디오** (`/studio/*`, 로그인)
대시보드 · GPU연결 · 생성 · 큐 · 내 갤러리 · 에셋상세 · 씬 조립기 · 플레이 · 내 레벨 · 프리셋 · 설정 · 파이프라인

## 실행

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

데모는 김구현 계정으로 자동 로그인되어 스튜디오에 바로 들어갑니다.

## 핵심 구조
- **클라우드 DB** = 계정·에셋 메타·레벨·소셜 / **개인 GPU** = 생성 / **클라우드 스토리지** = 결과 PNG
- 생성 흐름: 브라우저가 내 `localhost:8188` ComfyUI를 직접 호출 → 결과를 스토리지 업로드 → asset 생성
- 레벨(씬)은 공개/비공개 + 좋아요·댓글·플레이수가 붙는 공유 콘텐츠

## ⚠ 목업 범위 (실제 아님)
- 에셋 = 플레이스홀더 SVG(`frontend/public/sample-assets/`)
- "생성" = `store/studio.ts`의 `setTimeout` 시뮬레이션 (ComfyUI 호출 없음)
- 로그인/좋아요/댓글/공개설정 = 클라이언트 상태
- 다음 단계: `enqueueJob`을 실제 백엔드 `fetch`로 교체 (`docs/WORKFLOW_AND_MODELS.md §7`)

## 좌표 계약 (검증됨)
씬 조립기 배치 좌표 = Phaser 플레이 월드 좌표 **1:1** (`frontend/src/lib/coords.ts`). 실측: 지면 y=688 → 플레이어 발 착지 688.
