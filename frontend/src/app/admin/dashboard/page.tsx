'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { AdminLayout } from '@/components/admin/admin-layout'

interface Stats {
  totalUsers: number
  totalTalents: number
  totalAdmins: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalTalents: 0, totalAdmins: 0 })

  useEffect(() => {
    apiClient.listUsers(0, 100).then((res) => {
      const users = res.data || []
      setStats({
        totalUsers: res.total || users.length,
        totalTalents: users.filter((u: any) => u.role === 'talent').length,
        totalAdmins: users.filter((u: any) => u.role === 'admin' || u.role === 'superadmin').length,
      })
    }).catch(() => {})
  }, [])

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Talents</p>
            <p className="text-3xl font-bold">{stats.totalTalents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Admins</p>
            <p className="text-3xl font-bold">{stats.totalAdmins}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link
              href="/admin/users?action=create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create User
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
