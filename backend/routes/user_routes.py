"""
User Management Routes
Handles user profile creation, updates, and settings
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging
import os
from datetime import datetime

from utils.supabase_client import supabase_client
from utils.r2_storage import r2_storage

router = APIRouter(prefix="/api/users", tags=["users"])
logger = logging.getLogger(__name__)

# Approved college domains - only these can access the system
APPROVED_DOMAINS = [
    "bmsit.in",
    # Add more domains here as needed
]


def is_college_email(email: str) -> bool:
    """Check if email domain is approved"""
    if not email:
        return False
    domain = email.lower().split('@')[-1]
    return domain in APPROVED_DOMAINS


class UserProfileRequest(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserSettingsRequest(BaseModel):
    email: EmailStr
    notifications_enabled: Optional[bool] = None
    auto_summarize_pdfs: Optional[bool] = None
    smart_suggestions_enabled: Optional[bool] = None
    response_style: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    notifications_enabled: bool
    auto_summarize_pdfs: bool
    smart_suggestions_enabled: bool
    response_style: str
    theme: str
    language: str
    total_pdfs_uploaded: int
    total_messages_sent: int
    total_storage_used_bytes: int
    subscription_tier: str
    created_at: str
    updated_at: str
    last_login_at: Optional[str] = None


@router.post("/login")
async def user_login(user: UserProfileRequest):
    """
    Record user login and create/update profile
    Called when user logs in
    Only allows approved college email domains
    """
    logger.info(f"📝 User login attempt: {user.email}")
    
    # Validate college email domain
    if not is_college_email(user.email):
        logger.warning(f"🚫 Rejected non-college email: {user.email}")
        raise HTTPException(
            status_code=403, 
            detail=f"Access denied. Only students with approved college email domains can register. Your domain: @{user.email.split('@')[-1]}"
        )
    
    try:
        logger.info(f"✅ College email approved: {user.email}")
        
        # Create or update user profile
        user_data = await supabase_client.create_or_update_user(
            email=user.email,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            update_login=True
        )
        
        if not user_data:
            raise HTTPException(status_code=500, detail="Failed to create/update user profile")
        
        logger.info(f"✅ User profile updated: {user.email}")
        return {
            "success": True,
            "message": "User profile updated successfully",
            "user": user_data
        }
        
    except Exception as e:
        logger.error(f"❌ Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profile/{email}")
async def get_user_profile(email: str):
    """
    Get user profile by email
    """
    logger.info(f"📋 Fetching profile: {email}")
    
    try:
        user_data = await supabase_client.get_user_by_email(email)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "user": user_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/display-name")
async def update_display_name(request: dict):
    """
    Update user display name
    """
    email = request.get('email')
    display_name = request.get('display_name')
    
    if not email or not display_name:
        raise HTTPException(status_code=400, detail="Email and display_name required")
    
    logger.info(f"✏️ Updating display name for: {email}")
    
    try:
        # Update in database
        user_data = await supabase_client.create_or_update_user(
            email=email,
            display_name=display_name
        )
        
        # Update Supabase Auth metadata
        import httpx
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_service_key = os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE')
        
        if supabase_service_key:
            async with httpx.AsyncClient() as admin_client:
                list_url = f"{supabase_url}/auth/v1/admin/users"
                headers_admin = {
                    "Authorization": f"Bearer {supabase_service_key}",
                    "apikey": supabase_service_key
                }
                
                list_response = await admin_client.get(list_url, headers=headers_admin)
                if list_response.status_code == 200:
                    users_list = list_response.json()
                    auth_user = next((u for u in users_list.get('users', []) if u.get('email') == email), None)
                    
                    if auth_user:
                        update_url = f"{supabase_url}/auth/v1/admin/users/{auth_user['id']}"
                        user_meta = auth_user.get('user_metadata', {})
                        user_meta['full_name'] = display_name
                        
                        await admin_client.put(
                            update_url,
                            headers=headers_admin,
                            json={"user_metadata": user_meta}
                        )
                        logger.info(f"✅ Updated display name in auth metadata")
        
        logger.info(f"✅ Display name updated: {email}")
        return {
            "success": True,
            "message": "Display name updated successfully",
            "display_name": display_name
        }
        
    except Exception as e:
        logger.error(f"❌ Display name update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/settings")
async def update_user_settings(settings: UserSettingsRequest):
    """
    Update user settings/preferences
    """
    logger.info(f"⚙️ Updating settings for: {settings.email}")
    
    try:
        # Prepare settings dict (only include non-None values)
        settings_dict = {}
        if settings.notifications_enabled is not None:
            settings_dict['notifications_enabled'] = settings.notifications_enabled
        if settings.auto_summarize_pdfs is not None:
            settings_dict['auto_summarize_pdfs'] = settings.auto_summarize_pdfs
        if settings.smart_suggestions_enabled is not None:
            settings_dict['smart_suggestions_enabled'] = settings.smart_suggestions_enabled
        if settings.response_style:
            settings_dict['response_style'] = settings.response_style
        if settings.theme:
            settings_dict['theme'] = settings.theme
        if settings.language:
            settings_dict['language'] = settings.language
        
        success = await supabase_client.update_user_settings(
            email=settings.email,
            settings=settings_dict
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update settings")
        
        logger.info(f"✅ Settings updated: {settings.email}")
        return {
            "success": True,
            "message": "Settings updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/usage/increment")
async def increment_usage(
    email: EmailStr,
    pdfs: int = 0,
    messages: int = 0,
    storage_bytes: int = 0
):
    """
    Increment user usage statistics
    Called after PDF upload or message send
    """
    logger.info(f"📊 Incrementing usage for: {email}")


@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    email: str = Form(...)
):
    """
    Upload user profile picture to Supabase storage
    """
    logger.info(f"📸 Avatar upload for: {email}")
    
    # Validate college email
    if not is_college_email(email):
        raise HTTPException(status_code=403, detail="Only college emails allowed")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only image files allowed")
    
    # Validate file size (5MB max)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be less than 5MB")
    
    try:
        # Generate unique filename
        timestamp = int(datetime.now().timestamp())
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"avatar_{timestamp}.{ext}"
        
        # Path in Supabase storage bucket
        storage_path = f"{email}/{filename}"
        bucket_name = "avatars"
        
        # Upload to Supabase storage using REST API
        import httpx
        from dotenv import load_dotenv
        load_dotenv()
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        # Use service role key to bypass RLS policies
        supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE')
        
        # Upload file to Supabase storage
        upload_url = f"{supabase_url}/storage/v1/object/{bucket_name}/{storage_path}"
        headers = {
            "Authorization": f"Bearer {supabase_key}",
            "apikey": supabase_key,
            "Content-Type": file.content_type
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(upload_url, headers=headers, content=content)
        
        logger.info(f"📤 Supabase response: {response.status_code} - {response.text}")
        
        if response.status_code not in [200, 201]:
            raise HTTPException(status_code=500, detail=f"Supabase upload failed: {response.text}")
        
        # Get public URL
        avatar_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{storage_path}"
        
        # Update user record in database
        user_data = await supabase_client.create_or_update_user(
            email=email,
            avatar_url=avatar_url
        )
        
        # Also update Supabase Auth user metadata
        try:
            supabase_service_key = os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE')
            if supabase_service_key:
                # Get user by email from auth
                async with httpx.AsyncClient() as admin_client:
                    list_url = f"{supabase_url}/auth/v1/admin/users"
                    headers_admin = {
                        "Authorization": f"Bearer {supabase_service_key}",
                        "apikey": supabase_service_key
                    }
                    
                    list_response = await admin_client.get(list_url, headers=headers_admin)
                    if list_response.status_code == 200:
                        users_list = list_response.json()
                        auth_user = next((u for u in users_list.get('users', []) if u.get('email') == email), None)
                        
                        if auth_user:
                            # Update user metadata
                            update_url = f"{supabase_url}/auth/v1/admin/users/{auth_user['id']}"
                            user_meta = auth_user.get('user_metadata', {})
                            user_meta['avatar_url'] = avatar_url
                            
                            await admin_client.put(
                                update_url,
                                headers=headers_admin,
                                json={"user_metadata": user_meta}
                            )
                            logger.info(f"✅ Updated auth metadata for: {email}")
        except Exception as meta_error:
            logger.warning(f"⚠️ Could not update auth metadata: {meta_error}")
        
        logger.info(f"✅ Avatar uploaded to Supabase: {email}")
        return {
            "success": True,
            "message": "Avatar uploaded successfully",
            "avatar_url": avatar_url
        }
        
    except Exception as e:
        logger.error(f"❌ Avatar upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/remove-avatar")
async def remove_avatar(request: dict):
    """
    Remove user profile picture from Supabase storage
    """
    email = request.get('email')
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    
    logger.info(f"🗑️ Avatar removal for: {email}")
    
    # Validate college email
    if not is_college_email(email):
        raise HTTPException(status_code=403, detail="Only college emails allowed")
    
    try:
        # Get user to find current avatar
        user_data = await supabase_client.get_user_by_email(email)
        
        if user_data and user_data.get('avatar_url'):
            # Extract path from Supabase storage URL and delete
            avatar_url = user_data['avatar_url']
            if '/storage/v1/object/public/avatars/' in avatar_url:
                # Extract the storage path after "avatars/"
                storage_path = avatar_url.split('/storage/v1/object/public/avatars/')[-1]
                
                # Delete from Supabase storage using REST API
                import httpx
                from dotenv import load_dotenv
                load_dotenv()
                
                supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
                # Use service role key to bypass RLS policies
                supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE')
                bucket_name = "avatars"
                
                delete_url = f"{supabase_url}/storage/v1/object/{bucket_name}/{storage_path}"
                headers = {
                    "Authorization": f"Bearer {supabase_key}",
                    "apikey": supabase_key
                }
                
                async with httpx.AsyncClient() as client:
                    await client.delete(delete_url, headers=headers)
                
                logger.info(f"☁️ Deleted from Supabase storage: {storage_path}")
        
        # Update user record to remove avatar URL
        user_data = await supabase_client.create_or_update_user(
            email=email,
            avatar_url=None
        )
        
        # Also update Supabase Auth user metadata
        try:
            from dotenv import load_dotenv
            load_dotenv()
            
            supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
            supabase_service_key = os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE')
            
            if supabase_service_key:
                async with httpx.AsyncClient() as admin_client:
                    list_url = f"{supabase_url}/auth/v1/admin/users"
                    headers_admin = {
                        "Authorization": f"Bearer {supabase_service_key}",
                        "apikey": supabase_service_key
                    }
                    
                    list_response = await admin_client.get(list_url, headers=headers_admin)
                    if list_response.status_code == 200:
                        users_list = list_response.json()
                        auth_user = next((u for u in users_list.get('users', []) if u.get('email') == email), None)
                        
                        if auth_user:
                            # Remove avatar from metadata
                            update_url = f"{supabase_url}/auth/v1/admin/users/{auth_user['id']}"
                            user_meta = auth_user.get('user_metadata', {})
                            user_meta.pop('avatar_url', None)
                            
                            await admin_client.put(
                                update_url,
                                headers=headers_admin,
                                json={"user_metadata": user_meta}
                            )
                            logger.info(f"✅ Removed avatar from auth metadata: {email}")
        except Exception as meta_error:
            logger.warning(f"⚠️ Could not update auth metadata: {meta_error}")
        
        logger.info(f"✅ Avatar removed: {email}")
        return {
            "success": True,
            "message": "Avatar removed successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Avatar removal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    try:
        success = await supabase_client.increment_usage_stats(
            email=email,
            pdfs=pdfs,
            messages=messages,
            storage_bytes=storage_bytes
        )
        
        if not success:
            # Don't fail the request if usage tracking fails
            logger.warning(f"⚠️ Failed to increment usage for: {email}")
        
        return {
            "success": success,
            "message": "Usage stats updated" if success else "Usage tracking unavailable"
        }
        
    except Exception as e:
        logger.error(f"❌ Error incrementing usage: {e}")
        # Don't fail the request
        return {
            "success": False,
            "message": str(e)
        }
