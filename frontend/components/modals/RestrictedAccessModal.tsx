/**
 * Restricted Access Modal
 * Shows when non-college email tries to access
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, Mail, GraduationCap } from 'lucide-react'
import { APPROVED_DOMAINS } from '@/utils/domainValidator'
import { useEffect, useState } from 'react'

interface RestrictedAccessModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
}

export function RestrictedAccessModal({ isOpen, onClose, userEmail }: RestrictedAccessModalProps) {
  const contactEmail = "kushalrajgs@gmail.com"
  const [formData, setFormData] = useState({
    name: '',
    email: userEmail || '',
    collegeName: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Update email when prop changes
  useEffect(() => {
    if (userEmail) {
      setFormData(prev => ({ ...prev, email: userEmail }))
    }
  }, [userEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Replace with your Formspree endpoint
      const response = await fetch('https://formspree.io/f/mldpyjkd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          collegeName: formData.collegeName,
          message: formData.message,
          subject: `DocsVibe Access Request - ${formData.collegeName}`,
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: userEmail || '', collegeName: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      console.log('🔒 Modal opened - preventing scroll')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/95">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-red-500/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md sm:max-w-lg bg-gradient-to-br from-red-950 to-orange-950 border-2 border-red-500 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-red-500/20 to-orange-500/20 p-6 border-b border-red-500/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
                    <p className="text-sm text-red-300">College Students Only</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Your Email */}
                {userEmail && (
                  <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">You tried to login with:</p>
                    <p className="text-sm sm:text-base text-white font-medium break-all">{userEmail}</p>
                  </div>
                )}

                {/* Main Message */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm sm:text-base text-white font-medium mb-2">
                        DocsVibe is exclusively available to college and university students.
                      </p>
                      <p className="text-xs sm:text-sm text-gray-300">
                        Please use your institutional email address to access the platform.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Approved Institutions */}
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base text-white font-semibold flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Currently Approved Institutions:
                  </h3>
                  <div className="max-h-32 overflow-y-auto space-y-2 custom-scrollbar">
                    {APPROVED_DOMAINS.map((inst, idx) => (
                      <div
                        key={idx}
                        className="p-2 sm:p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                      >
                        <p className="text-sm sm:text-base text-white font-medium">{inst.name}</p>
                        <p className="text-xs sm:text-sm text-green-400">@{inst.domain}</p>
                        {inst.location && (
                          <p className="text-xs text-gray-400 mt-1">{inst.location}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Form Section */}
                <div className="p-3 sm:p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <h3 className="text-sm sm:text-base text-white font-semibold">Your College Not Listed?</h3>
                  </div>
                  
                  {submitStatus === 'success' ? (
                    <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
                      <p className="text-green-400 font-medium mb-1">✅ Request Sent!</p>
                      <p className="text-xs text-gray-300">We'll review and add your institution within 24-48 hours</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none"
                        />
                        <input
                          type="email"
                          placeholder="Your Email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none"
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="College Name"
                        value={formData.collegeName}
                        onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none"
                      />
                      
                      <textarea
                        placeholder="Message - tell us your college mail id"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none resize-none"
                      />
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white text-sm sm:text-base font-medium rounded-xl text-center transition-all"
                      >
                        {isSubmitting ? 'Sending...' : '📧 Request Access'}
                      </button>
                      
                      {submitStatus === 'error' && (
                        <p className="text-xs text-red-400 text-center">
                          Failed to send. Please email {contactEmail} directly.
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-red-500/30 p-4 sm:p-6 bg-black/20">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm sm:text-base font-medium rounded-xl transition-all"
                >
                  Close & Re-Login with College Email
                </button>
              </div>
            </motion.div>
          </div>
      </div>
  )
}
