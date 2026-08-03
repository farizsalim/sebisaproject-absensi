'use client'

import { useEffect, useState } from 'react'
import RoleDashboard from '@/components/role/RoleDashboard'

export default function ConsolePage() {
  const [leader, setLeader] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then((response) => response.json()).then((data) => {
      const role = data.user?.role?.toLowerCase()
      if (!['hr', 'leader'].includes(role)) return window.location.replace('/dashboard')
      setLeader(role === 'leader')
    })
  }, [])

  return <RoleDashboard leader={leader} />
}
