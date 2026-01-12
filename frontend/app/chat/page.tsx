/**
 * Chat Page - Main Application Interface
 * DocsVibe AI-Powered PDF Chat Assistant
 * 
 * Features:
 * - ChatGPT-style interface with sidebar
 * - Real-time chat with AI models
 * - PDF upload and viewing
 * - Speech-to-text input
 * - Chat history management
 * - Model switching
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatArea } from '@/components/chat/ChatArea'
import { ChatInput } from '@/components/chat/ChatInput'
import { ModelSelector } from '@/components/chat/ModelSelector'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useChatHistory } from '@/hooks/useChatHistory'
import { Message, PDFFile } from '@/types/chat'
import { sendMessage, uploadPDF, updateConversationTitle, getConversationPDFs, deletePDF, analyzeFileUpload } from '@/utils/api'
import { generateId, isPDFAnalysisModel, getMaxPDFsForModel } from '@/utils/helpers'
import { AnimatedGradientMesh } from '@/components/animated-gradient-mesh'
import { Loader2, AlertCircle, X } from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { RestrictedAccessModal } from '@/components/modals/RestrictedAccessModal'
import SmartModelSuggestionModal from '@/components/modals/SmartModelSuggestionModal'
import { analyzeFile } from '@/utils/fileRouter/fileAnalyzer'
import type { Suggestion } from '@/utils/fileRouter/suggestionFormatter'

export default function ChatPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated, showRestrictionModal, restrictedEmail, closeRestrictionModal } = useAuth()
  const { profile: userProfile } = useUserProfile(user?.email)
  const {
    sessions,
    groupedSessions,
    loading: historyLoading,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    deleteSession,
    updateSessionTitle,
    refreshHistory,
  } = useChatHistory(user?.id, user?.email)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('provider-8/qwen3-next-80b-a3b-instruct') // Default model - Qwen 3 Next 80B for PDFs
  const [uploadedPDFs, setUploadedPDFs] = useState<PDFFile[]>([]) // Support multiple PDFs
  const [isUploadingPDF, setIsUploadingPDF] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [previousModel, setPreviousModel] = useState<string>(selectedModel) // Track model changes
  
  // File router state
  const [suggestionModal, setSuggestionModal] = useState<{
    isOpen: boolean
    suggestion: Suggestion | null
    pendingFile: File | null
  }>({
    isOpen: false,
    suggestion: null,
    pendingFile: null,
  })
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false)
  
  // Check if current model supports PDF analysis
  const isPDFModel = isPDFAnalysisModel(selectedModel)
  const maxPDFs = getMaxPDFsForModel(selectedModel)

  // Watch for model changes and handle multi-PDF cleanup
  useEffect(() => {
    const handleModelChange = async () => {
      // Only run if model actually changed (not on initial mount)
      if (previousModel === selectedModel) return
      
      // If switching to non-PDF model with multiple PDFs, keep only first and warn user
      if (!isPDFModel && uploadedPDFs.length > 1) {
        const removedPDFs = uploadedPDFs.slice(1) // All PDFs except the first
        const firstPDF = uploadedPDFs[0]
        
        // Delete extra PDFs from backend
        for (const pdf of removedPDFs) {
          try {
            await deletePDF(pdf.id)
          } catch (error) {
            console.error('Error auto-deleting PDF:', error)
          }
        }
        
        // Keep only first PDF
        setUploadedPDFs([firstPDF])
        
        // Show modal warning to user
        const removedList = removedPDFs.map(p => `"${p.filename}"`).join(', ')
        setSuggestionModal({
          isOpen: true,
          suggestion: {
            type: 'warning',
            title: '⚠️ Model Changed',
            message: 'This model only supports 1 document at a time.',
            details: `Kept: "${firstPDF.filename}"\n\nRemoved: ${removedList}\n\n💡 Switch to a PDF Analysis model (DeepSeek) to analyze up to 3 documents together.`,
            action: null,
            actionText: 'OK',
            severity: 'medium',
            recommendedModel: 'deepseek-chat-v3.2-exp',
            compatibleModels: [],
            maxFiles: undefined,
            currentCount: undefined,
          },
          pendingFile: null,
        })
      }
      
      // Update previous model
      setPreviousModel(selectedModel)
    }
    
    handleModelChange()
  }, [selectedModel, isPDFModel, uploadedPDFs]) // Run when model or PDFs change

  // Redirect if not authenticated (only if Supabase is configured)
  useEffect(() => {
    if (isSupabaseConfigured && !authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load messages when session changes (but not when sessions array updates)
  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId)
      if (session) {
        // Only update messages if they're actually different (avoid clearing on title update)
        if (session.messages && session.messages.length > 0) {
          setMessages(session.messages)
        }
        // Load PDFs for this conversation
        loadConversationPDFs(parseInt(currentSessionId))
      }
    } else {
      setMessages([])
      setUploadedPDFs([])
    }
  }, [currentSessionId]) // REMOVED sessions dependency to prevent clearing on title updates
  
  // Load PDFs for a conversation
  const loadConversationPDFs = async (convId: number) => {
    try {
      const data = await getConversationPDFs(convId)
      if (data && data.pdfs) {
        const pdfs: PDFFile[] = data.pdfs.map((pdf: any) => ({
          id: pdf.id.toString(),
          filename: pdf.filename,
          fileUrl: '',
          pageCount: pdf.page_count || 0,
          uploadedAt: new Date(pdf.uploaded_at),
          size: 0,
        }))
        setUploadedPDFs(pdfs)
      }
    } catch (error) {
      console.error('Error loading PDFs:', error)
      setUploadedPDFs([])
    }
  }

  // Auto-rename conversation based on first message
  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Create new conversation if none exists
    let convId = conversationId
    if (!convId) {
      console.log('Creating new conversation...')
      const newSession = await createNewSession('New Chat')
      if (!newSession) {
        console.error('Failed to create conversation')
        return
      }
      convId = parseInt(newSession.id)
      setConversationId(convId)
      console.log('Conversation created with ID:', convId)
    }

    // Add user message to UI immediately
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      pdfContext: uploadedPDFs.length > 0 ? {
        filename: uploadedPDFs.map(p => p.filename).join(', '),
      } : undefined,
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      console.log('Sending message to conversation:', convId, 'with model:', selectedModel)
      // Send message to backend with conversation_id, message, and model
      const response = await sendMessage(convId, content, selectedModel)
      console.log('Received response:', response)

      // Add AI response
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Backend auto-renames on first message - update sidebar with typing animation like ChatGPT
      // Start immediately, no delay - animation happens while user reads the response
      if (messages.length === 0 && convId) {
        // Get the new title (truncated to 60 chars like backend does)
        const newTitle = content.length > 60 ? content.substring(0, 60).trim() + '...' : content.trim()
        
        // Animate title character by character
        let charIndex = 0
        const animateTitle = () => {
          if (charIndex <= newTitle.length) {
            updateSessionTitle(convId.toString(), newTitle.substring(0, charIndex))
            charIndex++
            if (charIndex <= newTitle.length) {
              setTimeout(animateTitle, 30) // 30ms per character for smooth typing effect
            }
          }
        }
        // Start animation immediately when response arrives
        animateTitle()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle PDF upload with AI File Router
  const handleUploadPDF = async (file: File) => {
    // Step 1: Client-side quick validation
    const clientAnalysis = analyzeFile(file)
    
    if (!clientAnalysis.isSupported) {
      // Show modal for unsupported file type
      setSuggestionModal({
        isOpen: true,
        suggestion: {
          type: 'error',
          title: '❌ Unsupported File Type',
          message: `${clientAnalysis.fileExtension} files are not supported.`,
          details: 'Supported file types:\n\n• PDF (.pdf)\n• Word Documents (.docx)\n• PowerPoint (.pptx)\n• Images (.jpg, .png, .gif, .webp)',
          action: null,
          actionText: 'OK',
          severity: 'high',
          recommendedModel: null,
          compatibleModels: [],
          maxFiles: undefined,
          currentCount: undefined,
        },
        pendingFile: null,
      })
      return
    }
    
    // Step 2: Backend comprehensive analysis
    setIsAnalyzingFile(true)
    try {
      // Get current file counts by type (EXCLUDING the new file being uploaded)
      const fileCounts: Record<string, number> = {}
      uploadedPDFs.forEach(pdf => {
        const ext = pdf.filename.split('.').pop()?.toLowerCase() || ''
        if (ext === 'pdf') fileCounts.pdf = (fileCounts.pdf || 0) + 1
        else if (['doc', 'docx'].includes(ext)) fileCounts.docx = (fileCounts.docx || 0) + 1
        else if (['ppt', 'pptx'].includes(ext)) fileCounts.pptx = (fileCounts.pptx || 0) + 1
        else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) fileCounts.image = (fileCounts.image || 0) + 1
      })
      
      // Backend will add +1 for the new file, so we send CURRENT count only
      
      const response = await analyzeFileUpload(
        file.name,
        file.size,
        selectedModel,
        fileCounts
      )
      
      setIsAnalyzingFile(false)
      
      // Step 3: Handle suggestion
      if (response.suggestion.action === 'proceed') {
        // Direct upload - file is compatible
        await performUpload(file)
      } else {
        // Show suggestion modal
        setSuggestionModal({
          isOpen: true,
          suggestion: response.suggestion,
          pendingFile: file,
        })
      }
    } catch (error: any) {
      console.error('File analysis failed:', error)
      setIsAnalyzingFile(false)
      
      // Show error modal
      setSuggestionModal({
        isOpen: true,
        suggestion: {
          type: 'error',
          title: '⚠️ Analysis Failed',
          message: 'Failed to analyze file.',
          details: error.message || 'An unexpected error occurred. Please try again.',
          action: null,
          actionText: 'OK',
          severity: 'high',
          recommendedModel: null,
          compatibleModels: [],
          maxFiles: undefined,
          currentCount: undefined,
        },
        pendingFile: null,
      })
    }
  }
  
  // Perform the actual upload
  const performUpload = async (file: File) => {
    // Create conversation if none exists
    let convId = conversationId
    if (!convId) {
      const newSession = await createNewSession('New Chat')
      if (!newSession) return
      convId = parseInt(newSession.id)
      setConversationId(convId)
    }

    // Create optimistic PDF entry immediately
    const optimisticPDF: PDFFile = {
      id: generateId(),
      filename: file.name,
      fileUrl: '', // Will be updated after upload
      pageCount: 0,
      uploadedAt: new Date(),
      size: file.size,
    }
    
    // Show PDF in UI immediately
    setUploadedPDFs(prev => [...prev, optimisticPDF])
    setIsUploadingPDF(true)
    
    try {
      // Upload in background
      const uploadedPDF = await uploadPDF(convId, file, selectedModel, user?.email)
      
      // Update the optimistic entry with real data
      setUploadedPDFs(prev => prev.map(pdf => 
        pdf.id === optimisticPDF.id 
          ? {
              ...pdf,
              id: uploadedPDF.file_id?.toString() || pdf.id,
              fileUrl: uploadedPDF.r2_url || '',
              pageCount: uploadedPDF.units || 0,
            }
          : pdf
      ))
    } catch (error: any) {
      console.error('Error uploading file:', error)
      
      // Remove optimistic PDF on error
      setUploadedPDFs(prev => prev.filter(pdf => pdf.id !== optimisticPDF.id))
      
      // Show error modal
      setSuggestionModal({
        isOpen: true,
        suggestion: {
          type: 'error',
          title: '⚠️ Upload Failed',
          message: 'Failed to upload file.',
          details: error.message || 'An unexpected error occurred. Please try again.',
          action: null,
          actionText: 'OK',
          severity: 'high',
          recommendedModel: null,
          compatibleModels: [],
          maxFiles: undefined,
          currentCount: undefined,
        },
        pendingFile: null,
      })
    } finally {
      setIsUploadingPDF(false)
    }
  }
  
  // Handle modal actions
  const handleModalAction = async (action: string, modelId?: string) => {
    const { pendingFile } = suggestionModal
    
    if (!pendingFile) {
      setSuggestionModal({ isOpen: false, suggestion: null, pendingFile: null })
      return
    }

    try {
      switch (action) {
        case 'proceed':
          // Upload file with current model
          await performUpload(pendingFile)
          break

        case 'switch_model':
          if (modelId) {
            // Switch to recommended model
            setSelectedModel(modelId)
            // Wait for state to update, then upload
            setTimeout(async () => {
              await performUpload(pendingFile)
            }, 100)
          }
          break

        case 'remove_files':
          // Remove existing files
          const filesToRemove = uploadedPDFs.slice(0, -1)
          for (const pdf of filesToRemove) {
            await deletePDF(pdf.id)
          }
          // Refresh list
          setUploadedPDFs(uploadedPDFs.slice(-1))
          // Then allow upload
          await performUpload(pendingFile)
          break

        case 'continue_anyway':
          // User insists, upload anyway
          await performUpload(pendingFile)
          break

        default:
          console.warn('Unknown action:', action)
      }

      // Close modal
      setSuggestionModal({ isOpen: false, suggestion: null, pendingFile: null })
    } catch (error: any) {
      console.error('Action failed:', error)
      alert(error.message || 'Operation failed. Please try again.')
    }
  }
  
  const handleModalClose = () => {
    setSuggestionModal({ isOpen: false, suggestion: null, pendingFile: null })
  }
  
  // Handle PDF removal
  const handleRemovePDF = async (pdfId: string) => {
    try {
      await deletePDF(pdfId)
      setUploadedPDFs(prev => prev.filter(p => p.id !== pdfId))
      // intentionally not adding a system message to chat to avoid noise
    } catch (error) {
      console.error('Error removing PDF:', error)
      alert('Failed to remove PDF. Please try again.')
    }
  }

  // Handle new chat
  const handleNewChat = async () => {
    const newSession = await createNewSession('New Chat')
    if (newSession) {
      setConversationId(parseInt(newSession.id))
    }
    setMessages([])
    setUploadedPDFs([])
  }

  // Handle delete session with optimistic UI and state cleanup
  const handleDeleteSession = async (sessionId: string) => {
    // Optimistic: Remove from UI immediately
    const sessionToDelete = sessions.find(s => s.id === sessionId)
    if (!sessionToDelete) return

    // Clear state if deleting current conversation
    if (conversationId && sessionId === conversationId.toString()) {
      setConversationId(null)
      setMessages([])
      setUploadedPDFs([])
    }

    // Delete in background (hook handles UI update)
    try {
      await deleteSession(sessionId)
    } catch (error) {
      console.error('Failed to delete session:', error)
      // Refresh to restore if delete failed
      await refreshHistory()
    }
  }

  // Handle session selection
  const handleSelectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setConversationId(parseInt(sessionId))
    
    // Load messages from backend
    try {
      const { fetchConversationMessages } = await import('@/utils/api')
      const backendMessages = await fetchConversationMessages(parseInt(sessionId))
      
      // Convert backend messages to frontend format
      const loadedMessages: Message[] = backendMessages.map((msg: any) => ({
        id: msg.id?.toString() || generateId(),
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at || Date.now()),
      }))
      
      setMessages(loadedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    router.push('/')
  }

  // Handle rename session
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      await updateConversationTitle(parseInt(sessionId), newTitle)
      // Update will be reflected when sessions are refreshed
    } catch (error) {
      console.error('Error renaming session:', error)
      alert('Failed to rename conversation')
    }
  }

  // Loading state
  if (authLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <AnimatedGradientMesh />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading DocsVibe...</p>
        </motion.div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated && isSupabaseConfigured) {
    return null
  }

  // Supabase not configured - show demo mode
  if (!isSupabaseConfigured) {
    return (
      <div className="relative flex h-screen overflow-hidden bg-gray-950">
        <AnimatedGradientMesh />
        <div className="noise-overlay fixed inset-0 -z-10" />
        
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl text-center glass-strong p-8 rounded-3xl border border-yellow-500/30"
          >
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">
              Demo Mode - Supabase Not Configured
            </h1>
            <p className="text-gray-300 mb-6 leading-relaxed">
              To use DocsVibe with authentication, you need to configure Supabase:
            </p>
            <div className="text-left glass p-6 rounded-xl mb-6 space-y-3 text-sm">
              <p className="text-cyan-400 font-semibold">Quick Setup:</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Create a free account at <a href="https://supabase.com" target="_blank" className="text-cyan-400 hover:underline">supabase.com</a></li>
                <li>Create a new project</li>
                <li>Go to Settings → API</li>
                <li>Copy your Project URL and anon key</li>
                <li>Update <code className="bg-black/30 px-2 py-1 rounded text-cyan-300">.env.local</code> file</li>
              </ol>
            </div>
            <div className="flex gap-4 justify-center">
              <a href="https://supabase.com" target="_blank">
                <Button variant="glow" className="gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.3 17.7L8.3 12.7C7.9 12.3 7.9 11.7 8.3 11.3L13.3 6.3C13.7 5.9 14.3 5.9 14.7 6.3C15.1 6.7 15.1 7.3 14.7 7.7L10.4 12L14.7 16.3C15.1 16.7 15.1 17.3 14.7 17.7C14.3 18.1 13.7 18.1 13.3 17.7Z"/>
                  </svg>
                  Set Up Supabase
                </Button>
              </a>
              <a href="/">
                <Button variant="outline" className="glass border-white/20">
                  Back to Home
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-gray-950">
      {/* Background Effects */}
      <AnimatedGradientMesh />
      <div className="noise-overlay fixed inset-0 -z-10" />

      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        groupedSessions={groupedSessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        user={userProfile || (user ? {
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar: undefined,
        } : null)}
        onSignOut={handleSignOut}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:ml-0 relative">
        {/* Top Bar with Model Selector */}
        <div className="flex items-center justify-between px-6 py-3.5 glass-strong border-b border-white/10 backdrop-blur-xl relative z-50">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white hidden sm:block">
              {currentSessionId 
                ? sessions.find(s => s.id === currentSessionId)?.title || 'New Chat' 
                : 'New Chat'}
            </h1>
          </div>
          
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>

        {/* Messages Area */}
        <ChatArea
          messages={messages}
          isTyping={isTyping}
          className="flex-1"
        />

        {/* Input Area - ChatGPT Style */}
        <div className="border-t border-white/10 glass-strong backdrop-blur-xl">
          <div className="w-full max-w-7xl mx-auto px-4 py-4">
            {/* Uploaded PDFs - Show as small chips above input (ChatGPT style) */}
            <AnimatePresence mode="popLayout">
              {uploadedPDFs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 flex flex-wrap gap-2"
                >
                  {uploadedPDFs.map((pdf) => (
                    <motion.div
                      key={pdf.id}
                      initial={{ opacity: 0, scale: 0.8, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 20 }}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-full text-sm shadow-lg"
                    >
                      <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                      </svg>
                      <span className="text-cyan-100 font-medium truncate max-w-[150px]">{pdf.filename}</span>
                      {pdf.pageCount && (
                        <span className="text-xs text-gray-400">• {pdf.pageCount} pages</span>
                      )}
                      <button
                        onClick={() => handleRemovePDF(pdf.id)}
                        className="hover:bg-red-500/30 rounded-full p-1 transition-colors ml-1"
                        title="Remove document"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Chat Input with Upload Button */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onUploadPDF={handleUploadPDF}
              disabled={isUploadingPDF || isAnalyzingFile}
              isLoading={isTyping || isUploadingPDF || isAnalyzingFile}
              showUploadButton={uploadedPDFs.length < maxPDFs} // Show paperclip if can upload more
              placeholder={uploadedPDFs.length > 0
                ? `Ask anything about your ${uploadedPDFs.length} document${uploadedPDFs.length > 1 ? 's' : ''}...`
                : 'Type a message or attach documents...'}
            />
            
            {/* Helper text - Animated */}
            <AnimatePresence mode="wait">
              {!isPDFModel && uploadedPDFs.length > 1 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-amber-400 mt-2 text-center"
                >
                  ⚠️ Switch to a PDF Analysis model (DeepSeek) to use all {uploadedPDFs.length} documents together
                </motion.p>
              )}
              
              {isPDFModel && uploadedPDFs.length > 0 && uploadedPDFs.length < 3 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-gray-500 mt-2 text-center"
                >
                  💡 You can upload {3 - uploadedPDFs.length} more document{3 - uploadedPDFs.length > 1 ? 's' : ''} (max 3 total)
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* File Analysis Loading Overlay */}
      {isAnalyzingFile && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-lg bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              <span className="text-white">
                Analyzing file...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AI File Router Modal */}
      {suggestionModal.isOpen && suggestionModal.suggestion && (
        <SmartModelSuggestionModal
          isOpen={suggestionModal.isOpen}
          suggestion={suggestionModal.suggestion}
          onClose={handleModalClose}
          onAction={handleModalAction}
        />
      )}

      {/* Restriction Modal */}
      <RestrictedAccessModal
        isOpen={showRestrictionModal}
        onClose={closeRestrictionModal}
        userEmail={restrictedEmail}
      />
    </div>
  )
}
