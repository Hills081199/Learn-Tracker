from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import date, datetime

from app.database import get_db
from app.models import LearningRecord, LearningSeries, Tag
from app.schemas import RecordCreate, RecordUpdate

router = APIRouter()


def serialize_record(record):
    return {
        "id": record.id,
        "series_id": record.series_id,
        "goal_id": record.goal_id,
        "title": record.title,
        "content": record.content,
        "content_raw": record.content_raw,
        "date": str(record.date) if record.date else None,
        "mood": record.mood,
        "duration": record.duration,
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "updated_at": record.updated_at.isoformat() if record.updated_at else None,
        "tags": [{"id": t.id, "name": t.name, "color": t.color} for t in record.tags],
        "attachments": [
            {
                "id": a.id,
                "record_id": a.record_id,
                "url": a.url,
                "type": a.type,
                "name": a.name,
                "size": a.size,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in record.attachments
        ],
    }


@router.get("/series/{series_id}/records")
def list_records(
    series_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    series = db.query(LearningSeries).filter(LearningSeries.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")

    records = (
        db.query(LearningRecord)
        .filter(LearningRecord.series_id == series_id)
        .order_by(LearningRecord.date.desc(), LearningRecord.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return [serialize_record(r) for r in records]


@router.post("/series/{series_id}/records")
def create_record(series_id: UUID, record_in: RecordCreate, db: Session = Depends(get_db)):
    series = db.query(LearningSeries).filter(LearningSeries.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")

    record_date = date.today()
    if record_in.date:
        try:
            record_date = datetime.strptime(record_in.date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

    record = LearningRecord(
        series_id=series_id,
        goal_id=series.goal_id,  # Auto-set for easier querying
        title=record_in.title,
        content=record_in.content,
        content_raw=record_in.content_raw,
        date=record_date,
        mood=record_in.mood,
        duration=record_in.duration,
    )
    if record_in.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(record_in.tag_ids)).all()
        record.tags = tags

    db.add(record)
    db.commit()
    db.refresh(record)
    return serialize_record(record)


# Keep backward compat: list records by goal (all series)
@router.get("/goals/{goal_id}/records")
def list_records_by_goal(
    goal_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    records = (
        db.query(LearningRecord)
        .filter(LearningRecord.goal_id == goal_id)
        .order_by(LearningRecord.date.desc(), LearningRecord.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return [serialize_record(r) for r in records]


@router.get("/records/search")
def search_records(
    q: str = Query(..., min_length=1),
    goal_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
):
    query = db.query(LearningRecord).filter(
        (LearningRecord.content_raw.ilike(f"%{q}%"))
        | (LearningRecord.title.ilike(f"%{q}%"))
    )
    if goal_id:
        query = query.filter(LearningRecord.goal_id == goal_id)
    records = query.order_by(LearningRecord.date.desc()).limit(50).all()
    return [serialize_record(r) for r in records]


@router.get("/records/{record_id}")
def get_record(record_id: UUID, db: Session = Depends(get_db)):
    record = db.query(LearningRecord).filter(LearningRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return serialize_record(record)


@router.patch("/records/{record_id}")
def update_record(record_id: UUID, record_in: RecordUpdate, db: Session = Depends(get_db)):
    record = db.query(LearningRecord).filter(LearningRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    update_data = record_in.model_dump(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)

    if "date" in update_data and update_data["date"]:
        try:
            update_data["date"] = datetime.strptime(update_data["date"], "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

    for key, value in update_data.items():
        setattr(record, key, value)
    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        record.tags = tags

    db.commit()
    db.refresh(record)
    return serialize_record(record)


@router.delete("/records/{record_id}")
def delete_record(record_id: UUID, db: Session = Depends(get_db)):
    record = db.query(LearningRecord).filter(LearningRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Record deleted"}
