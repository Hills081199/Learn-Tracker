from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.models import LearningGoal, LearningRecord, LearningSeries, Tag, GoalStatus
from app.schemas import GoalCreate, GoalUpdate, GoalReorderRequest

router = APIRouter()


def serialize_goal(goal, series_count=0, record_count=0, total_duration=0, last_record_date=None):
    return {
        "id": goal.id,
        "user_id": goal.user_id,
        "title": goal.title,
        "description": goal.description,
        "emoji": goal.emoji,
        "color": goal.color,
        "status": goal.status.value if hasattr(goal.status, "value") else goal.status,
        "start_date": str(goal.start_date) if goal.start_date else None,
        "target_date": str(goal.target_date) if goal.target_date else None,
        "order": goal.order or 0,
        "created_at": goal.created_at.isoformat() if goal.created_at else None,
        "updated_at": goal.updated_at.isoformat() if goal.updated_at else None,
        "tags": [{"id": t.id, "name": t.name, "color": t.color} for t in goal.tags],
        "series_count": series_count,
        "record_count": record_count,
        "total_duration": total_duration,
        "last_record_date": str(last_record_date) if last_record_date else None,
    }


def get_goal_stats(db: Session, goal_id):
    series_count = (
        db.query(func.count(LearningSeries.id))
        .filter(LearningSeries.goal_id == goal_id)
        .scalar() or 0
    )
    record_count = (
        db.query(func.count(LearningRecord.id))
        .filter(LearningRecord.goal_id == goal_id)
        .scalar() or 0
    )
    total_duration = (
        db.query(func.coalesce(func.sum(LearningRecord.duration), 0))
        .filter(LearningRecord.goal_id == goal_id)
        .scalar() or 0
    )
    last_record = (
        db.query(func.max(LearningRecord.date))
        .filter(LearningRecord.goal_id == goal_id)
        .scalar()
    )
    return series_count, record_count, total_duration, last_record


@router.get("")
def list_goals(
    status: Optional[GoalStatus] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(LearningGoal)
    if status:
        query = query.filter(LearningGoal.status == status)
    if search:
        query = query.filter(LearningGoal.title.ilike(f"%{search}%"))

    goals = query.order_by(LearningGoal.order, LearningGoal.created_at.desc()).all()
    result = []
    for goal in goals:
        sc, rc, td, lr = get_goal_stats(db, goal.id)
        result.append(serialize_goal(goal, sc, rc, td, lr))
    return result


@router.post("")
def create_goal(goal_in: GoalCreate, db: Session = Depends(get_db)):
    start_date = None
    target_date = None
    if goal_in.start_date:
        try:
            start_date = datetime.strptime(goal_in.start_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")
    if goal_in.target_date:
        try:
            target_date = datetime.strptime(goal_in.target_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid target_date format")

    goal = LearningGoal(
        title=goal_in.title,
        description=goal_in.description,
        emoji=goal_in.emoji,
        color=goal_in.color,
        status=goal_in.status,
        start_date=start_date,
        target_date=target_date,
        order=goal_in.order,
    )
    if goal_in.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(goal_in.tag_ids)).all()
        goal.tags = tags

    db.add(goal)
    db.commit()
    db.refresh(goal)
    return serialize_goal(goal)


@router.put("/reorder")
def reorder_goals(reorder: GoalReorderRequest, db: Session = Depends(get_db)):
    for item in reorder.items:
        goal = db.query(LearningGoal).filter(LearningGoal.id == item.id).first()
        if goal:
            goal.order = item.order
    db.commit()
    return {"message": "Goals reordered"}


@router.get("/{goal_id}")
def get_goal(goal_id: UUID, db: Session = Depends(get_db)):
    goal = db.query(LearningGoal).filter(LearningGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    sc, rc, td, lr = get_goal_stats(db, goal.id)
    return serialize_goal(goal, sc, rc, td, lr)


@router.patch("/{goal_id}")
def update_goal(goal_id: UUID, goal_in: GoalUpdate, db: Session = Depends(get_db)):
    goal = db.query(LearningGoal).filter(LearningGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_data = goal_in.model_dump(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)

    if "start_date" in update_data and update_data["start_date"]:
        try:
            update_data["start_date"] = datetime.strptime(update_data["start_date"], "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")
    if "target_date" in update_data and update_data["target_date"]:
        try:
            update_data["target_date"] = datetime.strptime(update_data["target_date"], "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid target_date format")

    for key, value in update_data.items():
        setattr(goal, key, value)
    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        goal.tags = tags

    db.commit()
    db.refresh(goal)
    sc, rc, td, lr = get_goal_stats(db, goal.id)
    return serialize_goal(goal, sc, rc, td, lr)


@router.delete("/{goal_id}")
def delete_goal(goal_id: UUID, hard: bool = False, db: Session = Depends(get_db)):
    goal = db.query(LearningGoal).filter(LearningGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if hard:
        db.delete(goal)
    else:
        goal.status = GoalStatus.ARCHIVED
    db.commit()
    return {"message": "Goal deleted" if hard else "Goal archived"}
