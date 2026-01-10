/**
 * TypeScript Type Definitions for Chat Application
 */

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  reasoning?: string  // Chain-of-thought reasoning (from <think> tags)
  pdfContext?: {
    filename: string
    pageNumber?: number
  }
}

export interface ChatSession {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messages: Message[]
  pdfAttached?: PDFFile
}

export interface PDFFile {
  id: string
  filename: string
  fileUrl: string
  pageCount: number
  uploadedAt: Date
  size: number // in bytes
}

export interface AIModel {
  id: string
  name: string
  displayName: string
  icon: string
  description: string
  isAvailable: boolean
  category?: string  // Model category: PDF Analysis, General Chat, Reasoning, Coding
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
}

// API Response types
export interface ChatHistoryResponse {
  sessions: ChatSession[]
  totalCount: number
}

export interface SendMessageRequest {
  sessionId: string
  message: string
  model: string
  pdfContext?: string
}

export interface SendMessageResponse {
  message: Message
  sessionId: string
}
