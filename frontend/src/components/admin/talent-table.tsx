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
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, Trash2 } from 'lucide-react'

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
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (talents.length === 0) {
    return <p className="text-sm text-muted-foreground">No talents found</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {talents.map((talent) => (
            <TableRow key={talent.id}>
              <TableCell className="font-medium">{talent.name}</TableCell>
              <TableCell>{talent.email}</TableCell>
              <TableCell>{talent.phone || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => onEdit?.(talent)} aria-label="Edit">
                    <Edit />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => onDelete?.(talent)} aria-label="Delete">
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
