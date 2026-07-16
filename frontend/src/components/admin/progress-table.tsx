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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, Circle } from 'lucide-react'

interface StepState {
  step: string
  status: string
}

interface AssignmentProgress {
  assignment_id: string
  job_id: string
  talent_id: string
  steps: StepState[]
}

interface Assignment {
  id: string
  job_id: string
  talent_id: string
  social_media_id: string
  platform: string
  username: string
}

interface ProgressTableProps {
  jobId: string
  refreshKey?: number
}

const STEP_COLUMNS = ['absen', 'draft_storyline', 'input_link', 'insight']

const STEP_LABELS: Record<string, string> = {
  absen: 'Absen',
  draft_storyline: 'Draft',
  input_link: 'Link',
  insight: 'Insight',
}

export function ProgressTable({ jobId, refreshKey }: ProgressTableProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, AssignmentProgress>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const assignRes = await apiClient.listAssignmentsByJob(jobId)
        const jobAssignments: Assignment[] = assignRes.data || []
        setAssignments(jobAssignments)

        const progressEntries: Record<string, AssignmentProgress> = {}
        for (const assignment of jobAssignments) {
          try {
            const progressRes = await apiClient.getProgress(assignment.id)
            progressEntries[assignment.id] = progressRes.data
          } catch {
            // Progress may not exist yet
          }
        }
        setProgressMap(progressEntries)
      } catch {
        // Silently handle errors
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [jobId, refreshKey])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (assignments.length === 0) {
    return <p className="text-sm text-muted-foreground">No assignments for this job.</p>
  }

  const getStepStatus = (assignmentId: string, step: string): string => {
    const progress = progressMap[assignmentId]
    if (!progress) return 'pending'
    const stepState = progress.steps.find((s) => s.step === step)
    return stepState?.status || 'pending'
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Platform</TableHead>
          <TableHead>Username</TableHead>
          {STEP_COLUMNS.map((step) => (
            <TableHead key={step} className="text-center">
              {STEP_LABELS[step]}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell>
              <Badge variant="secondary">{assignment.platform}</Badge>
            </TableCell>
            <TableCell className="font-medium">{assignment.username}</TableCell>
            {STEP_COLUMNS.map((step) => {
              const status = getStepStatus(assignment.id, step)
              return (
                <TableCell key={step} className="text-center">
                  {status === 'completed' ? (
                    <CheckCircle2 className="mx-auto size-5 text-green-500" />
                  ) : (
                    <Circle className="mx-auto size-5 text-muted-foreground/30" />
                  )}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
