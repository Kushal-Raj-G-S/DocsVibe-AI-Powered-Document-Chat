"""
Validation Rules - File upload limits and constraints
Enforces rules for file counts, types, and model compatibility
"""

from typing import Dict, List, Any, Optional


class ValidationRules:
    """
    Enforces validation rules for file uploads based on model and file type
    """
    
    # Map model categories to validation categories
    CATEGORY_MAP = {
        'pdf_analysis': 'pdf_analysis',
        'general_chat': 'general',
        'reasoning': 'general',
        'coding': 'general',
        'multimodal': 'general',  # Treat multimodal as general text models
    }
    
    # Maximum file limits by category
    MAX_LIMITS = {
        'pdf_analysis': {
            # PDF Analysis Models (DeepSeek): 3 files total (any mix)
            'total_files': 3,  # Combined limit across all types
            'pdf': 3,
            'docx': 3,
            'pptx': 3,
            'image': 0,  # No images
        },
        'general': {
            # All Other Models: 1 file only
            'total_files': 1,
            'pdf': 1,
            'docx': 1,
            'pptx': 1,
            'image': 0,  # Images not supported
        },
    }
    
    # File size limits (in MB)
    SIZE_LIMITS = {
        'pdf': 50,
        'image': 10,
        'docx': 25,
        'pptx': 50,
    }
    
    @staticmethod
    def validate_upload(
        file_type: str,
        current_files: Dict[str, int],
        model_category: str,
        file_size_mb: float
    ) -> Dict[str, Any]:
        """
        Validate if file upload is allowed based on current state
        
        Args:
            file_type: Type of file being uploaded (pdf, image, docx, pptx)
            current_files: Dict of current file counts by type
            model_category: Category of current model (pdf_analysis, vision, general_chat, etc.)
            file_size_mb: Size of file in MB
            
        Returns:
            Dict with validation result
        """
        # Map model category to validation category
        validation_category = ValidationRules.CATEGORY_MAP.get(model_category, 'general')
        
        # Get limits for this model category
        limits = ValidationRules.MAX_LIMITS.get(validation_category, ValidationRules.MAX_LIMITS['general'])
        max_allowed = limits.get(file_type, 0)
        current_count = current_files.get(file_type, 0)
        
        # PRIORITY 1: Check if file type is supported
        if max_allowed == 0:
            return {
                'is_valid': False,
                'reason': 'file_type_not_supported',
                'message': f"{file_type.upper()} files not supported with current model",
                'max_allowed': 0,
                'current_count': current_count,
            }
        
        # PRIORITY 2: For PDF Analysis models, check TOTAL file count (3 files max, any mix)
        if validation_category == 'pdf_analysis':
            total_current = sum(current_files.get(ft, 0) for ft in ['pdf', 'docx', 'pptx'])
            total_limit = limits.get('total_files', 3)
            
            if total_current >= total_limit:
                return {
                    'is_valid': False,
                    'reason': 'total_limit_exceeded',
                    'message': f"Maximum {total_limit} files allowed (any mix of PDF/DOCX/PPTX)",
                    'max_allowed': total_limit,
                    'current_count': total_current,
                    'file_breakdown': current_files,
                }
        
        # PRIORITY 3: Check individual file type count
        if current_count >= max_allowed:
            return {
                'is_valid': False,
                'reason': 'count_limit_exceeded',
                'message': f"Cannot upload more {file_type.upper()} files. Limit: {max_allowed}",
                'max_allowed': max_allowed,
                'current_count': current_count,
            }
        
        # PRIORITY 4: Check file size
        size_limit = ValidationRules.SIZE_LIMITS.get(file_type, 25)
        if file_size_mb > size_limit:
            return {
                'is_valid': False,
                'reason': 'file_size_exceeded',
                'message': f"File too large ({file_size_mb}MB). Max: {size_limit}MB",
                'max_allowed': max_allowed,
                'current_count': current_count,
            }
        
        # Validation passed
        return {
            'is_valid': True,
            'reason': 'validation_passed',
            'message': 'File upload allowed',
            'max_allowed': max_allowed,
            'current_count': current_count,
            'remaining_slots': max_allowed - current_count,
        }
    
    @staticmethod
    def get_upload_limits(model_category: str) -> Dict[str, int]:
        """
        Get upload limits for a specific model category
        
        Args:
            model_category: Category of model (pdf_analysis, vision, general_chat, etc.)
            
        Returns:
            Dict of file type limits
        """
        # Map model category to validation category
        validation_category = ValidationRules.CATEGORY_MAP.get(model_category, 'general')
        
        return ValidationRules.MAX_LIMITS.get(
            validation_category,
            ValidationRules.MAX_LIMITS['general']
        )
    
    @staticmethod
    def check_batch_upload(
        files: List[Dict[str, Any]],
        current_files: Dict[str, int],
        model_category: str
    ) -> Dict[str, Any]:
        """
        Validate a batch of files before upload
        
        Args:
            files: List of file info dicts (each with file_type, file_size_mb)
            current_files: Current file counts by type
            model_category: Category of current model
            
        Returns:
            Dict with batch validation results
        """
        limits = ValidationRules.get_upload_limits(model_category)
        results = []
        cumulative_counts = current_files.copy()
        
        for file_info in files:
            file_type = file_info['file_type']
            file_size_mb = file_info['file_size_mb']
            
            validation = ValidationRules.validate_upload(
                file_type,
                cumulative_counts,
                model_category,
                file_size_mb
            )
            
            results.append({
                'filename': file_info.get('filename', 'unknown'),
                'is_valid': validation['is_valid'],
                'reason': validation['reason'],
                'message': validation['message'],
            })
            
            # Update cumulative count if valid
            if validation['is_valid']:
                cumulative_counts[file_type] = cumulative_counts.get(file_type, 0) + 1
        
        all_valid = all(r['is_valid'] for r in results)
        
        return {
            'all_valid': all_valid,
            'results': results,
            'summary': {
                'total_files': len(files),
                'valid_files': sum(1 for r in results if r['is_valid']),
                'invalid_files': sum(1 for r in results if not r['is_valid']),
            }
        }
    
    @staticmethod
    def get_size_limit(file_type: str) -> int:
        """
        Get size limit for a file type
        
        Args:
            file_type: Type of file
            
        Returns:
            Size limit in MB
        """
        return ValidationRules.SIZE_LIMITS.get(file_type, 25)
