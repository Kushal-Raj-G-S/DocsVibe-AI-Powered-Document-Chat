/**
 * useUserProfile Hook
 * Fetches complete user profile from backend (including custom avatar)
 */

'use client'

import { useState, useEffect } from 'react'

interface UserProfile {
  name: string
  email: string
  avatar?: string
  display_name?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.docsvibe.app'

if (API_BASE_URL.includes('www.api')) {
  throw new Error('🚨 Incorrect API URL: Remove www')
}

export function useUserProfile(email: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!email) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        console.log('🔍 Fetching profile for:', email)
        const response = await fetch(`${API_BASE_URL}/api/users/profile/${email}`)
        console.log('📡 Profile response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('📦 Profile data received:', data)
          
          // Backend returns {success: true, user: {...}}
          const userData = data.user || data
          
          setProfile({
            name: userData.display_name || userData.email?.split('@')[0] || email.split('@')[0],
            email: userData.email || email,
            avatar: userData.avatar_url,
            display_name: userData.display_name
          })
        } else {
          console.warn('⚠️ Profile fetch failed:', response.status)
          // Fallback to email if backend fails
          setProfile({
            name: email.split('@')[0],
            email: email,
          })
        }
      } catch (error) {
        console.error('❌ Failed to fetch user profile:', error)
        // Fallback
        setProfile({
          name: email.split('@')[0],
          email: email,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [email])

  return { profile, loading }
}
