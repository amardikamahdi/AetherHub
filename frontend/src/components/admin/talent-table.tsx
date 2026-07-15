'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface Talent {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
}

interface TalentTableProps {
  onEdit?: (talent: Talent) => void
  onDelete?: (talent: Talent) => void
  refreshKey?: number
}

const PAGE_SIZE = 20

export function TalentTable({ onEdit, onDelete, refreshKey }: TalentTableProps) {
  const [talents, setTalents] = useState<Talent[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    apiClient
      .listTalents(page * PAGE_SIZE, PAGE_SIZE)
      .then((res) => {
        setTalents(res.data || [])
        setTotal(res.total || 0)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [page, refreshKey])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (isLoading) {
    return <p className="text-gray-500">Loading...</p>
  }

  if (talents.length === 0) {
    return <p className="text-gray-500">No talents found</p>
  }

  return (
    <div>
      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="p-3 font-medium">Name</th>
            <th className="p-3 font-medium">Email</th>
            <th className="p-3 font-medium">Phone</th>
            <th className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {talents.map((talent) => (
            <tr key={talent.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{talent.name}</td>
              <td className="p-3">{talent.email}</td>
              <td className="p-3">{talent.phone || '-'}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => onEdit?.(talent)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete?.(talent)}
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
