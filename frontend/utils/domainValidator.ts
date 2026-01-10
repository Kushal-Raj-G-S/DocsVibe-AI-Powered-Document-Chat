export interface ApprovedInstitution {
  domain: string
  name: string
  location?: string
}

// List of approved college domains
export const APPROVED_DOMAINS: ApprovedInstitution[] = [
  {
    domain: 'bmsit.in',
    name: 'BMS Institute of Technology and Management',
    location: 'Bangalore, India'
  },
  // More domains will be added as students request access
]

/**
 * Check if email domain is approved
 */
export function isCollegeEmail(email: string): boolean {
  if (!email) return false
  
  const domain = email.toLowerCase().split('@')[1]
  if (!domain) return false
  
  console.log('🔍 Domain check:', { email, domain, approvedDomains: APPROVED_DOMAINS.map(d => d.domain) })
  
  const isApproved = APPROVED_DOMAINS.some(approved => 
    approved.domain.toLowerCase() === domain
  )
  
  console.log('✓ Domain approved:', isApproved)
  return isApproved
}

/**
 * Get institution info from email
 */
export function getInstitutionInfo(email: string): ApprovedInstitution | null {
  if (!email) return null
  
  const domain = email.toLowerCase().split('@')[1]
  if (!domain) return null
  
  return APPROVED_DOMAINS.find(approved => 
    approved.domain.toLowerCase() === domain
  ) || null
}

/**
 * Extract domain from email
 */
export function getDomain(email: string): string | null {
  if (!email) return null
  const parts = email.split('@')
  return parts.length === 2 ? parts[1].toLowerCase() : null
}

/**
 * Format institution list for display
 */
export function getApprovedInstitutionsList(): string {
  return APPROVED_DOMAINS.map(inst => 
    `${inst.name} (${inst.domain})`
  ).join('\n')
}
