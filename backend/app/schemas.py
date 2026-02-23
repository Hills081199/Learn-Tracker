from pydantic import BaseModel, Field
from typing import Optional, List, Any
from uuid import UUID

from app.models import GoalStatus, AttachType


# ========== Tag ==========
class TagBase(BaseModel):
    name: str
    color: Optional[str] = None


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    model_config = {"from_attributes": True}
    id: UUID


# ========== Attachment ==========
class AttachmentResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    record_id: UUID
    url: str
    type: AttachType
    name: str
    size: Optional[int] = None
    created_at: Any = None


# ========== Goal ==========
class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    emoji: Optional[str] = None
    color: Optional[str] = None
    status: GoalStatus = GoalStatus.ACTIVE
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    order: int = 0
    tag_ids: Optional[List[UUID]] = []


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    emoji: Optional[str] = None
    color: Optional[str] = None
    status: Optional[GoalStatus] = None
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    order: Optional[int] = None
    tag_ids: Optional[List[UUID]] = None


class GoalResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    user_id: str
    title: str
    description: Optional[str] = None
    emoji: Optional[str] = None
    color: Optional[str] = None
    status: GoalStatus = GoalStatus.ACTIVE
    start_date: Any = None
    target_date: Any = None
    order: int = 0
    created_at: Any = None
    updated_at: Any = None
    tags: List[TagResponse] = []
    series_count: Optional[int] = 0
    record_count: Optional[int] = 0
    total_duration: Optional[int] = 0
    last_record_date: Any = None


class GoalReorderItem(BaseModel):
    id: UUID
    order: int


class GoalReorderRequest(BaseModel):
    items: List[GoalReorderItem]


# ========== Series ==========
class SeriesCreate(BaseModel):
    title: str
    description: Optional[str] = None
    emoji: Optional[str] = None
    order: int = 0


class SeriesUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    emoji: Optional[str] = None
    order: Optional[int] = None


class SeriesResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    goal_id: UUID
    title: str
    description: Optional[str] = None
    emoji: Optional[str] = None
    order: int = 0
    created_at: Any = None
    updated_at: Any = None
    tags: List[TagResponse] = []
    record_count: Optional[int] = 0
    total_duration: Optional[int] = 0
    last_record_date: Any = None


class SeriesReorderItem(BaseModel):
    id: UUID
    order: int


class SeriesReorderRequest(BaseModel):
    items: List[SeriesReorderItem]


# ========== Record ==========
class RecordCreate(BaseModel):
    title: Optional[str] = None
    content: Optional[Any] = None
    content_raw: Optional[str] = None
    date: Optional[str] = None
    mood: Optional[int] = Field(None, ge=1, le=5)
    duration: Optional[int] = Field(None, ge=0)
    tag_ids: Optional[List[UUID]] = []


class RecordUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Any] = None
    content_raw: Optional[str] = None
    date: Optional[str] = None
    mood: Optional[int] = Field(None, ge=1, le=5)
    duration: Optional[int] = Field(None, ge=0)
    tag_ids: Optional[List[UUID]] = None


class RecordResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    series_id: Any = None
    goal_id: Any = None
    title: Optional[str] = None
    content: Optional[Any] = None
    content_raw: Optional[str] = None
    date: Any = None
    mood: Optional[int] = None
    duration: Optional[int] = None
    created_at: Any = None
    updated_at: Any = None
    tags: List[TagResponse] = []
    attachments: List[AttachmentResponse] = []


# ========== Stats ==========
class StatsOverview(BaseModel):
    total_goals: int
    active_goals: int
    total_records: int
    total_duration: int
    streak: int
    today_records: int
    goals_without_today_record: list = []
    recent_records: list = []


class HeatmapData(BaseModel):
    date: str
    count: int
    duration: int


class WeeklyData(BaseModel):
    date: str
    duration: int
    count: int


# ========== Upload ==========
class UploadResponse(BaseModel):
    url: str
    name: str
    size: int
    type: str
