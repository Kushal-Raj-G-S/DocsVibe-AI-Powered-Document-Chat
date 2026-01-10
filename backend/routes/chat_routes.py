"""
Chat Routes with Complete Backend Integration
- Response caching (1 hour TTL)
- Vector semantic search for document context
- Intelligent model routing with fallbacks
- Rate limiting (5 req/min)
- Multi-format document support (PDF, DOCX, PPTX)
- Cloudflare R2 storage for documents
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import logging

from database.db_config import get_db
from database.dual_db_config import get_supabase_db
from models.chat_models import Conversation, Message, UploadedFile
from utils.a4f_client import A4FClient
from utils.pdf_extractor import extract_text_from_file
from utils.model_router import model_router
from utils.cache_manager import cache_manager
from utils.reasoning_parser import parse_reasoning, sanitize_reasoning
from utils.r2_storage import r2_storage
from utils.supabase_client import supabase_client

router = APIRouter(prefix="/api/chat", tags=["chat"])
logger = logging.getLogger(__name__)

# Pydantic models
class ChatRequest(BaseModel):
    conversation_id: int
    message: str
    model: str = "provider-3/deepseek-v3-0324"
    user_id: str = "default_user"  # Add user_id for preferences

class ChatResponse(BaseModel):
    message_id: int
    response: str
    model_used: str
    cached: bool = False
    source: str = "ai"  # "cache" or "ai"
    reasoning: str | None = None  # Chain-of-thought reasoning (if available)
    
    model_config = {
        "protected_namespaces": ()  # Allow model_* fields
    }

# Initialize A4F client
a4f_client = A4FClient()


@router.post("/upload-pdf")
async def upload_pdf(
    conversation_id: int,
    file: UploadFile = File(...),
    selected_model: str = "auto",
    user_email: str = "default@example.com",  # Add user_email parameter
    db: Session = Depends(get_db),  # Neon - for conversation check
    supa_db: Session = Depends(get_supabase_db)  # Supabase - for file metadata
):
    """
    Upload a document file (PDF, DOCX, PPTX) to a conversation
    Supports up to 3 files when PDF analysis models are selected
    Files stored in R2, metadata in Supabase
    """
    
    logger.info(f"📤 Upload request - User: {user_email}, Conversation: {conversation_id}, File: {file.filename}, Model: {selected_model}")
    
    # Verify conversation exists in Neon
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check current file count from Supabase
    current_file_count = supa_db.query(UploadedFile).filter(
        UploadedFile.conversation_id == conversation_id
    ).count()
    
    # Get model category to check if multi-PDF is supported
    model_category = model_router.get_model_category(selected_model)
    supports_multi_pdf = model_category.get('supports_native_pdf', False)
    
    # Validate file limits based on model type
    if not supports_multi_pdf and current_file_count >= 1:
        raise HTTPException(
            status_code=400,
            detail="This model only supports 1 file. Switch to a PDF Analysis model to upload up to 3 files."
        )
    
    if supports_multi_pdf and current_file_count >= 3:
        raise HTTPException(
            status_code=400,
            detail="Maximum 3 files allowed per conversation. Please delete an existing file before uploading a new one."
        )
    
    logger.info(f"📊 Current files: {current_file_count}/3, Model supports multi-file: {supports_multi_pdf}")
    
    # Validate file type - ONLY documents (images not supported)
    file_ext = file.filename.lower().split('.')[-1]
    document_extensions = ['pdf', 'docx', 'pptx']
    
    if file_ext not in document_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: .{file_ext}. Only PDF, DOCX, and PPTX are supported."
        )
    
    # Read file content into memory
    file_content = await file.read()
    
    try:
        # Extract text directly from memory (no temp file)
        extracted_text, unit_count, detected_type = extract_text_from_file(file_content, file_ext)
        logger.info(f"📄 Extracted {unit_count} units from {detected_type}")
        
        # Upload to R2
        object_key, r2_url = await r2_storage.upload_file(
            file_content=file_content,
            conversation_id=conversation_id,
            filename=file.filename,
            user_email=user_email  # Use user's email for folder structure
        )
        
        if not object_key:
            raise Exception("Failed to upload file to R2 storage")
        
        logger.info(f"☁️ Uploaded to R2: {object_key}")
        
        # Save metadata to Supabase
        uploaded_file = UploadedFile(
            conversation_id=conversation_id,
            filename=file.filename,
            file_type=file_ext,
            file_path=object_key,  # R2 object key
            r2_url=r2_url,  # Public R2 URL
            extracted_text=extracted_text,
            page_count=unit_count,
            file_size_bytes=len(file_content),
            user_email=user_email
        )
        supa_db.add(uploaded_file)
        supa_db.commit()
        supa_db.refresh(uploaded_file)
        
        logger.info(f"✅ Upload successful - DB ID: {uploaded_file.id}")
        
        # Track usage in Supabase (don't fail if it doesn't work)
        try:
            await supabase_client.increment_usage_stats(
                email=user_email,
                pdfs=1,
                storage_bytes=len(file_content)
            )
            logger.info(f"📊 Usage stats updated for {user_email}")
        except Exception as e:
            logger.warning(f"⚠️ Failed to update usage stats: {e}")
        
        return {
            "file_id": uploaded_file.id,
            "filename": file.filename,
            "file_type": detected_type,
            "units": unit_count,
            "r2_url": r2_url,
            "total_files": current_file_count + 1,
            "max_files": 3 if supports_multi_pdf else 1,
            "message": f"{detected_type.upper()} uploaded successfully to cloud storage ({current_file_count + 1}/{3 if supports_multi_pdf else 1})"
        }
        
    except Exception as e:
        logger.error(f"❌ Upload failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))



@router.get("/pdfs/{conversation_id}")
async def get_conversation_pdfs(
    conversation_id: int,
    supa_db: Session = Depends(get_supabase_db)
):
    """
    Get all files uploaded to a conversation (Supabase)
    """
    uploaded_files = supa_db.query(UploadedFile).filter(
        UploadedFile.conversation_id == conversation_id
    ).all()
    
    return {
        "conversation_id": conversation_id,
        "total_files": len(uploaded_files),
        "files": [
            {
                "id": file.id,
                "filename": file.filename,
                "file_type": file.file_type,
                "file_size_bytes": file.file_size_bytes,
                "uploaded_at": file.uploaded_at.isoformat()
            }
            for file in uploaded_files
        ]
    }


@router.delete("/pdf/{pdf_id}")
async def delete_pdf(
    pdf_id: int,
    supa_db: Session = Depends(get_supabase_db)
):
    """
    Delete a specific file from a conversation (Supabase + R2)
    Deletes from both R2 storage and database
    """
    uploaded_file = supa_db.query(UploadedFile).filter(UploadedFile.id == pdf_id).first()
    
    if not uploaded_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete from R2 storage (file_path contains R2 object_key)
    r2_object_key = uploaded_file.file_path
    if r2_object_key:
        deleted = await r2_storage.delete_file(r2_object_key)
        if deleted:
            logger.info(f"☁️ Deleted from R2: {r2_object_key}")
        else:
            logger.warning(f"⚠️ Failed to delete from R2: {r2_object_key}")
    
    # Delete from Supabase database
    conversation_id = uploaded_file.conversation_id
    filename = uploaded_file.filename
    supa_db.delete(uploaded_file)
    supa_db.commit()
    
    logger.info(f"✅ Deleted file {pdf_id} ({filename}) from conversation {conversation_id}")
    
    return {
        "message": f"File '{filename}' deleted successfully from cloud storage",
        "file_id": pdf_id
    }


@router.post("/send", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    supa_db: Session = Depends(get_supabase_db)
):
    """
    Send a message and get AI response
    Features:
    - Check cache first (1 hour TTL)
    - Use vector search for document context
    - Intelligent model routing with fallbacks
    - Rate limiting (5 req/min)
    - Last 5 messages context window
    """
    
    logger.info(f"📩 Message - Conv: {chat_request.conversation_id}, Model: {chat_request.model}")
    
    # Verify conversation exists (Neon)
    conversation = db.query(Conversation).filter(
        Conversation.id == chat_request.conversation_id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # 0. CHECK IF DOCUMENTS EXIST (needed for cache key) - Supabase
    uploaded_files = supa_db.query(UploadedFile).filter(
        UploadedFile.conversation_id == chat_request.conversation_id
    ).all()
    has_documents = len(uploaded_files) > 0
    
    # 1. CHECK CACHE FIRST
    cached_response = cache_manager.get(
        conversation_id=chat_request.conversation_id,
        message=chat_request.message,
        model=chat_request.model,
        has_pdf=has_documents
    )
    
    if cached_response:
        logger.info(f"✅ Cache HIT - Returning cached response")
        
        # Save user message (for history)
        user_message = Message(
            conversation_id=chat_request.conversation_id,
            role="user",
            content=chat_request.message
        )
        db.add(user_message)
        
        # Auto-rename conversation if it's the first message
        message_count = db.query(Message).filter(
            Message.conversation_id == chat_request.conversation_id
        ).count()
        
        if message_count == 0:  # First message (before commit)
            conversation = db.query(Conversation).filter(
                Conversation.id == chat_request.conversation_id
            ).first()
            if conversation and (conversation.title == "New Conversation" or conversation.title == "New Chat"):
                # Truncate to ~60 chars
                new_title = chat_request.message[:60].strip()
                if len(chat_request.message) > 60:
                    new_title += "..."
                conversation.title = new_title
                logger.info(f"🏷️ Auto-renamed conversation to: {new_title}")
        
        # Save cached assistant message
        assistant_message = Message(
            conversation_id=chat_request.conversation_id,
            role="assistant",
            content=cached_response,
            model_used=f"{chat_request.model} (cached)"
        )
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)
        
        return ChatResponse(
            message_id=assistant_message.id,
            response=cached_response,
            model_used=chat_request.model,
            cached=True,
            source="cache"
        )
    
    # 2. CACHE MISS - CHECK RATE LIMIT
    rate_limit_status = model_router.check_rate_limit()
    if not rate_limit_status['allowed']:
        raise HTTPException(
            status_code=429, 
            detail=f"⏱️ Rate limit exceeded: {rate_limit_status['requests_made']}/{rate_limit_status['limit']} requests. Wait {rate_limit_status['retry_after']}s."
        )
    
    logger.info(f"✅ Rate limit OK: {rate_limit_status['remaining']} remaining")
    
    # 3. SAVE USER MESSAGE
    user_message = Message(
        conversation_id=chat_request.conversation_id,
        role="user",
        content=chat_request.message
    )
    db.add(user_message)
    db.commit()
    
    # 3.5. AUTO-RENAME CONVERSATION IF FIRST MESSAGE (like ChatGPT/Claude)
    message_count = db.query(Message).filter(
        Message.conversation_id == chat_request.conversation_id
    ).count()
    
    if message_count == 1:  # First message (just added user message)
        conversation = db.query(Conversation).filter(
            Conversation.id == chat_request.conversation_id
        ).first()
        if conversation and (conversation.title == "New Conversation" or conversation.title == "New Chat"):
            # Truncate to ~60 chars like ChatGPT does
            new_title = chat_request.message[:60].strip()
            if len(chat_request.message) > 60:
                new_title += "..."
            conversation.title = new_title
            db.commit()
            logger.info(f"🏷️ Auto-renamed conversation to: {new_title}")
    
    # 4. GET CONVERSATION HISTORY (last 5 user-assistant pairs BEFORE current message)
    # Get messages EXCLUDING the one we just added (it will be added by a4f_client)
    previous_messages = db.query(Message).filter(
        Message.conversation_id == chat_request.conversation_id,
        Message.id != user_message.id  # Exclude current message
    ).order_by(Message.created_at.desc()).limit(10).all()
    
    # Reverse to get chronological order
    previous_messages.reverse()
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in previous_messages
    ][-10:]  # Keep last 10 messages (5 pairs)
    
    logger.info(f"📜 Context: {len(conversation_history)} previous messages (current question will be added by API client)")
    
    # 5. DOCUMENT CONTEXT (already fetched earlier for cache key)
    if has_documents:
        logger.info(f"📑 Found {len(uploaded_files)} file(s) in conversation")
    
    # 5.5. USE DEFAULT PREFERENCES (UserPreferences moved to user settings)
    response_style = "balanced"
    auto_summarize = False
    logger.info(f"⚙️ Using default preferences")
    
    # 6. GET INTELLIGENT MODEL ROUTING WITH 3-TIER FALLBACK
    ai_response = None
    model_used = None
    max_attempts = 3  # Primary (0), Secondary (1), Fallback (2)
    
    for attempt in range(max_attempts):
        try:
            # Get model for this attempt
            selected_model, routing_info = model_router.get_model_for_query(
                chat_request.message, 
                user_selected_model=chat_request.model,
                has_documents=has_documents,
                attempt=attempt
            )
            
            tier_name = routing_info.get('tier', 'unknown')
            supports_native_pdf = routing_info.get("supports_native_pdf", False)
            context_window = routing_info.get("context_window", 15000)
            
            logger.info(f"🎯 Attempt {attempt + 1}/{max_attempts} - Tier: {tier_name} → Model: {selected_model}")
            logger.info(f"📊 Capabilities - Native PDF: {supports_native_pdf}, Context: {context_window}")
            
            # 7. PREPARE DOCUMENT CONTEXT BASED ON MODEL CAPABILITIES
            document_context = None
            if has_documents:
                if supports_native_pdf:
                    # DeepSeek models with native PDF support - combine all files (up to 3)
                    combined_texts = []
                    total_chars = 0
                    max_chars_per_file = 40000  # 40K chars per file (120K total for 3 files)
                    
                    for idx, uploaded_file in enumerate(uploaded_files, 1):
                        file_text = uploaded_file.extracted_text[:max_chars_per_file]
                        combined_texts.append(f"\n\n{'='*60}\n📄 DOCUMENT {idx}: {uploaded_file.filename}\n{'='*60}\n\n{file_text}")
                        total_chars += len(file_text)
                    
                    document_context = "\n".join(combined_texts)
                    logger.info(f"📑 Combined {len(uploaded_files)} files - LARGE context ({total_chars} chars) for native PDF model")
                else:
                    # Other models - use only first file with smaller context
                    first_file = uploaded_files[0]
                    document_context = first_file.extracted_text[:15000]  # 15K chars limit
                    logger.info(f"📑 Using FIRST file only ({first_file.filename}) - STANDARD context ({len(document_context)} chars)")
                    
                    if len(uploaded_files) > 1:
                        logger.warning(f"⚠️ Model doesn't support multi-file. Using only first file. Switch to PDF Analysis models for all {len(uploaded_files)} files.")
            
            # 8. MAKE API CALL (without internal fallback - we control retries)
            ai_response, model_used = await a4f_client.chat_with_context(
                user_message=chat_request.message,
                conversation_history=conversation_history,
                document_context=document_context,
                model=selected_model,
                fallback_model=None,  # Disable internal fallback, we control it
                response_style=response_style  # Apply user's preferred response style
            )
            
            logger.info(f"✅ Success on attempt {attempt + 1} using {model_used} ({tier_name})")
            break  # Success - exit retry loop
            
        except Exception as e:
            logger.warning(f"⚠️ Attempt {attempt + 1} failed with {selected_model}: {str(e)}")
            
            if attempt == max_attempts - 1:
                # Final attempt failed
                logger.error(f"❌ All {max_attempts} attempts failed")
                raise HTTPException(
                    status_code=500, 
                    detail=f"AI API error: All models failed. Last error: {str(e)}"
                )
            else:
                logger.info(f"🔄 Retrying with next tier...")
                continue
    
    if not ai_response:
        raise HTTPException(status_code=500, detail="Failed to get AI response")
    
    # 8.5. PARSE REASONING (strip <think> tags if present)
    logger.debug(f"📝 Raw AI response (first 500 chars): {ai_response[:500]}")
    clean_response, reasoning = parse_reasoning(ai_response)
    
    if reasoning:
        reasoning = sanitize_reasoning(reasoning)
        logger.info(f"🧠 Extracted reasoning ({len(reasoning)} chars) from response")
        logger.debug(f"✂️ Clean response (first 500 chars): {clean_response[:500]}")
    else:
        logger.debug(f"ℹ️ No <think> tags found in response")
    
    # 9. CACHE THE RESPONSE (cache clean response only)
    cache_manager.set(
        conversation_id=chat_request.conversation_id,
        message=chat_request.message,
        model=chat_request.model,
        response=clean_response,
        has_pdf=has_documents
    )
    
    # 10. SAVE ASSISTANT MESSAGE (with reasoning if available)
    assistant_message = Message(
        conversation_id=chat_request.conversation_id,
        role="assistant",
        content=clean_response,
        model_used=model_used,
        reasoning=reasoning  # Store reasoning separately
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)
    
    return ChatResponse(
        message_id=assistant_message.id,
        response=clean_response,
        model_used=model_used,
        cached=False,
        source="ai",
        reasoning=reasoning
    )
