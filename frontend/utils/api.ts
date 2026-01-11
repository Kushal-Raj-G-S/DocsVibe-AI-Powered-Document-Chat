/**
 * API Utility Functions
 * Handles all backend API calls for chat history, messages, and PDF operations
 */

import { ChatHistoryResponse, SendMessageRequest, SendMessageResponse } from '@/types/chat'

// Centralized API Base URL from environment variable
// This MUST be set in production environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Validate that API_BASE_URL is set
if (!API_BASE_URL) {
  throw new Error(
    'CRITICAL: NEXT_PUBLIC_API_BASE_URL environment variable is not set. ' +
    'The application cannot function without a backend API URL. ' +
    'Please set NEXT_PUBLIC_API_BASE_URL in your environment variables.'
  )
}

// SECURITY: Block insecure HTTP URLs in production
if (API_BASE_URL.startsWith('http://')) {
  throw new Error(
    '🚨 INSECURE API URL DETECTED: ' + API_BASE_URL + '\n' +
    'Production must use HTTPS. Update NEXT_PUBLIC_API_BASE_URL to https://api.docsvibe.app'
  )
}

// SECURITY: Block incorrect www subdomain
if (API_BASE_URL.includes('www.api')) {
  throw new Error(
    '🚨 INCORRECT API URL: ' + API_BASE_URL + '\n' +
    'Remove "www" from the URL. Correct URL: https://api.docsvibe.app'
  )
}

// DEBUG: Log the API URL in production to verify it's correct
if (typeof window !== 'undefined') {
  console.log('🔗 API_BASE_URL:', API_BASE_URL)
}

/**
 * Generic API fetch wrapper with error handling
 */
async function apiFetch(endpoint: string, options?: RequestInit): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      
      // Handle rate limit error specifically
      if (response.status === 429) {
        throw new Error(`⏱️ Rate limit exceeded! Please wait a moment. You can only send 5 messages per minute.`)
      }
      
      throw new Error(errorData?.detail || `API Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

/**
 * Fetch all conversations from backend
 */
export async function fetchChatHistory(): Promise<any[]> {
  return apiFetch('/api/conversations', { method: 'GET' })
}

/**
 * Fetch messages for a specific conversation
 */
export async function fetchConversationMessages(conversationId: number): Promise<any[]> {
  return apiFetch(`/api/conversations/${conversationId}/messages`, { method: 'GET' })
}

/**
 * Send a message to the AI model
 */
export async function sendMessage(
  conversationId: number,
  message: string,
  model: string
): Promise<any> {
  return apiFetch('/api/chat/send', {
    method: 'POST',
    body: JSON.stringify({
      conversation_id: conversationId,
      message,
      model,
    }),
  })
}

/**
 * Upload PDF file to a conversation
 */
export async function uploadPDF(conversationId: number, file: File, selectedModel: string = 'auto', userEmail?: string): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('conversation_id', conversationId.toString())
  formData.append('selected_model', selectedModel)

  const url = `${API_BASE_URL}/api/chat/upload-pdf?conversation_id=${conversationId}&selected_model=${selectedModel}&user_email=${userEmail || 'default@example.com'}`
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to upload PDF')
  }

  return await response.json()
}

/**
 * Get all PDFs for a conversation
 */
export async function getConversationPDFs(conversationId: number): Promise<any> {
  return apiFetch(`/api/chat/pdfs/${conversationId}`, { method: 'GET' })
}

/**
 * Delete a specific PDF
 */
export async function deletePDF(pdfId: string): Promise<void> {
  await apiFetch(`/api/chat/pdf/${pdfId}`, { method: 'DELETE' })
}

/**
 * Create a new conversation
 */
export async function createConversation(title?: string, userEmail?: string): Promise<any> {
  return apiFetch('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({
      title: title || 'New Conversation',
      user_email: userEmail,
    }),
  })
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: number): Promise<void> {
  await apiFetch(`/api/conversations/${conversationId}`, { method: 'DELETE' })
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(conversationId: number, title: string): Promise<any> {
  return apiFetch(`/api/conversations/${conversationId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  })
}

/**
 * Analyze file upload with AI File Router
 */
export async function analyzeFileUpload(
  filename: string,
  fileSize: number,
  currentModel: string,
  currentFiles: Record<string, number> = {}
): Promise<any> {
  return apiFetch('/api/file-router/analyze', {
    method: 'POST',
    body: JSON.stringify({
      filename,
      file_size: fileSize,
      current_model: currentModel,
      current_files: currentFiles,
    }),
  })
}

/**
 * Get model capabilities
 */
export async function getModelCapabilities(modelId: string): Promise<any> {
  return apiFetch(`/api/file-router/model-capabilities/${modelId}`, { method: 'GET' })
}

/**
 * Get upload limits for model
 */
export async function getUploadLimits(modelId: string): Promise<any> {
  return apiFetch(`/api/file-router/upload-limits/${modelId}`, { method: 'GET' })
}

