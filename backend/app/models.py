import uuid
import enum
from datetime import datetime, date

from sqlalchemy import (
    Column, String, Text, Integer, DateTime, Date,
    JSON, ForeignKey, Table, Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


# ---------- Enums ----------
class GoalStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"


class AttachType(str, enum.Enum):
    IMAGE = "IMAGE"
    PDF = "PDF"
    FILE = "FILE"
    LINK = "LINK"


# ---------- Association Tables ----------
goal_tags = Table(
    "goal_tags",
    Base.metadata,
    Column("goal_id", UUID(as_uuid=True), ForeignKey("learning_goals.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

record_tags = Table(
    "record_tags",
    Base.metadata,
    Column("record_id", UUID(as_uuid=True), ForeignKey("learning_records.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

series_tags = Table(
    "series_tags",
    Base.metadata,
    Column("series_id", UUID(as_uuid=True), ForeignKey("learning_series.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


# ---------- Models ----------
class LearningGoal(Base):
    __tablename__ = "learning_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, default="default", nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    emoji = Column(String(10), nullable=True)
    color = Column(String(7), nullable=True)
    status = Column(SAEnum(GoalStatus), default=GoalStatus.ACTIVE, nullable=False)
    start_date = Column(Date, nullable=True)
    target_date = Column(Date, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    series = relationship("LearningSeries", back_populates="goal", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=goal_tags, back_populates="goals")


class LearningSeries(Base):
    __tablename__ = "learning_series"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("learning_goals.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    emoji = Column(String(10), nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    goal = relationship("LearningGoal", back_populates="series")
    records = relationship("LearningRecord", back_populates="series", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=series_tags, back_populates="series_list")


class LearningRecord(Base):
    __tablename__ = "learning_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    series_id = Column(UUID(as_uuid=True), ForeignKey("learning_series.id", ondelete="CASCADE"), nullable=True)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("learning_goals.id", ondelete="CASCADE"), nullable=True)
    date = Column(Date, default=date.today)
    title = Column(String(255), nullable=True)
    content = Column(JSON, nullable=True)
    content_raw = Column(Text, nullable=True)
    mood = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    series = relationship("LearningSeries", back_populates="records")
    tags = relationship("Tag", secondary=record_tags, back_populates="records")
    attachments = relationship("Attachment", back_populates="record", cascade="all, delete-orphan")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    color = Column(String(7), nullable=True)

    goals = relationship("LearningGoal", secondary=goal_tags, back_populates="tags")
    records = relationship("LearningRecord", secondary=record_tags, back_populates="tags")
    series_list = relationship("LearningSeries", secondary=series_tags, back_populates="tags")


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    record_id = Column(UUID(as_uuid=True), ForeignKey("learning_records.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(500), nullable=False)
    type = Column(SAEnum(AttachType), nullable=False)
    name = Column(String(255), nullable=False)
    size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    record = relationship("LearningRecord", back_populates="attachments")
