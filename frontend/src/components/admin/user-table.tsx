'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface UserTableProps {
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
}

const PAGE_SIZE = 20

export function UserTable({ onEdit, onDelete }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [roleFilter, setRoleFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    apiClient
      .listUsers(page * PAGE_SIZE, PAGE_SIZE, roleFilter || undefined)
      .then((res) => {
        setUsers(res.data || [])
        setTotal(res.total || 0)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [page, roleFilter])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (isLoading) {
    return <p className="text-gray-500">Loading...</p>
  }

  if (users.length === 0) {
    return <p className="text-gray-500">No users found</p>
  }

  return (
    <div>
      {/* Role filter */}
      <div className="mb-4">
        <label htmlFor="role-filter" className="mr-2 text-sm font-medium text-gray-700">
          Filter by role
        </label>
        <select
          id="role-filter"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(0)
          }}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="talent">Talent</option>
          <option value="superadmin">Superadmin</option>
        </select>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="p-3 font-medium">Name</th>
            <th className="p-3 font-medium">Email</th>
            <th className="p-3 font-medium">Role</th>
            <th className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.role}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => onEdit?.(user)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete?.(user)}
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
