'use client'

import { useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Share2,
  Briefcase,
  LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/talent/dashboard', icon: LayoutDashboard },
  { label: 'My Jobs', href: '/talent/jobs', icon: Briefcase },
  { label: 'Social Media', href: '/talent/social-media', icon: Share2 },
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
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
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

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="size-4" />
            </div>
            <span className="text-lg font-semibold">AetherHub</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex gap-1 px-6">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-muted/50 p-6">{children}</main>
    </div>
  )
}
