import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProgressSteps } from './progress-steps'

// Mock apiClient
const mockUpdateProgressStep = vi.fn()
vi.mock('@/lib/api', () => ({
  apiClient: {
    updateProgressStep: (...args: any[]) => mockUpdateProgressStep(...args),
  },
}))

describe('ProgressSteps', () => {
  const mockSteps = [
    { step: 'absen', status: 'completed', completed_at: '2026-01-01T00:00:00Z' },
    { step: 'draft_storyline', status: 'pending' },
    { step: 'input_link', status: 'pending' },
    { step: 'insight', status: 'pending' },
  ]

  const allPendingSteps = [
    { step: 'absen', status: 'pending' },
    { step: 'draft_storyline', status: 'pending' },
    { step: 'input_link', status: 'pending' },
    { step: 'insight', status: 'pending' },
  ]

  const allCompletedSteps = [
    { step: 'absen', status: 'completed', completed_at: '2026-01-01T00:00:00Z' },
    { step: 'draft_storyline', status: 'completed', completed_at: '2026-01-02T00:00:00Z' },
    { step: 'input_link', status: 'completed', completed_at: '2026-01-03T00:00:00Z' },
    { step: 'insight', status: 'completed', completed_at: '2026-01-04T00:00:00Z' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateProgressStep.mockResolvedValue({ success: true, data: {} })
  })

  it('renders all step labels', () => {
    render(<ProgressSteps assignmentId="assign-1" steps={mockSteps} />)

    expect(screen.getByText('Absen')).toBeInTheDocument()
    expect(screen.getByText('Draft Storyline')).toBeInTheDocument()
    expect(screen.getByText('Input Link')).toBeInTheDocument()
    expect(screen.getByText('Insight')).toBeInTheDocument()
  })

  it('shows completed checkmarks for completed steps', () => {
    render(<ProgressSteps assignmentId="assign-1" steps={mockSteps} />)

    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks.length).toBeGreaterThanOrEqual(1)
  })

  it('shows complete button for next pending step', () => {
    render(<ProgressSteps assignmentId="assign-1" steps={mockSteps} />)

    expect(screen.getByText('Complete: Draft Storyline')).toBeInTheDocument()
  })

  it('shows all steps completed message when all done', () => {
    render(<ProgressSteps assignmentId="assign-1" steps={allCompletedSteps} />)

    expect(screen.getByText(/all steps completed/i)).toBeInTheDocument()
  })

  it('does not show complete button when all steps done', () => {
    render(<ProgressSteps assignmentId="assign-1" steps={allCompletedSteps} />)

    expect(screen.queryByText(/complete:/i)).not.toBeInTheDocument()
  })

  it('calls updateProgressStep when complete button clicked', async () => {
    const onStepComplete = vi.fn()
    render(
      <ProgressSteps
        assignmentId="assign-1"
        steps={allPendingSteps}
        onStepComplete={onStepComplete}
      />
    )

    const completeButton = screen.getByText('Complete: Absen')
    await userEvent.click(completeButton)

    await waitFor(() => {
      expect(mockUpdateProgressStep).toHaveBeenCalledWith('assign-1', 'absen')
    })
  })

  it('calls onStepComplete after successful update', async () => {
    const onStepComplete = vi.fn()
    render(
      <ProgressSteps
        assignmentId="assign-1"
        steps={allPendingSteps}
        onStepComplete={onStepComplete}
      />
    )

    const completeButton = screen.getByText('Complete: Absen')
    await userEvent.click(completeButton)

    await waitFor(() => {
      expect(onStepComplete).toHaveBeenCalled()
    })
  })

  it('shows error message on failed update', async () => {
    mockUpdateProgressStep.mockRejectedValue(new Error('Update failed'))
    render(<ProgressSteps assignmentId="assign-1" steps={allPendingSteps} />)

    const completeButton = screen.getByText('Complete: Absen')
    await userEvent.click(completeButton)

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument()
    })
  })

  it('shows progress percentage in progress bar', () => {
    render(<ProgressSteps assignmentId="assign-1" steps={mockSteps} />)

    // 1 of 4 completed = 25%
    const progressBar = document.querySelector('[style*="width: 25%"]')
    expect(progressBar).toBeInTheDocument()
  })
})
