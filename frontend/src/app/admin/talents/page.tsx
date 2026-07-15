'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { TalentTable } from '@/components/admin/talent-table'
import { TalentModal } from '@/components/admin/talent-modal'
import { apiClient } from '@/lib/api'

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
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save talent')
    }
  }

  const handleDelete = async (talent: Talent) => {
    if (!window.confirm('Are you sure you want to delete this talent?')) {
      return
    }
    try {
      await apiClient.deleteTalent(talent.id)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete talent')
    }
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Talent Management</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Talent
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <TalentTable key={refreshKey} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <TalentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          talent={editingTalent}
        />
      </div>
    </AdminLayout>
  )
}
