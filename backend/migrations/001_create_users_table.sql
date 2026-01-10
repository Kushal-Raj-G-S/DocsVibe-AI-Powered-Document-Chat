-- ============================================
-- USER MANAGEMENT TABLE FOR DOCSVIBE
-- ============================================
-- Run this in Supabase SQL Editor
-- This table stores user profiles and preferences

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Authentication
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    
    -- User Settings
    notifications_enabled BOOLEAN DEFAULT true,
    auto_summarize_pdfs BOOLEAN DEFAULT false,
    smart_suggestions_enabled BOOLEAN DEFAULT true,
    response_style TEXT DEFAULT 'balanced' CHECK (response_style IN ('concise', 'balanced', 'detailed', 'academic', 'casual')),
    
    -- Theme preferences
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'en',
    
    -- Usage tracking
    total_pdfs_uploaded INTEGER DEFAULT 0,
    total_messages_sent INTEGER DEFAULT 0,
    total_storage_used_bytes BIGINT DEFAULT 0,
    
    -- Subscription/limits (for future)
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid()::text = id::text OR email = auth.email());

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid()::text = id::text OR email = auth.email());

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.users
    FOR INSERT
    WITH CHECK (email = auth.email());

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE QUERIES (for testing)
-- ============================================

-- Insert test user (replace with your email)
-- INSERT INTO public.users (email, display_name) 
-- VALUES ('test@example.com', 'Test User');

-- View all users
-- SELECT * FROM public.users;

-- Update user settings
-- UPDATE public.users 
-- SET response_style = 'detailed', notifications_enabled = false 
-- WHERE email = 'test@example.com';
