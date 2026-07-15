'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

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

  if (!isOpen) return null

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
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to assign')
    }
  }

  const handleUnassign = async (assignmentId: string) => {
    try {
      await apiClient.unassignFromJob(assignmentId)
      onAssignmentChange()

      // Refresh assignments
      const res = await apiClient.listAssignmentsByJob(jobId)
      setAssignments(res.data || [])
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to unassign')
    }
  }

  const getTalentName = (talentId: string) => {
    const talent = talents.find((t) => t.id === talentId)
    return talent?.name || talentId
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Manage Assignments</h2>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            {/* Current assignments */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned Accounts</h3>
              {assignments.length === 0 ? (
                <p className="text-sm text-gray-500">No accounts assigned yet</p>
              ) : (
                <ul className="space-y-2">
                  {assignments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <div>
                        <span className="text-sm font-medium">{a.platform}</span>
                        <span className="text-sm text-gray-500 ml-2">{a.username}</span>
                        <span className="text-xs text-gray-400 ml-2">({getTalentName(a.talent_id)})</span>
                      </div>
                      <button
                        onClick={() => handleUnassign(a.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add new assignment */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Add Assignment</h3>
              {availableAccounts.length === 0 ? (
                <p className="text-sm text-gray-500">No more accounts available to assign</p>
              ) : (
                <div className="flex space-x-2">
                  <select
                    value={selectedSmId}
                    onChange={(e) => setSelectedSmId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select account...</option>
                    {availableAccounts.map((sm) => (
                      <option key={sm.id} value={sm.id}>
                        {sm.platform} - {sm.username} ({getTalentName(sm.talent_id)})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedSmId}
                    className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end pt-4 mt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
