"""
Cloudflare R2 Storage Manager
Handles document uploads to R2 bucket (10GB free)
Supports: PDF, DOCX, PPTX
"""

import boto3
from botocore.config import Config
import os
from typing import Optional, Tuple
import logging
import mimetypes
from datetime import datetime

logger = logging.getLogger(__name__)


class R2StorageManager:
    """
    Manages file uploads to Cloudflare R2
    Free tier: 10GB storage/month, unlimited egress, 1M writes, 10M reads
    """
    
    # MIME type mapping for supported files
    MIME_TYPES = {
        'pdf': 'application/pdf',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'ppt': 'application/vnd.ms-powerpoint'
    }
    
    def __init__(self):
        """Initialize R2 client with credentials from env"""
        endpoint_url = os.getenv('R2_ENDPOINT_URL')
        access_key = os.getenv('R2_ACCESS_KEY_ID')
        secret_key = os.getenv('R2_SECRET_ACCESS_KEY')
        
        # Check if R2 is configured
        if not all([endpoint_url, access_key, secret_key]):
            logger.warning("⚠️ R2 not configured - file upload will fail")
            self.enabled = False
            return
        
        try:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=endpoint_url,
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                config=Config(signature_version='s3v4'),
                region_name='auto'
            )
            self.bucket_name = os.getenv('R2_BUCKET_NAME', 'student-notes')
            self.public_url = os.getenv('R2_PUBLIC_URL', '')
            self.enabled = True
            logger.info(f"✅ R2 Storage initialized - Bucket: {self.bucket_name}")
        except Exception as e:
            logger.error(f"❌ R2 initialization failed: {e}")
            self.enabled = False
    
    def _get_content_type(self, filename: str) -> str:
        """Get MIME type for file"""
        ext = filename.lower().split('.')[-1]
        return self.MIME_TYPES.get(ext, 'application/octet-stream')
    
    async def upload_file(
        self, 
        file_content: bytes, 
        conversation_id: int,
        filename: str,
        user_email: str = "default_user",
        is_avatar: bool = False
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Upload document or avatar to R2
        
        Args:
            file_content: File bytes
            conversation_id: Conversation ID (0 for avatars)
            filename: Original filename or object_key for avatars
            user_email: User's email
            is_avatar: True if uploading profile picture
        
        Returns:
            Tuple of (object_key, public_url) or (None, None) on failure
            user_email: User's email address (used for folder structure)
            is_avatar: True if uploading profile picture
        
        Returns:
            Tuple of (object_key, public_url) or (None, None) if failed
        """
        if not self.enabled:
            logger.error("R2 is not configured")
            return None, None
        
        try:
            # For avatars, filename is already the full object_key
            if is_avatar:
                object_key = filename
            else:
                # Create unique path: users/{email}/conversations/{conv_id}/{timestamp}_{filename}
                # Sanitize email for folder name (replace @ and . with _)
                safe_email = user_email.replace('@', '_at_').replace('.', '_')
                timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
                object_key = f"users/{safe_email}/conversations/{conversation_id}/{timestamp}_{filename}"
            
            content_type = self._get_content_type(filename)
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=file_content,
                ContentType=content_type,
                Metadata={
                    'user_email': user_email,
                    'conversation_id': str(conversation_id),
                    'original_filename': filename if not is_avatar else 'avatar'
                }
            )
            
            # Construct public URL
            if self.public_url:
                public_url = f"{self.public_url}/{object_key}"
            else:
                public_url = f"https://{self.bucket_name}.r2.dev/{object_key}"
            
            logger.info(f"✅ Uploaded to R2: {object_key}")
            return object_key, public_url
            
        except Exception as e:
            logger.error(f"❌ R2 upload failed: {e}")
            return None, None
    
    async def download_file(self, object_key: str) -> Optional[bytes]:
        """Download file from R2"""
        if not self.enabled:
            return None
        
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            logger.info(f"✅ Downloaded from R2: {object_key}")
            return response['Body'].read()
        except Exception as e:
            logger.error(f"❌ R2 download failed: {e}")
            return None
    
    async def delete_file(self, object_key: str) -> bool:
        """Delete file from R2"""
        if not self.enabled:
            return False
        
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            logger.info(f"✅ Deleted from R2: {object_key}")
            return True
        except Exception as e:
            logger.error(f"❌ R2 delete failed: {e}")
            return False
    
    def get_public_url(self, object_key: str) -> str:
        """Get public URL for an object"""
        if self.public_url:
            return f"{self.public_url}/{object_key}"
        return f"https://{self.bucket_name}.r2.dev/{object_key}"


# Singleton instance
r2_storage = R2StorageManager()
