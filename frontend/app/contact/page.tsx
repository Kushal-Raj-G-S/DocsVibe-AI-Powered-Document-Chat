/**
 * Contact Page - Get in Touch
 * Contact form and information
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import {
  Mail,
  Send,
  MessageSquare,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react'

// Lazy load animation components
const AnimatedGradientMesh = dynamic(() => import('@/components/animated-gradient-mesh').then(mod => ({ default: mod.AnimatedGradientMesh })), { ssr: false })
const GridPattern = dynamic(() => import('@/components/grid-pattern').then(mod => ({ default: mod.GridPattern })), { ssr: false })

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const response = await fetch('https://formspree.io/f/mldpyjkd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
        
        // Reset status after 3 seconds
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch (error) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <AnimatedGradientMesh />
      <GridPattern />
      <div className="noise-overlay fixed inset-0 -z-10" />

      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center px-4 pt-32 pb-12">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="inline-flex mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/30 backdrop-blur-xl">
              <MessageSquare className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-sm text-cyan-300">We'd Love to Hear From You</span>
            </div>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="gradient-text">Get in Touch</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto"
          >
            Have questions, feedback, or want to add your college to our approved list?
            Drop us a message and we'll get back to you within 24 hours.
          </motion.p>
        </motion.div>
      </section>

      {/* Contact Content */}
      <section className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Contact Info Cards */}
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-strong p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                <p className="text-gray-400 text-sm">{info.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-3 glass-strong p-8 rounded-2xl border border-white/10"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="glow"
                  size="lg"
                  disabled={status === 'sending'}
                  className="w-full group"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Message Sent!
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Thank you! We'll get back to you within 24 hours.</span>
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 space-y-6"
            >
              {/* Email */}
              <div className="glass-strong p-6 rounded-2xl border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Direct Email</h3>
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=kushalrajgs@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>kushalrajgs@gmail.com</span>
                </a>
                <p className="text-sm text-gray-400 mt-3">
                  We typically respond within 24 hours
                </p>
              </div>

              {/* FAQ */}
              <div className="glass-strong p-6 rounded-2xl border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Questions?</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">College Email:</strong> Contact us to add your institution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Bug Reports:</strong> Include screenshots and steps to reproduce</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Feature Requests:</strong> We love hearing your ideas!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Partnerships:</strong> Open to collaborations</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'kushalrajgs@gmail.com',
  },
  {
    icon: Clock,
    title: 'Response Time',
    value: 'Within 24 hours',
  },
  {
    icon: MapPin,
    title: 'Location',
    value: 'Bangalore, India',
  },
]
