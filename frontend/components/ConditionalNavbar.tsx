'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Don't show navbar on chat page (it has its own layout)
  if (pathname === '/chat') {
    return null
  }
  
  return <Navbar />
}
