'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, Trash2, ExternalLink } from 'lucide-react'

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
    if (!talentId) return
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
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return <p className="text-sm text-muted-foreground">No social media accounts found</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Platform</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>URL</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id}>
            <TableCell>
              <Badge variant="secondary">
                {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{account.username}</TableCell>
            <TableCell>
              {account.url ? (
                <a href={account.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  <ExternalLink className="size-3" />
                  Link
                </a>
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => onEdit?.(account)} aria-label="Edit">
                  <Edit />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => onDelete?.(account)} aria-label="Delete">
                  <Trash2 />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
