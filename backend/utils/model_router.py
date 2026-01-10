"""
Intelligent Model Router - 3-Tier System Per Category
Routes questions to the best AI model for the task using a primary->secondary->fallback approach per category.

NOTE: Model configurations are now centralized in config/models_config.py
Update that file when models change.
"""

import re
from typing import Dict, Tuple, List
from datetime import datetime, timedelta
from config.models_config import MODEL_CATEGORIES, ROUTING_RULES


class ModelRouter:
    """Routes questions to optimal AI models based on query analysis"""

    # Rate limiting configuration
    MAX_REQUESTS_PER_MINUTE = 5
    request_history: List[datetime] = []

    # Import configurations from central config file
    MODEL_CATEGORIES = MODEL_CATEGORIES
    ROUTING_RULES = ROUTING_RULES

    def analyze_query(self, question: str) -> Dict[str, any]:
        """
        Analyze user question and determine best category

        Args:
            question: User's question

        Returns:
            Dict with category and model selection
        """
        question_lower = question.lower()

        # Check each routing rule
        matched_category = None
        max_matches = 0
        best_match = None

        for rule_name, config in self.ROUTING_RULES.items():
            if not config['keywords']:  # Skip default fallback
                continue

            # Count keyword matches
            matches = sum(1 for keyword in config['keywords'] if keyword in question_lower)

            if matches > max_matches:
                max_matches = matches
                matched_category = config['category']
                best_match = config

        # Default to general chat if no clear match
        if matched_category is None:
            matched_category = 'general_chat'
            best_match = self.ROUTING_RULES['general_chat']

        # Calculate confidence based on matches
        if max_matches >= 3:
            confidence = 'very_high'
        elif max_matches >= 2:
            confidence = 'high'
        elif max_matches == 1:
            confidence = 'medium'
        else:
            confidence = 'low'

        # Get models for this category
        category_models = self.MODEL_CATEGORIES[matched_category]

        return {
            'category': matched_category,
            'primary_model': category_models['primary'],
            'secondary_model': category_models['secondary'],
            'fallback_model': category_models['fallback'],
            'description': best_match['description'],
            'confidence': confidence,
            'keyword_matches': max_matches,
            'supports_native_pdf': category_models['supports_native_pdf'],
            'context_window': category_models['context_window']
        }

    def get_category_models(self, category: str) -> List[str]:
        """
        Get all 3 models for a specific category in order

        Args:
            category: Category name

        Returns:
            List of [primary, secondary, fallback] models
        """
        if category not in self.MODEL_CATEGORIES:
            category = 'general_chat'

        cat = self.MODEL_CATEGORIES[category]
        return [cat['primary'], cat['secondary'], cat['fallback']]

    def get_model_category(self, model_id: str) -> Dict:
        """
        Get category information for a specific model

        Args:
            model_id: Model identifier (e.g., 'deepseek-chat-v3.2-exp' or 'provider-1/deepseek-v3.2-exp')

        Returns:
            Dict with category info
        """
        # Normalize model_id for comparison (remove provider prefix if present)
        normalized_id = model_id.split('/')[-1].lower()
        
        for category_name, category_info in self.MODEL_CATEGORIES.items():
            # Check exact match first
            if model_id in [category_info['primary'], category_info['secondary'], category_info['fallback']]:
                return {
                    'category': category_name,
                    'supports_native_pdf': category_info.get('supports_native_pdf', False),
                    'supports_images': category_info.get('supports_images', False),
                    'context_window': category_info['context_window'],
                    'description': category_info['description']
                }
            
            # Check fuzzy match (for models like 'deepseek-chat-v3.2-exp' vs 'provider-1/deepseek-v3.2-exp')
            for model in [category_info['primary'], category_info['secondary'], category_info['fallback']]:
                normalized_category_model = model.split('/')[-1].lower()
                
                # Match DeepSeek models
                if 'deepseek' in normalized_id and 'deepseek' in normalized_category_model:
                    return {
                        'category': category_name,
                        'supports_native_pdf': category_info.get('supports_native_pdf', False),
                        'supports_images': category_info.get('supports_images', False),
                        'context_window': category_info['context_window'],
                        'description': category_info['description']
                    }
                
                # Match Multimodal models (gemma, llama-11b) - treating as text models
                if category_name == 'multimodal' and (
                    ('gemma' in normalized_id and ('27b' in normalized_id or '12b' in normalized_id)) or
                    ('llama' in normalized_id and '11b' in normalized_id and 'instruct' in normalized_id)
                ):
                    return {
                        'category': category_name,
                        'supports_native_pdf': category_info.get('supports_native_pdf', False),
                        'supports_images': category_info.get('supports_images', False),
                        'context_window': category_info['context_window'],
                        'description': category_info['description']
                    }

        # Default to general chat if model not found
        return {
            'category': 'general_chat',
            'supports_native_pdf': False,
            'supports_images': False,
            'context_window': 15000,
            'description': 'Unknown model - using general chat defaults'
        }

    def get_model_for_query(self, question: str, user_selected_model: str = None, 
                           has_documents: bool = False, prefer_speed: bool = False,
                           attempt: int = 0) -> Tuple[str, Dict]:
        """
        Get the best model for a query with 3-tier fallback system

        Args:
            question: User's question
            user_selected_model: Model user manually selected (overrides routing)
            has_documents: Whether conversation has uploaded PDFs
            prefer_speed: Whether to prioritize fast response
            attempt: Which attempt (0=primary, 1=secondary, 2=fallback)

        Returns:
            Tuple of (model_name, routing_info)
        """
        # If user explicitly selected a model, use it
        if user_selected_model and user_selected_model != 'auto':
            category_info = self.get_model_category(user_selected_model)
            return user_selected_model, {
                'routing_method': 'manual',
                'category': category_info['category'],
                'supports_native_pdf': category_info['supports_native_pdf'],
                'context_window': category_info['context_window'],
                'description': f"User selected: {category_info['description']}",
                'tier': 'manual'
            }

        # If conversation has documents, force PDF category
        if has_documents:
            category = 'pdf_analysis'
            models = self.get_category_models(category)
            selected_model = models[min(attempt, 2)]  # Cap at fallback
            cat_info = self.MODEL_CATEGORIES[category]

            tier_name = ['primary', 'secondary', 'fallback'][min(attempt, 2)]

            return selected_model, {
                'routing_method': 'document_detected',
                'category': category,
                'tier': tier_name,
                'primary_model': cat_info['primary'],
                'secondary_model': cat_info['secondary'],
                'fallback_model': cat_info['fallback'],
                'current_model': selected_model,
                'supports_native_pdf': True,
                'context_window': 128000,
                'description': f'PDF analysis - {tier_name} model',
                'confidence': 'very_high'
            }

        # If speed is preferred, use fast category
        if prefer_speed:
            category = 'fast_response'
            models = self.get_category_models(category)
            selected_model = models[min(attempt, 2)]
            cat_info = self.MODEL_CATEGORIES[category]

            tier_name = ['primary', 'secondary', 'fallback'][min(attempt, 2)]

            return selected_model, {
                'routing_method': 'speed_optimized',
                'category': category,
                'tier': tier_name,
                'primary_model': cat_info['primary'],
                'secondary_model': cat_info['secondary'],
                'fallback_model': cat_info['fallback'],
                'current_model': selected_model,
                'supports_native_pdf': False,
                'context_window': 8000,
                'description': f'Fast response - {tier_name} model',
                'confidence': 'high'
            }

        # Otherwise, use intelligent routing based on keywords
        routing_info = self.analyze_query(question)
        category = routing_info['category']
        models = self.get_category_models(category)
        selected_model = models[min(attempt, 2)]  # 0=primary, 1=secondary, 2=fallback

        tier_name = ['primary', 'secondary', 'fallback'][min(attempt, 2)]

        return selected_model, {
            'routing_method': 'intelligent',
            'tier': tier_name,
            'current_model': selected_model,
            **routing_info
        }

    def check_rate_limit(self) -> Dict[str, any]:
        """
        Check if rate limit is exceeded

        Returns:
            Dict with rate limit status
        """
        now = datetime.now()
        one_minute_ago = now - timedelta(minutes=1)

        # Remove old requests
        self.request_history = [
            req_time for req_time in self.request_history 
            if req_time > one_minute_ago
        ]

        requests_in_last_minute = len(self.request_history)

        if requests_in_last_minute >= self.MAX_REQUESTS_PER_MINUTE:
            return {
                'allowed': False,
                'requests_made': requests_in_last_minute,
                'limit': self.MAX_REQUESTS_PER_MINUTE,
                'message': f'Rate limit exceeded: {requests_in_last_minute}/{self.MAX_REQUESTS_PER_MINUTE} requests in last minute',
                'retry_after': 60  # seconds
            }

        # Add current request
        self.request_history.append(now)

        return {
            'allowed': True,
            'requests_made': requests_in_last_minute + 1,
            'limit': self.MAX_REQUESTS_PER_MINUTE,
            'remaining': self.MAX_REQUESTS_PER_MINUTE - requests_in_last_minute - 1
        }

    def get_all_categories(self) -> Dict[str, Dict]:
        """
        Get all categories with their 3-tier model structure

        Returns:
            Dict of categories with primary, secondary, fallback models
        """
        return {
            category_name: {
                'primary': category_info['primary'],
                'secondary': category_info['secondary'],
                'fallback': category_info['fallback'],
                'description': category_info['description'],
                'context_window': category_info['context_window'],
                'supports_native_pdf': category_info['supports_native_pdf']
            }
            for category_name, category_info in self.MODEL_CATEGORIES.items()
        }


# Global instance
model_router = ModelRouter()


if __name__ == "__main__":
    router = ModelRouter()

    # Test query
    question = "Help me debug this Python code"

    # Try primary model first
    model, info = router.get_model_for_query(question, attempt=0)
    print(f"\ud83c\udf9f Primary: {model}")
    print(f"\ud83d\udccb Category: {info['category']}")

    # If primary fails, try secondary
    model, info = router.get_model_for_query(question, attempt=1)
    print(f"\ud83d\udd04 Secondary: {model}")

    # If secondary fails, use fallback
    model, info = router.get_model_for_query(question, attempt=2)
    print(f"\ud83d\udea1 Fallback: {model}")
