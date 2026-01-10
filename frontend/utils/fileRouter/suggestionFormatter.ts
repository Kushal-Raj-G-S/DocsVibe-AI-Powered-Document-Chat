/**
 * Suggestion Formatter - Formats backend suggestions for frontend display
 * Provides type-safe interfaces for suggestion objects
 */

export type SuggestionType = 'success' | 'error' | 'warning' | 'suggestion' | 'info';
export type SeverityLevel = 'low' | 'medium' | 'high';
export type ActionType =
  | 'proceed'
  | 'switch_model'
  | 'remove_files'
  | 'reduce_files'
  | 'compress_file'
  | 'continue_anyway'
  | null;

export interface Suggestion {
  type: SuggestionType;
  title: string;
  message: string;
  details?: string;
  action: ActionType;
  actionText: string;
  severity: SeverityLevel;
  recommendedModel?: string | null;
  compatibleModels?: string[];
  maxFiles?: number;
  currentCount?: number;
}

export interface FileRouterResponse {
  success: boolean;
  analysis: {
    filename: string;
    file_size: number;
    file_size_mb: number;
    file_extension: string;
    file_type: string;
    category: string;
    is_supported: boolean;
  };
  compatibility?: {
    is_compatible: boolean;
    current_model: string;
    file_type: string;
    file_count: number;
    max_files: number;
    exceeds_limit: boolean;
    recommended_model: string | null;
    reason: string;
  };
  validation?: {
    is_valid: boolean;
    reason: string;
    message: string;
    max_allowed: number;
    current_count: number;
  };
  suggestion: Suggestion;
}

/**
 * Format backend suggestion for frontend display
 */
export function formatSuggestion(backendSuggestion: any): Suggestion {
  return {
    type: backendSuggestion.type || 'info',
    title: backendSuggestion.title || 'Notice',
    message: backendSuggestion.message || '',
    details: backendSuggestion.details || '',
    action: backendSuggestion.action || null,
    actionText: backendSuggestion.actionText || backendSuggestion.action_text || 'OK',
    severity: backendSuggestion.severity || 'low',
    recommendedModel: backendSuggestion.recommendedModel || backendSuggestion.recommended_model,
    compatibleModels: backendSuggestion.compatibleModels || backendSuggestion.compatible_models || [],
    maxFiles: backendSuggestion.maxFiles || backendSuggestion.max_files,
    currentCount: backendSuggestion.currentCount || backendSuggestion.current_count,
  };
}

/**
 * Get icon for suggestion type
 */
export function getSuggestionIcon(type: SuggestionType): string {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'suggestion':
      return '💡';
    case 'info':
      return 'ℹ️';
    default:
      return '📢';
  }
}

/**
 * Get color scheme for suggestion type
 */
export function getSuggestionColors(type: SuggestionType): {
  bg: string;
  text: string;
  border: string;
} {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-700',
      };
    case 'error':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-200 dark:border-red-700',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-700',
      };
    case 'suggestion':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-700',
      };
    case 'info':
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-700',
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-700',
      };
  }
}

/**
 * Get button variant for action type
 */
export function getActionButtonVariant(action: ActionType): 'default' | 'destructive' | 'outline' {
  switch (action) {
    case 'switch_model':
      return 'default';
    case 'remove_files':
    case 'reduce_files':
      return 'destructive';
    case 'proceed':
      return 'default';
    case 'continue_anyway':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Format details text for display (preserves newlines)
 */
export function formatDetailsText(details?: string): string[] {
  if (!details) return [];
  return details.split('\n').filter(line => line.trim() !== '');
}

/**
 * Create a suggestion object manually (for client-side suggestions)
 */
export function createSuggestion(
  type: SuggestionType,
  title: string,
  message: string,
  options?: Partial<Suggestion>
): Suggestion {
  return {
    type,
    title,
    message,
    action: options?.action || null,
    actionText: options?.actionText || 'OK',
    severity: options?.severity || 'low',
    details: options?.details,
    recommendedModel: options?.recommendedModel,
    compatibleModels: options?.compatibleModels,
    maxFiles: options?.maxFiles,
    currentCount: options?.currentCount,
  };
}
