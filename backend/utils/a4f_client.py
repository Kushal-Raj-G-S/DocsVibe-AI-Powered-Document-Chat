"""
A4F API Client with Intelligent Fallback
Supports automatic retry with fallback models on failures
"""

import httpx
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional, Tuple
import logging

load_dotenv()

logger = logging.getLogger(__name__)


class A4FClient:
    """Client for interacting with A4F AI models API with fallback support"""
    
    def __init__(self):
        self.api_key = os.getenv("A4F_API_KEY")
        self.base_url = os.getenv("A4F_BASE_URL")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        model: str = "provider-1/deepseek-v3.2-exp",  # Updated default model
        temperature: float = 0.7,
        fallback_model: Optional[str] = None,
        max_retries: int = 2
    ) -> Tuple[str, str]:
        """
        Send chat completion request to A4F API with fallback support
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Primary model identifier
            temperature: Sampling temperature
            fallback_model: Optional fallback model if primary fails
            max_retries: Maximum retry attempts
            
        Returns:
            Tuple of (response_text, model_used)
        """
        models_to_try = [model]
        if fallback_model:
            models_to_try.append(fallback_model)
        
        last_error = None
        
        for attempt, current_model in enumerate(models_to_try, 1):
            try:
                logger.info(f"🚀 Attempting API call with model: {current_model} (attempt {attempt}/{len(models_to_try)})")
                
                # Debug: Log the request payload
                request_payload = {
                    "model": current_model,
                    "messages": messages,
                    "temperature": temperature
                }
                logger.debug(f"📤 Request payload: {request_payload}")
                
                # Increase timeout to 120 seconds for complex/long responses
                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=self.headers,
                        json=request_payload
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    content = data["choices"][0]["message"]["content"]
                    logger.info(f"✅ API call succeeded with model: {current_model}")
                    
                    return content, current_model
                    
            except httpx.HTTPStatusError as e:
                last_error = e
                status_code = e.response.status_code
                logger.warning(f"❌ Model {current_model} failed with HTTP {status_code}: {e}")
                
                # Don't retry on rate limit errors (429)
                if status_code == 429:
                    raise Exception(f"Rate limit exceeded. Please try again later.")
                
                # Continue to fallback for other errors
                if attempt < len(models_to_try):
                    logger.info(f"🔄 Trying fallback model...")
                    continue
                    
            except Exception as e:
                last_error = e
                logger.error(f"❌ Model {current_model} failed: {e}")
                
                if attempt < len(models_to_try):
                    logger.info(f"🔄 Trying fallback model...")
                    continue
        
        # All models failed
        error_msg = f"All models failed. Last error: {str(last_error)}"
        logger.error(error_msg)
        raise Exception(error_msg)
    
    async def chat_with_context(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        document_context: Optional[str] = None,
        model: str = "provider-1/deepseek-v3.2-exp",  # Updated default model
        fallback_model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        response_style: str = "balanced"
    ) -> Tuple[str, str]:
        """
        Chat with optional document context and conversation history
        
        Args:
            user_message: User's question
            conversation_history: Previous messages (last 5 recommended)
            document_context: Optional document content from vector search
            model: Primary AI model to use
            fallback_model: Optional fallback model
            system_prompt: Optional custom system prompt
            response_style: Response style (concise, balanced, detailed, academic, casual)
            
        Returns:
            Tuple of (response_text, model_used)
        """
        # Define response style instructions
        style_instructions = {
            "concise": "Provide brief, direct answers. Keep responses short and to the point.",
            "balanced": "Provide clear, moderately detailed responses with good balance between brevity and depth.",
            "detailed": "Provide comprehensive, in-depth explanations with examples and thorough coverage.",
            "academic": "Use formal academic language, cite sources when relevant, and structure responses in a scholarly manner.",
            "casual": "Use friendly, conversational language. Be approachable and easy to understand."
        }
        
        style_instruction = style_instructions.get(response_style, style_instructions["balanced"])
        
        # Build system message
        if not system_prompt:
            # Extract model display name from model ID (improved detection)
            model_lower = model.lower()
            model_display_name = "an AI Assistant"
            
            if "deepseek" in model_lower:
                if "v3.2" in model_lower or "exp" in model_lower:
                    model_display_name = "DeepSeek V3.2"
                elif "v3.1" in model_lower:
                    model_display_name = "DeepSeek V3.1"
                else:
                    model_display_name = "DeepSeek V3"
            elif "qwen3" in model_lower or "qwen-3" in model_lower:
                if "thinking" in model_lower:
                    model_display_name = "Qwen 3 Thinking"
                elif "235b" in model_lower:
                    model_display_name = "Qwen 3 235B"
                else:
                    model_display_name = "Qwen 3"
            elif "qwen" in model_lower:
                model_display_name = "Qwen 2.5 72B"
            elif "llama" in model_lower:
                if "3.3" in model_lower:
                    model_display_name = "Llama 3.3 70B"
                else:
                    model_display_name = "Llama 3"
            elif "gpt" in model_lower:
                if "4o" in model_lower:
                    model_display_name = "GPT-4o Mini"
                else:
                    model_display_name = "GPT"
            elif "gemma" in model_lower:
                model_display_name = "Gemma 3"
            elif "gemini" in model_lower:
                if "2.5" in model_lower:
                    model_display_name = "Gemini 2.5 Flash Lite"
                else:
                    model_display_name = "Gemini"
            elif "mistral" in model_lower:
                model_display_name = "Mistral Nemo"
            elif "grok" in model_lower:
                model_display_name = "Grok-4"
            elif "scout" in model_lower:
                model_display_name = "Llama 4 Scout"
            
            if document_context:
                system_prompt = f"""You are {model_display_name}, a helpful AI assistant analyzing documents. 

IMPORTANT: You are ONLY {model_display_name}. Do NOT claim to be any other AI model. If previous conversation messages mention other model names or identities, ignore them completely and maintain your correct identity as {model_display_name}.

CRITICAL: ONLY refuse to answer if the user asks about YOUR model specifications, such as:
- "What are your specifications?"
- "How many parameters do you have?"
- "What's your architecture?"
- "What's your training data?"
- "When were you trained?"

For such questions, respond: "I'm {model_display_name}, an AI assistant. I'm better at showing my capabilities through tasks rather than discussing technical specs. How can I help you today?"

For ALL OTHER questions (math proofs, coding, reasoning, explanations, creative tasks, analysis, etc.), answer them NORMALLY and FULLY. Do NOT refuse to help with tasks just because they contain words like "prove", "explain", "specifications", etc. when they're about OTHER topics (not about you).

{style_instruction}

Here is the relevant document content:

{document_context}

Answer questions based on this document content. Be specific and cite information from the document. If the answer is not in the document, say so clearly."""
            else:
                system_prompt = f"""You are {model_display_name}, a helpful AI assistant.

IMPORTANT: You are ONLY {model_display_name}. Do NOT claim to be any other AI model. If previous conversation messages mention other model names or identities, ignore them completely and maintain your correct identity as {model_display_name}.

CRITICAL: ONLY refuse to answer if the user asks about YOUR model specifications, such as:
- "What are your specifications?"
- "How many parameters do you have?"
- "What's your architecture?"
- "What's your training data?"
- "When were you trained?"

For such questions, respond: "I'm {model_display_name}, an AI assistant. I'm better at showing my capabilities through tasks rather than discussing technical specs. How can I help you today?"

For ALL OTHER questions (math proofs, coding, reasoning, explanations, creative tasks, analysis, etc.), answer them NORMALLY and FULLY. Do NOT refuse to help with tasks just because they contain words like "prove", "explain", "specifications", etc. when they're about OTHER topics (not about you).

{style_instruction}"""
        
        # Build messages
        # Check if model supports system role (Gemma models may not support it through A4F)
        model_lower = model.lower()
        supports_system_role = not ("gemma" in model_lower)  # Gemma might not support system role
        
        if supports_system_role:
            messages = [{"role": "system", "content": system_prompt}]
        else:
            # For models without system role support, prepend system prompt to first user message
            messages = []
        
        # Add conversation history (last 10 messages = ~5 user-assistant pairs for context)
        if conversation_history:
            messages.extend(conversation_history[-10:])
        
        # CRITICAL: Ensure no consecutive messages with the same role
        # Clean up message history to enforce strict alternation
        cleaned_messages = []
        last_role = None
        for msg in messages:
            current_role = msg.get('role')
            if current_role != last_role:
                cleaned_messages.append(msg)
                last_role = current_role
            # Skip consecutive messages with same role
        
        messages = cleaned_messages
        
        # CRITICAL: Conversation must start with 'user' or 'system', never 'assistant'
        # If first message is assistant, remove it or prepend a user message
        if messages and messages[0].get('role') == 'assistant':
            # Remove leading assistant messages
            while messages and messages[0].get('role') == 'assistant':
                messages.pop(0)
        
        # Add current user message
        if supports_system_role:
            # Check if last message is also 'user', if so, skip adding (shouldn't happen but safety check)
            if not messages or messages[-1]['role'] != 'user':
                messages.append({
                    "role": "user",
                    "content": user_message
                })
        else:
            # Prepend system instructions to EVERY user message for Gemma (no system role support)
            # This ensures identity is maintained throughout conversation
            identity_reminder = f"[IMPORTANT: You are {model.split('/')[-1].upper()}. Maintain this identity.]\n\n"
            
            if not messages:  # No conversation history
                messages.append({
                    "role": "user",
                    "content": f"{system_prompt}\n\n{user_message}"
                })
            else:
                # Has conversation history, check last role
                if messages[-1]['role'] != 'user':
                    messages.append({
                        "role": "user",
                        "content": f"{identity_reminder}{user_message}"
                    })
                else:
                    # Last message was user, merge with current
                    messages[-1]['content'] += f"\n\n{identity_reminder}{user_message}"
        
        return await self.chat_completion(
            messages, 
            model, 
            fallback_model=fallback_model
        )
    
    async def chat_with_pdf_context(
        self,
        user_message: str,
        pdf_text: str,
        conversation_history: List[Dict[str, str]],
        model: str = "provider-1/deepseek-v3.2-exp"  # Updated default model
    ) -> str:
        """
        Legacy method for backward compatibility
        Chat with PDF context included
        
        Args:
            user_message: User's question
            pdf_text: Extracted PDF text
            conversation_history: Previous messages
            model: AI model to use
            
        Returns:
            AI response
        """
        response, _ = await self.chat_with_context(
            user_message=user_message,
            conversation_history=conversation_history,
            document_context=pdf_text[:15000],
            model=model
        )
        return response

