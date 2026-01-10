/**
 * ChatInput Component
 * Modern input box with auto-expand textarea, PDF upload, STT mic button, send button
 * Features: Focus animations, file upload, speech-to-text, keyboard shortcuts
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Mic, MicOff, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSTT } from '@/hooks/useSTT'
import { validatePDFFile, formatFileSize } from '@/utils/helpers'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onUploadPDF?: (file: File) => void // Optional - for backward compatibility
  disabled?: boolean
  isLoading?: boolean
  currentPDF?: {  // Deprecated - keeping for backward compatibility
    filename: string
    size: number
  } | null
  onRemovePDF?: () => void // Deprecated
  placeholder?: string
  className?: string
  showUploadButton?: boolean // New - control upload button visibility
}

export function ChatInput({
  onSendMessage,
  onUploadPDF,
  disabled = false,
  isLoading = false,
  currentPDF,
  onRemovePDF,
  placeholder = 'Ask anything about your document...',
  className = '',
  showUploadButton = false, // Default to false - upload handled by MultiPDFUploader
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Speech-to-Text Hook
  const {
    isListening,
    error: sttError,
    isSupported: isSttSupported,
    toggleListening,
  } = useSTT({
    onResult: (text) => {
      setMessage(prev => prev + text + ' ')
    },
  })

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])

  // Handle send message
  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Skip old validation - let AI File Router handle everything
    // const validation = validatePDFFile(file)
    // if (!validation.valid) {
    //   alert(validation.error)
    //   return
    // }

    if (onUploadPDF) {
      onUploadPDF(file)
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* PDF Attachment Display */}
      <AnimatePresence>
        {currentPDF && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-3 px-4"
          >
            <div className="glass border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{currentPDF.filename}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(currentPDF.size)}</p>
                </div>
              </div>
              {onRemovePDF && (
                <button
                  onClick={onRemovePDF}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Box */}
      <motion.div
        animate={{
          scale: isFocused ? 1.005 : 1,
          boxShadow: isFocused
            ? '0 0 0 2px rgba(6, 182, 212, 0.2)'
            : '0 0 0 0px rgba(6, 182, 212, 0)',
        }}
        className={`
          glass-strong border rounded-2xl transition-all
          ${isFocused ? 'border-cyan-500/50' : 'border-white/10'}
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
  <div className="flex items-end gap-3 p-4 w-full">
          {/* PDF Upload Button - Always show if callback provided */}
          {onUploadPDF && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isLoading || !showUploadButton}
                className={`
                  p-2 rounded-lg transition-all flex-shrink-0
                  ${showUploadButton 
                    ? 'hover:bg-cyan-500/10 text-cyan-400 opacity-100' 
                    : 'text-gray-600 opacity-50 cursor-not-allowed'
                  }
                `}
                title={showUploadButton ? "Attach Document (PDF, DOCX, PPT)" : "Maximum documents reached"}
              >
                <Paperclip className="w-5 h-5" />
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}

          {/* Textarea - Normal Height */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled || isLoading}
            placeholder={placeholder}
            rows={1}
            className="
              flex-1 min-w-0 w-full bg-transparent text-white placeholder-gray-500 text-base
              outline-none resize-none max-h-52 min-h-[48px] py-3 text-sm
              disabled:cursor-not-allowed
            "
          />

          {/* STT Button */}
          {isSttSupported && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              disabled={disabled || isLoading}
              className={`
                p-2 rounded-lg transition-all disabled:opacity-50 flex-shrink-0
                ${isListening 
                  ? 'bg-red-500/20 text-red-400 animate-pulse' 
                  : 'hover:bg-cyan-500/10 text-cyan-400'
                }
              `}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </motion.button>
          )}

          {/* Send Button - Larger */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading || disabled}
              size="default"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 px-5 py-2 h-10"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </motion.div>
        </div>

        {/* Recording Waveform Indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-3"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-red-400 rounded-full"
                      animate={{
                        height: [8, 16, 8],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
                <span>Recording... Click mic to stop</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {sttError && (
          <div className="px-4 pb-3">
            <p className="text-xs text-red-400">{sttError}</p>
          </div>
        )}

        {/* Keyboard Shortcut Hint */}
        {!isListening && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-gray-400">Enter</kbd> to send, 
              <kbd className="ml-1 px-1.5 py-0.5 bg-white/5 rounded text-gray-400">Shift + Enter</kbd> for new line
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
