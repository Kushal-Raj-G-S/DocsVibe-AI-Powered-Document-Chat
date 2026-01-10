/**
 * ChatArea Component
 * Main chat interface with message bubbles, avatars, typing indicator
 * User messages on right (blue), AI responses on left (gray)
 */

'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, User, Copy, Check, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { Message } from '@/types/chat'
import { formatTime } from '@/utils/helpers'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatAreaProps {
  messages: Message[]
  isTyping?: boolean
  className?: string
}

export function ChatArea({ messages, isTyping = false, className = '' }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto px-4 py-6 custom-scrollbar ${className}`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.length === 0 && !isTyping ? (
          <EmptyState />
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  index={index}
                />
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

/**
 * MessageBubble Component
 * Individual message bubble with avatar and content
 */
function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasReasoning = !isUser && message.reasoning && message.reasoning.trim().length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex justify-end' : ''}`}>
        <div className="group relative">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`
              px-5 py-3.5 rounded-2xl shadow-lg
              ${isUser
                ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-sm'
                : 'glass border border-white/10 text-gray-100 rounded-tl-sm'
              }
            `}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            ) : (
              <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="ml-2" {...props} />,
                    code: ({node, inline, ...props}: any) => 
                      inline ? (
                        <code className="bg-black/30 px-1.5 py-0.5 rounded text-cyan-300" {...props} />
                      ) : (
                        <code className="block bg-black/30 p-2 rounded my-2 overflow-x-auto" {...props} />
                      ),
                    strong: ({node, ...props}) => <strong className="font-bold text-cyan-300" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-gray-300" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {/* PDF Context Badge */}
            {message.pdfContext && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs opacity-75">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                  <span>
                    {message.pdfContext.filename}
                    {message.pdfContext.pageNumber && ` • Page ${message.pdfContext.pageNumber}`}
                  </span>
                </div>
              </div>
            )}

            {/* Reasoning Toggle Button */}
            {hasReasoning && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-cyan-400 transition-colors group"
                  aria-expanded={showReasoning}
                  aria-controls={`reasoning-${message.id}`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    {showReasoning ? 'Hide' : 'Show'} reasoning
                  </span>
                  {showReasoning ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* Reasoning Panel (Collapsible) */}
          <AnimatePresence>
            {hasReasoning && showReasoning && (
              <motion.div
                id={`reasoning-${message.id}`}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="glass-strong border border-amber-500/30 rounded-xl p-4 bg-amber-500/5">
                  {/* Header */}
                  <div className="flex items-start gap-2 mb-3 pb-2 border-b border-amber-500/20">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-amber-300">
                        Model reasoning — internal process
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        This is the model's internal thinking. It may contain assumptions or errors.
                      </p>
                    </div>
                  </div>

                  {/* Reasoning Content */}
                  <div className="text-xs leading-relaxed text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar">
                    {message.reasoning}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timestamp and Copy Button */}
          <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'justify-end' : ''}`}>
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
            
            {!isUser && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/5 rounded-md transition-all"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * TypingIndicator Component
 * Shows animated dots when AI is typing
 */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-4"
    >
      {/* AI Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white animate-pulse" />
        </div>
      </div>

      {/* Typing Animation */}
      <div className="flex-1">
        <div className="glass border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm inline-block">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-gray-400"
                animate={{
                  y: [-2, 2, -2],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * EmptyState Component
 * Shows when no messages exist
 */
function EmptyState() {
  const suggestions = [
    'Summarize this document',
    'Extract key points from the PDF',
    'What are the main topics discussed?',
    'Explain this section in simple terms',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full text-center px-4"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-6">
        <Bot className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-3">
        Ready to <span className="gradient-text">Chat</span> with Your Documents?
      </h2>
      
      <p className="text-gray-400 mb-8 max-w-lg">
        Upload a PDF and start asking questions. Get instant answers, summaries, and insights powered by AI.
      </p>

      {/* Suggestion Pills */}
      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="px-4 py-2 glass border border-white/10 rounded-full text-sm text-gray-300 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
