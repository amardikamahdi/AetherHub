'use client'

import { useState, useEffect } from 'react'

interface SocialMediaAccount {
  id: string
  talent_id: string
  platform: string
  username: string
  url?: string
}

interface SocialMediaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { platform: string; username: string; url: string }) => void
  account?: SocialMediaAccount
}

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook']

export function SocialMediaModal({ isOpen, onClose, onSubmit, account }: SocialMediaModalProps) {
  const [platform, setPlatform] = useState('instagram')
  const [username, setUsername] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (account) {
      setPlatform(account.platform)
      setUsername(account.username)
      setUrl(account.url || '')
    } else {
      setPlatform('instagram')
      setUsername('')
      setUrl('')
    }
  }, [account, isOpen])

  if (!isOpen) return null

  const isEditMode = !!account

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!platform || !username) return

    onSubmit({ platform, username, url })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit Social Media' : 'Add Social Media'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="sm-platform" className="block text-sm font-medium text-gray-700">
              Platform
            </label>
            <select
              id="sm-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              disabled={isEditMode}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sm-username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="sm-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="@yourusername"
            />
          </div>

          <div>
            <label htmlFor="sm-url" className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              id="sm-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
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
              {isEditMode ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
