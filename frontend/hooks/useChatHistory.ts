/**
 * useChatHistory Hook
 * Manages chat history fetching and state from SQLite database
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChatSession } from '@/types/chat'
import { fetchChatHistory, createConversation, deleteConversation } from '@/utils/api'
import { groupChatsByDate } from '@/utils/helpers'

export function useChatHistory(userId: string | undefined, userEmail?: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [groupedSessions, setGroupedSessions] = useState<Record<string, ChatSession[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Fetch chat history from backend
  const loadChatHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const conversations = await fetchChatHistory()
      
      // Convert backend conversations to ChatSession format with unique IDs
      const fetchedSessions: ChatSession[] = Array.isArray(conversations) 
        ? conversations.map((conv: any) => ({
            id: String(conv.id), // Ensure ID is string and unique
            title: conv.title || 'New Chat',
            createdAt: new Date(conv.created_at || Date.now()),
            updatedAt: new Date(conv.updated_at || Date.now()),
            messages: [],
          }))
        : []
      
      // Remove duplicates by ID (just in case)
      const uniqueSessions = Array.from(
        new Map(fetchedSessions.map(s => [s.id, s])).values()
      )
      
      setSessions(uniqueSessions)
      
      // Group sessions by date
      const grouped = groupChatsByDate(uniqueSessions)
      setGroupedSessions(grouped)
    } catch (err) {
      console.error('Error loading chat history:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chat history')
      // Don't clear sessions on error - keep existing data
      // setSessions([])
      // setGroupedSessions({})
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new chat session
  const createNewSession = useCallback(async (title?: string) => {
    try {
      const conversation = await createConversation(title || 'New Chat', userEmail)
      const now = new Date()
      const newSession: ChatSession = {
        id: conversation.id.toString(),
        title: conversation.title,
        createdAt: now,
        updatedAt: now,
        messages: [],
      }
      
      setCurrentSessionId(newSession.id)
      
      // Add session and re-group
      setSessions(prev => {
        const allSessions = Array.isArray(prev) ? [newSession, ...prev] : [newSession]
        const grouped = groupChatsByDate(allSessions)
        setGroupedSessions(grouped)
        return allSessions
      })
      
      return newSession
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session')
      return null
    }
  }, [userId, userEmail])

  // Delete a chat session (optimistic update)
  const deleteSession = useCallback(async (sessionId: string) => {
    // Optimistic: Remove from UI immediately
    setSessions(prev => {
      const updated = Array.isArray(prev) ? prev.filter(s => s.id !== sessionId) : []
      const grouped = groupChatsByDate(updated)
      setGroupedSessions(grouped)
      return updated
    })
    
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null)
    }
    
    // Delete in background (fire and forget for speed)
    deleteConversation(parseInt(sessionId)).catch(err => {
      console.error('Failed to delete conversation:', err)
      // Optionally: Could restore the session here if delete fails
    })
  }, [currentSessionId])

  // Update session title (for auto-rename with typing animation)
  const updateSessionTitle = useCallback((sessionId: string, newTitle: string) => {
    setSessions(prev => {
      const updated = prev.map(s => 
        s.id === sessionId ? { ...s, title: newTitle } : s
      )
      const grouped = groupChatsByDate(updated)
      setGroupedSessions(grouped)
      return updated
    })
  }, [])

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory()
  }, [loadChatHistory])

  return {
    sessions,
    groupedSessions,
    loading,
    error,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    deleteSession,
    updateSessionTitle,
    refreshHistory: loadChatHistory,
  }
}
