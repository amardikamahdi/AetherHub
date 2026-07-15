'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { JobTable } from '@/components/admin/job-table'
import { JobModal } from '@/components/admin/job-modal'
import { AssignmentModal } from '@/components/admin/assignment-modal'
import { apiClient } from '@/lib/api'

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
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save job')
    }
  }

  const handleDelete = async (job: Job) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return
    }
    try {
      await apiClient.deleteJob(job.id)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete job')
    }
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Job Management</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Job
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
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
      </div>
    </AdminLayout>
  )
}
