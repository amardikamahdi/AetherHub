'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface SocialMediaAccount {
  id: string
  talent_id: string
  platform: string
  username: string
  url?: string
}

interface SocialMediaTableProps {
  talentId: string
  onEdit?: (account: SocialMediaAccount) => void
  onDelete?: (account: SocialMediaAccount) => void
  refreshKey?: number
}

export function SocialMediaTable({ talentId, onEdit, onDelete, refreshKey }: SocialMediaTableProps) {
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    apiClient
      .listSocialMedia(talentId)
      .then((res) => {
        setAccounts(res.data || [])
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [talentId, refreshKey])

  if (isLoading) {
    return <p className="text-gray-500">Loading...</p>
  }

  if (accounts.length === 0) {
    return <p className="text-gray-500">No social media accounts found</p>
  }

  const capitalizePlatform = (platform: string) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1)
  }

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left text-sm">
            <th className="p-3 font-medium">Platform</th>
            <th className="p-3 font-medium">Username</th>
            <th className="p-3 font-medium">URL</th>
            <th className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{capitalizePlatform(account.platform)}</td>
              <td className="p-3">{account.username}</td>
              <td className="p-3">
                {account.url ? (
                  <a href={account.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {account.url}
                  </a>
                ) : (
                  '-'
                )}
              </td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => onEdit?.(account)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete?.(account)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
