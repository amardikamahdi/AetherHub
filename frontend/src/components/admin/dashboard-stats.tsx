'use client'

interface DashboardSummary {
  total_jobs: number
  active_jobs: number
  completed_jobs: number
  total_assignments: number
  completed_steps: number
  total_steps: number
}

interface DashboardStatsProps {
  summary: DashboardSummary
}

interface StatCardProps {
  label: string
  value: number | string
  color?: string
}

function StatCard({ label, value, color = 'text-gray-900' }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export function DashboardStats({ summary }: DashboardStatsProps) {
  const completionPercent = summary.total_steps > 0
    ? Math.round((summary.completed_steps / summary.total_steps) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard label="Total Jobs" value={summary.total_jobs} />
      <StatCard label="Active Jobs" value={summary.active_jobs} color="text-green-600" />
      <StatCard label="Total Assignments" value={summary.total_assignments} />
      <StatCard label="Completion" value={`${completionPercent}%`} color="text-blue-600" />
    </div>
  )
}
