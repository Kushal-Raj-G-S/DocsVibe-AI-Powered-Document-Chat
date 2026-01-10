/**
 * ChatSidebar Component
 * Left sidebar with chat history, collapsible on mobile, ChatGPT-style interface
 * Features: Chat history with date grouping, "+ New Chat" button, user profile menu
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  FileText,
  Settings,
  Edit2,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatSession } from '@/types/chat'
import { truncateText } from '@/utils/helpers'
import { ProfileModal } from './ProfileModal'

interface ChatSidebarProps {
  sessions: ChatSession[]
  groupedSessions: Record<string, ChatSession[]>
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  onDeleteSession: (sessionId: string) => void
  onRenameSession?: (sessionId: string, newTitle: string) => void
  user: {
    name: string
    email: string
    avatar?: string
  } | null
  onSignOut: () => void
  className?: string
}

export function ChatSidebar({
  sessions,
  groupedSessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  user,
  onSignOut,
  className = '',
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'All Chats': true,
  })

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const toggleSidebar = () => setIsOpen(!isOpen)

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-900/95 backdrop-blur-xl border-r border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5">
            <Image
              src="/logo.png"
              alt="DocsVibe Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-lg font-bold gradient-text">DocsVibe</span>
        </div>
        
        {/* Mobile close button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          variant="glow"
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
        {Object.keys(groupedSessions).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No chats yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Start a new conversation to begin
            </p>
          </div>
        ) : (
          Object.entries(groupedSessions).map(([group, sessions]) => (
            <div key={group} className="mb-4">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-400 transition-colors"
              >
                <span>{group}</span>
                <motion.div
                  animate={{ rotate: expandedGroups[group] ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              {/* Session List */}
              <AnimatePresence>
                {expandedGroups[group] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 mt-1"
                  >
                    {sessions.map((session) => (
                      <ChatHistoryItem
                        key={session.id}
                        session={session}
                        isActive={session.id === currentSessionId}
                        onSelect={() => onSelectSession(session.id)}
                        onDelete={() => onDeleteSession(session.id)}
                        onRename={onRenameSession ? (newTitle) => onRenameSession(session.id, newTitle) : undefined}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* User Profile Menu */}
      {user && (
        <div className="border-t border-white/10 p-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsProfileOpen(true)}
            className="w-full flex items-center justify-between glass p-3 rounded-xl cursor-pointer group transition-all hover:border hover:border-cyan-500/30"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <Settings className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
          </motion.button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onSignOut={onSignOut}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-lg border border-white/10"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block w-80 h-screen ${className}`}>
        {sidebarContent}
      </div>

      {/* Mobile Sidebar (Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * ChatHistoryItem Component
 * Individual chat session item in the sidebar
 */
function ChatHistoryItem({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: {
  session: ChatSession
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onRename?: (newTitle: string) => void
}) {
  const [showDelete, setShowDelete] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(session.title)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRename = () => {
    if (editedTitle.trim() && editedTitle !== session.title && onRename) {
      onRename(editedTitle.trim())
      setIsEditing(false)
    } else {
      setEditedTitle(session.title)
      setIsEditing(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDeleting) return // Prevent spam clicks
    setIsDeleting(true)
    await onDelete()
  }

  return (
    <motion.div
      whileHover={{ x: 5 }}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className={`
        group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all
        ${isActive 
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' 
          : 'hover:bg-white/5'
        }
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0" onClick={!isEditing ? onSelect : undefined}>
        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
        
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') {
                setEditedTitle(session.title)
                setIsEditing(false)
              }
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            className="flex-1 bg-white/10 text-white text-sm px-2 py-1 rounded border border-cyan-500/50 outline-none"
          />
        ) : (
          <span className={`text-sm truncate ${isActive ? 'text-white font-medium' : 'text-gray-300'}`}>
            {truncateText(session.title, 30)}
          </span>
        )}
      </div>
      
      <AnimatePresence>
        {showDelete && !isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1"
          >
            {onRename && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
                className="p-1.5 hover:bg-cyan-500/20 rounded-md transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`p-1.5 rounded-md transition-colors ${
                isDeleting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-red-500/20'
              }`}
            >
              <Trash2 className={`w-3.5 h-3.5 ${
                isDeleting ? 'text-red-300 animate-pulse' : 'text-red-400'
              }`} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
