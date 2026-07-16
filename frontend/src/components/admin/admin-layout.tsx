'use client'

import { useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserCog,
  LogOut,
} from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { label: 'Talents', href: '/admin/talents', icon: Users },
  { label: 'Users', href: '/admin/users', icon: UserCog },
]

const ALLOWED_ROLES = ['admin', 'superadmin']

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && (!user || !ALLOWED_ROLES.includes(user.role))) {
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

  if (!user || !ALLOWED_ROLES.includes(user.role)) {
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
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="size-4" />
            </div>
            <span className="text-lg font-semibold">AetherHub</span>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.role}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 items-center border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
