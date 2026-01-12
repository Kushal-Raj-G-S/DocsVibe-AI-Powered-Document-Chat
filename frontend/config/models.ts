/**
 * ============================================
 * MODELS CONFIGURATION FILE
 * ============================================
 * 
 * This is the SINGLE SOURCE OF TRUTH for all AI models in the frontend.
 * 
 * UPDATE THIS FILE when:
 * - New models are available from the provider
 * - Models are deprecated or removed
 * - Model capabilities change
 * - Categories need to be reorganized
 * 
 * SYNC WITH: backend/config/models_config.py
 * 
 * Last Updated: January 9, 2026 - Model Identity Test Verified
 * ============================================
 */

import { AIModel } from '@/types/chat'

/**
 * Model Categories
 * Used to organize models by their primary use case
 */
export enum ModelCategory {
  PDF_ANALYSIS = 'PDF Analysis',
  GENERAL_CHAT = 'General Chat',
  REASONING = 'Reasoning',
  CODING = 'Coding',
  MULTIMODAL = 'Multimodal',
  FAST_RESPONSE = 'Fast Response',
}

/**
 * Icon Types for Models
 * Maps to Lucide React icons
 */
export type ModelIconType = 'filetext' | 'zap' | 'brain' | 'code' | 'lightbulb' | 'sparkles'

/**
 * ============================================
 * ALL AVAILABLE MODELS - Curated & Deduplicated (11 unique models)
 * Best models for each category, no duplicates across categories
 * ============================================
 * 
 * STRUCTURE:
 * - id: Full model identifier used in API calls
 * - name: Same as id (for backward compatibility)
 * - displayName: User-friendly name shown in UI
 * - icon: Icon type for visual identification
 * - description: Clear explanation of model's strengths
 * - category: Primary use case category
 * - isAvailable: Whether model is currently accessible
 * 
 * ============================================
 */
