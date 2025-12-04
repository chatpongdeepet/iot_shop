import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from .. import models
from .auth import get_current_user
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/upload",
    tags=["upload"]
)

# Configure Cloudinary
# Handle potential typo in .env as seen in user's file
api_key = os.getenv("CLOUDINARY_API_KEY") or os.getenv("COULDINARY_API_KEY")
api_secret = os.getenv("CLOUDINARY_API_SECRET") or os.getenv("COULDINARY_API_SECRET")
cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME") or os.getenv("COULDINARY_CLOUD_NAME") or os.getenv("CLOUD_NAME")

if not api_key or not api_secret:
    print("Warning: Cloudinary credentials missing in .env")

cloudinary.config( 
  cloud_name = cloud_name, 
  api_key = api_key, 
  api_secret = api_secret 
)

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if not cloud_name:
        raise HTTPException(status_code=500, detail="Server misconfiguration: Cloudinary Cloud Name missing")

    # Debug logging
    print(f"Debug: Cloud Name present: {bool(cloud_name)}")
    print(f"Debug: API Key present: {bool(api_key)}")
    print(f"Debug: API Secret present: {bool(api_secret)}")

    try:
        # Upload to Cloudinary
        print("Attempting upload to Cloudinary...")
        result = cloudinary.uploader.upload(file.file)
        print("Upload successful")
        return {"url": result.get("secure_url")}
    except Exception as e:
        print(f"Upload error details: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
