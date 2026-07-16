'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { JobTable } from '@/components/admin/job-table'
import { JobModal } from '@/components/admin/job-modal'
import { AssignmentModal } from '@/components/admin/assignment-modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

interface Job {
  id: string
  title: string
  brand_name: string
  status: string
  deadline?: string
  description?: string
}

export default function JobsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined)
  const [selectedJobId, setSelectedJobId] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<Job | null>(null)

  const handleCreate = () => {
    setEditingJob(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setIsModalOpen(true)
  }

  const handleAssign = (job: Job) => {
    setSelectedJobId(job.id)
    setIsAssignmentModalOpen(true)
  }

  const handleSubmit = async (data: { title: string; description: string; brand_name: string; status: string; deadline: string }) => {
    try {
      if (editingJob) {
        await apiClient.updateJob(editingJob.id, data)
      } else {
        await apiClient.createJob(data)
      }
      setIsModalOpen(false)
      setRefreshKey((k) => k + 1)
      toast.success(editingJob ? 'Job updated' : 'Job created')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save job')
    }
  }

  const handleDelete = (job: Job) => {
    setDeleteConfirm(job)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      await apiClient.deleteJob(deleteConfirm.id)
      setRefreshKey((k) => k + 1)
      toast.success('Job deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete job')
    } finally {
      setDeleteConfirm(null)
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Job Management</h1>
          <Button onClick={handleCreate}>
            <Plus />
            Create Job
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <JobTable
            key={refreshKey}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssign={handleAssign}
          />
        </div>

        <JobModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          job={editingJob}
        />

        {selectedJobId && (
          <AssignmentModal
            isOpen={isAssignmentModalOpen}
            onClose={() => setIsAssignmentModalOpen(false)}
            jobId={selectedJobId}
            onAssignmentChange={() => setRefreshKey((k) => k + 1)}
          />
        )}

        <ConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          title="Delete Job"
          description={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          confirmText="Delete"
        />
      </div>
    </AdminLayout>
  )
}
