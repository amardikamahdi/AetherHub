'use client'

import { useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/talent/dashboard' },
  { label: 'Social Media', href: '/talent/social-media' },
]

interface TalentLayoutProps {
  children: ReactNode
}

export function TalentLayout({ children }: TalentLayoutProps) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'talent')) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user || user.role !== 'talent') {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">AetherHub</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
        <nav className="mt-2 flex gap-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-8">
        {children}
      </main>
    </div>
  )
}
