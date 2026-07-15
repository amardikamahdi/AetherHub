'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface Job {
  id: string
  title: string
  brand_name: string
  status: string
  deadline?: string
  description?: string
}

interface JobTableProps {
  onEdit?: (job: Job) => void
  onDelete?: (job: Job) => void
  onAssign?: (job: Job) => void
  refreshKey?: number
}

const PAGE_SIZE = 20

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function JobTable({ onEdit, onDelete, onAssign, refreshKey }: JobTableProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    apiClient
      .listJobs(page * PAGE_SIZE, PAGE_SIZE)
      .then((res) => {
        setJobs(res.data || [])
        setTotal(res.total || 0)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [page, refreshKey])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (isLoading) {
    return <p className="text-gray-500">Loading...</p>
  }

  if (jobs.length === 0) {
    return <p className="text-gray-500">No jobs found</p>
  }

  return (
    <div>
      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="p-3 font-medium">Title</th>
            <th className="p-3 font-medium">Brand</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Deadline</th>
            <th className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{job.title}</td>
              <td className="p-3">{job.brand_name}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-700'}`}>
                  {job.status}
                </span>
              </td>
              <td className="p-3">{job.deadline ? new Date(job.deadline).toLocaleDateString() : '-'}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => onEdit?.(job)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => onAssign?.(job)}
                  className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                >
                  Assign
                </button>
                <button
                  onClick={() => onDelete?.(job)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
