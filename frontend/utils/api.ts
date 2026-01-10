/**
 * API Utility Functions
 * Handles all backend API calls for chat history, messages, and PDF operations
 */

import { ChatHistoryResponse, SendMessageRequest, SendMessageResponse } from '@/types/chat'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://docs-vibe-6giqc.ondigitalocean.app'

/**
 * Fetch all conversations from backend
 */
export async function fetchChatHistory(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch conversations')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching conversations:', error)
    throw error
  }
}

/**
 * Fetch messages for a specific conversation
 */
export async function fetchConversationMessages(conversationId: number): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch messages')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching messages:', error)
    throw error
  }
}

/**
 * Send a message to the AI model
 */
export async function sendMessage(
  conversationId: number,
  message: string,
  model: string
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
        model,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Send message failed:', response.status, errorData)
      
      // Handle rate limit error specifically
      if (response.status === 429) {
        throw new Error(`⏱️ Rate limit exceeded! Please wait a moment. You can only send 5 messages per minute.`)
      }
      
      throw new Error(errorData?.detail || `Failed to send message: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

/**
 * Upload PDF file to a conversation
 */
export async function uploadPDF(conversationId: number, file: File, selectedModel: string = 'auto', userEmail?: string): Promise<any> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('conversation_id', conversationId.toString())
    formData.append('selected_model', selectedModel)

    const response = await fetch(`${API_BASE_URL}/api/chat/upload-pdf?conversation_id=${conversationId}&selected_model=${selectedModel}&user_email=${userEmail || 'default@example.com'}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to upload PDF')
    }

    return await response.json()
  } catch (error) {
    console.error('Error uploading PDF:', error)
    throw error
  }
}

/**
 * Get all PDFs for a conversation
 */
export async function getConversationPDFs(conversationId: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/pdfs/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch PDFs')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching PDFs:', error)
    throw error
  }
}

/**
 * Delete a specific PDF
 */
export async function deletePDF(pdfId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/pdf/${pdfId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to delete PDF')
    }
  } catch (error) {
    console.error('Error deleting PDF:', error)
    throw error
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(title?: string, userEmail?: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title || 'New Conversation',
        user_email: userEmail,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create conversation')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating conversation:', error)
    throw error
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete conversation')
    }
  } catch (error) {
    console.error('Error deleting conversation:', error)
    throw error
  }
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(conversationId: number, title: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      throw new Error('Failed to update conversation title')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating conversation title:', error)
    throw error
  }
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
  try {
    const response = await fetch(`${API_BASE_URL}/api/file-router/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        file_size: fileSize,
        current_model: currentModel,
        current_files: currentFiles,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to analyze file')
    }

    return await response.json()
  } catch (error) {
    console.error('Error analyzing file:', error)
    throw error
  }
}

/**
 * Get model capabilities
 */
export async function getModelCapabilities(modelId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/file-router/model-capabilities/${modelId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get model capabilities')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting model capabilities:', error)
    throw error
  }
}

/**
 * Get upload limits for model
 */
export async function getUploadLimits(modelId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/file-router/upload-limits/${modelId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get upload limits')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting upload limits:', error)
    throw error
  }
}

