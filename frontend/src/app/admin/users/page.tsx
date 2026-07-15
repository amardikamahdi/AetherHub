'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { UserTable } from '@/components/admin/user-table'
import { UserModal } from '@/components/admin/user-modal'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreate = () => {
    setEditingUser(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: { name: string; email: string; password: string; role: string }) => {
    try {
      if (editingUser) {
        await apiClient.updateUser(editingUser.id, data)
      } else {
        await apiClient.createUser(data)
      }
      setIsModalOpen(false)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save user')
    }
  }

  const handleDelete = async (user: User) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }
    try {
      await apiClient.deleteUser(user.id)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create User
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <UserTable key={refreshKey} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          user={editingUser}
        />
      </div>
    </AdminLayout>
  )
}
