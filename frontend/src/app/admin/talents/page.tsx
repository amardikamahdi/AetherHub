'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { TalentTable } from '@/components/admin/talent-table'
import { TalentModal } from '@/components/admin/talent-modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

interface Talent {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
}

export default function TalentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTalent, setEditingTalent] = useState<Talent | undefined>(undefined)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<Talent | null>(null)

  const handleCreate = () => {
    setEditingTalent(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (talent: Talent) => {
    setEditingTalent(talent)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: { name: string; email: string; phone: string }) => {
    try {
      if (editingTalent) {
        await apiClient.updateTalent(editingTalent.id, data)
      } else {
        await apiClient.createTalent(data)
      }
      setIsModalOpen(false)
      setRefreshKey((k) => k + 1)
      toast.success(editingTalent ? 'Talent updated' : 'Talent created')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save talent')
    }
  }

  const handleDelete = (talent: Talent) => {
    setDeleteConfirm(talent)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      await apiClient.deleteTalent(deleteConfirm.id)
      setRefreshKey((k) => k + 1)
      toast.success('Talent deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete talent')
    } finally {
      setDeleteConfirm(null)
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Talent Management</h1>
          <Button onClick={handleCreate}>
            <Plus />
            Create Talent
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <TalentTable key={refreshKey} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <TalentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          talent={editingTalent}
        />

        <ConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          title="Delete Talent"
          description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          confirmText="Delete"
        />
      </div>
    </AdminLayout>
  )
}
