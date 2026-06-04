# chchar — 워크플로우 & 모델 조사 (RX 7800 XT 기준)

> 목적: 지금 만든 **프론트(목업)** 를 나중에 **실제 로컬 생성 파이프라인**에 연결할 때 필요한
> 스택·모델·연동법을 사람이 빠르게 보고 판단하도록 정리. (웹 실조사 2026-06)

---

## 0. 한눈에

```
[S1 프롬프트] → 백엔드(LangGraph)
   → expand_concept (Ollama)         프롬프트 확장·JSON
   → generate       (ComfyUI/SDXL)   픽셀 에셋 생성
   → bg_removal     (rembg)          배경 제거(투명 PNG)
   → normalize      (Pillow NEAREST) 픽셀 정규화
   → auto_tag                        태그 추출
   → persist        (SQLite)         asset 행 저장
→ [S3 갤러리] → [S5 조립] → [S6 플레이]
```

- **핵심 차별점**: 클라우드 의존 0 · 무료 · AMD에서 동작. (PixelLab·Scenario·Retro Diffusion은 전부 클라우드+구독)
- **현 단계**: 위 파이프라인 자리에 **목업**이 끼워져 있음. `frontend/src/store/studio.ts`의 `enqueueJob`만 실제 백엔드 `fetch`로 교체하면 연결.

---

## 1. 제약 & 결론

| 항목 | 결론 |
|---|---|
| GPU | RX 7800 XT (16GB, RDNA3, gfx1101) |
| 정적 에셋 생성(캐릭터·배경·플랫폼) | ✅ **현실적** — SDXL 1024px ≈ **35~45초/장** |
| 투명 배경 스프라이트 | ✅ rembg 또는 LayerDiffuse(투명 SDXL) |
| **애니메이션 스프라이트시트(걷기 8프레임 일관성)** | ⚠ **단발 프롬프트로는 비신뢰** → MVP는 정적, 애니는 P7(LoRA 학습 AMD 24~48h or 정적+엔진모션) |
| VRAM 동시성 | SDXL(~6~7GB)+4bit 7B LLM(~5GB) 빠듯 → **LangGraph 노드 순차 실행**으로 회피 |

> 즉 **설계대로(정적 MVP)면 타당**. 범위 축소 불필요. 애니메이션만 후속 단계로 분리.

---

## 2. 이미지 생성 스택 (Windows 11)

| 순위 | 스택 | 메모 |
|---|---|---|
| **1순위** | **ComfyUI Desktop v0.7+ (ROCm 7.x)** | AMD 공식 ROCm 지원. **.safetensor 사용**(GGUF/UNET는 7800XT 저활용 — 실사용 보고). HTTP API 기본 제공 |
| 폴백 | **ComfyUI-ZLUDA** (`patientx/ComfyUI-Zluda`) | RDNA1~4 호환. ROCm 설치 이슈 시 |
| 최후 | A1111/Forge + **DirectML** | 호환성 최고·속도 최저(2~12배 느림) |

- **API 연동**: `POST http://127.0.0.1:8188/prompt` (워크플로우 JSON) + `ws://127.0.0.1:8188/ws` 로 진행률 수신 → S2 큐에 반영.
- 워크플로우는 ComfyUI에서 "Save (API Format)"로 JSON 추출해 백엔드에 내장.

## 3. 모델

| 용도 | 모델 | 비고 |
|---|---|---|
| 베이스 | **SDXL base 1.0** (.safetensor) | SD1.5보다 디테일·일관성 우위 |
| 픽셀 스타일 | **`nerijs/pixel-art-xl` (LoRA)** | 현역, 픽셀 스프라이트/타일 |
| 배경 제거 | **rembg** (대안: LayerDiffuse 투명 SDXL) | 투명 PNG 산출 |
| 일관성(선택) | **IPAdapter + OpenPose ControlNet** + seed 고정 | 같은 캐릭터 유지 |
| 픽셀 정규화 | **Pillow `NEAREST`** 리샘플 | 격자 정렬·계단 보존 |

## 4. LLM (프롬프트 확장)

- **Ollama `qwen3.5:9b`** (사용자 PC에 설치됨) 사용. *주의: qwen2.5 계열은 미설치 → 9b로.*
- 역할: 짧은 한 줄 컨셉 → 상세 영문 프롬프트 + 역할 분류(JSON). `concept` 테이블에 저장.
- 노하우: `num_ctx` 확장 + `think=False` + 프롬프트에 출력 스키마 명시.

## 5. 오케스트레이션 (LangGraph, 순차)

```
expand_concept(Ollama) → generate(ComfyUI) → bg_removal(rembg)
→ normalize(Pillow) → auto_tag → persist(asset)
```
- 선형이라 약간 오버킬이나 **체크포인트·재시작·학습목적**으로 유지(사용자 확정).
- **VRAM 16GB**: 노드 사이 모델 언로드/순차 실행으로 OOM 회피. (S2의 "batch 8 → VRAM OOM" 실패 예시가 이 지점)

## 6. 성능 (실측 기준 추정)

- SDXL 1024px ≈ 35~45초/장 (+ rembg·normalize 수 초)
- MVP 에셋셋(캐릭터1·배경1·에너미/타일 몇) ≈ **30~45분** (재롤 포함)
- 애니메이션 걷기 4프레임(ControlNet 수동) ≈ 6분/사이클 + 수작업

## 7. 프론트 ↔ 백엔드 연결 지점 (다음 단계 체크리스트)

1. `store/studio.ts > enqueueJob`: 목업 `setTimeout` 시뮬 → `POST /api/jobs` 로 교체.
2. 백엔드: FastAPI + SQLModel(아래 `backend/models.py` 스텁) + LangGraph 파이프라인 + ComfyUI/Ollama 클라이언트(httpx).
3. 진행률: `/ws` 또는 SSE → S2 큐 카드 갱신.
4. 완료 시 `asset` 행 생성 → S3 갤러리는 그대로 소비(타입 동일).
5. 좌표 계약(`lib/coords.ts`)은 그대로 — 백엔드 무관, 프론트 S5/S6 공유.

> 산출 에셋 경로(`raw/processed/thumbnail_path`)만 백엔드가 채우면, 지금 만든 화면들이 **그대로** 실데이터로 동작한다.
