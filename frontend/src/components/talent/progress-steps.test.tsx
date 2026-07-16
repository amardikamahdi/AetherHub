import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProgressSteps } from './progress-steps'

vi.mock('@/lib/api', () => ({
  apiClient: {
    updateProgressStep: vi.fn(),
  },
}))

describe('ProgressSteps', () => {
  const mockSteps = [
    { step: 'absen', status: 'completed', completed_at: '2025-01-01' },
    { step: 'draft_storyline', status: 'completed', completed_at: '2025-01-02' },
    { step: 'input_link', status: 'pending' },
    { step: 'insight', status: 'pending' },
  ]

  it('renders step labels', () => {
    render(<ProgressSteps assignmentId="a1" steps={mockSteps} />)

    expect(screen.getByText('Absen')).toBeInTheDocument()
    expect(screen.getByText('Draft Storyline')).toBeInTheDocument()
    expect(screen.getByText('Input Link')).toBeInTheDocument()
    expect(screen.getByText('Insight')).toBeInTheDocument()
  })

  it('shows progress bar', () => {
    render(<ProgressSteps assignmentId="a1" steps={mockSteps} />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows complete button for next pending step', () => {
    render(<ProgressSteps assignmentId="a1" steps={mockSteps} />)

    expect(screen.getByRole('button', { name: /complete: input link/i })).toBeInTheDocument()
  })

  it('shows all complete message when all steps done', () => {
    const allComplete = mockSteps.map((s) => ({ ...s, status: 'completed' }))
    render(<ProgressSteps assignmentId="a1" steps={allComplete} />)

    expect(screen.getByText(/all steps completed/i)).toBeInTheDocument()
  })
})
