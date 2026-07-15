'use client'

import { TalentLayout } from '@/components/talent/talent-layout'

export default function TalentDashboardPage() {
  return (
    <TalentLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assigned Jobs */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Assigned Jobs</h2>
            <p className="text-gray-500 text-sm">No assigned jobs</p>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
            <p className="text-gray-500 text-sm">No pending tasks</p>
          </div>
        </div>
      </div>
    </TalentLayout>
  )
}
