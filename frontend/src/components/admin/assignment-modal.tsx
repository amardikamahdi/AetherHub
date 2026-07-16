'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface Assignment {
  id: string
  job_id: string
  social_media_id: string
  talent_id: string
  platform: string
  username: string
}

interface SocialMediaAccount {
  id: string
  talent_id: string
  platform: string
  username: string
}

interface Talent {
  id: string
  user_id: string
  name: string
}

interface AssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  onAssignmentChange: () => void
}

export function AssignmentModal({ isOpen, onClose, jobId, onAssignmentChange }: AssignmentModalProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [talents, setTalents] = useState<Talent[]>([])
  const [socialMediaAccounts, setSocialMediaAccounts] = useState<SocialMediaAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSmId, setSelectedSmId] = useState('')

  useEffect(() => {
    if (!isOpen || !jobId) return

    setIsLoading(true)
    Promise.all([
      apiClient.listAssignmentsByJob(jobId),
      apiClient.listTalents(0, 100),
    ])
      .then(([assignRes, talentsRes]) => {
        setAssignments(assignRes.data || [])
        setTalents(talentsRes.data || [])

        // Fetch social media for each talent
        const smPromises = (talentsRes.data || []).map((t: Talent) =>
          apiClient.listSocialMedia(t.id).then((res) => res.data || [])
        )
        return Promise.all(smPromises)
      })
      .then((smArrays) => {
        setSocialMediaAccounts(smArrays.flat())
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [isOpen, jobId])

  const assignedSmIds = new Set(assignments.map((a) => a.social_media_id))
  const availableAccounts = socialMediaAccounts.filter((sm) => !assignedSmIds.has(sm.id))

  const handleAssign = async () => {
    if (!selectedSmId) return

    try {
      await apiClient.assignToJob(jobId, selectedSmId)
      setSelectedSmId('')
      onAssignmentChange()

      // Refresh assignments
      const res = await apiClient.listAssignmentsByJob(jobId)
      setAssignments(res.data || [])
      toast.success('Account assigned')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign')
    }
  }

  const handleUnassign = async (assignmentId: string) => {
    try {
      await apiClient.unassignFromJob(assignmentId)
      onAssignmentChange()

      // Refresh assignments
      const res = await apiClient.listAssignmentsByJob(jobId)
      setAssignments(res.data || [])
      toast.success('Account unassigned')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to unassign')
    }
  }

  const getTalentName = (talentId: string) => {
    const talent = talents.find((t) => t.id === talentId)
    return talent?.name || talentId
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Assignments</DialogTitle>
          <DialogDescription>
            Assign social media accounts to this job.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            {/* Current assignments */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">Assigned Accounts</h3>
              {assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No accounts assigned yet</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {assignments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{a.platform}</Badge>
                        <span className="text-sm">{a.username}</span>
                        <span className="text-xs text-muted-foreground">({getTalentName(a.talent_id)})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleUnassign(a.id)}
                        aria-label="Remove"
                      >
                        <X />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Separator />

            {/* Add new assignment */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">Add Assignment</h3>
              {availableAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No more accounts available to assign</p>
              ) : (
                <div className="flex gap-2">
                  <Select value={selectedSmId} onValueChange={(v) => setSelectedSmId(v ?? "")}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select account..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAccounts.map((sm) => (
                        <SelectItem key={sm.id} value={sm.id}>
                          {sm.platform} - {sm.username} ({getTalentName(sm.talent_id)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAssign} disabled={!selectedSmId}>
                    Add
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
