'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, CheckCircle2, Users, TrendingUp } from 'lucide-react'

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

export function DashboardStats({ summary }: DashboardStatsProps) {
  const completionPercent = summary.total_steps > 0
    ? Math.round((summary.completed_steps / summary.total_steps) * 100)
    : 0

  const stats = [
    { label: 'Total Jobs', value: summary.total_jobs, icon: Briefcase },
    { label: 'Active Jobs', value: summary.active_jobs, icon: CheckCircle2 },
    { label: 'Total Assignments', value: summary.total_assignments, icon: Users },
    { label: 'Completion', value: `${completionPercent}%`, icon: TrendingUp },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
