'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TalentLayout } from '@/components/talent/talent-layout'
import { ProgressSteps } from '@/components/talent/progress-steps'
import { apiClient } from '@/lib/api'

interface Job {
  id: string
  title: string
  brand_name: string
  status: string
  deadline?: string
  description?: string
}

interface Assignment {
  id: string
  job_id: string
  social_media_id: string
  talent_id: string
  platform: string
  username: string
}

interface StepState {
  step: string
  status: string
  completed_at?: string
  notes?: string
}

interface AssignmentProgress {
  assignment_id: string
  job_id: string
  talent_id: string
  steps: StepState[]
}

export default function TalentJobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, AssignmentProgress>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const loadData = async () => {
    try {
      // Load job details
      const jobRes = await apiClient.getJob(id)
      setJob(jobRes.data)

      // Load assignments for this job
      const assignRes = await apiClient.listAssignmentsByJob(id)
      const jobAssignments: Assignment[] = assignRes.data || []

      // Filter to only this talent's assignments
      const user = await apiClient.getMe()
      const talentAssignments = jobAssignments.filter((a) => a.talent_id === user.id)
      setAssignments(talentAssignments)

      // Load progress for each assignment
      const progressEntries: Record<string, AssignmentProgress> = {}
      for (const assignment of talentAssignments) {
        try {
          const progressRes = await apiClient.getProgress(assignment.id)
          progressEntries[assignment.id] = progressRes.data
        } catch {
          // Progress may not exist yet — that's OK
        }
      }
      setProgressMap(progressEntries)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (isLoading) {
    return (
      <TalentLayout>
        <p className="text-gray-500">Loading...</p>
      </TalentLayout>
    )
  }

  if (error) {
    return (
      <TalentLayout>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </TalentLayout>
    )
  }

  if (!job) return null

  return (
    <TalentLayout>
      <div>
        {/* Back link */}
        <Link href="/talent/jobs" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← Back to My Jobs
        </Link>

        {/* Job header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="text-gray-600 mt-1">{job.brand_name}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-700'}`}>
              {job.status}
            </span>
          </div>

          {job.description && (
            <p className="text-gray-700 mt-4">{job.description}</p>
          )}

          {job.deadline && (
            <p className="text-sm text-gray-500 mt-2">
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Assignments with progress */}
        {assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">No assignments found for this job.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const progress = progressMap[assignment.id]
              return (
                <div key={assignment.id} className="bg-white rounded-lg shadow p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                      {assignment.platform} — {assignment.username}
                    </h2>
                  </div>

                  {progress ? (
                    <ProgressSteps
                      assignmentId={assignment.id}
                      steps={progress.steps}
                      onStepComplete={loadData}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      Progress will be created when you start your first step.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </TalentLayout>
  )
}
