'use client'

import { useEffect, useRef } from 'react'

export function AnimatedGradientMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let time = 0

    const animate = () => {
      time += 0.005

      const gradient1 = ctx.createRadialGradient(
        canvas.width * (0.5 + Math.sin(time) * 0.3),
        canvas.height * (0.5 + Math.cos(time) * 0.3),
        0,
        canvas.width * (0.5 + Math.sin(time) * 0.3),
        canvas.height * (0.5 + Math.cos(time) * 0.3),
        canvas.width * 0.8
      )
      gradient1.addColorStop(0, 'rgba(6, 182, 212, 0.3)')
      gradient1.addColorStop(0.5, 'rgba(14, 165, 233, 0.2)')
      gradient1.addColorStop(1, 'rgba(0, 0, 0, 0)')

      const gradient2 = ctx.createRadialGradient(
        canvas.width * (0.3 + Math.cos(time * 1.3) * 0.3),
        canvas.height * (0.6 + Math.sin(time * 1.3) * 0.3),
        0,
        canvas.width * (0.3 + Math.cos(time * 1.3) * 0.3),
        canvas.height * (0.6 + Math.sin(time * 1.3) * 0.3),
        canvas.width * 0.8
      )
      gradient2.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
      gradient2.addColorStop(0.5, 'rgba(96, 165, 250, 0.2)')
      gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = gradient1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = gradient2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
