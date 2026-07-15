'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

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
        // Load assignments
        const assignRes = await apiClient.listAssignmentsByJob(jobId)
        const jobAssignments: Assignment[] = assignRes.data || []
        setAssignments(jobAssignments)

        // Load progress for each assignment
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
    return <p className="text-gray-500 text-sm">Loading progress...</p>
  }

  if (assignments.length === 0) {
    return <p className="text-gray-500 text-sm">No assignments for this job.</p>
  }

  const getStepStatus = (assignmentId: string, step: string): string => {
    const progress = progressMap[assignmentId]
    if (!progress) return 'pending'
    const stepState = progress.steps.find((s) => s.step === step)
    return stepState?.status || 'pending'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-sm">
            <th className="p-3 font-medium">Platform</th>
            <th className="p-3 font-medium">Username</th>
            {STEP_COLUMNS.map((step) => (
              <th key={step} className="p-3 font-medium text-center">
                {STEP_LABELS[step]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="border-b hover:bg-gray-50">
              <td className="p-3 text-sm">{assignment.platform}</td>
              <td className="p-3 text-sm">{assignment.username}</td>
              {STEP_COLUMNS.map((step) => {
                const status = getStepStatus(assignment.id, step)
                return (
                  <td key={step} className="p-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {status === 'completed' ? '✓' : '—'}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
