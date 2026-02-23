import uuid
import os
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Attachment
from app.schemas import UploadResponse

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"}


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    # Read file content
    contents = await file.read()

    # Validate file size
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max 10MB.")

    # Validate extension
    ext = Path(file.filename).suffix.lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")

    # Generate unique filename
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    # Save file
    with open(filepath, "wb") as f:
        f.write(contents)

    # Determine type
    if ext in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
        file_type = "IMAGE"
    elif ext == ".pdf":
        file_type = "PDF"
    else:
        file_type = "FILE"

    return UploadResponse(
        url=f"/uploads/{filename}",
        name=file.filename or filename,
        size=len(contents),
        type=file_type,
    )


@router.delete("/attachments/{attachment_id}")
def delete_attachment(attachment_id: uuid.UUID, db: Session = Depends(get_db)):
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    # Try to delete the physical file
    filepath = os.path.join(settings.UPLOAD_DIR, os.path.basename(attachment.url))
    if os.path.exists(filepath):
        os.remove(filepath)

    db.delete(attachment)
    db.commit()
    return {"message": "Attachment deleted"}
