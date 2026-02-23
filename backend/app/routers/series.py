from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models import LearningSeries, LearningGoal, LearningRecord, Tag
from app.schemas import SeriesCreate, SeriesUpdate, SeriesReorderRequest

router = APIRouter()


def serialize_series(series, record_count=0, total_duration=0, last_record_date=None):
    return {
        "id": series.id,
        "goal_id": series.goal_id,
        "title": series.title,
        "description": series.description,
        "emoji": series.emoji,
        "order": series.order or 0,
        "created_at": series.created_at.isoformat() if series.created_at else None,
        "updated_at": series.updated_at.isoformat() if series.updated_at else None,
        "tags": [{"id": t.id, "name": t.name, "color": t.color} for t in series.tags],
        "record_count": record_count,
        "total_duration": total_duration,
        "last_record_date": str(last_record_date) if last_record_date else None,
    }


def get_series_stats(db: Session, series_id):
    record_count = (
        db.query(func.count(LearningRecord.id))
        .filter(LearningRecord.series_id == series_id)
        .scalar() or 0
    )
    total_duration = (
        db.query(func.coalesce(func.sum(LearningRecord.duration), 0))
        .filter(LearningRecord.series_id == series_id)
        .scalar() or 0
    )
    last_record = (
        db.query(func.max(LearningRecord.date))
        .filter(LearningRecord.series_id == series_id)
        .scalar()
    )
    return record_count, total_duration, last_record


@router.get("/goals/{goal_id}/series")
def list_series(goal_id: UUID, db: Session = Depends(get_db)):
    goal = db.query(LearningGoal).filter(LearningGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    series_list = (
        db.query(LearningSeries)
        .filter(LearningSeries.goal_id == goal_id)
        .order_by(LearningSeries.order, LearningSeries.created_at.desc())
        .all()
    )

    result = []
    for s in series_list:
        rc, td, lr = get_series_stats(db, s.id)
        result.append(serialize_series(s, rc, td, lr))
    return result


@router.post("/goals/{goal_id}/series")
def create_series(goal_id: UUID, series_in: SeriesCreate, db: Session = Depends(get_db)):
    goal = db.query(LearningGoal).filter(LearningGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    series = LearningSeries(
        goal_id=goal_id,
        title=series_in.title,
        description=series_in.description,
        emoji=series_in.emoji,
        order=series_in.order,
    )
    db.add(series)
    db.commit()
    db.refresh(series)
    return serialize_series(series)


@router.put("/series/reorder")
def reorder_series(reorder: SeriesReorderRequest, db: Session = Depends(get_db)):
    for item in reorder.items:
        s = db.query(LearningSeries).filter(LearningSeries.id == item.id).first()
        if s:
            s.order = item.order
    db.commit()
    return {"message": "Series reordered"}


@router.get("/series/{series_id}")
def get_series(series_id: UUID, db: Session = Depends(get_db)):
    series = db.query(LearningSeries).filter(LearningSeries.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    rc, td, lr = get_series_stats(db, series.id)
    return serialize_series(series, rc, td, lr)


@router.patch("/series/{series_id}")
def update_series(series_id: UUID, series_in: SeriesUpdate, db: Session = Depends(get_db)):
    series = db.query(LearningSeries).filter(LearningSeries.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")

    update_data = series_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(series, key, value)

    db.commit()
    db.refresh(series)
    rc, td, lr = get_series_stats(db, series.id)
    return serialize_series(series, rc, td, lr)


@router.delete("/series/{series_id}")
def delete_series(series_id: UUID, db: Session = Depends(get_db)):
    series = db.query(LearningSeries).filter(LearningSeries.id == series_id).first()
    if not series:
        raise HTTPException(status_code=404, detail="Series not found")
    db.delete(series)
    db.commit()
    return {"message": "Series deleted"}
