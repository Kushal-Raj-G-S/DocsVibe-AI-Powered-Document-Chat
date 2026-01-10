"""
File Router API Routes
Endpoint for intelligent file analysis and model matching
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from utils.file_router import FileAnalyzer, ModelMatcher, SuggestionEngine, ValidationRules
from utils.model_router import model_router

router = APIRouter(prefix="/api/file-router", tags=["file-router"])


class FileUploadRequest(BaseModel):
    """Request model for file upload analysis"""
    filename: str
    file_size: int
    current_model: str
    current_files: Dict[str, int] = {}  # Current file counts by type


class BatchFileUploadRequest(BaseModel):
    """Request model for batch file upload analysis"""
    files: List[Dict[str, Any]]  # List of file info dicts
    current_model: str
    current_files: Dict[str, int] = {}


@router.post("/analyze")
async def analyze_file_upload(request: FileUploadRequest):
    """
    Analyze a file upload and provide intelligent suggestions
    
    This endpoint:
    1. Analyzes file type, size, and metadata
    2. Checks model compatibility
    3. Validates upload against limits
    4. Generates user-friendly suggestions
    
    Returns comprehensive analysis with actionable recommendations
    """
    try:
        # Step 1: Analyze the file
        file_analysis = FileAnalyzer.analyze_file(
            request.filename,
            request.file_size
        )
        
        # Check basic file validation
        is_valid, error_message = FileAnalyzer.validate_file(
            request.filename,
            request.file_size
        )
        
        if not is_valid:
            return {
                'success': False,
                'analysis': file_analysis,
                'suggestion': {
                    'type': 'error',
                    'title': '❌ Invalid File',
                    'message': error_message,
                    'action': None,
                    'severity': 'high',
                }
            }
        
        # Step 2: Get model category
        model_category_info = model_router.get_model_category(request.current_model)
        model_category = model_category_info.get('category', 'general')
        
        # Step 3: Check model compatibility
        file_type = file_analysis['file_type']
        file_category = file_analysis['category']
        current_count = request.current_files.get(file_type, 0)
        
        compatibility_result = ModelMatcher.check_model_compatibility(
            request.current_model,
            file_type,
            file_category,
            current_count + 1  # Including the new file
        )
        
        # Step 4: Validate upload
        validation_result = ValidationRules.validate_upload(
            file_type,
            request.current_files,
            model_category,
            file_analysis['file_size_mb']
        )
        
        # Step 5: Generate suggestion
        suggestion = SuggestionEngine.generate_suggestion(
            compatibility_result,
            validation_result,
            file_analysis,
            model_category  # Pass model category for context-aware messages
        )
        
        # Format for frontend
        formatted_suggestion = SuggestionEngine.format_for_frontend(suggestion)
        
        return {
            'success': True,
            'analysis': file_analysis,
            'compatibility': compatibility_result,
            'validation': validation_result,
            'suggestion': formatted_suggestion,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File analysis failed: {str(e)}")


@router.post("/analyze-batch")
async def analyze_batch_upload(request: BatchFileUploadRequest):
    """
    Analyze multiple file uploads at once
    
    Useful for drag-and-drop scenarios with multiple files
    """
    try:
        # Get model category
        model_category_info = model_router.get_model_category(request.current_model)
        model_category = model_category_info.get('category', 'general')
        
        # Analyze each file
        results = []
        for file_info in request.files:
            file_analysis = FileAnalyzer.analyze_file(
                file_info['filename'],
                file_info['file_size']
            )
            
            file_type = file_analysis['file_type']
            current_count = request.current_files.get(file_type, 0)
            
            compatibility_result = ModelMatcher.check_model_compatibility(
                request.current_model,
                file_type,
                file_analysis['category'],
                current_count + 1
            )
            
            validation_result = ValidationRules.validate_upload(
                file_type,
                request.current_files,
                model_category,
                file_analysis['file_size_mb']
            )
            
            suggestion = SuggestionEngine.generate_suggestion(
                compatibility_result,
                validation_result,
                file_analysis
            )
            
            results.append({
                'filename': file_info['filename'],
                'analysis': file_analysis,
                'suggestion': SuggestionEngine.format_for_frontend(suggestion),
            })
        
        # Check batch validation
        batch_validation = ValidationRules.check_batch_upload(
            [{'file_type': r['analysis']['file_type'], 
              'file_size_mb': r['analysis']['file_size_mb'],
              'filename': r['filename']} for r in results],
            request.current_files,
            model_category
        )
        
        return {
            'success': True,
            'results': results,
            'batch_validation': batch_validation,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")


@router.get("/model-capabilities/{model_id}")
async def get_model_capabilities(model_id: str):
    """
    Get capabilities of a specific model
    
    Returns supported file types and limits
    """
    try:
        capabilities = ModelMatcher.get_model_capabilities(model_id)
        category_info = model_router.get_model_category(model_id)
        
        return {
            'success': True,
            'model_id': model_id,
            'capabilities': capabilities,
            'category': category_info,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model capabilities: {str(e)}")


@router.get("/upload-limits/{model_id}")
async def get_upload_limits(model_id: str):
    """
    Get upload limits for a specific model
    
    Returns maximum file counts for each file type
    """
    try:
        category_info = model_router.get_model_category(model_id)
        model_category = category_info.get('category', 'general')
        
        limits = ValidationRules.get_upload_limits(model_category)
        
        return {
            'success': True,
            'model_id': model_id,
            'category': model_category,
            'limits': limits,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get upload limits: {str(e)}")
