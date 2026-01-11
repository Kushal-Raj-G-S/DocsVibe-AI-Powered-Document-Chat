/**
 * ProfileModal Component
 * User profile settings modal that appears centered on screen
 * Shows user info, settings, and sign out option
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, User, Mail, Settings, LogOut, Edit2, Save, 
  Bell, Brain, FileText, Zap, Download, Trash
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    name: string
    email: string
    avatar?: string
  } | null
  onSignOut: () => void
}

export function ProfileModal({ isOpen, onClose, user, onSignOut }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(user?.name || '')
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  // Settings state
  const [notifications, setNotifications] = useState(true)
  const [autoSummarize, setAutoSummarize] = useState(false)
  const [smartSuggestions, setSmartSuggestions] = useState(true)
  const [responseStyle, setResponseStyle] = useState('balanced')
  const [isSaving, setIsSaving] = useState(false)
  
  let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL must be set')
  }
  
  // CRITICAL FIX: Force HTTPS
  if (API_BASE_URL.startsWith('http://')) {
    API_BASE_URL = API_BASE_URL.replace('http://', 'https://')
  }
  
  if (API_BASE_URL.includes('www.api')) {
    throw new Error('🚨 Incorrect API URL: Remove www')
  }

  // Update avatar when user prop changes
  useEffect(() => {
    setAvatarUrl(user?.avatar || '')
  }, [user?.avatar])

  // Load preferences on mount
  useEffect(() => {
    if (isOpen && user?.email) {
      loadPreferences()
    }
  }, [isOpen, user?.email])

  const loadPreferences = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/preferences/${user?.email}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications_enabled)
        setAutoSummarize(data.auto_summarize_pdfs)
        setSmartSuggestions(data.smart_suggestions_enabled)
        setResponseStyle(data.response_style)
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
  }

  const savePreferences = async () => {
    if (!user?.email) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/preferences/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.email,
          notifications_enabled: notifications,
          auto_summarize_pdfs: autoSummarize,
          smart_suggestions_enabled: smartSuggestions,
          response_style: responseStyle
        })
      })
      
      if (response.ok) {
        console.log('✅ Preferences saved successfully')
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save preferences when they change
  useEffect(() => {
    if (isOpen && user?.email) {
      const timer = setTimeout(() => {
        savePreferences()
      }, 500) // Debounce 500ms
      
      return () => clearTimeout(timer)
    }
  }, [notifications, autoSummarize, smartSuggestions, responseStyle])

  const handleSave = async () => {
    if (!user?.email) return
    
    setIsEditing(false)
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/display-name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          display_name: editedName
        })
      })
      
      if (response.ok) {
        console.log('✅ Display name updated')
        // Refresh session and reload to show new name everywhere
        await supabase.auth.refreshSession()
        window.location.reload()
      } else {
        throw new Error('Failed to update display name')
      }
    } catch (error) {
      console.error('Failed to update display name:', error)
      alert('Failed to update display name. Please try again.')
      setIsEditing(true)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.email) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('email', user.email)

      const response = await fetch(`${API_BASE_URL}/api/users/upload-avatar`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Avatar uploaded successfully', data)
        
        // Refresh Supabase session to get updated metadata from backend
        await supabase.auth.refreshSession()
        console.log('🔄 Session refreshed successfully')
        
        // Reload page to show updated avatar everywhere
        window.location.reload()
      } else {
        const errorData = await response.json()
        console.error('❌ Upload error:', errorData)
        throw new Error(errorData.detail || 'Upload failed')
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user?.email) return

    setIsUploadingAvatar(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/remove-avatar`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })

      if (response.ok) {
        setAvatarUrl('')
        console.log('✅ Avatar removed successfully')
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch (error) {
      console.error('Failed to remove avatar:', error)
      alert('Failed to remove avatar. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  if (!user) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[1001] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md glass-strong border border-cyan-500/30 rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold gradient-text">Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'preferences'
                      ? 'text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Preferences
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {activeTab === 'profile' ? (
                  <>
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative group">
                        {avatarUrl || user.avatar ? (
                          <img
                            src={avatarUrl || user.avatar}
                            alt={user.name}
                            className="w-24 h-24 rounded-full border-4 border-cyan-500/30 object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center border-4 border-cyan-500/30">
                            <User className="w-12 h-12 text-white" />
                          </div>
                        )}
                        
                        {/* Loading overlay */}
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 cursor-pointer">
                          <Edit2 className="w-3 h-3" />
                          {avatarUrl || user.avatar ? 'Change' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={isUploadingAvatar}
                            className="hidden"
                          />
                        </label>
                        
                        {(avatarUrl || user.avatar) && (
                          <>
                            <span className="text-gray-600">•</span>
                            <button
                              onClick={handleRemoveAvatar}
                              disabled={isUploadingAvatar}
                              className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                            >
                              <Trash className="w-3 h-3" />
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Max 5MB • JPG, PNG, GIF
                      </p>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-gray-400">
                        <User className="w-4 h-4" />
                        Display Name
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={isEditing ? editedName : user.name}
                          onChange={(e) => setEditedName(e.target.value)}
                          disabled={!isEditing}
                          className={`
                            flex-1 px-4 py-3 rounded-xl border text-white
                            ${isEditing 
                              ? 'bg-white/5 border-cyan-500/50 focus:border-cyan-500' 
                              : 'bg-white/5 border-white/10 cursor-not-allowed'
                            }
                            outline-none transition-colors
                          `}
                        />
                        {isEditing ? (
                          <Button
                            onClick={handleSave}
                            variant="glow"
                            size="sm"
                            className="px-4"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setIsEditing(true)
                              setEditedName(user.name)
                            }}
                            variant="outline"
                            size="sm"
                            className="px-4 border-white/20"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Email Field (Read-only) */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed outline-none"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Preferences */}
                    <div className="space-y-4">
                      {/* Notifications */}
                      <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="text-sm font-medium text-white">Notifications</p>
                            <p className="text-xs text-gray-400">Get alerts for completed tasks</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setNotifications(!notifications)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            notifications ? 'bg-cyan-500' : 'bg-gray-600'
                          }`}
                        >
                          <motion.div
                            animate={{ x: notifications ? 24 : 2 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full"
                          />
                        </button>
                      </div>

                      {/* Auto Summarize PDFs */}
                      <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-sm font-medium text-white">Auto-Summarize PDFs</p>
                            <p className="text-xs text-gray-400">Generate summary on upload</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setAutoSummarize(!autoSummarize)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            autoSummarize ? 'bg-purple-500' : 'bg-gray-600'
                          }`}
                        >
                          <motion.div
                            animate={{ x: autoSummarize ? 24 : 2 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full"
                          />
                        </button>
                      </div>

                      {/* Smart Suggestions */}
                      <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <Brain className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-sm font-medium text-white">Smart Suggestions</p>
                            <p className="text-xs text-gray-400">Show AI-powered question prompts</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSmartSuggestions(!smartSuggestions)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            smartSuggestions ? 'bg-blue-500' : 'bg-gray-600'
                          }`}
                        >
                          <motion.div
                            animate={{ x: smartSuggestions ? 24 : 2 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full"
                          />
                        </button>
                      </div>

                      {/* Response Style */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                          <Zap className="w-4 h-4" />
                          Response Style
                        </label>
                        <select
                          value={responseStyle}
                          onChange={(e) => setResponseStyle(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white outline-none focus:border-cyan-500/50 cursor-pointer [&>option]:bg-gray-900 [&>option]:text-white [&>option]:py-2"
                        >
                          <option value="concise">Concise - Quick, brief answers</option>
                          <option value="balanced">Balanced - Moderate detail</option>
                          <option value="detailed">Detailed - In-depth explanations</option>
                          <option value="academic">Academic - Formal, research-style</option>
                          <option value="casual">Casual - Friendly, conversational</option>
                        </select>
                        <p className="text-xs text-gray-500">How AI responds to your questions</p>
                      </div>

                      {/* Data Management */}
                      <div className="pt-4 border-t border-white/10 space-y-3">
                        <p className="text-sm font-semibold text-gray-400">Data Management</p>
                        
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left">
                          <Download className="w-5 h-5 text-blue-400" />
                          <div className="flex-1">
                            <p className="text-sm text-white">Export Conversations</p>
                            <p className="text-xs text-gray-400">Download as PDF or Markdown</p>
                          </div>
                        </button>
                        
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-xl transition-colors text-left group">
                          <Trash className="w-5 h-5 text-red-400" />
                          <div className="flex-1">
                            <p className="text-sm text-red-400 group-hover:text-red-300">Clear All Chats</p>
                            <p className="text-xs text-gray-400">Delete entire conversation history</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10">
                <button
                  onClick={() => {
                    onSignOut()
                    onClose()
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 hover:bg-red-500/10 transition-colors group"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 group-hover:text-red-300 font-medium">Sign Out</span>
                </button>
                
                <div className="px-6 py-3 text-center border-t border-white/10">
                  <p className="text-xs text-gray-500">
                    DocsVibe AI • Version 1.0.0
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
