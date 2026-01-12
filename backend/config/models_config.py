"""
============================================
MODELS CONFIGURATION FILE
============================================

This is the SINGLE SOURCE OF TRUTH for all AI models in the backend.

UPDATE THIS FILE when:
- New models are available from the provider
- Models are deprecated or removed
- Model capabilities change (context window, PDF support, etc.)
- Routing priorities need adjustment
- Categories need to be reorganized

SYNC WITH: frontend/config/models.ts

Last Updated: January 2025 - 18 Curated Models Across 6 Categories
============================================
"""

from typing import Dict, List, TypedDict


class ModelTier(TypedDict):
    """Model tier configuration"""
    primary: str
    secondary: str
    fallback: str
    supports_native_pdf: bool
    context_window: int
    description: str
    additional_models: List[str]


# ============================================
# MODEL CATEGORIES WITH 3-TIER SYSTEM
# ============================================
# Each category has:
# - primary: First choice model (best performance)
# - secondary: Backup if primary fails
# - fallback: Last resort if both fail
# - additional_models: Other models in this category
# ============================================

MODEL_CATEGORIES: Dict[str, ModelTier] = {
    # PDF Analysis - Large multimodal for documents
    'pdf_analysis': {
        'primary': 'provider-8/qwen2.5-vl-32b-instruct',
        'secondary': 'provider-8/qwen3-next-80b-a3b-instruct',
        'fallback': 'provider-1/qwen3-next-80b-a3b-instruct',
        'supports_native_pdf': True,
        'context_window': 128000,
        'description': 'PDF Analysis - Vision models for document understanding',
        'additional_models': []
    },
    
    # General Chat - Friendly conversational AI
    'general_chat': {
        'primary': 'provider-8/kimi-k2',
        'secondary': 'provider-8/gemini-2.0-flash',
        'fallback': 'provider-8/mistral-small-3.2-24b-instruct',
        'supports_native_pdf': False,
        'context_window': 128000,
        'description': 'General Chat - Balanced conversational models',
        'additional_models': []
    },
    
    # Reasoning - Purpose-built with thinking
    'reasoning': {
        'primary': 'provider-2/deepseek-r1-0528',
        'secondary': 'provider-8/deepseek-r1-distill-llama-70b',
        'fallback': 'provider-8/qwen3-32b',
        'supports_native_pdf': False,
        'context_window': 128000,
        'description': 'Reasoning - Explicit chain-of-thought models',
        'additional_models': []
    },
    
    # Coding - Strong programming support
    'coding': {
        'primary': 'provider-8/gpt-oss-120b',
        'secondary': 'provider-8/gpt-oss-20b',
        'fallback': 'provider-8/hermes-4-14b',
        'supports_native_pdf': False,
        'context_window': 128000,
        'description': 'Coding - Open-source programming models',
        'additional_models': []
    },
    
    # Multimodal - Text and image inputs
    'multimodal': {
        'primary': 'provider-3/gemma-3-27b-it',
        'secondary': 'provider-3/gemma-3-12b-it',
        'fallback': 'provider-3/gemma-3-4b-it',
        'supports_native_pdf': False,
        'context_window': 8192,
        'description': 'Multimodal - Google DeepMind vision models',
        'additional_models': []
    },
    
    # Fast Response - Groq LPU optimized
    'fast_response': {
        'primary': 'provider-6/mimo-v2-flash',
        'secondary': 'provider-8/deepseek-v3',
        'fallback': 'provider-8/llama-4-scout',
        'supports_native_pdf': False,
        'context_window': 32000,
        'description': 'Fast Response - Speed-optimized models',
        'additional_models': []
    }
}


# ============================================
# ALL AVAILABLE MODELS - 18 Curated Models
# Organized by category with 3 models each
# ============================================
ALL_MODELS = [
    # PDF Analysis (3)
    'provider-8/qwen2.5-vl-32b-instruct',
    'provider-8/qwen3-next-80b-a3b-instruct',
    'provider-1/qwen3-next-80b-a3b-instruct',
    
    # General Chat (3)
    'provider-8/kimi-k2',
    'provider-8/gemini-2.0-flash',
    'provider-8/mistral-small-3.2-24b-instruct',
    
    # Reasoning (3)
    'provider-2/deepseek-r1-0528',
    'provider-8/deepseek-r1-distill-llama-70b',
    'provider-8/qwen3-32b',
    
    # Coding (3)
    'provider-8/gpt-oss-120b',
    'provider-8/gpt-oss-20b',
    'provider-8/hermes-4-14b',
    
    # Multimodal (3)
    'provider-3/gemma-3-27b-it',
    'provider-3/gemma-3-12b-it',
    'provider-3/gemma-3-4b-it',
    
    # Fast Response (3)
    'provider-6/mimo-v2-flash',
    'provider-8/deepseek-v3',
    'provider-8/llama-4-scout',
]


