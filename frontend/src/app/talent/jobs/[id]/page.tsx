'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TalentLayout } from '@/components/talent/talent-layout'
import { ProgressSteps } from '@/components/talent/progress-steps'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'

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

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  completed: 'outline',
  cancelled: 'destructive',
}

export default function TalentJobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, AssignmentProgress>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      const jobRes = await apiClient.getJob(id)
      setJob(jobRes.data)

      const assignRes = await apiClient.listAssignmentsByJob(id)
      const jobAssignments: Assignment[] = assignRes.data || []

      const user = await apiClient.getMe()
      const talentAssignments = jobAssignments.filter((a) => a.talent_id === user.id)
      setAssignments(talentAssignments)

      const progressEntries: Record<string, AssignmentProgress> = {}
      for (const assignment of talentAssignments) {
        try {
          const progressRes = await apiClient.getProgress(assignment.id)
          progressEntries[assignment.id] = progressRes.data
        } catch {
          // Progress may not exist yet
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
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </TalentLayout>
    )
  }

  if (error) {
    return (
      <TalentLayout>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </TalentLayout>
    )
  }

  if (!job) return null

  return (
    <TalentLayout>
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" className="w-fit">
          
            <ArrowLeft />
            Back to My Jobs
          
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription>{job.brand_name}</CardDescription>
              </div>
              <Badge variant={STATUS_VARIANT[job.status] || 'secondary'}>
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {job.description && (
              <p className="text-muted-foreground mb-2">{job.description}</p>
            )}
            {job.deadline && (
              <p className="text-sm text-muted-foreground">
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No assignments found for this job.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {assignments.map((assignment) => {
              const progress = progressMap[assignment.id]
              return (
                <Card key={assignment.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {assignment.platform} — {assignment.username}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {progress ? (
                      <ProgressSteps
                        assignmentId={assignment.id}
                        steps={progress.steps}
                        onStepComplete={loadData}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Progress will be created when you start your first step.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </TalentLayout>
  )
}
