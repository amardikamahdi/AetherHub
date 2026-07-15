'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; email: string; password: string; role: string }) => void
  user?: User
}

export function UserModal({ isOpen, onClose, onSubmit, user }: UserModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('talent')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setRole(user.role)
      setPassword('')
    } else {
      setName('')
      setEmail('')
      setPassword('')
      setRole('talent')
    }
  }, [user, isOpen])

  if (!isOpen) return null

  const isEditMode = !!user

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !role) return
    if (!isEditMode && !password) return

    onSubmit({ name, email, password, role })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit User' : 'Create User'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user-name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="user-email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="user-password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEditMode}
              minLength={isEditMode ? undefined : 6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={isEditMode ? 'Leave blank to keep current' : ''}
            />
          </div>

          <div>
            <label htmlFor="user-role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="admin">Admin</option>
              <option value="talent">Talent</option>
              <option value="superadmin">Superadmin</option>
            </select>
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
