"""
Model Matcher - Intelligent model-file compatibility checker
Analyzes which models can handle specific file types
"""

from typing import Dict, List, Any, Optional


class ModelMatcher:
    """
    Matches files with compatible AI models based on capabilities
    """
    
    # Import model categories from existing model_router
    # This will be integrated with the actual MODEL_CATEGORIES
    
    @staticmethod
    def get_compatible_models(file_type: str, file_category: str) -> Dict[str, Any]:
        """
        Get list of models compatible with given file type
        
        Args:
            file_type: Type of file (pdf, image, docx, pptx)
            file_category: Category (document, image)
            
        Returns:
            Dict with compatible models and recommendations
        """
        # For PDFs - All models support (DeepSeek native, others with extraction)
        if file_type == 'pdf':
            return {
                'compatible_models': 'all',  # All models can handle PDFs
                'recommended_model': 'deepseek-chat-v3.2-exp',  # Best for PDFs
                'reason': 'DeepSeek models support native PDF reading with 128K context. Other models will extract text.',
                'max_files': 3,  # DeepSeek limit; general models limited to 1 by validation
                'supports_native': False,  # Only DeepSeek has native support
                'category': 'pdf_analysis',
            }
        
        # For images - NOT SUPPORTED (vision models removed)
        elif file_type == 'image':
            return {
                'compatible_models': [],
                'recommended_model': None,
                'reason': 'Image analysis not supported. Vision models have been disabled.',
                'max_files': 0,
                'supports_native': False,
                'category': 'unsupported',
            }
        
        # For DOCX/PPTX - all models support after text extraction
        # NOTE: This returns DEFAULT values. Actual limits should be checked
        # via ValidationRules which is model-aware (DeepSeek=3, others=1)
        elif file_type in ['docx', 'pptx']:
            return {
                'compatible_models': 'all',  # All models support text
                'recommended_model': 'deepseek-chat-v3.2-exp',  # Best for multi-docs
                'reason': 'Text will be extracted and sent to any model. DeepSeek supports up to 3 files.',
                'max_files': 3,  # Default to DeepSeek's limit; will be validated per model
                'supports_native': False,
                'category': 'general',  # Backend will map to pdf_analysis for DeepSeek
            }
        
        return {
            'compatible_models': [],
            'recommended_model': None,
            'reason': 'Unsupported file type',
            'max_files': 0,
            'supports_native': False,
            'category': 'unknown',
        }
    
    @staticmethod
    def check_model_compatibility(
        current_model: str,
        file_type: str,
        file_category: str,
        file_count: int = 1
    ) -> Dict[str, Any]:
        """
        Check if current model is compatible with the file(s)
        
        Args:
            current_model: Currently selected model ID
            file_type: Type of file being uploaded
            file_category: Category of file
            file_count: Number of files being uploaded
            
        Returns:
            Dict with compatibility status and suggestions
        """
        compatibility_info = ModelMatcher.get_compatible_models(file_type, file_category)
        
        # Extract model family from full model ID
        model_family = ModelMatcher._get_model_family(current_model)
        
        # Check if current model is compatible
        compatible_models = compatibility_info['compatible_models']
        is_compatible = (
            compatible_models == 'all' or
            current_model in compatible_models or
            model_family in ['deepseek']  # Removed vision models
        )
        
        # Get model-specific file count limits
        max_files = ModelMatcher._get_max_files_for_model(current_model, file_type)
        exceeds_limit = file_count > max_files
        
        return {
            'is_compatible': is_compatible and not exceeds_limit,
            'current_model': current_model,
            'file_type': file_type,
            'file_count': file_count,
            'max_files': max_files,
            'exceeds_limit': exceeds_limit,
            'recommended_model': compatibility_info['recommended_model'],
            'compatible_models': compatible_models,
            'reason': compatibility_info['reason'],
            'action_required': not is_compatible or exceeds_limit,
        }
    
    @staticmethod
    def _get_max_files_for_model(model_id: str, file_type: str) -> int:
        """
        Get maximum file count for specific model and file type
        Model-aware limits: DeepSeek supports 3 PDFs/DOCX/PPTX, Vision supports 10 images
        
        Args:
            model_id: Model identifier
            file_type: Type of file
            
        Returns:
            Maximum file count for this model-filetype combination
        """
        model_family = ModelMatcher._get_model_family(model_id)
        
        # DeepSeek models support 3 PDFs, 3 DOCX, 3 PPTX
        if model_family == 'deepseek':
            if file_type in ['pdf', 'docx', 'pptx']:
                return 3
        
        # Vision models support 10 images - REMOVED (vision models disabled)
        # Default: 1 file for all other combinations
        return 1
    
    @staticmethod
    def _get_model_family(model_id: str) -> str:
        """
        Extract model family from full model ID
        
        Examples:
            'deepseek-chat-v3.2-exp' -> 'deepseek'
            'provider-6/gemma-3-27b-instruct' -> 'gemma'
            'provider-6/llama-3.2-11b-instruct' -> 'llama'
        """
        model_lower = model_id.lower()
        
        if 'deepseek' in model_lower:
            return 'deepseek'
        elif 'qwen' in model_lower:
            return 'qwen'
        elif 'llama' in model_lower:
            return 'llama'
        elif 'gemma' in model_lower:
            return 'gemma'
        elif 'gpt' in model_lower:
            return 'gpt'
        elif 'mistral' in model_lower:
            return 'mistral'
        
        return 'unknown'
    
    @staticmethod
    def get_model_capabilities(model_id: str) -> Dict[str, Any]:
        """
        Get capabilities of a specific model
        
        Args:
            model_id: Model identifier
            
        Returns:
            Dict with model capabilities
        """
        model_family = ModelMatcher._get_model_family(model_id)
        
        if model_family == 'deepseek':
            return {
                'supports_pdf': True,
                'supports_images': False,
                'max_pdf_count': 3,
                'context_window': 128000,
                'native_pdf_support': True,
            }
        elif model_family in ['gemma', 'llama']:  # Removed vision-specific handling
            return {
                'supports_pdf': False,
                'supports_images': False,
                'max_pdf_count': 1,
                'context_window': 32000,
                'native_pdf_support': False,
            }
        else:
            return {
                'supports_pdf': False,
                'supports_images': False,
                'max_pdf_count': 1,
                'context_window': 8000,
                'native_pdf_support': False,
            }
