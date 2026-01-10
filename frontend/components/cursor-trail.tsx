'use client'

import { useEffect, useState } from 'react'

export function CursorTrail() {
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([])

  useEffect(() => {
    let id = 0
    const handleMouseMove = (e: MouseEvent) => {
      setTrail((prev) => {
        const newTrail = [
          ...prev,
          { x: e.clientX, y: e.clientY, id: id++ },
        ].slice(-20)
        return newTrail
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
          style={{
            left: point.x,
            top: point.y,
            opacity: index / trail.length * 0.5,
            transform: `translate(-50%, -50%) scale(${index / trail.length})`,
            transition: 'opacity 0.3s, transform 0.3s',
          }}
        />
      ))}
    </div>
  )
}
