"""
File Analyzer - Deep file analysis and metadata extraction
Detects file types, validates formats, extracts metadata
"""

import os
import mimetypes
from typing import Dict, Any, Optional, Tuple
from pathlib import Path


class FileAnalyzer:
    """
    Analyzes uploaded files to determine type, size, and compatibility
    """
    
    # Supported file types and their categories
    FILE_CATEGORIES = {
        'pdf': {
            'extensions': ['.pdf'],
            'mimetypes': ['application/pdf'],
            'category': 'document',
            'requires_extraction': True,
            'supports_native': True,  # Can be read natively by some models
        },
        'image': {
            'extensions': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
            'mimetypes': ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'],
            'category': 'image',
            'requires_extraction': False,
            'supports_native': True,  # Vision models can read directly
        },
        'docx': {
            'extensions': ['.doc', '.docx'],
            'mimetypes': ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'category': 'document',
            'requires_extraction': True,
            'supports_native': False,  # Must extract text
        },
        'pptx': {
            'extensions': ['.ppt', '.pptx'],
            'mimetypes': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            'category': 'document',
            'requires_extraction': True,
            'supports_native': False,  # Must extract text
        },
    }
    
    @staticmethod
    def analyze_file(filename: str, file_size: int) -> Dict[str, Any]:
        """
        Analyze a file and return detailed metadata
        
        Args:
            filename: Name of the uploaded file
            file_size: Size of the file in bytes
            
        Returns:
            Dict containing file analysis results
        """
        file_ext = Path(filename).suffix.lower()
        mime_type, _ = mimetypes.guess_type(filename)
        
        # Detect file type
        file_type = FileAnalyzer._detect_file_type(file_ext, mime_type)
        file_info = FileAnalyzer.FILE_CATEGORIES.get(file_type, {})
        
        return {
            'filename': filename,
            'file_size': file_size,
            'file_size_mb': round(file_size / (1024 * 1024), 2),
            'file_extension': file_ext,
            'mime_type': mime_type,
            'file_type': file_type,
            'category': file_info.get('category', 'unknown'),
            'requires_extraction': file_info.get('requires_extraction', True),
            'supports_native': file_info.get('supports_native', False),
            'is_supported': file_type is not None,
        }
    
    @staticmethod
    def _detect_file_type(extension: str, mime_type: Optional[str]) -> Optional[str]:
        """
        Detect file type based on extension and mime type
        
        Returns:
            File type key (pdf, image, docx, pptx) or None if unsupported
        """
        for file_type, info in FileAnalyzer.FILE_CATEGORIES.items():
            if extension in info['extensions']:
                return file_type
            if mime_type and mime_type in info['mimetypes']:
                return file_type
        return None
    
    @staticmethod
    def validate_file(filename: str, file_size: int, max_size_mb: int = 50) -> Tuple[bool, Optional[str]]:
        """
        Validate if file meets basic requirements
        
        Args:
            filename: Name of the file
            file_size: Size in bytes
            max_size_mb: Maximum allowed size in MB
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        analysis = FileAnalyzer.analyze_file(filename, file_size)
        
        # Check if file type is supported
        if not analysis['is_supported']:
            supported_types = []
            for info in FileAnalyzer.FILE_CATEGORIES.values():
                supported_types.extend(info['extensions'])
            return False, f"Unsupported file type. Supported: {', '.join(supported_types)}"
        
        # Check file size
        if analysis['file_size_mb'] > max_size_mb:
            return False, f"File too large ({analysis['file_size_mb']}MB). Max: {max_size_mb}MB"
        
        return True, None
    
    @staticmethod
    def get_file_category(filename: str) -> str:
        """
        Quick method to get file category (document, image, unknown)
        
        Args:
            filename: Name of the file
            
        Returns:
            Category string
        """
        file_ext = Path(filename).suffix.lower()
        mime_type, _ = mimetypes.guess_type(filename)
        file_type = FileAnalyzer._detect_file_type(file_ext, mime_type)
        
        if file_type:
            return FileAnalyzer.FILE_CATEGORIES[file_type]['category']
        return 'unknown'
