'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { UserTable } from '@/components/admin/user-table'
import { UserModal } from '@/components/admin/user-modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

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
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null)

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
      toast.success(editingUser ? 'User updated' : 'User created')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save user')
    }
  }

  const handleDelete = (user: User) => {
    setDeleteConfirm(user)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      await apiClient.deleteUser(deleteConfirm.id)
      setRefreshKey((k) => k + 1)
      toast.success('User deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setDeleteConfirm(null)
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button onClick={handleCreate}>
            <Plus />
            Create User
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <UserTable key={refreshKey} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          user={editingUser}
        />

        <ConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          title="Delete User"
          description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          confirmText="Delete"
        />
      </div>
    </AdminLayout>
  )
}
