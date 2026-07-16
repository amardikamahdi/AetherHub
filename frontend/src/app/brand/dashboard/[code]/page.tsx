'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { apiClient } from '@/lib/api'
import { Briefcase, CheckCircle2, Circle } from 'lucide-react'

interface StepState {
  step: string
  status: string
  completed_at?: string
}

interface AssignmentProgress {
  assignment_id: string
  job_id: string
  talent_id: string
  steps: StepState[]
}

interface JobWithProgress {
  id: string
  title: string
  brand_name: string
  status: string
  progress: AssignmentProgress[]
}

interface BrandData {
  brand_name: string
  code: string
  jobs: JobWithProgress[]
}

const STEP_LABELS: Record<string, string> = {
  absen: 'Absen',
  draft_storyline: 'Draft Storyline',
  input_link: 'Input Link',
  insight: 'Insight',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  completed: 'outline',
  cancelled: 'destructive',
}

export default function BrandDashboardPage() {
  const { code } = useParams<{ code: string }>()
  const [data, setData] = useState<BrandData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient
      .getBrandAccess(code)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || 'Access denied'))
      .finally(() => setIsLoading(false))
  }, [code])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <div className="flex flex-col gap-4 w-full max-w-4xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) return null

  const getProgressPercent = (progress: AssignmentProgress): number => {
    if (!progress.steps || progress.steps.length === 0) return 0
    const completed = progress.steps.filter((s) => s.status === 'completed').length
    return Math.round((completed / progress.steps.length) * 100)
  }

  return (
    <div className="min-h-svh bg-muted/50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Brand Dashboard</h1>
              <p className="text-muted-foreground">{data.brand_name}</p>
            </div>
          </div>
        </div>

        {data.jobs.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No assigned jobs</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {data.jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>{job.brand_name}</CardDescription>
                    </div>
                    <Badge variant={STATUS_VARIANT[job.status] || 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {job.progress.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No progress data yet</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {job.progress.map((prog) => (
                        <div key={prog.assignment_id}>
                          <Separator className="mb-4" />
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">
                              Talent: {prog.talent_id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getProgressPercent(prog)}% complete
                            </p>
                          </div>

                          <Progress value={getProgressPercent(prog)} className="mb-3" />

                          <div className="flex flex-wrap gap-4">
                            {prog.steps.map((step) => (
                              <div key={step.step} className="flex items-center gap-1.5">
                                {step.status === 'completed' ? (
                                  <CheckCircle2 className="size-4 text-green-500" />
                                ) : (
                                  <Circle className="size-4 text-muted-foreground/30" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {STEP_LABELS[step.step] || step.step}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
