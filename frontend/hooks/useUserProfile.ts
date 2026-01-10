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

export function useUserProfile(email: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? 'https://docs-vibe-6giqc.ondigitalocean.app' 
      : 'http://localhost:8000')

  useEffect(() => {
    if (!email) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile/${email}`)
        if (response.ok) {
          const data = await response.json()
          setProfile({
            name: data.display_name || email.split('@')[0],
            email: data.email,
            avatar: data.avatar_url,
            display_name: data.display_name
          })
        } else {
          // Fallback to email if backend fails
          setProfile({
            name: email.split('@')[0],
            email: email,
          })
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
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
