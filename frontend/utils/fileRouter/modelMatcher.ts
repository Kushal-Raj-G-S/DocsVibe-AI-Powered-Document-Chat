/**
 * Model Matcher - Frontend utility for model-file compatibility
 * Mirrors backend ModelMatcher logic for client-side checks
 */

export interface ModelCompatibility {
  compatibleModels: string[] | 'all';
  recommendedModel: string | null;
  reason: string;
  maxFiles: number;
  supportsNative: boolean;
  category: string;
}

export interface CompatibilityCheck {
  isCompatible: boolean;
  currentModel: string;
  fileType: string;
  fileCount: number;
  maxFiles: number;
  exceedsLimit: boolean;
  recommendedModel: string | null;
  compatibleModels: string[] | 'all';
  reason: string;
  actionRequired: boolean;
}

/**
 * Get compatible models for a file type
 * NOTE: This returns DEFAULT compatibility. For model-specific limits, 
 * use getMaxFilesForModelAndType() or call backend API
 */
export function getCompatibleModels(
  fileType: string,
  fileCategory: string
): ModelCompatibility {
  // For PDFs
  if (fileType === 'pdf') {
    return {
      compatibleModels: [
        'deepseek-chat-v3.2-exp',
        'deepseek-chat-v3.2-coder',
        'deepseek-reasoner-r1',
      ],
      recommendedModel: 'deepseek-chat-v3.2-exp',
      reason: 'DeepSeek models support native PDF reading with 128K context',
      maxFiles: 3,
      supportsNative: true,
      category: 'pdf_analysis',
    };
  }

  // For images
  if (fileType === 'image') {
    return {
      compatibleModels: ['pixtral-12b', 'llama-3.2-vision-90b'],
      recommendedModel: 'pixtral-12b',
      reason: 'Vision models can analyze images directly',
      maxFiles: 10,
      supportsNative: true,
      category: 'vision',
    };
  }

  // For DOCX/PPTX - DeepSeek supports 3, others support 1
  if (fileType === 'docx' || fileType === 'pptx') {
    return {
      compatibleModels: 'all',
      recommendedModel: 'deepseek-chat-v3.2-exp',
      reason: 'Text will be extracted and sent to any model. DeepSeek supports up to 3 files.',
      maxFiles: 3, // Default to DeepSeek's limit, will be adjusted per model
      supportsNative: false,
      category: 'general', // Note: Backend will map to pdf_analysis for DeepSeek
    };
  }

  return {
    compatibleModels: [],
    recommendedModel: null,
    reason: 'Unsupported file type',
    maxFiles: 0,
    supportsNative: false,
    category: 'unknown',
  };
}

/**
 * Check if current model is compatible with file
 */
export function checkModelCompatibility(
  currentModel: string,
  fileType: string,
  fileCategory: string,
  fileCount: number = 1
): CompatibilityCheck {
  const compatibilityInfo = getCompatibleModels(fileType, fileCategory);
  const modelFamily = getModelFamily(currentModel);

  // Check if current model is compatible
  const compatibleModels = compatibilityInfo.compatibleModels;
  const isCompatible =
    compatibleModels === 'all' ||
    compatibleModels.includes(currentModel) ||
    ['deepseek', 'pixtral', 'llama-vision'].includes(modelFamily);

  // Check file count limits - use model-specific limits!
  const maxFiles = getMaxFilesForModelAndType(currentModel, fileType);
  const exceedsLimit = fileCount > maxFiles;

  return {
    isCompatible: isCompatible && !exceedsLimit,
    currentModel,
    fileType,
    fileCount,
    maxFiles,
    exceedsLimit,
    recommendedModel: compatibilityInfo.recommendedModel,
    compatibleModels,
    reason: compatibilityInfo.reason,
    actionRequired: !isCompatible || exceedsLimit,
  };
}

/**
 * Extract model family from model ID
 */
export function getModelFamily(modelId: string): string {
  const modelLower = modelId.toLowerCase();

  if (modelLower.includes('deepseek')) return 'deepseek';
  if (modelLower.includes('pixtral')) return 'pixtral';
  if (modelLower.includes('llama') && modelLower.includes('vision'))
    return 'llama-vision';
  if (modelLower.includes('qwen')) return 'qwen';
  if (modelLower.includes('llama')) return 'llama';
  if (modelLower.includes('gemma')) return 'gemma';

  return 'unknown';
}

/**
 * Get model capabilities
 */
export function getModelCapabilities(modelId: string) {
  const modelFamily = getModelFamily(modelId);

  if (modelFamily === 'deepseek') {
    return {
      supportsPdf: true,
      supportsImages: false,
      maxPdfCount: 3,
      contextWindow: 128000,
      nativePdfSupport: true,
    };
  }

  if (modelFamily === 'pixtral' || modelFamily === 'llama-vision') {
    return {
      supportsPdf: false,
      supportsImages: true,
      maxImageCount: 10,
      contextWindow: 32000,
      nativeImageSupport: true,
    };
  }

  return {
    supportsPdf: false,
    supportsImages: false,
    maxPdfCount: 1,
    contextWindow: 8000,
    nativePdfSupport: false,
  };
}

/**
 * Check if model supports PDF
 */
export function modelSupportsPdf(modelId: string): boolean {
  return getModelFamily(modelId) === 'deepseek';
}

/**
 * Check if model supports images
 */
export function modelSupportsImages(modelId: string): boolean {
  const family = getModelFamily(modelId);
  return family === 'pixtral' || family === 'llama-vision';
}

/**
 * Get max files for model and file type
 */
export function getMaxFilesForModel(
  modelId: string,
  fileType: string
): number {
  const capabilities = getModelCapabilities(modelId);
  const modelFamily = getModelFamily(modelId);

  if (fileType === 'pdf' && capabilities.supportsPdf) {
    return capabilities.maxPdfCount || 1;
  }

  if (fileType === 'image' && capabilities.supportsImages) {
    return capabilities.maxImageCount || 1;
  }

  // For DOCX/PPTX - DeepSeek supports 3, others support 1
  if (fileType === 'docx' || fileType === 'pptx') {
    return modelFamily === 'deepseek' ? 3 : 1;
  }

  return 1; // Default for other file types
}

/**
 * Get max files for model and file type with model-aware logic
 * This version properly handles DeepSeek's multi-file support for DOCX/PPTX
 */
export function getMaxFilesForModelAndType(
  modelId: string,
  fileType: string
): number {
  const modelFamily = getModelFamily(modelId);

  // DeepSeek supports 3 PDFs, 3 DOCX, 3 PPTX
  if (modelFamily === 'deepseek') {
    if (fileType === 'pdf' || fileType === 'docx' || fileType === 'pptx') {
      return 3;
    }
  }

  // Vision models support 10 images
  if (
    (modelFamily === 'pixtral' || modelFamily === 'llama-vision') &&
    fileType === 'image'
  ) {
    return 10;
  }

  // Default: 1 file for all other combinations
  return 1;
}
