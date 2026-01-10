/**
 * Professional Navbar Component
 * Modern navigation with glass morphism design
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Menu, 
  X, 
  Sparkles, 
  User,
  LogIn,
  LogOut,
  MessageSquare,
  Home,
  Info,
  Mail
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, signOut } = useAuth()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/chat', label: 'Chat', icon: MessageSquare, protected: true },
    { href: '/features', label: 'Features', icon: Sparkles },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/40 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-cyan-500/10' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className="relative w-12 h-12 rounded-xl overflow-hidden"
              >
                <Image
                  src="/logo.png"
                  alt="DocsVibe Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </motion.div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold gradient-text">DocsVibe</span>
                <div className="text-[10px] text-gray-400 -mt-1">AI-Powered PDF Assistant</div>
              </div>
              <span className="sm:hidden text-xl font-bold gradient-text">DocsVibe</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                if (link.protected && !isAuthenticated) return null
                
                const isActive = pathname === link.href || 
                  (link.href !== '/' && pathname?.startsWith(link.href))
                
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <Button
                        variant="ghost"
                        className={`gap-2 group ${
                          isActive 
                            ? 'text-cyan-400 bg-cyan-500/10' 
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <link.icon className={`w-4 h-4 ${
                          isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'
                        } transition-colors`} />
                        {link.label}
                      </Button>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>

            {/* Right Section - Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                    {user?.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        className="w-6 h-6 rounded-full border border-cyan-500/30 object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-cyan-400" />
                    )}
                    <span className="text-sm text-gray-300 max-w-[150px] truncate">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </span>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="gap-2 text-gray-300 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="glow" className="gap-2 group">
                    <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    Get Started
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-16 right-0 bottom-0 w-[280px] bg-black/95 backdrop-blur-xl border-l border-white/10 z-[999] md:hidden overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* User Info */}
                {isAuthenticated && (
                  <div className="pb-6 border-b border-white/10">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                      {user?.user_metadata?.avatar_url ? (
                        <img 
                          src={user.user_metadata.avatar_url} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full border-2 border-cyan-500/30 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-2">
                  {navLinks.map((link) => {
                    if (link.protected && !isAuthenticated) return null
                    
                    const isActive = pathname === link.href || 
                      (link.href !== '/' && pathname?.startsWith(link.href))

                    return (
                      <Link key={link.href} href={link.href}>
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <link.icon className={`w-5 h-5 ${
                            isActive ? 'text-cyan-400' : 'text-gray-400'
                          }`} />
                          <span className="font-medium">{link.label}</span>
                        </motion.div>
                      </Link>
                    )
                  })}
                </nav>

                {/* Auth Button */}
                <div className="pt-6 border-t border-white/10">
                  {isAuthenticated ? (
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </Button>
                  ) : (
                    <Link href="/login" className="block">
                      <Button variant="glow" className="w-full gap-2">
                        <LogIn className="w-4 h-4" />
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
