/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client for authentication and database operations
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate Supabase credentials
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key-here'

if (!isSupabaseConfigured) {
  console.warn(`
⚠️  Supabase is not configured!
    
To enable authentication:
1. Create a project at https://supabase.com
2. Go to Settings > API
3. Copy your Project URL and anon/public key
4. Update .env.local with your credentials:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
  `)
}

// Create client with dummy values if not configured (to prevent runtime errors)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

// Helper functions for authentication
export const authHelpers = {
  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please update .env.local with your credentials.')
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/chat`,
      },
    })
    return { data, error }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    if (!isSupabaseConfigured) {
      return { error: null }
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Get current user session
   */
  getSession: async () => {
    if (!isSupabaseConfigured) {
      return { session: null, error: null }
    }
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  /**
   * Get current user
   */
  getUser: async () => {
    if (!isSupabaseConfigured) {
      return { user: null, error: null }
    }
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },
}

export { isSupabaseConfigured }
