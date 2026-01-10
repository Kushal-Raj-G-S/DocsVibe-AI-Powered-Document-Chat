from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from database.db_config import Base

class Conversation(Base):
    """Stores conversation sessions (in Neon)"""
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), default="New Conversation")
    user_email = Column(String(255), nullable=False, index=True)  # Link to Supabase user
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)  # Index for fast sorting
    
    # Relationships
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    """Stores individual messages in conversations (in Neon)"""
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String(50))  # 'user' or 'assistant'
    content = Column(Text)
    model_used = Column(String(100), nullable=True)  # Which AI model was used
    reasoning = Column(Text, nullable=True)  # Chain-of-thought reasoning (for models that expose it)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")


# Supabase models
class UploadedFile(Base):
    """Stores uploaded file metadata (in Supabase) - actual files in R2"""
    __tablename__ = "uploaded_files"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer)  # Links to Neon conversation
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # 'pdf', 'docx', 'pptx', etc.
    file_path = Column(String(500), nullable=False)  # R2 object_key
    r2_url = Column(Text, nullable=True)  # Public R2 URL
    extracted_text = Column(Text)  # Full text content for search
    page_count = Column(Integer)
    file_size_bytes = Column(BigInteger)
    user_email = Column(String(255), nullable=False, index=True)  # Link to Supabase user
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    """User profiles and preferences (in Supabase)"""
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True)  # UUID from Supabase auth
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(255))
    avatar_url = Column(Text)
    
    # Settings
    notifications_enabled = Column(Boolean, default=True)
    auto_summarize_pdfs = Column(Boolean, default=False)
    smart_suggestions_enabled = Column(Boolean, default=True)
    response_style = Column(String(50), default='balanced')
    theme = Column(String(20), default='dark')
    language = Column(String(10), default='en')
    
    # Usage tracking
    total_pdfs_uploaded = Column(Integer, default=0)
    total_messages_sent = Column(Integer, default=0)
    total_storage_used_bytes = Column(BigInteger, default=0)
    
    # Subscription
    subscription_tier = Column(String(20), default='free')
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime)


# Legacy (deprecated)
class PDFFile(Base):
    """DEPRECATED - Use UploadedFile instead"""
    __tablename__ = "pdf_files"
    
    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    filename = Column(String(255))
    file_path = Column(String(500))
    r2_url = Column(Text)
    extracted_text = Column(Text)
    page_count = Column(Integer)
    user_email = Column(String(255))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    conversation = relationship("Conversation")
