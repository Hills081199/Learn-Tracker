import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text, inspect as sa_inspect

from app.config import settings
from app.database import engine, Base
from app.routers import goals, series, records, upload, stats, tags


def run_migrations(eng):
    """Add series_id column to learning_records if missing."""
    inspector = sa_inspect(eng)
    tables = inspector.get_table_names()

    if "learning_records" in tables:
        columns = [col["name"] for col in inspector.get_columns("learning_records")]
        with eng.begin() as conn:
            if "series_id" not in columns:
                try:
                    conn.execute(text(
                        "ALTER TABLE learning_records "
                        "ADD COLUMN series_id UUID REFERENCES learning_series(id) ON DELETE CASCADE"
                    ))
                except Exception:
                    pass  # column may already exist

            # Make goal_id nullable if it isn't already
            try:
                conn.execute(text(
                    "ALTER TABLE learning_records ALTER COLUMN goal_id DROP NOT NULL"
                ))
            except Exception:
                pass


# Create all tables on startup
Base.metadata.create_all(bind=engine)
run_migrations(engine)

app = FastAPI(
    title="LearnTracker API",
    version="2.0.0",
    description="API for LearnTracker - Personal Learning Management",
)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])
app.include_router(series.router, prefix="/api", tags=["Series"])
app.include_router(records.router, prefix="/api", tags=["Records"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"])
app.include_router(tags.router, prefix="/api/tags", tags=["Tags"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "LearnTracker API v2 is running"}
