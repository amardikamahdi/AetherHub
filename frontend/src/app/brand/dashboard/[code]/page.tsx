'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api'

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p>{error}</p>
        </div>
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Brand Dashboard</h1>
          <p className="text-gray-600">{data.brand_name}</p>
        </div>

        {data.jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">No assigned jobs</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">{job.title}</h2>
                    <p className="text-sm text-gray-500">{job.brand_name}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      job.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                {job.progress.length === 0 ? (
                  <p className="text-sm text-gray-500">No progress data yet</p>
                ) : (
                  <div className="space-y-4">
                    {job.progress.map((prog) => (
                      <div key={prog.assignment_id} className="border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">
                            Talent: {prog.talent_id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getProgressPercent(prog)}% complete
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${getProgressPercent(prog)}%` }}
                          />
                        </div>

                        {/* Step indicators */}
                        <div className="flex gap-4">
                          {prog.steps.map((step) => (
                            <div key={step.step} className="flex items-center gap-1">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                  step.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {step.status === 'completed' ? '✓' : '—'}
                              </span>
                              <span className="text-xs text-gray-600">
                                {STEP_LABELS[step.step] || step.step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
