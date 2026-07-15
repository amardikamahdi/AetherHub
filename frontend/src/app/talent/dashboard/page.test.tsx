import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TalentDashboardPage from './page'

// Mock TalentLayout to isolate page tests
vi.mock('@/components/talent/talent-layout', () => ({
  TalentLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('TalentDashboardPage', () => {
  it('renders dashboard heading', () => {
    render(<TalentDashboardPage />)
    expect(screen.getByRole('heading', { name: /my dashboard/i })).toBeInTheDocument()
  })

  it('displays assigned jobs section', () => {
    render(<TalentDashboardPage />)
    expect(screen.getByRole('heading', { name: /assigned jobs/i })).toBeInTheDocument()
  })

  it('displays pending tasks section', () => {
    render(<TalentDashboardPage />)
    expect(screen.getByRole('heading', { name: /pending tasks/i })).toBeInTheDocument()
  })

  it('shows empty state for assigned jobs', () => {
    render(<TalentDashboardPage />)
    expect(screen.getByText(/no assigned jobs/i)).toBeInTheDocument()
  })

  it('shows empty state for pending tasks', () => {
    render(<TalentDashboardPage />)
    expect(screen.getByText(/no pending tasks/i)).toBeInTheDocument()
  })
})
