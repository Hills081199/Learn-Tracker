from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from typing import Optional
from uuid import UUID
from datetime import date, timedelta

from app.database import get_db
from app.models import LearningGoal, LearningRecord, GoalStatus
from app.routers.goals import serialize_goal, get_goal_stats
from app.routers.records import serialize_record

router = APIRouter()


def calculate_streak(db: Session, goal_id: Optional[UUID] = None) -> int:
    query = db.query(distinct(LearningRecord.date)).order_by(LearningRecord.date.desc())
    if goal_id:
        query = query.filter(LearningRecord.goal_id == goal_id)

    dates = [row[0] for row in query.all() if row[0] is not None]
    if not dates:
        return 0

    streak = 0
    today = date.today()
    check = today

    if dates[0] < today - timedelta(days=1):
        return 0

    for d in dates:
        if d == check:
            streak += 1
            check -= timedelta(days=1)
        elif d < check:
            break

    return streak


@router.get("/overview")
def stats_overview(goal_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    total_goals = db.query(func.count(LearningGoal.id)).scalar() or 0
    active_goals = (
        db.query(func.count(LearningGoal.id))
        .filter(LearningGoal.status == GoalStatus.ACTIVE)
        .scalar() or 0
    )

    rec_query = db.query(LearningRecord)
    if goal_id:
        rec_query = rec_query.filter(LearningRecord.goal_id == goal_id)

    total_records = rec_query.count()
    total_duration = (
        db.query(func.coalesce(func.sum(LearningRecord.duration), 0))
    )
    if goal_id:
        total_duration = total_duration.filter(LearningRecord.goal_id == goal_id)
    total_duration = total_duration.scalar() or 0

    streak = calculate_streak(db, goal_id)

    today = date.today()
    today_records = rec_query.filter(LearningRecord.date == today).count()

    # Goals without today's record
    goals_with_today = (
        db.query(distinct(LearningRecord.goal_id))
        .filter(LearningRecord.date == today)
        .subquery()
    )
    goals_without = (
        db.query(LearningGoal)
        .filter(LearningGoal.status == GoalStatus.ACTIVE)
        .filter(~LearningGoal.id.in_(goals_with_today))
        .all()
    )

    # Recent records
    recent = (
        db.query(LearningRecord)
        .order_by(LearningRecord.date.desc(), LearningRecord.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "total_goals": total_goals,
        "active_goals": active_goals,
        "total_records": total_records,
        "total_duration": total_duration,
        "streak": streak,
        "today_records": today_records,
        "goals_without_today_record": [
            serialize_goal(g, *get_goal_stats(db, g.id)) for g in goals_without
        ],
        "recent_records": [serialize_record(r) for r in recent],
    }


@router.get("/heatmap")
def stats_heatmap(
    goal_id: Optional[UUID] = None,
    series_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
):
    query = db.query(
        LearningRecord.date,
        func.count(LearningRecord.id).label("count"),
        func.coalesce(func.sum(LearningRecord.duration), 0).label("duration"),
    )
    if goal_id:
        query = query.filter(LearningRecord.goal_id == goal_id)
    if series_id:
        query = query.filter(LearningRecord.series_id == series_id)
    query = query.filter(LearningRecord.date >= date.today() - timedelta(days=365))
    rows = query.group_by(LearningRecord.date).all()

    return [
        {"date": str(row.date), "count": row.count, "duration": row.duration}
        for row in rows
    ]


@router.get("/weekly")
def stats_weekly(
    goal_id: Optional[UUID] = None,
    weeks: int = Query(4, ge=1, le=52),
    db: Session = Depends(get_db),
):
    start = date.today() - timedelta(weeks=weeks)
    query = db.query(
        LearningRecord.date,
        func.count(LearningRecord.id).label("count"),
        func.coalesce(func.sum(LearningRecord.duration), 0).label("duration"),
    ).filter(LearningRecord.date >= start)

    if goal_id:
        query = query.filter(LearningRecord.goal_id == goal_id)

    rows = query.group_by(LearningRecord.date).all()
    return [
        {"date": str(row.date), "count": row.count, "duration": row.duration}
        for row in rows
    ]
