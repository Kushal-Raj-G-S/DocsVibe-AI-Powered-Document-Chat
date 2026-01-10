"""
User Preferences Routes
Handles user settings and preferences
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import logging

from database.db_config import get_db
from models.chat_models import UserPreferences

router = APIRouter(prefix="/api/preferences", tags=["preferences"])
logger = logging.getLogger(__name__)


class PreferencesRequest(BaseModel):
    user_id: str
    notifications_enabled: bool = True
    auto_summarize_pdfs: bool = False
    smart_suggestions_enabled: bool = True
    response_style: str = "balanced"


class PreferencesResponse(BaseModel):
    user_id: str
    notifications_enabled: bool
    auto_summarize_pdfs: bool
    smart_suggestions_enabled: bool
    response_style: str
    
    model_config = {
        "protected_namespaces": ()
    }


@router.get("/{user_id}", response_model=PreferencesResponse)
async def get_preferences(user_id: str, db: Session = Depends(get_db)):
    """Get user preferences"""
    
    logger.info(f"📋 Fetching preferences for user: {user_id}")
    
    # Try to find existing preferences
    preferences = db.query(UserPreferences).filter(
        UserPreferences.user_id == user_id
    ).first()
    
    # If not found, create default preferences
    if not preferences:
        logger.info(f"✨ Creating default preferences for new user: {user_id}")
        preferences = UserPreferences(
            user_id=user_id,
            notifications_enabled=True,
            auto_summarize_pdfs=False,
            smart_suggestions_enabled=True,
            response_style="balanced"
        )
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
    
    return PreferencesResponse(
        user_id=preferences.user_id,
        notifications_enabled=preferences.notifications_enabled,
        auto_summarize_pdfs=preferences.auto_summarize_pdfs,
        smart_suggestions_enabled=preferences.smart_suggestions_enabled,
        response_style=preferences.response_style
    )


@router.post("/", response_model=PreferencesResponse)
async def update_preferences(
    prefs: PreferencesRequest,
    db: Session = Depends(get_db)
):
    """Update or create user preferences"""
    
    logger.info(f"💾 Updating preferences for user: {prefs.user_id}")
    
    # Try to find existing preferences
    preferences = db.query(UserPreferences).filter(
        UserPreferences.user_id == prefs.user_id
    ).first()
    
    if preferences:
        # Update existing
        preferences.notifications_enabled = prefs.notifications_enabled
        preferences.auto_summarize_pdfs = prefs.auto_summarize_pdfs
        preferences.smart_suggestions_enabled = prefs.smart_suggestions_enabled
        preferences.response_style = prefs.response_style
        logger.info(f"✅ Updated existing preferences")
    else:
        # Create new
        preferences = UserPreferences(
            user_id=prefs.user_id,
            notifications_enabled=prefs.notifications_enabled,
            auto_summarize_pdfs=prefs.auto_summarize_pdfs,
            smart_suggestions_enabled=prefs.smart_suggestions_enabled,
            response_style=prefs.response_style
        )
        db.add(preferences)
        logger.info(f"✨ Created new preferences")
    
    db.commit()
    db.refresh(preferences)
    
    return PreferencesResponse(
        user_id=preferences.user_id,
        notifications_enabled=preferences.notifications_enabled,
        auto_summarize_pdfs=preferences.auto_summarize_pdfs,
        smart_suggestions_enabled=preferences.smart_suggestions_enabled,
        response_style=preferences.response_style
    )
