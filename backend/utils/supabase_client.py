"""
Supabase Client for Backend
Handles user management and data operations
"""

import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv
import httpx
import logging

load_dotenv()

logger = logging.getLogger(__name__)


class SupabaseClient:
    """
    Backend client for Supabase operations
    Uses REST API for user management
    """
    
    def __init__(self):
        self.url = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
        self.anon_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
        self.service_role = os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE', '')
        
        self.enabled = bool(self.url and (self.anon_key or self.service_role))
        
        if not self.enabled:
            logger.warning("⚠️ Supabase not configured")
        else:
            logger.info(f"✅ Supabase client initialized: {self.url}")
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile by email
        
        Args:
            email: User's email address
            
        Returns:
            User dict or None
        """
        if not self.enabled:
            return None
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.url}/rest/v1/users",
                    headers={
                        "apikey": self.service_role or self.anon_key,
                        "Authorization": f"Bearer {self.service_role or self.anon_key}",
                        "Content-Type": "application/json"
                    },
                    params={"email": f"eq.{email}", "select": "*"}
                )
                
                if response.status_code == 200:
                    users = response.json()
                    return users[0] if users else None
                else:
                    logger.error(f"Failed to fetch user: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error fetching user: {e}")
            return None
    
    async def create_or_update_user(
        self, 
        email: str, 
        display_name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        update_login: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Create or update user profile
        
        Args:
            email: User's email
            display_name: Display name
            avatar_url: Avatar URL
            update_login: Whether to update last_login_at
            
        Returns:
            User dict or None
        """
        if not self.enabled:
            return None
        
        try:
            # Check if user exists
            existing_user = await self.get_user_by_email(email)
            
            data = {}
            if display_name:
                data['display_name'] = display_name
            if avatar_url:
                data['avatar_url'] = avatar_url
            if update_login:
                data['last_login_at'] = 'now()'
            
            async with httpx.AsyncClient() as client:
                if existing_user:
                    # Update existing user
                    response = await client.patch(
                        f"{self.url}/rest/v1/users",
                        headers={
                            "apikey": self.service_role or self.anon_key,
                            "Authorization": f"Bearer {self.service_role or self.anon_key}",
                            "Content-Type": "application/json",
                            "Prefer": "return=representation"
                        },
                        params={"email": f"eq.{email}"},
                        json=data
                    )
                else:
                    # Create new user
                    data['email'] = email
                    response = await client.post(
                        f"{self.url}/rest/v1/users",
                        headers={
                            "apikey": self.service_role or self.anon_key,
                            "Authorization": f"Bearer {self.service_role or self.anon_key}",
                            "Content-Type": "application/json",
                            "Prefer": "return=representation"
                        },
                        json=data
                    )
                
                if response.status_code in [200, 201]:
                    result = response.json()
                    return result[0] if isinstance(result, list) else result
                elif response.status_code == 409:
                    # Duplicate key - user already exists, try to fetch and return
                    logger.info(f"User {email} already exists, fetching existing record")
                    return await self.get_user_by_email(email)
                else:
                    logger.error(f"Failed to create/update user: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error creating/updating user: {e}")
            return None
    
    async def update_user_settings(
        self,
        email: str,
        settings: Dict[str, Any]
    ) -> bool:
        """
        Update user settings
        
        Args:
            email: User's email
            settings: Dict of settings to update
            
        Returns:
            Success boolean
        """
        if not self.enabled:
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    f"{self.url}/rest/v1/users",
                    headers={
                        "apikey": self.service_role or self.anon_key,
                        "Authorization": f"Bearer {self.service_role or self.anon_key}",
                        "Content-Type": "application/json"
                    },
                    params={"email": f"eq.{email}"},
                    json=settings
                )
                
                return response.status_code in [200, 204]
                
        except Exception as e:
            logger.error(f"Error updating settings: {e}")
            return False
    
    async def increment_usage_stats(
        self,
        email: str,
        pdfs: int = 0,
        messages: int = 0,
        storage_bytes: int = 0
    ) -> bool:
        """
        Increment user usage statistics
        
        Args:
            email: User's email
            pdfs: Number of PDFs to add
            messages: Number of messages to add
            storage_bytes: Storage bytes to add
            
        Returns:
            Success boolean
        """
        if not self.enabled:
            return False
        
        try:
            user = await self.get_user_by_email(email)
            if not user:
                return False
            
            updates = {
                'total_pdfs_uploaded': user.get('total_pdfs_uploaded', 0) + pdfs,
                'total_messages_sent': user.get('total_messages_sent', 0) + messages,
                'total_storage_used_bytes': user.get('total_storage_used_bytes', 0) + storage_bytes
            }
            
            return await self.update_user_settings(email, updates)
            
        except Exception as e:
            logger.error(f"Error incrementing usage: {e}")
            return False


# Singleton instance
supabase_client = SupabaseClient()
