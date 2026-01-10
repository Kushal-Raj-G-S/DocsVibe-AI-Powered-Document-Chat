/**
 * useAuth Hook
 * Manages Supabase authentication state and operations
 * Includes college email domain validation
 */

'use client'

import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, authHelpers } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { isCollegeEmail } from '@/utils/domainValidator'

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRestrictionModal, setShowRestrictionModal] = useState(false)
  const [restrictedEmail, setRestrictedEmail] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    const initAuth = async () => {
      try {
        const { session } = await authHelpers.getSession()
        
        // Check if user has college email
        if (session?.user?.email) {
          const emailAllowed = isCollegeEmail(session.user.email)
          
          if (!emailAllowed) {
            setRestrictedEmail(session.user.email)
            setShowRestrictionModal(true)
            setUser(null)
          } else {
            setUser(session.user)
          }
        } else {
          setUser(session?.user ?? null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error')
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Check domain for new sign-ins
        if (session?.user?.email) {
          const emailAllowed = isCollegeEmail(session.user.email)
          
          if (!emailAllowed) {
            setRestrictedEmail(session.user.email)
            setShowRestrictionModal(true)
            setUser(null)
          } else {
            setUser(session.user)
            
            // Backend sync disabled - user data already in Supabase Auth
          }
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const { error: signInError } = await authHelpers.signInWithGoogle()
      if (signInError) throw signInError
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
      throw err
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      
      // Clear session sync marker
      if (user?.email) {
        sessionStorage.removeItem(`user_synced_${user.email}`)
      }
      
      // Sign out from Supabase
      const { error: signOutError } = await authHelpers.signOut()
      if (signOutError) throw signOutError
      
      // Clear user state
      setUser(null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out')
      throw err
    }
  }

  const closeRestrictionModal = () => {
    setShowRestrictionModal(false)
    setRestrictedEmail('')
    // Sign out when modal is closed
    authHelpers.signOut()
    router.push('/login')
  }

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
    showRestrictionModal,
    restrictedEmail,
    closeRestrictionModal,
  }
}
