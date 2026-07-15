'use client'

import { useState, useEffect } from 'react'

interface Talent {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
}

interface TalentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; email: string; phone: string }) => void
  talent?: Talent
}

export function TalentModal({ isOpen, onClose, onSubmit, talent }: TalentModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (talent) {
      setName(talent.name)
      setEmail(talent.email)
      setPhone(talent.phone || '')
    } else {
      setName('')
      setEmail('')
      setPhone('')
    }
  }, [talent, isOpen])

  if (!isOpen) return null

  const isEditMode = !!talent

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email) return

    onSubmit({ name, email, phone })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit Talent' : 'Create Talent'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="talent-name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="talent-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="talent-email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="talent-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="talent-phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="talent-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Optional"
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
