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

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; email: string; password: string; role: string }) => void
  user?: User
}

export function UserModal({ isOpen, onClose, onSubmit, user }: UserModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('talent')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setRole(user.role)
      setPassword('')
    } else {
      setName('')
      setEmail('')
      setPassword('')
      setRole('talent')
    }
  }, [user, isOpen])

  const isEditMode = !!user

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !role) return
    if (!isEditMode && !password) return
    onSubmit({ name, email, password, role })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the user details below.' : 'Fill in the details to create a new user.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEditMode}
              minLength={isEditMode ? undefined : 6}
              placeholder={isEditMode ? 'Leave blank to keep current' : ''}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="user-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v ?? "talent")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="talent">Talent</SelectItem>
                <SelectItem value="superadmin">Superadmin</SelectItem>
              </SelectContent>
            </Select>
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
