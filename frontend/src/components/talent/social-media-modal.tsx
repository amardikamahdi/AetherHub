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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SocialMediaAccount {
  id: string
  talent_id: string
  platform: string
  username: string
  url?: string
}

interface SocialMediaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { platform: string; username: string; url: string }) => void
  account?: SocialMediaAccount
}

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook']

export function SocialMediaModal({ isOpen, onClose, onSubmit, account }: SocialMediaModalProps) {
  const [platform, setPlatform] = useState('instagram')
  const [username, setUsername] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (account) {
      setPlatform(account.platform)
      setUsername(account.username)
      setUrl(account.url || '')
    } else {
      setPlatform('instagram')
      setUsername('')
      setUrl('')
    }
  }, [account, isOpen])

  const isEditMode = !!account

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!platform || !username) return
    onSubmit({ platform, username, url })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Social Media' : 'Add Social Media'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update your social media account.' : 'Add a new social media account.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sm-platform">Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v ?? "instagram")} disabled={isEditMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sm-username">Username</Label>
            <Input
              id="sm-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="@yourusername"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sm-url">URL</Label>
            <Input
              id="sm-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
