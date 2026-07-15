'use client'

import { useState, useEffect } from 'react'

interface Job {
  id: string
  title: string
  brand_name: string
  status: string
  deadline?: string
  description?: string
}

interface JobModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; brand_name: string; status: string; deadline: string }) => void
  job?: Job
}

export function JobModal({ isOpen, onClose, onSubmit, job }: JobModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [brandName, setBrandName] = useState('')
  const [status, setStatus] = useState('draft')
  const [deadline, setDeadline] = useState('')

  useEffect(() => {
    if (job) {
      setTitle(job.title)
      setDescription(job.description || '')
      setBrandName(job.brand_name)
      setStatus(job.status)
      setDeadline(job.deadline ? job.deadline.split('T')[0] : '')
    } else {
      setTitle('')
      setDescription('')
      setBrandName('')
      setStatus('draft')
      setDeadline('')
    }
  }, [job, isOpen])

  if (!isOpen) return null

  const isEditMode = !!job

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !brandName) return

    onSubmit({ title, description, brand_name: brandName, status, deadline })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit Job' : 'Create Job'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="job-title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="job-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="job-brand" className="block text-sm font-medium text-gray-700">
              Brand Name
            </label>
            <input
              id="job-brand"
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="job-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Optional"
            />
          </div>

          {isEditMode && (
            <div>
              <label htmlFor="job-status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="job-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="job-deadline" className="block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              id="job-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {isEditMode ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
