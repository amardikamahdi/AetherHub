'use client'

import { useEffect, useState } from 'react'
import { TalentLayout } from '@/components/talent/talent-layout'
import { apiClient } from '@/lib/api'

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

export default function TalentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user to find their talent profile
        const user = await apiClient.getMe()

        // Get talent's social media accounts
        const smRes = await apiClient.listSocialMedia(user.id)
        const socialMedia: SocialMediaAccount[] = smRes.data || []

        if (socialMedia.length === 0) {
          setIsLoading(false)
          return
        }

        // For each social media, get assignments
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
      } catch (error) {
        console.error('Failed to load jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const getAssignmentForJob = (jobId: string) => {
    return assignments.filter((a) => a.job_id === jobId)
  }

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <TalentLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">My Jobs</h1>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">No jobs assigned to your accounts yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const jobAssignments = getAssignmentForJob(job.id)
              return (
                <div key={job.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{job.title}</h2>
                      <p className="text-sm text-gray-600">{job.brand_name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-700'}`}>
                      {job.status}
                    </span>
                  </div>

                  {job.deadline && (
                    <p className="text-sm text-gray-500 mt-2">
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Your Assigned Accounts</h3>
                    <ul className="space-y-1">
                      {jobAssignments.map((a) => (
                        <li key={a.id} className="text-sm text-gray-600">
                          <span className="font-medium">{a.platform}</span> — {a.username}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </TalentLayout>
  )
}
