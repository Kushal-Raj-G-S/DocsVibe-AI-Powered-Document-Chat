'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedGradientMesh } from '@/components/animated-gradient-mesh'
import { FloatingParticles } from '@/components/floating-particles'
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  Users, 
  Clock,
  MoreVertical,
  Search,
  Bell,
  Settings,
  LogOut
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <AnimatedGradientMesh />
      <FloatingParticles count={15} />
      <div className="noise-overlay fixed inset-0 -z-10" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">DocsVibe</span>
            </Link>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Search className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your documents today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}
            >
              <Card className="glass-strong border-white/10 hover:border-cyan-500/30 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="glass-strong border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription>Get started with your documents</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="glow" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload PDF
              </Button>
              <Button variant="outline" className="glass border-white/20">
                Create New Folder
              </Button>
              <Button variant="outline" className="glass border-white/20">
                Invite Team Member
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-strong border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Documents</CardTitle>
              <CardDescription>Your most recently accessed PDFs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocs.map((doc, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ x: 10, transition: { type: 'spring', stiffness: 300 } }}
                    className="flex items-center justify-between p-4 rounded-lg glass hover:border-cyan-500/30 border border-transparent transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                          {doc.name}
                        </h3>
                        <p className="text-sm text-gray-400">{doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

const stats = [
  {
    title: 'Total Documents',
    value: '2,345',
    change: '+12.5%',
    icon: FileText,
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Team Members',
    value: '24',
    change: '+8.2%',
    icon: Users,
    gradient: 'from-blue-500 to-sky-500',
  },
  {
    title: 'Storage Used',
    value: '45.2 GB',
    change: '+15.3%',
    icon: TrendingUp,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Time Saved',
    value: '127h',
    change: '+23.1%',
    icon: Clock,
    gradient: 'from-orange-500 to-red-500',
  },
]

const recentDocs = [
  { name: 'Q4 Financial Report.pdf', size: '2.4 MB', date: '2 hours ago' },
  { name: 'Product Roadmap 2025.pdf', size: '1.8 MB', date: '5 hours ago' },
  { name: 'Marketing Strategy.pdf', size: '3.2 MB', date: 'Yesterday' },
  { name: 'Customer Research.pdf', size: '4.1 MB', date: '2 days ago' },
]
