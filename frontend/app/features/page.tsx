/**
 * Features Page - Detailed Feature Showcase
 * Comprehensive overview of all DocsVibe features
 */

'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import {
  FileText,
  Sparkles,
  Zap,
  Shield,
  Search,
  Share2,
  Lock,
  Brain,
  MessageSquare,
  Table,
  Image as ImageIcon,
  Calendar,
  CheckCircle,
  Globe,
  Smartphone,
  Cloud,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

// Lazy load animation components
const AnimatedGradientMesh = dynamic(() => import('@/components/animated-gradient-mesh').then(mod => ({ default: mod.AnimatedGradientMesh })), { ssr: false })
const GridPattern = dynamic(() => import('@/components/grid-pattern').then(mod => ({ default: mod.GridPattern })), { ssr: false })

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
}

export default function FeaturesPage() {
  const { isAuthenticated } = useAuth()

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <AnimatedGradientMesh />
      <GridPattern />
      <div className="noise-overlay fixed inset-0 -z-10" />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-4 pt-32 pb-20">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="inline-flex mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/30 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-sm text-cyan-300">Powered by Advanced AI</span>
            </div>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="gradient-text">Features That Make</span>
            <br />
            <span className="text-white">Work Effortless</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto"
          >
            Discover how DocsVibe revolutionizes document management with cutting-edge AI technology,
            intelligent automation, and seamless collaboration tools.
          </motion.p>
        </motion.div>
      </section>

      {/* Core Features */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Core Capabilities</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              File processing, vector search, and intelligent model routing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Features */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">AI-Powered Intelligence</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Multi-model architecture with intelligent routing and vector search
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aiFeatures.map((feature, index) => (
              <DetailedFeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Features */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Technical Architecture</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Modern tech stack with FastAPI, Next.js, and ChromaDB
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collaborationFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center glass-strong p-12 rounded-3xl border border-white/10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Ready to Get Started?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Experience all these features for free. No credit card required.
          </p>
          <Link href={isAuthenticated ? "/chat" : "/login"}>
            <Button variant="glow" size="xl" className="group">
              Start Using DocsVibe Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
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
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
      className="glass-strong p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer"
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.4 }}
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

function DetailedFeatureCard({ icon: Icon, title, description, details, index }: {
  icon: any
  title: string
  description: string
  details: string[]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass-strong p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
      
      <ul className="space-y-3">
        {details.map((detail, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-300">
            <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

const coreFeatures = [
  {
    icon: FileText,
    title: 'Multi-Format Support',
    description: 'Upload and analyze PDF, DOCX, and PPTX files. Extract text, tables, and metadata automatically with intelligent parsing.',
  },
  {
    icon: Zap,
    title: '128K Token Context',
    description: 'Process entire research papers in one go. DeepSeek models handle up to 128,000 tokens - perfect for 40+ page documents.',
  },
  {
    icon: Search,
    title: 'Vector Search Engine',
    description: 'ChromaDB-powered semantic search finds relevant passages based on meaning, not just keywords. Lightning-fast retrieval.',
  },
  {
    icon: MessageSquare,
    title: 'Conversation Memory',
    description: 'AI remembers your entire chat history per document. Ask follow-up questions naturally without repeating context.',
  },
  {
    icon: Table,
    title: 'Smart Text Extraction',
    description: 'PyPDF2, python-docx, and python-pptx libraries extract clean text while preserving document structure and formatting.',
  },
  {
    icon: Globe,
    title: 'Model Routing',
    description: 'Intelligent router selects the best AI model for your task - DeepSeek for PDFs, GPT for code, Qwen for reasoning.',
  },
]

const aiFeatures = [
  {
    icon: Brain,
    title: 'Multi-Model Architecture',
    description: '20+ AI models for different tasks',
    details: [
      'DeepSeek V3 (128K context) - PDF analysis with native upload',
      'GPT-4o Mini - Premier coding and technical documentation',
      'Qwen 2.5 72B - Complex reasoning and detailed explanations',
      'Llama 3.3 70B - Lightning-fast general conversation',
    ],
  },
  {
    icon: Sparkles,
    title: 'Advanced File Routing',
    description: 'Intelligent model selection engine',
    details: [
      'Analyzes file type, size, and content complexity',
      'Routes to optimal model based on task requirements',
      'Fuzzy matching for natural model selection',
      'File validation with smart suggestions',
    ],
  },
  {
    icon: ImageIcon,
    title: 'Document Processing',
    description: 'Multi-format text extraction pipeline',
    details: [
      'PDF: PyPDF2 with 50MB size limit per file',
      'DOCX: python-docx with structure preservation',
      'PPTX: python-pptx for slide content extraction',
      'Up to 3 files simultaneously (DeepSeek models)',
    ],
  },
  {
    icon: Calendar,
    title: 'ChromaDB Vector Store',
    description: 'Persistent semantic search database',
    details: [
      'Stores document embeddings for fast retrieval',
      'Cosine similarity search for relevant passages',
      'Automatic chunking for optimal context windows',
      'Conversation history with vector indexing',
    ],
  },
]

const collaborationFeatures = [
  {
    icon: Share2,
    title: 'FastAPI Backend',
    description: 'High-performance Python backend with async support. CORS-enabled API for seamless frontend integration.',
  },
  {
    icon: Lock,
    title: 'Supabase Auth',
    description: 'College email validation with domain whitelist. Secure Google OAuth integration and session management.',
  },
  {
    icon: Shield,
    title: 'SQLAlchemy ORM',
    description: 'PostgreSQL database with SQLAlchemy models. Stores conversations, PDFs, and user preferences persistently.',
  },
  {
    icon: Cloud,
    title: 'Next.js 14 Frontend',
    description: 'React 18 with App Router. TypeScript for type safety. Framer Motion animations and Tailwind CSS styling.',
  },
  {
    icon: Smartphone,
    title: 'Real-time Updates',
    description: 'Streaming AI responses with chunked transfer. Live file upload progress. Instant conversation history sync.',
  },
  {
    icon: CheckCircle,
    title: 'Response Customization',
    description: 'Choose response style: Concise, Balanced, Detailed, Academic, or Casual. AI adapts to your preference.',
  },
]
