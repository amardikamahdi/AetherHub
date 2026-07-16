'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TalentLayout } from '@/components/talent/talent-layout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { apiClient } from '@/lib/api'
import { ArrowRight } from 'lucide-react'

interface Job {
  id: string
  title: string
  brand_name: string
  status: string
  deadline?: string
}

interface Assignment {
  id: string
  job_id: string
  social_media_id: string
  platform: string
  username: string
}

interface SocialMediaAccount {
  id: string
  talent_id: string
  platform: string
  username: string
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  completed: 'outline',
  cancelled: 'destructive',
}

export default function TalentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await apiClient.getMe()
        const smRes = await apiClient.listSocialMedia(user.id)
        const socialMedia: SocialMediaAccount[] = smRes.data || []

        if (socialMedia.length === 0) {
          setIsLoading(false)
          return
        }

        const allAssignments: Assignment[] = []
        const jobIds = new Set<string>()
        const jobsRes = await apiClient.listJobs(0, 100)
        const allJobs: Job[] = jobsRes.data || []

        for (const job of allJobs) {
          try {
            const assignRes = await apiClient.listAssignmentsByJob(job.id)
            const jobAssignments: Assignment[] = assignRes.data || []

            for (const assignment of jobAssignments) {
              if (socialMedia.some((sm) => sm.id === assignment.social_media_id)) {
                allAssignments.push(assignment)
                jobIds.add(job.id)
              }
            }
          } catch {
            // Skip jobs that fail to load assignments
          }
        }

        setAssignments(allAssignments)
        setJobs(allJobs.filter((j) => jobIds.has(j.id)))
      } catch {
        // Silently handle errors
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const getAssignmentForJob = (jobId: string) => {
    return assignments.filter((a) => a.job_id === jobId)
  }

  return (
    <TalentLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">My Jobs</h1>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No jobs assigned to your accounts yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => {
              const jobAssignments = getAssignmentForJob(job.id)
              return (
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
                    {job.deadline && (
                      <p className="text-sm text-muted-foreground mb-4">
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </p>
                    )}
                    <Separator className="mb-4" />
                    <h3 className="text-sm font-medium mb-2">Your Assigned Accounts</h3>
                    <ul className="flex flex-col gap-1">
                      {jobAssignments.map((a) => (
                        <li key={a.id} className="text-sm text-muted-foreground">
                          <span className="font-medium">{a.platform}</span> — {a.username}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button render={<Link href={`/talent/jobs/${job.id}`} />}>
                      
                        View Progress
                        <ArrowRight />
                      
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </TalentLayout>
  )
}
