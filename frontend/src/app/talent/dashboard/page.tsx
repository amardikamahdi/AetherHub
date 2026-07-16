'use client'

import { TalentLayout } from '@/components/talent/talent-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, ListChecks, Icon } from 'lucide-react'

export default function TalentDashboardPage() {
  return (
    <TalentLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">My Dashboard</h1>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assigned Jobs
              </CardTitle>
              <Briefcase className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No assigned jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Tasks
              </CardTitle>
              <ListChecks className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No pending tasks</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TalentLayout>
  )
}
