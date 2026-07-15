import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProgressTable } from './progress-table'

// Mock apiClient
const mockListAssignmentsByJob = vi.fn()
const mockGetProgress = vi.fn()
vi.mock('@/lib/api', () => ({
  apiClient: {
    listAssignmentsByJob: (...args: any[]) => mockListAssignmentsByJob(...args),
    getProgress: (...args: any[]) => mockGetProgress(...args),
  },
}))

describe('ProgressTable', () => {
  const mockAssignments = [
    { id: 'assign-1', job_id: 'job-1', talent_id: 'talent-1', social_media_id: 'sm-1', platform: 'instagram', username: '@alice' },
    { id: 'assign-2', job_id: 'job-1', talent_id: 'talent-2', social_media_id: 'sm-2', platform: 'tiktok', username: '@bob' },
  ]

  const mockProgress = {
    assignment_id: 'assign-1',
    job_id: 'job-1',
    talent_id: 'talent-1',
    steps: [
      { step: 'absen', status: 'completed' },
      { step: 'draft_storyline', status: 'completed' },
      { step: 'input_link', status: 'pending' },
      { step: 'insight', status: 'pending' },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockListAssignmentsByJob.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })
    mockGetProgress.mockResolvedValue({
      success: true,
      data: mockProgress,
    })
  })

  it('renders table headers', async () => {
    render(<ProgressTable jobId="job-1" />)

    await waitFor(() => {
      expect(screen.getByText('Platform')).toBeInTheDocument()
      expect(screen.getByText('Username')).toBeInTheDocument()
      expect(screen.getByText('Absen')).toBeInTheDocument()
      expect(screen.getByText('Draft')).toBeInTheDocument()
      expect(screen.getByText('Link')).toBeInTheDocument()
      expect(screen.getByText('Insight')).toBeInTheDocument()
    })
  })

  it('renders assignment data', async () => {
    render(<ProgressTable jobId="job-1" />)

    await waitFor(() => {
      expect(screen.getByText('instagram')).toBeInTheDocument()
      expect(screen.getByText('@alice')).toBeInTheDocument()
      expect(screen.getByText('tiktok')).toBeInTheDocument()
      expect(screen.getByText('@bob')).toBeInTheDocument()
    })
  })

  it('shows checkmarks for completed steps', async () => {
    render(<ProgressTable jobId="job-1" />)

    await waitFor(() => {
      const checkmarks = screen.getAllByText('✓')
      expect(checkmarks.length).toBeGreaterThanOrEqual(2) // absen and draft_storyline completed
    })
  })

  it('shows dashes for pending steps', async () => {
    render(<ProgressTable jobId="job-1" />)

    await waitFor(() => {
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBeGreaterThanOrEqual(2) // input_link and insight pending
    })
  })

  it('shows empty state when no assignments', async () => {
    mockListAssignmentsByJob.mockResolvedValue({ success: true, data: [] })
    render(<ProgressTable jobId="job-1" />)

    await waitFor(() => {
      expect(screen.getByText(/no assignments/i)).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    mockListAssignmentsByJob.mockReturnValue(new Promise(() => {}))
    render(<ProgressTable jobId="job-1" />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('handles missing progress gracefully', async () => {
    mockGetProgress.mockRejectedValue(new Error('Not found'))
    render(<ProgressTable jobId="job-1" />)

    await waitFor(() => {
      // Should still show assignments with pending status
      expect(screen.getByText('instagram')).toBeInTheDocument()
    })
  })
})
