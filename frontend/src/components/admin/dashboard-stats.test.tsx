import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DashboardStats } from './dashboard-stats'

describe('DashboardStats', () => {
  const mockSummary = {
    total_jobs: 10,
    active_jobs: 5,
    completed_jobs: 3,
    total_assignments: 20,
    completed_steps: 40,
    total_steps: 80,
  }

  it('renders all stat cards', () => {
    render(<DashboardStats summary={mockSummary} />)

    expect(screen.getByText('Total Jobs')).toBeInTheDocument()
    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    expect(screen.getByText('Total Assignments')).toBeInTheDocument()
    expect(screen.getByText('Completion')).toBeInTheDocument()
  })

  it('displays correct stat values', () => {
    render(<DashboardStats summary={mockSummary} />)

    expect(screen.getByText('10')).toBeInTheDocument() // total_jobs
    expect(screen.getByText('5')).toBeInTheDocument() // active_jobs
    expect(screen.getByText('20')).toBeInTheDocument() // total_assignments
    expect(screen.getByText('50%')).toBeInTheDocument() // completion (40/80 = 50%)
  })

  it('handles zero values', () => {
    const zeroSummary = {
      total_jobs: 0,
      active_jobs: 0,
      completed_jobs: 0,
      total_assignments: 0,
      completed_steps: 0,
      total_steps: 0,
    }

    render(<DashboardStats summary={zeroSummary} />)

    // Should show 0% completion when total_steps is 0
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('calculates completion percentage correctly', () => {
    const partialSummary = {
      total_jobs: 5,
      active_jobs: 3,
      completed_jobs: 2,
      total_assignments: 10,
      completed_steps: 30,
      total_steps: 40,
    }

    render(<DashboardStats summary={partialSummary} />)

    // 30/40 = 75%
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})
