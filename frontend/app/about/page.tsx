/**
 * About Page - Company Information & Mission
 * Learn about DocsVibe and our mission
 */

'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  Sparkles,
  Shield,
  Heart,
  Users,
  Target,
  Lightbulb,
  Award,
  TrendingUp,
  Globe,
  ArrowRight,
  BookOpen,
  Rocket,
  CheckCircle,
  User,
  Github,
  Linkedin
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

export default function AboutPage() {
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
              <Heart className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-sm text-cyan-300">Made with ❤️ for Students & Researchers</span>
            </div>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="gradient-text">Democratizing AI</span>
            <br />
            <span className="text-white">for Education</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            We're building the future of document interaction. DocsVibe makes complex PDFs accessible,
            searchable, and interactive through cutting-edge AI technology - completely free for students.
          </motion.p>
        </motion.div>
      </section>

      {/* Creator Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-strong p-12 rounded-2xl border border-white/10"
          >
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="gradient-text">Meet the Creator</span>
            </h2>

            <div className="flex flex-col items-center text-center">
              {/* Profile Photo */}
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-1 mb-6">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                  <Image
                    src="/creator.jpg"
                    alt="Kushal Raj G S"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Name */}
              <h3 className="text-2xl font-bold text-white mb-2">Kushal Raj G S</h3>
              <p className="text-cyan-400 mb-6">AI Product and Full Stack Developer</p>

              {/* About Me */}
              <p className="text-gray-400 mb-4 max-w-2xl leading-relaxed">
                Hey there! I'm a student passionate about making AI accessible to everyone. I built DocsVibe because 
                I saw how expensive and complicated AI tools were for students who just wanted to understand their research papers better.
              </p>
              <p className="text-gray-400 mb-8 max-w-2xl leading-relaxed">
                This project combines my love for building things that matter with my belief that education should be free and 
                accessible. Every feature you see here was designed with students and researchers in mind.
              </p>

              {/* Links */}
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="https://kushalrajgs.me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl transition-all group"
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Visit My Portfolio</span>
                </a>
                <a 
                  href="https://github.com/kushal-raj-g-s" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 glass-strong border border-white/10 hover:border-cyan-500/50 rounded-xl transition-all"
                >
                  <Github className="w-5 h-5" />
                  <span className="font-medium">GitHub</span>
                </a>
                <a 
                  href="https://linkedin.com/in/kushal-raj-g-s" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 glass-strong border border-white/10 hover:border-cyan-500/50 rounded-xl transition-all"
                >
                  <Linkedin className="w-5 h-5" />
                  <span className="font-medium">LinkedIn</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-strong p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                To empower students, researchers, and professionals worldwide with AI-powered tools that make
                document analysis effortless and accessible to everyone.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We believe cutting-edge AI shouldn't be locked behind paywalls. Knowledge should be free,
                and technology should serve education first.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-strong p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                A world where every student has access to powerful AI tools that enhance learning,
                boost productivity, and unlock new possibilities in research and education.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We're creating a platform that grows with you - from undergraduate research papers
                to doctoral dissertations and beyond.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why We Built This */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Why We Built DocsVibe</span>
            </h2>
            <p className="text-xl text-gray-400">
              Born from real struggles with research and document analysis
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-strong p-8 rounded-2xl border border-white/10"
          >
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p className="text-lg">
                <span className="text-cyan-400 font-semibold">As students ourselves</span>, we spent countless
                hours struggling with massive research papers, trying to extract key insights from hundreds of pages,
                and wishing we had better tools to understand complex academic material.
              </p>
              <p className="text-lg">
                Traditional PDF readers are just... readers. They don't help you <span className="text-white font-semibold">understand</span>, 
                they don't help you <span className="text-white font-semibold">analyze</span>, and they definitely don't help you work
                with 6-40 page research documents efficiently.
              </p>
              <p className="text-lg">
                <span className="text-cyan-400 font-semibold">We built DocsVibe</span> to be the research assistant
                we always wished we had - an AI that reads with you, answers your questions, and helps you extract
                insights in seconds instead of hours.
              </p>
              <p className="text-lg font-semibold text-white">
                Best of all? It's 100% free for students. No trials, no limits, no credit cards. Just pure, powerful AI for education.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Our Core Values</span>
            </h2>
            <p className="text-xl text-gray-400">
              Principles that guide everything we build
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="glass-strong p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-6">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-strong p-12 rounded-2xl border border-white/10"
          >
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="gradient-text">Powerful AI Capabilities</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

const values = [
  {
    icon: BookOpen,
    title: 'Education First',
    description: 'We prioritize students and researchers. Every feature is designed with learning and discovery in mind.',
  },
  {
    icon: Shield,
    title: 'Privacy Always',
    description: 'Your data is yours. Zero-knowledge encryption means we never see your documents or sell your data.',
  },
  {
    icon: Heart,
    title: 'Always Free',
    description: 'Core features remain free forever for students. No hidden fees, premium tiers, or artificial limits.',
  },
  {
    icon: Rocket,
    title: 'Innovation Driven',
    description: 'We leverage the latest AI breakthroughs to continually improve and add cutting-edge features.',
  },
  {
    icon: Users,
    title: 'Community Powered',
    description: 'Built with feedback from 15,000+ users. Your suggestions directly shape our roadmap.',
  },
  {
    icon: Globe,
    title: 'Globally Accessible',
    description: 'Support for 100+ languages and optimized for low-bandwidth connections worldwide.',
  },
]

const stats = [
  { value: '20+', label: 'AI Models' },
  { value: '128K', label: 'Token Context' },
  { value: '3 Files', label: 'Upload Limit' },
  { value: '100%', label: 'Free Forever' },
]
