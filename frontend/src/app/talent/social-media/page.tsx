'use client'

import { useState } from 'react'
import { TalentLayout } from '@/components/talent/talent-layout'
import { SocialMediaTable } from '@/components/talent/social-media-table'
import { SocialMediaModal } from '@/components/talent/social-media-modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/providers/auth-provider'
import { Plus } from 'lucide-react'

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
  const [deleteConfirm, setDeleteConfirm] = useState<SocialMediaAccount | null>(null)

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
      toast.success(editingAccount ? 'Account updated' : 'Account added')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save social media account')
    }
  }

  const handleDelete = (account: SocialMediaAccount) => {
    setDeleteConfirm(account)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      await apiClient.deleteSocialMedia(deleteConfirm.id)
      setRefreshKey((k) => k + 1)
      toast.success('Account deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete social media account')
    } finally {
      setDeleteConfirm(null)
    }
  }

  return (
    <TalentLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Social Media Accounts</h1>
          <Button onClick={handleAdd}>
            <Plus />
            Add Account
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
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

        <ConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          title="Delete Account"
          description={`Are you sure you want to delete your ${deleteConfirm?.platform} account? This action cannot be undone.`}
          onConfirm={confirmDelete}
          confirmText="Delete"
        />
      </div>
    </TalentLayout>
  )
}
