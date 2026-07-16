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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Job {
  id: string
  title: string
  brand_name: string
  status: string
  deadline?: string
  description?: string
}

interface JobModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; brand_name: string; status: string; deadline: string }) => void
  job?: Job
}

export function JobModal({ isOpen, onClose, onSubmit, job }: JobModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [brandName, setBrandName] = useState('')
  const [status, setStatus] = useState('draft')
  const [deadline, setDeadline] = useState('')

  useEffect(() => {
    if (job) {
      setTitle(job.title)
      setDescription(job.description || '')
      setBrandName(job.brand_name)
      setStatus(job.status)
      setDeadline(job.deadline ? job.deadline.split('T')[0] : '')
    } else {
      setTitle('')
      setDescription('')
      setBrandName('')
      setStatus('draft')
      setDeadline('')
    }
  }, [job, isOpen])

  const isEditMode = !!job

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !brandName) return
    onSubmit({ title, description, brand_name: brandName, status, deadline })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Job' : 'Create Job'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the job details below.' : 'Fill in the details to create a new job.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="job-title">Title</Label>
            <Input
              id="job-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="job-brand">Brand Name</Label>
            <Input
              id="job-brand"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="job-description">Description</Label>
            <Textarea
              id="job-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional"
            />
          </div>

          {isEditMode && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="job-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v ?? "draft")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="job-deadline">Deadline</Label>
            <Input
              id="job-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
