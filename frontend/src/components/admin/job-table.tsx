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
import { Edit, UserPlus, Trash2 } from 'lucide-react'

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

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  completed: 'outline',
  cancelled: 'destructive',
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
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return <p className="text-sm text-muted-foreground">No jobs found</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>{job.brand_name}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[job.status] || 'secondary'}>
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell>{job.deadline ? new Date(job.deadline).toLocaleDateString() : '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => onEdit?.(job)} aria-label="Edit">
                    <Edit />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => onAssign?.(job)} aria-label="Assign">
                    <UserPlus />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => onDelete?.(job)} aria-label="Delete">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
