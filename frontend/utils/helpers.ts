/**
 * Helper Utility Functions
 * Common utilities for formatting, validation, and date operations
 */

/**
 * Format date for chat history grouping (Today, Yesterday, Last 7 Days, etc.)
 */
export function formatChatDate(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays <= 7) return 'Last 7 Days'
  if (diffInDays <= 30) return 'Last 30 Days'
  return 'Older'
}

/**
 * Group chat sessions by date - simplified to show all chats in one group
 */
export function groupChatsByDate<T extends { createdAt: Date }>(
  chats: T[]
): Record<string, T[]> {
  // Return all chats in a single "All Chats" group
  if (chats.length === 0) return {}
  return { 'All Chats': chats }
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Format timestamp to readable time
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Validate document file (PDF, DOCX, PPT)
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
  
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

  // Check file type
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: 'Only PDF, Word (DOCX), and PowerPoint (PPT/PPTX) files are allowed' }
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' }
  }

  return { valid: true }
}

/**
 * Debounce function for optimizing frequent operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Check if a model supports PDF analysis (native PDF upload with 128K context)
 * Returns true for DeepSeek family models
 */
export function isPDFAnalysisModel(modelId: string): boolean {
  const pdfModels = [
    'provider-1/deepseek-v3.2-exp',
    'provider-1/deepseek-v3.1',
    'provider-3/deepseek-v3',
  ]
  return pdfModels.includes(modelId)
}

/**
 * Get maximum number of PDFs allowed for a model
 * - PDF Analysis models (DeepSeek): 3 PDFs
 * - Other models: 1 PDF
 */
export function getMaxPDFsForModel(modelId: string): number {
  return isPDFAnalysisModel(modelId) ? 3 : 1
}
