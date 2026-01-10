"""
Suggestion Engine - Generates user-friendly suggestions and messages
Creates intelligent recommendations for model switching and file handling
"""

from typing import Dict, Any, Optional, List


class SuggestionEngine:
    """
    Generates smart suggestions for users based on file-model compatibility
    """
    
    @staticmethod
    def generate_suggestion(
        compatibility_result: Dict[str, Any],
        validation_result: Dict[str, Any],
        file_info: Dict[str, Any],
        model_category: str = 'general'
    ) -> Dict[str, Any]:
        """
        Generate comprehensive suggestion based on analysis results
        
        Args:
            compatibility_result: Result from ModelMatcher.check_model_compatibility
            validation_result: Result from ValidationRules.validate_upload
            file_info: File analysis from FileAnalyzer
            model_category: Current model category (pdf_analysis, vision, general_chat, etc.)
            
        Returns:
            Dict with suggestion details and user-friendly message
        """
        # If validation failed, return validation error
        if not validation_result['is_valid']:
            return SuggestionEngine._create_validation_error(
                validation_result, 
                file_info, 
                model_category
            )
        
        # If model is compatible, allow upload
        if compatibility_result['is_compatible']:
            return SuggestionEngine._create_compatible_message(compatibility_result, file_info)
        
        # Model is incompatible - suggest alternatives
        return SuggestionEngine._create_incompatible_suggestion(compatibility_result, file_info)
    
    @staticmethod
    def _create_validation_error(validation: Dict[str, Any], file_info: Dict[str, Any], model_category: str = 'general') -> Dict[str, Any]:
        """Create message for validation errors with context-aware suggestions"""
        reason = validation['reason']
        file_type = file_info['file_type']
        
        if reason == 'file_type_not_supported':
            # Suggest appropriate model based on file type
            if file_type == 'image':
                return {
                    'type': 'error',
                    'title': '❌ Images Not Supported',
                    'message': f"Image uploads are currently disabled.",
                    'details': f"Vision models have been removed. Only PDF, DOCX, and PPTX files are supported.\n\nSupported models:\n• DeepSeek (3 files: any mix of PDF/DOCX/PPTX)\n• All other models (1 file)",
                    'action': None,
                    'severity': 'high',
                }
            elif file_type in ['pdf', 'docx', 'pptx']:
                # Check if current model is vision - give specific message
                if model_category == 'vision':
                    return {
                        'type': 'error',
                        'title': 'Vision Models Don\'t Support Documents',
                        'message': 'Vision models can only analyze images.',
                        'details': f'You\'ve selected a Vision Model which is designed for image analysis only.\n\n{file_type.upper()} files (documents) are not supported.\n\nTo analyze documents:\n• Switch to DeepSeek (up to 3 files: PDF/DOCX/PPTX)\n• Or use any General model (1 file)\n\nVision models accept images only (up to 10).',
                        'action': 'switch_model',
                        'action_text': 'Switch to DeepSeek V3.2',
                        'severity': 'high',
                        'recommended_model': 'deepseek-chat-v3.2-exp',
                    }
                else:
                    # General model or other
                    return {
                        'type': 'suggestion',
                        'title': 'PDF Analysis Model Recommended',
                        'message': f'{file_type.upper()} files work best with DeepSeek models.',
                        'details': f'Your current model doesn\'t support {file_type.upper()} files.\n\nSwitch to DeepSeek for:\n• Native PDF support with 128K context\n• Upload up to 3 files (any mix of PDF/DOCX/PPTX)\n• Better document comprehension',
                        'action': 'switch_model',
                        'action_text': 'Switch to DeepSeek V3.2',
                        'severity': 'high',
                        'recommended_model': 'deepseek-chat-v3.2-exp',
                    }
            else:
                return {
                    'type': 'error',
                    'title': '❌ File Type Not Supported',
                    'message': validation['message'],
                    'details': f"Your current model doesn't support {file_type.upper()} files. Try switching to DeepSeek for better document support.",
                    'action': 'switch_model',
                    'action_text': 'Switch to DeepSeek V3.2',
                    'severity': 'high',
                    'recommended_model': 'deepseek-chat-v3.2-exp',
                }
        
        if reason == 'count_limit_exceeded':
            return {
                'type': 'error',
                'title': '📁 File Limit Reached',
                'message': f"Only one file can be uploaded for this model.",
                'details': f"You've already uploaded {validation['current_count']} {file_type.upper()} file(s).\n\nRemove the existing file to upload a new one.",
                'action': 'remove_files',
                'action_text': 'OK',
                'severity': 'high',
            }
        
        elif reason == 'total_limit_exceeded':
            file_breakdown = validation.get('file_breakdown', {})
            breakdown_text = ', '.join([f"{count} {ftype.upper()}" for ftype, count in file_breakdown.items() if count > 0])
            
            return {
                'type': 'error',
                'title': '📁 Maximum Upload Limit Reached',
                'message': f"You've reached the maximum upload limit ({validation['max_allowed']} files).",
                'details': f"Current files: {breakdown_text}\n\nRemove one file if you wish to add another.\n\n💡 Tip: You can upload any mix of PDF, DOCX, or PPTX files (up to 3 total).",
                'action': 'remove_files',
                'action_text': 'OK',
                'severity': 'high',
            }
        
        elif reason == 'file_size_exceeded':
            return {
                'type': 'error',
                'title': '📦 File Too Large',
                'message': validation['message'],
                'details': f"Maximum allowed size for {file_type.upper()} files is {ValidationRules.get_size_limit(file_type)}MB.",
                'action': 'compress_file',
                'action_text': 'Try compressing the file or using a smaller version',
                'severity': 'medium',
            }
        
        return {
            'type': 'error',
            'title': '⚠️ Upload Failed',
            'message': validation['message'],
            'details': 'Please check the file and try again.',
            'action': None,
            'severity': 'medium',
        }
    
    @staticmethod
    def _create_compatible_message(compatibility: Dict[str, Any], file_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create success message for compatible uploads"""
        file_type = file_info['file_type'].upper()
        
        return {
            'type': 'success',
            'title': f'✅ {file_type} Upload Ready',
            'message': f"Your {file_type} file is compatible with the current model.",
            'details': compatibility['reason'],
            'action': 'proceed',
            'action_text': 'Upload File',
            'severity': 'low',
            'max_files': compatibility['max_files'],
            'current_count': compatibility['file_count'],
        }
    
    @staticmethod
    def _create_incompatible_suggestion(compatibility: Dict[str, Any], file_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create suggestion for incompatible model-file combination"""
        file_type = file_info['file_type'].upper()
        current_model = compatibility['current_model']
        recommended_model = compatibility.get('recommended_model')
        
        # Handle exceeds limit scenario
        if compatibility.get('exceeds_limit'):
            return {
                'type': 'warning',
                'title': f'📊 Too Many {file_type} Files',
                'message': f"You're trying to upload too many files for this model.",
                'details': f"Maximum {compatibility['max_files']} {file_type} file(s) allowed. You have {compatibility['file_count']}.",
                'action': 'reduce_files',
                'action_text': f"Remove {compatibility['file_count'] - compatibility['max_files']} file(s) to proceed",
                'severity': 'medium',
                'recommended_model': recommended_model,
            }
        
        # PDF with non-PDF model
        if file_info['file_type'] == 'pdf':
            return {
                'type': 'suggestion',
                'title': '🔄 Model Switch Recommended',
                'message': f"PDF files work best with DeepSeek models.",
                'details': f"Your current model ({current_model}) doesn't support native PDF reading. Switch to DeepSeek for:\n• Native PDF support with 128K context\n• Upload up to 3 PDFs simultaneously\n• Better document comprehension",
                'action': 'switch_model',
                'action_text': f'Switch to {recommended_model}',
                'severity': 'medium',
                'recommended_model': recommended_model,
                'compatible_models': compatibility.get('compatible_models', []),
            }
        
        # Image with non-vision model
        if file_info['file_type'] == 'image':
            return {
                'type': 'suggestion',
                'title': '🖼️ Vision Model Required',
                'message': f"Image files require a vision-capable model.",
                'details': f"Your current model ({current_model}) can't process images. Switch to a vision model for:\n• Direct image understanding\n• Upload up to 10 images\n• Visual analysis capabilities",
                'action': 'switch_model',
                'action_text': f'Switch to {recommended_model}',
                'severity': 'high',
                'recommended_model': recommended_model,
                'compatible_models': compatibility.get('compatible_models', []),
            }
        
        # Generic incompatibility
        return {
            'type': 'warning',
            'title': '⚠️ Compatibility Issue',
            'message': f"This file type may not work optimally with your current model.",
            'details': compatibility['reason'],
            'action': 'continue_anyway' if recommended_model is None else 'switch_model',
            'action_text': 'Continue Anyway' if recommended_model is None else f'Switch to {recommended_model}',
            'severity': 'low',
            'recommended_model': recommended_model,
        }
    
    @staticmethod
    def format_for_frontend(suggestion: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format suggestion for frontend display
        
        Args:
            suggestion: Raw suggestion dict
            
        Returns:
            Frontend-ready suggestion object
        """
        return {
            'type': suggestion.get('type', 'info'),
            'title': suggestion.get('title', 'Notice'),
            'message': suggestion.get('message', ''),
            'details': suggestion.get('details', ''),
            'action': suggestion.get('action'),
            'actionText': suggestion.get('action_text', 'OK'),
            'severity': suggestion.get('severity', 'low'),
            'recommendedModel': suggestion.get('recommended_model'),
            'compatibleModels': suggestion.get('compatible_models', []),
            'maxFiles': suggestion.get('max_files'),
            'currentCount': suggestion.get('current_count'),
        }


# Import for size limits access
from .validation_rules import ValidationRules
