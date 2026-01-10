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
  // Large multimodal models for document understanding
  // ==========================================
  {
    id: 'provider-8/qwen3-next-80b-a3b-instruct',
    name: 'provider-8/qwen3-next-80b-a3b-instruct',
    displayName: 'Qwen 3 Next 80B',
    icon: 'filetext',
    description: '🏆 Alibaba flagship 80B - Superior document understanding with logical reasoning',
    category: ModelCategory.PDF_ANALYSIS,
    isAvailable: true,
  },
  {
    id: 'provider-8/gemini-2.0-flash',
    name: 'provider-8/gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    icon: 'filetext',
    description: '⚡ Google multimodal - Fast document analysis with vision capabilities',
    category: ModelCategory.PDF_ANALYSIS,
    isAvailable: true,
  },
  
  // ==========================================
  // GENERAL CHAT MODELS
  // Friendly, engaging conversational experiences
  // ==========================================
  {
    id: 'provider-8/gpt-oss-120b',
    name: 'provider-8/gpt-oss-120b',
    displayName: 'GPT-OSS 120B',
    icon: 'sparkles',
    description: '💬 Largest ChatGPT variant - Best for brainstorming, explanations, and versatile conversations',
    category: ModelCategory.GENERAL_CHAT,
    isAvailable: true,
  },
  {
    id: 'provider-8/kimi-k2',
    name: 'provider-8/kimi-k2',
    displayName: 'Kimi K2',
    icon: 'brain',
    description: '🤝 Your intelligent assistant and good friend - Friendly, engaging conversational experience',
    category: ModelCategory.GENERAL_CHAT,
    isAvailable: true,
  },
  {
    id: 'provider-8/llama-4-maverick',
    name: 'provider-8/llama-4-maverick',
    displayName: 'Llama 4 Maverick',
    icon: 'zap',
    description: '🚀 Meta\'s next-gen - Fresh perspectives and interesting ideas with advanced reasoning',
    category: ModelCategory.GENERAL_CHAT,
    isAvailable: true,
  },
  
  // ==========================================
  // REASONING MODELS
  // Purpose-built with explicit thinking processes
  // ==========================================
  {
    id: 'provider-2/deepseek-r1',
    name: 'provider-2/deepseek-r1',
    displayName: 'DeepSeek R1',
    icon: 'lightbulb',
    description: '🧠 Purpose-built reasoning - Explicit <think> blocks showing step-by-step logical deduction',
    category: ModelCategory.REASONING,
    isAvailable: true,
  },
  {
    id: 'provider-8/kimi-k2-thinking',
    name: 'provider-8/kimi-k2-thinking',
    displayName: 'Kimi K2 Thinking',
    icon: 'lightbulb',
    description: '🔍 Kimi reasoning mode - Chain-of-thought processing for complex problems',
    category: ModelCategory.REASONING,
    isAvailable: true,
  },
  
  // ==========================================
  // CODING MODELS
  // Strong programming support across languages
  // ==========================================
  {
    id: 'provider-2/deepseek-v3.1',
    name: 'provider-2/deepseek-v3.1',
    displayName: 'DeepSeek V3.1',
    icon: 'code',
    description: '💻 DeepSeek coding expert - Excellent for complex code generation and debugging',
    category: ModelCategory.CODING,
    isAvailable: true,
  },
  
  // ==========================================
  // MULTIMODAL MODELS
  // Handle both text and image inputs effectively
  // ==========================================
  {
    id: 'provider-3/gemma-3-27b-it',
    name: 'provider-3/gemma-3-27b-it',
    displayName: 'Gemma 3 27B',
    icon: 'brain',
    description: '🧠 Google DeepMind - Open-weights multimodal model with creative conversation',
    category: ModelCategory.MULTIMODAL,
    isAvailable: true,
  },
  
  // ==========================================
  // FAST RESPONSE MODELS
  // Optimized for speed on custom LPU hardware
  // ==========================================
  {
    id: 'provider-6/compound-mini',
    name: 'provider-6/compound-mini',
    displayName: 'Compound Mini',
    icon: 'zap',
    description: '🚀 Groq LPU optimized - Ultra-fast inference on custom hardware for instant answers',
    category: ModelCategory.FAST_RESPONSE,
    isAvailable: true,
  },
  {
    id: 'provider-6/compound',
    name: 'provider-6/compound',
    displayName: 'Compound',
    icon: 'zap',
    description: '⚡ Groq standard - High-performance LPU inference for fast, accurate responses',
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
