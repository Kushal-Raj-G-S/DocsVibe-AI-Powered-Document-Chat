'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { 
  FileText, 
  Sparkles, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp,
  ArrowRight,
  ChevronDown,
  Search,
  Share2,
  Lock,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

// Lazy load expensive animation components
const AnimatedGradientMesh = dynamic(() => import('@/components/animated-gradient-mesh').then(mod => ({ default: mod.AnimatedGradientMesh })), { ssr: false })
const FloatingParticles = dynamic(() => import('@/components/floating-particles').then(mod => ({ default: mod.FloatingParticles })), { ssr: false })
const GridPattern = dynamic(() => import('@/components/grid-pattern').then(mod => ({ default: mod.GridPattern })), { ssr: false })
const MouseFollowSpotlight = dynamic(() => import('@/components/mouse-follow-spotlight').then(mod => ({ default: mod.MouseFollowSpotlight })), { ssr: false })

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const floatingCard = {
  hidden: { opacity: 0, y: 50, rotateX: -15 },
  show: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    }
  },
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <AnimatedGradientMesh />
      <FloatingParticles count={30} />
      <GridPattern />
      <MouseFollowSpotlight />
      <div className="noise-overlay fixed inset-0 -z-10" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
        <motion.div
          className="max-w-7xl mx-auto text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Badge - with top margin */}
          <motion.div variants={item} className="inline-flex mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/30 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-sm text-cyan-300">100% Free • No Credit Card Required</span>
            </div>
          </motion.div>

          {/* Animated Headline */}
          <motion.h1
            variants={item}
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="gradient-text inline-block">
              Read Smarter,
            </span>
            <br />
            <motion.span
              className="inline-block text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Not Harder
            </motion.span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={item}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transform how you work with PDFs using cutting-edge AI. 
            <span className="text-gray-300"> Chat with your documents, extract key insights instantly, 
            and collaborate seamlessly</span> - no limits, no catches, 100% free forever.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href={isAuthenticated ? "/chat" : "/login"}>
              <Button
                variant="glow"
                size="xl"
                className="group"
              >
                Start Chatting Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/login">
                <Button
                  variant="outline"
                  size="xl"
                  className="glass border-white/20 hover:border-cyan-500/40 hover:bg-white/5"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={item}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-500" />
              <span>Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>15K+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              <span>Always Free</span>
            </div>
          </motion.div>

          {/* Floating 3D Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
            <motion.div
              variants={floatingCard}
              className="glass-strong p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-float"
              style={{ animationDelay: '0s' }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">AI-Powered Search</h3>
              <p className="text-gray-400 text-sm">
                Ask questions naturally and get precise answers. No more endless scrolling or Ctrl+F.
              </p>
            </motion.div>

            <motion.div
              variants={floatingCard}
              className="glass-strong p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-float"
              style={{ animationDelay: '2s' }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Real-Time Collaboration</h3>
              <p className="text-gray-400 text-sm">
                Work together like Google Docs. Comment, highlight, and share insights instantly with your team.
              </p>
            </motion.div>

            <motion.div
              variants={floatingCard}
              className="glass-strong p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-float"
              style={{ animationDelay: '4s' }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Military-Grade Security</h3>
              <p className="text-gray-400 text-sm">
                Zero-knowledge encryption means not even we can see your files. Your data, truly private.
              </p>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-cyan-500 opacity-50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Bento Grid Section */}
      <section id="features" className="relative py-20 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to revolutionize your document workflow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-20 px-4 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold mb-4">
              <span className="gradient-text">About DocsVibe</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Empowering students and professionals with AI-powered document intelligence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-strong p-8 rounded-2xl border border-white/10"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-gray-400 leading-relaxed">
                We're building the future of document interaction. DocsVibe makes complex PDFs accessible, searchable, and interactive through cutting-edge AI technology. Our platform is designed specifically for students and researchers who need to extract insights quickly and efficiently.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-strong p-8 rounded-2xl border border-white/10"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Why Choose Us</h3>
              <p className="text-gray-400 leading-relaxed">
                100% free for college students. No hidden fees, no premium tiers. We believe in democratizing access to AI-powered tools for education. Your documents are encrypted and private. We never sell your data or use it for training.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-20 px-4 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center glass-strong p-12 rounded-3xl border border-white/10"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Get in Touch</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Have questions or feedback? Want to add your college to the approved list? We'd love to hear from you!
            </p>
            <div className="space-y-4">
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=kushalrajgs@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-lg font-medium transition-colors"
              >
                <Mail className="w-5 h-5" />
                kushalrajgs@gmail.com
              </a>
              <p className="text-sm text-gray-500">
                We typically respond within 24 hours
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center glass-strong p-12 rounded-3xl border border-white/10 relative overflow-hidden group"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Ready to Transform Your PDF Workflow?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join over 15,000 professionals who've already transformed how they work with documents. 
              <span className="text-gray-300"> Start free, stay free forever</span> - no credit card, no trial limits.
            </p>
            <Link href={isAuthenticated ? "/chat" : "/login"}>
              <Button variant="glow" size="xl" className="group">
                Get Started Now - It's Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  )
}

function FeatureCard({ icon: Icon, title, description, index }: {
  icon: any
  title: string
  description: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { type: 'spring', stiffness: 300 }
      }}
      className="glass-strong p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer relative overflow-hidden"
    >
      {/* Gradient Border Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-shadow"
      >
        <Icon className="w-7 h-7 text-white" />
      </motion.div>
      
      <h3 className="text-2xl font-semibold mb-3 text-white group-hover:text-cyan-300 transition-colors">
        {title}
      </h3>
      
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
        {description}
      </p>
    </motion.div>
  )
}

const features = [
  {
    icon: FileText,
    title: 'Intelligent Reading',
    description: 'AI highlights key information, generates summaries, and creates table of contents automatically for any PDF.',
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    description: 'Upload and start working with PDFs instantly. No waiting, no delays - even for documents with 1000+ pages.',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    description: 'Search by meaning, not just keywords. Find information across all documents using natural language.',
  },
  {
    icon: Share2,
    title: 'Live Collaboration',
    description: 'Multiple people can view, comment, and annotate the same document simultaneously in real-time.',
  },
  {
    icon: Sparkles,
    title: 'Auto-Extraction',
    description: 'Automatically extract tables, images, key metrics, dates, and action items from any document.',
  },
  {
    icon: Shield,
    title: 'Zero-Knowledge Security',
    description: 'Your documents are encrypted end-to-end. We can never see your data, even if we wanted to.',
  },
]
