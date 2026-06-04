"""
chchar — DB 서비스 버전 v2 SQLModel (참고용 스텁, 미실행)

멀티유저 서비스 + 생성은 각 사용자 개인 GPU(로컬 ComfyUI).
스택: FastAPI + SQLModel + PostgreSQL. docs/ERD.md 와 1:1. MVP 13테이블.
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


# ════════ 개인 GPU 연결 (★ 이 제품의 핵심) ════════
class GpuNode(SQLModel, table=True):
    __tablename__ = "gpu_node"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    label: str = "내 PC"
    comfy_url: str = "http://localhost:8188"  # 브라우저가 호출
    status: str = "offline"  # online|offline
    last_seen_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=now)


class InstalledModel(SQLModel, table=True):
    __tablename__ = "installed_model"
    id: Optional[int] = Field(default=None, primary_key=True)
    gpu_node_id: int = Field(foreign_key="gpu_node.id", index=True)
    kind: str  # checkpoint|lora|vae
    name: str  # 프리셋이 이 GPU에서 돌아가는지 검증용


# ════════ 생성 ════════
class StylePreset(SQLModel, table=True):
    __tablename__ = "style_preset"
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")  # null=공식 시드
    name: str
    role: str  # char|bg|platform
    checkpoint: str
    lora: Optional[str] = None
    prompt_prefix: str = ""
    prompt_suffix: str = ""
    negative_prompt: str = ""
    sampler: str = "dpmpp_2m_karras"
    steps: int = 28
    cfg: float = 6.5
    width: int = 768
    height: int = 1024
    postprocess: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    is_active: bool = True
    is_public: bool = False
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)


class GenerationJob(SQLModel, table=True):
    __tablename__ = "generation_job"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    gpu_node_id: Optional[int] = Field(default=None, foreign_key="gpu_node.id")
    preset_id: int = Field(foreign_key="style_preset.id")
    user_prompt: str
    batch_size: int = 1
    # queued|expanding|generating|postprocessing|tagging|done|failed
    status: str = "queued"
    comfy_prompt_id: Optional[str] = None
    progress: float = 0.0
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)


class Asset(SQLModel, table=True):
    __tablename__ = "asset"
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)
    job_id: Optional[int] = Field(default=None, foreign_key="generation_job.id")
    preset_id: Optional[int] = Field(default=None, foreign_key="style_preset.id")  # 역정규화
    role: str  # char|bg|platform
    raw_url: str           # 클라우드 스토리지 URL
    processed_url: str
    thumbnail_url: str
    width: int
    height: int
    anchor_x: float = 0.5  # 발 중심
    anchor_y: float = 1.0
    seed: int = 0
    prompt: str = ""       # concept 흡수
    status: str = "ok"     # ok|bg_removal_failed|normalize_failed
    favorite: bool = False
    is_public: bool = False
    created_at: datetime = Field(default_factory=now)


class Tag(SQLModel, table=True):
    __tablename__ = "tag"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)


class AssetTag(SQLModel, table=True):
    __tablename__ = "asset_tag"
    asset_id: int = Field(foreign_key="asset.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)


# ════════ 레벨/씬 (공유 콘텐츠) ════════
class Scene(SQLModel, table=True):
    __tablename__ = "scene"
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)
    name: str
    description: str = ""
    character_asset_id: Optional[int] = Field(default=None, foreign_key="asset.id")
    background_asset_id: Optional[int] = Field(default=None, foreign_key="asset.id")
    config: dict = Field(default_factory=dict, sa_column=Column(JSON))  # 중력·점프·속도·캔버스
    # 플랫폼+에너미+함정 전부, kind 로 구분 (lib/coords 좌표계)
    placements: list = Field(default_factory=list, sa_column=Column(JSON))
    player_start: dict = Field(default_factory=dict, sa_column=Column(JSON))  # {x, y}
    goal: dict = Field(default_factory=dict, sa_column=Column(JSON))  # {x, y}
    visibility: str = "private"  # public|private
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
    target_type: str  # asset|scene
    target_id: int
    created_at: datetime = Field(default_factory=now)


class Comment(SQLModel, table=True):
    __tablename__ = "comment"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    target_type: str  # asset|scene
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


# MVP 13테이블. 나중 확장: plan/subscription, notification, report, follow, collection.
# 좌표 규약은 프론트 lib/coords.ts 와 동일 (월드 px, 원점 좌상단, Y축 아래, TILE=32).