# ============================================
# INTELLIGENT ROUTING RULES
# Maps query patterns to model categories
# ============================================
ROUTING_RULES = {
    'pdf_document': {
        'keywords': ['pdf', 'document', 'file', 'page', 'chapter', 'section', 'summarize', 'extract', 'upload'],
        'category': 'pdf_analysis',
        'description': 'PDF document analysis with native upload support'
    },
    'vision_image': {
        'keywords': ['image', 'picture', 'photo', 'visual', 'screenshot', 'diagram', 'chart', 'graph'],
        'category': 'vision',
        'description': 'Image and visual content analysis'
    },
    'step_by_step_reasoning': {
        'keywords': ['prove', 'derive', 'demonstrate', 'step by step', 'reasoning', 'therefore', 'hence', 'conclude', 'logic', 'explain why'],
        'category': 'reasoning',
        'description': 'Deep reasoning and chain-of-thought analysis'
    },
    'coding': {
        'keywords': ['code', 'bug', 'implement', 'function', 'class', 'refactor', 'compile', 'error', 'debug', 'programming', 'syntax', 'algorithm', 'script'],
        'category': 'coding',
        'description': 'Programming, debugging, and technical documentation'
    },
    'complex_analysis': {
        'keywords': ['analyze', 'compare', 'evaluate', 'assess', 'review', 'critique', 'examine', 'detailed', 'comprehensive'],
        'category': 'general_chat',
        'description': 'Complex analysis and comprehensive evaluation'
    },
    'quick_question': {
        'keywords': ['quick', 'simple', 'brief', 'short', 'what is', 'define', 'meaning'],
        'category': 'fast_response',
        'description': 'Fast answers to simple questions'
    },
    'general_chat': {
        'keywords': [],  # Default fallback
        'category': 'general_chat',
        'description': 'General conversation and standard queries'
    }
}


# ============================================
# HELPER FUNCTIONS
# ============================================

def get_category_models(category: str) -> List[str]:
    """
    Get all 3 models for a category in priority order
    
    Args:
        category: Category name (e.g., 'pdf_analysis', 'general_chat')
    
    Returns:
        List of [primary, secondary, fallback] model IDs
    """
    if category not in MODEL_CATEGORIES:
        category = 'general_chat'
    
    cat = MODEL_CATEGORIES[category]
    return [cat['primary'], cat['secondary'], cat['fallback']]


def is_valid_model(model_id: str) -> bool:
    """
    Check if a model ID is valid and available
    
    Args:
        model_id: Model identifier
    
    Returns:
        True if model is in the master list
    """
    return model_id in ALL_MODELS


def get_model_category_info(model_id: str) -> Dict:
    """
    Get category information for a specific model
    
    Args:
        model_id: Model identifier
    
    Returns:
        Dict with category info or None if not found
    """
    for category_name, category_info in MODEL_CATEGORIES.items():
        # Check if model is primary, secondary, or fallback
        if model_id in [category_info['primary'], category_info['secondary'], category_info['fallback']]:
            return {
                'category': category_name,
                'tier': 'primary' if model_id == category_info['primary'] else 
                        'secondary' if model_id == category_info['secondary'] else 'fallback',
                'supports_native_pdf': category_info['supports_native_pdf'],
                'context_window': category_info['context_window'],
                'description': category_info['description']
            }
        
        # Check additional models
        if model_id in category_info.get('additional_models', []):
            return {
                'category': category_name,
                'tier': 'additional',
                'supports_native_pdf': category_info['supports_native_pdf'],
                'context_window': category_info['context_window'],
                'description': category_info['description']
            }
    
    return None


def get_default_model() -> str:
    """
    Get the default model (primary PDF analysis model)
    
    Returns:
        Default model ID
    """
    return MODEL_CATEGORIES['pdf_analysis']['primary']
