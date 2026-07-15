'use client'

import { useState } from 'react'
import { TalentLayout } from '@/components/talent/talent-layout'
import { SocialMediaTable } from '@/components/talent/social-media-table'
import { SocialMediaModal } from '@/components/talent/social-media-modal'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/providers/auth-provider'

interface SocialMediaAccount {
  id: string
  talent_id: string
  platform: string
  username: string
  url?: string
}

export default function SocialMediaPage() {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<SocialMediaAccount | undefined>(undefined)
  const [refreshKey, setRefreshKey] = useState(0)

  const talentId = user?.id || ''

  const handleAdd = () => {
    setEditingAccount(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (account: SocialMediaAccount) => {
    setEditingAccount(account)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: { platform: string; username: string; url: string }) => {
    try {
      if (editingAccount) {
        await apiClient.updateSocialMedia(editingAccount.id, data)
      } else {
        await apiClient.createSocialMedia(talentId, data)
      }
      setIsModalOpen(false)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save social media account')
    }
  }

  const handleDelete = async (account: SocialMediaAccount) => {
    if (!window.confirm('Are you sure you want to delete this social media account?')) {
      return
    }
    try {
      await apiClient.deleteSocialMedia(account.id)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete social media account')
    }
  }

  return (
    <TalentLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Social Media Accounts</h1>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Account
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <SocialMediaTable
            key={refreshKey}
            talentId={talentId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <SocialMediaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          account={editingAccount}
        />
      </div>
    </TalentLayout>
  )
}
