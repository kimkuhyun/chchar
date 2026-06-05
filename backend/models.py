"""
chchar — DB 서비스 v5 SQLModel (paper-doll / decal-atlas Pawn 시스템).

제품: 텍스트 → **브라우저 WebGPU**로 분리된 투명 파츠(atlas) 생성
(워크플로우 정의·모델 메타는 서버, 실제 추론은 사용자 브라우저 WebGPU.
타깃 환경 = 일반 사용자 VRAM 8GB → SD1.5/LCM 기준, FLUX 같은 대형 모델 제외) →
서버 라이브러리에 저장 → 브라우저에서 타원 몸체 + 파츠로 Pawn 조립,
방향은 8장 이미지가 아니라 방향별 레이어/좌표/스케일 규칙으로 표현,
모션은 코드(squash/stretch·bobbing·weapon swing). 여러 장르(클릭·디펜스·서바이버·
탑다운RPG·전술)에 같은 Pawn 재사용. (플랫포머 옆모습은 별도 — MVP 제외)

핵심 3엔티티: asset_part(파츠 원자) · pawn(조립체) · pawn_template(방향 규칙).
스택: FastAPI + SQLModel + **MariaDB**(mysql+pymysql, utf8mb4). docs/ERD.md 와 1:1.
MVP 12테이블.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, Column, JSON

now = datetime.utcnow


# ════════ 계정 ════════
class User(SQLModel, table=True):
    __tablename__ = "user"
    id: Optional[int] = Field(default=None, primary_key=True)
    handle: str = Field(index=True, unique=True)  # 프로필 URL /u/:handle
    email: str = Field(index=True, unique=True)
    display_name: str = ""
    avatar_url: Optional[str] = None
    plan: str = "free"  # 결제는 MVP 제외, 기본 free
    created_at: datetime = Field(default_factory=now)
    last_login_at: Optional[datetime] = None


class OAuthAccount(SQLModel, table=True):
    __tablename__ = "oauth_account"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    provider: str = "google"
    provider_uid: str = Field(index=True)
    created_at: datetime = Field(default_factory=now)


# ════════ 생성 워크플로우 (서버 보관, 브라우저 WebGPU에서 실행) ════════
class Workflow(SQLModel, table=True):
    """파츠를 뽑는 워크플로우 프리셋. 운영자가 만들고 서버에 저장, 사용자 브라우저
    WebGPU 파이프라인이 읽어 실행. ComfyUI API-format JSON을 호환 형식으로 받지만
    실제 추론기는 ComfyUI가 아니라 브라우저(web-stable-diffusion / transformers.js /
    onnxruntime-web 류) — VRAM 8GB 타깃이라 base_model 기본값은 sd15.
    """
    __tablename__ = "workflow"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    # pawn_atlas|weapon|shield|tile|prop|effect|style_ref|bg_remove
    purpose: str = "pawn_atlas"
    # sd15|sd15-lcm|sdxl-turbo-int8 ... 8GB VRAM 안에서 도는 것만. FLUX/SDXL풀 금지.
    base_model: str = "sd15"
    description: str = ""
    # ComfyUI API-format 호환 JSON (서버는 보관만, 실행기는 브라우저 WebGPU 파이프라인)
    api_json: dict = Field(default_factory=dict, sa_column=Column(JSON))
    param_map: dict = Field(default_factory=dict, sa_column=Column(JSON))  # 논리 파라미터 → 노드 입력
    prompt_prefix: str = ""
    prompt_suffix: str = ""
    negative_prompt: str = ""
    version: int = 1
    is_active: bool = True
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)


# ════════ 파츠 원자 (생성 결과 = 투명 PNG + slot) ════════
class AssetPart(SQLModel, table=True):
    """단일 투명 PNG 파츠. kind(slot)로 Pawn의 어느 자리에 얹힐지 결정.

    kind 예: body·face_front·face_side·face_back·head_back·
    hair_front·hair_side·hair_back·helmet_front·helmet_side·helmet_back·
    weapon·shield·cape·faction_mark·shadow·tile·prop·effect
    """
    __tablename__ = "asset_part"
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)  # null=공식 라이브러리
    kind: str = Field(index=True)        # slot 식별자(위 vocab)
    name: str = ""
    url: str                              # 투명 PNG (오브젝트 스토리지)
    thumbnail_url: str = ""
    width: int = 0
    height: int = 0
    anchor_x: float = 0.5                 # 합성 피벗(0~1)
    anchor_y: float = 0.5
    transparent: bool = True
    source_workflow_id: Optional[int] = Field(default=None, foreign_key="workflow.id")
    prompt: str = ""
    seed: int = 0
    status: str = "ok"                    # ok|bg_removal_failed
    is_public: bool = False
    created_at: datetime = Field(default_factory=now)


# ════════ Pawn 템플릿 (방향 규칙 — ★ "이미지 아니라 규칙") ════════
class PawnTemplate(SQLModel, table=True):
    """바디 타입별 슬롯 목록 + 방향별 레이어/좌표/스케일 규칙. 보통 전역 공유.

    slots: ["shadow","body","cape","face_front","hair_front","helmet_front","weapon", ...]
    direction_rules: {
      "S":  {"face_front":{"z":5,"dx":0,"dy":-4,"scale":1.0,"show":true}, "weapon":{"z":6,...}, ...},
      "N":  {"face_front":{"show":false}, "head_back":{"z":5,...}, "weapon":{"z":2,...}, ...},
      "E"/"NE"/"SE"/"W"/"NW"/"SW": ...
    }
    base_shape: 타원 몸체 파라미터 {"rx":..,"ry":..} 등.
    """
    __tablename__ = "pawn_template"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)  # humanoid|quadruped ...
    slots: list = Field(default_factory=list, sa_column=Column(JSON))
    direction_rules: dict = Field(default_factory=dict, sa_column=Column(JSON))
    base_shape: dict = Field(default_factory=dict, sa_column=Column(JSON))
    is_active: bool = True
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)


# ════════ Pawn (조립 캐릭터) ════════
class Pawn(SQLModel, table=True):
    """공통 PawnEntity. 슬롯→파츠 매핑 + 색/스케일. 여러 씬·장르에서 재사용."""
    __tablename__ = "pawn"
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)
    template_id: int = Field(foreign_key="pawn_template.id")
    name: str = ""
    body_color: str = "#c8a07a"
    faction_color: str = "#6d5efc"
    scale: float = 1.0
    # {slot: part_id, ...} + 선택 틴트 {slot: "#rrggbb"} 는 tints 로
    composition: dict = Field(default_factory=dict, sa_column=Column(JSON))
    tints: dict = Field(default_factory=dict, sa_column=Column(JSON))
    thumbnail_url: Optional[str] = None
    is_public: bool = False
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)


# ════════ 태깅 ════════
class Tag(SQLModel, table=True):
    __tablename__ = "tag"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)


class PartTag(SQLModel, table=True):
    __tablename__ = "part_tag"
    part_id: int = Field(foreign_key="asset_part.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)


# ════════ 씬 (Pawn·타일·prop 배치 = 장르별 보드/레벨) ════════
class Scene(SQLModel, table=True):
    __tablename__ = "scene"
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)
    name: str
    description: str = ""
    genre: str = "topdown_rpg"  # click|defense|survivor|topdown_rpg|tactical
    config: dict = Field(default_factory=dict, sa_column=Column(JSON))  # 장르별 설정·캔버스
    # [{kind:"pawn"|"tile"|"prop", ref_id, x, y, direction, scale, ...}]
    placements: list = Field(default_factory=list, sa_column=Column(JSON))
    is_public: bool = False  # asset_part·pawn 과 동일 명칭으로 통일
    thumbnail_url: Optional[str] = None
    play_count: int = 0   # 역정규화
    like_count: int = 0   # 역정규화
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)


# ════════ 소셜 ════════
class Like(SQLModel, table=True):
    __tablename__ = "like"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    target_type: str  # part|pawn|scene
    target_id: int
    created_at: datetime = Field(default_factory=now)


class Comment(SQLModel, table=True):
    __tablename__ = "comment"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    target_type: str  # part|pawn|scene
    target_id: int
    body: str
    created_at: datetime = Field(default_factory=now)


class PlayRecord(SQLModel, table=True):
    __tablename__ = "play_record"
    id: Optional[int] = Field(default=None, primary_key=True)
    scene_id: int = Field(foreign_key="scene.id", index=True)
    player_id: Optional[int] = Field(default=None, foreign_key="user.id")
    cleared: bool = False
    time_ms: Optional[int] = None
    score: Optional[int] = None
    created_at: datetime = Field(default_factory=now)


# MVP 12테이블 (paper-doll Pawn). 핵심: asset_part·pawn·pawn_template.
# 삭제됨(이전 버전): gpu_node·installed_model·generation_job·style_preset·asset·asset_tag.
# 생성=브라우저 WebGPU(VRAM 8GB 가정), 워크플로우/메타·조립·저장·소셜=서버.
# 진행상황은 클라이언트 상태(서버 큐 없음 — 브라우저가 직접 추론).
# 나중 확장: plan/subscription, notification, report, follow, collection, pawn_animation_clip.