export const AVAILABLE_MODELS: AIModel[] = [
  // ==========================================
  // PDF ANALYSIS MODELS
  // Vision-language and large context models for document understanding
  // ==========================================
  {
    id: 'provider-2/qwen2.5-vl-32b-instruct',
    name: 'provider-2/qwen2.5-vl-32b-instruct',
    displayName: 'Qwen 2.5-VL 32B',
    icon: 'filetext',
    description: '👁️ Vision-language model with strong document processing capabilities',
    category: ModelCategory.PDF_ANALYSIS,
    isAvailable: true,
  },
  {
    id: 'provider-8/qwen3-next-80b-a3b-instruct',
    name: 'provider-8/qwen3-next-80b-a3b-instruct',
    displayName: 'Qwen 3 Next 80B',
    icon: 'filetext',
    description: '🏆 Large parameter count - Excellent for document understanding',
    category: ModelCategory.PDF_ANALYSIS,
    isAvailable: true,
  },
  {
    id: 'provider-1/qwen3-next-80b-a3b-instruct',
    name: 'provider-1/qwen3-next-80b-a3b-instruct',
    displayName: 'Qwen 3 Next 80B (Alt)',
    icon: 'filetext',
    description: '📄 Strong analytical capabilities for complex documents',
    category: ModelCategory.PDF_ANALYSIS,
    isAvailable: true,
  },
  
  // ==========================================
  // GENERAL CHAT MODELS
  // Friendly, engaging conversational experiences
  // ==========================================
  {
    id: 'provider-8/kimi-k2',
    name: 'provider-8/kimi-k2',
    displayName: 'Kimi K2',
    icon: 'sparkles',
    description: '🤝 Intelligent assistant and companion - Friendly, engaging conversations',
    category: ModelCategory.GENERAL_CHAT,
    isAvailable: true,
  },
  {
    id: 'provider-8/gemini-2.0-flash',
    name: 'provider-8/gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    icon: 'sparkles',
    description: '⚡ Google\'s latest general-purpose model - Fast and versatile',
    category: ModelCategory.GENERAL_CHAT,
    isAvailable: true,
  },
  {
    id: 'provider-2/mistral-small-3.2-24b-instruct',
    name: 'provider-2/mistral-small-3.2-24b-instruct',
    displayName: 'Mistral Small 3.2',
    icon: 'sparkles',
    description: '💬 Balanced, respectful, and helpful for everyday conversations',
    category: ModelCategory.GENERAL_CHAT,
    isAvailable: true,
  },
  
  // ==========================================
  // REASONING MODELS
  // Structured thinking with explicit reasoning steps
  // ==========================================
  {
    id: 'provider-3/deepseek-r1-0528',
    name: 'provider-3/deepseek-r1-0528',
    displayName: 'DeepSeek R1',
    icon: 'brain',
    description: '🧠 Explicit reasoning with <think> blocks - Deep analytical thinking',
    category: ModelCategory.REASONING,
    isAvailable: true,
  },
  {
    id: 'provider-2/deepseek-r1-distill-llama-70b',
    name: 'provider-2/deepseek-r1-distill-llama-70b',
    displayName: 'DeepSeek R1 Distill',
    icon: 'brain',
    description: '💭 Distilled reasoning model with structured thinking',
    category: ModelCategory.REASONING,
    isAvailable: true,
  },
  {
    id: 'provider-2/qwen3-32b',
    name: 'provider-2/qwen3-32b',
    displayName: 'Qwen 3 32B',
    icon: 'brain',
    description: '🔍 Structured reasoning in responses with <think> tags',
    category: ModelCategory.REASONING,
    isAvailable: true,
  },
  
  // ==========================================
  // CODING MODELS
  // Technical assistance and code generation
  // ==========================================
  {
    id: 'provider-8/gpt-oss-120b',
    name: 'provider-8/gpt-oss-120b',
    displayName: 'GPT-OSS 120B',
    icon: 'code',
    description: '💻 Large parameter count - Trained on code and technical content',
    category: ModelCategory.CODING,
    isAvailable: true,
  },
  {
    id: 'provider-6/gpt-oss-20b',
    name: 'provider-6/gpt-oss-20b',
    displayName: 'GPT-OSS 20B',
    icon: 'code',
    description: '⚙️ Efficient coding assistant with strong technical capabilities',
    category: ModelCategory.CODING,
    isAvailable: true,
  },
  {
    id: 'provider-2/hermes-4-14b',
    name: 'provider-2/hermes-4-14b',
    displayName: 'Hermes 4 14B',
    icon: 'code',
    description: '🔧 Nous Research model designed for technical assistance',
    category: ModelCategory.CODING,
    isAvailable: true,
  },
  
  // ==========================================
  // MULTIMODAL MODELS
  // Text and image processing capabilities
  // ==========================================
  {
    id: 'provider-2/gemma-3-27b-it',
    name: 'provider-2/gemma-3-27b-it',
    displayName: 'Gemma 3 27B',
    icon: 'lightbulb',
    description: '🎨 Handles text AND images as inputs - Advanced multimodal',
    category: ModelCategory.MULTIMODAL,
    isAvailable: true,
  },
  {
    id: 'provider-2/gemma-3-12b-it',
    name: 'provider-2/gemma-3-12b-it',
    displayName: 'Gemma 3 12B',
    icon: 'lightbulb',
    description: '🖼️ Multimodal with text and image processing',
    category: ModelCategory.MULTIMODAL,
    isAvailable: true,
  },
  {
    id: 'provider-2/gemma-3-4b-it',
    name: 'provider-2/gemma-3-4b-it',
    displayName: 'Gemma 3 4B',
    icon: 'lightbulb',
    description: '⚡ Efficient multimodal processing - Fast and compact',
    category: ModelCategory.MULTIMODAL,
    isAvailable: true,
  },
  
  // ==========================================
  // FAST RESPONSE MODELS
  // Optimized for speed and efficiency
  // ==========================================
  {
    id: 'provider-8/mimo-v2-flash',
    name: 'provider-8/mimo-v2-flash',
    displayName: 'Mimo V2 Flash',
    icon: 'zap',
    description: '⚡ Flash variant optimized for speed - Instant responses',
    category: ModelCategory.FAST_RESPONSE,
    isAvailable: true,
  },
  {
    id: 'provider-3/deepseek-v3',
    name: 'provider-3/deepseek-v3',
    displayName: 'DeepSeek V3',
    icon: 'zap',
    description: '🚀 Efficient and concise responses - Quick and accurate',
    category: ModelCategory.FAST_RESPONSE,
    isAvailable: true,
  },
  {
    id: 'provider-8/llama-4-scout',
    name: 'provider-8/llama-4-scout',
    displayName: 'Llama 4 Scout',
    icon: 'zap',
    description: '🔭 Designed for quick, fresh perspectives - Fast exploration',
    category: ModelCategory.FAST_RESPONSE,
    isAvailable: true,
  },
]

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

/**
 * Get models by category
 */
export const getModelsByCategory = (category: ModelCategory): AIModel[] => {
  return AVAILABLE_MODELS.filter(model => model.category === category)
}

/**
 * Get model by ID
 */
export const getModelById = (modelId: string): AIModel | undefined => {
  return AVAILABLE_MODELS.find(model => model.id === modelId)
}

/**
 * Get all available models (not disabled)
 */
export const getAvailableModels = (): AIModel[] => {
  return AVAILABLE_MODELS.filter(model => model.isAvailable)
}

/**
 * Get default model (first PDF analysis model)
 */
export const getDefaultModel = (): AIModel => {
  return AVAILABLE_MODELS[0] // DeepSeek V3.2 EXP
}

/**
 * Get all unique categories
 */
export const getAllCategories = (): string[] => {
  return Array.from(new Set(AVAILABLE_MODELS.map(model => model.category).filter((cat): cat is string => cat !== undefined)))
}
