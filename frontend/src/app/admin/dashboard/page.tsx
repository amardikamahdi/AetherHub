'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { AdminLayout } from '@/components/admin/admin-layout'
import { DashboardStats } from '@/components/admin/dashboard-stats'
import { ProgressTable } from '@/components/admin/progress-table'

interface DashboardSummary {
  total_jobs: number
  active_jobs: number
  completed_jobs: number
  total_assignments: number
  completed_steps: number
  total_steps: number
}

interface Job {
  id: string
  title: string
  brand_name: string
  status: string
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load dashboard summary
        const dashboardRes = await apiClient.getDashboard()
        setSummary(dashboardRes.data)

        // Load jobs for progress tables
        const jobsRes = await apiClient.listJobs(0, 100)
        setJobs(jobsRes.data || [])
      } catch {
        // Silently handle errors
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link
            href="/admin/jobs"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Manage Jobs
          </Link>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            {/* Stats cards */}
            {summary && <DashboardStats summary={summary} />}

            {/* Job progress tables */}
            {jobs.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Job Progress</h2>
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg shadow p-6">
                    <div className="mb-4">
                      <h3 className="font-medium">{job.title}</h3>
                      <p className="text-sm text-gray-500">{job.brand_name}</p>
                    </div>
                    <ProgressTable jobId={job.id} />
                  </div>
                ))}
              </div>
            )}

            {jobs.length === 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">No jobs yet. Create one to get started.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
