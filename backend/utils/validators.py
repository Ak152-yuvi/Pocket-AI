import re
from fastapi import HTTPException, UploadFile, status

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

def validate_image_file(file: UploadFile):
    """Validate uploaded image MIME type and presence."""
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded. Please upload a valid image (JPG, PNG, or WEBP)."
        )
    
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Only JPG, JPEG, PNG, and WEBP formats are accepted."
        )

def validate_budget_bounds(budget: float, min_budget: float = 100.0, max_budget: float = 100_000_000.0):
    """Validate budget is within realistic boundaries."""
    if budget < min_budget:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Budget must be at least {min_budget}."
        )
    if budget > max_budget:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Budget exceeds maximum allowable limit of {max_budget}."
        )
