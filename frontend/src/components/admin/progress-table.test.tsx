import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProgressTable } from './progress-table'

const mockListAssignments = vi.fn()
const mockGetProgress = vi.fn()

vi.mock('@/lib/api', () => ({
  apiClient: {
    listAssignmentsByJob: (...args: any[]) => mockListAssignments(...args),
    getProgress: (...args: any[]) => mockGetProgress(...args),
  },
}))

describe('ProgressTable', () => {
  const mockAssignments = [
    { id: 'a1', job_id: 'j1', talent_id: 't1', social_media_id: 'sm1', platform: 'instagram', username: '@alice' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockListAssignments.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })
  })

  it('shows skeleton loading state', () => {
    mockListAssignments.mockReturnValue(new Promise(() => {}))
    const { container } = render(<ProgressTable jobId="j1" />)

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })

  it('shows empty state when no assignments', async () => {
    mockListAssignments.mockResolvedValue({ success: true, data: [] })
    render(<ProgressTable jobId="j1" />)

    expect(await screen.findByText(/no assignments/i)).toBeInTheDocument()
  })

  it('renders assignment data', async () => {
    mockGetProgress.mockResolvedValue({
      data: { assignment_id: 'a1', steps: [] },
    })

    render(<ProgressTable jobId="j1" />)

    await waitFor(() => {
      expect(screen.getByText('instagram')).toBeInTheDocument()
      expect(screen.getByText('@alice')).toBeInTheDocument()
    })
  })

  it('shows step column headers', async () => {
    mockGetProgress.mockResolvedValue({
      data: { assignment_id: 'a1', steps: [] },
    })

    render(<ProgressTable jobId="j1" />)

    await waitFor(() => {
      expect(screen.getByText('Absen')).toBeInTheDocument()
      expect(screen.getByText('Draft')).toBeInTheDocument()
      expect(screen.getByText('Link')).toBeInTheDocument()
      expect(screen.getByText('Insight')).toBeInTheDocument()
    })
  })
})
