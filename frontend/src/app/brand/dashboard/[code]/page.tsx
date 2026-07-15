'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api'

interface Job {
  id: string
  title: string
  status: string
}

interface BrandData {
  brand_name: string
  jobs: Job[]
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Brand Dashboard</h1>
          <p className="text-gray-600">{data.brand_name}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Assigned Jobs</h2>

          {data.jobs.length === 0 ? (
            <p className="text-gray-500 text-sm">No assigned jobs</p>
          ) : (
            <div className="space-y-4">
              {data.jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{job.title}</p>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
