import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TalentDashboardPage from './page'

// Mock talent layout
vi.mock('@/components/talent/talent-layout', () => ({
  TalentLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('TalentDashboardPage', () => {
  it('renders the dashboard heading', () => {
    render(<TalentDashboardPage />)
    expect(screen.getByText('My Dashboard')).toBeInTheDocument()
  })

  it('displays assigned jobs section', () => {
    render(<TalentDashboardPage />)
    expect(screen.getByText('Assigned Jobs')).toBeInTheDocument()
  })

  it('displays pending tasks section', () => {
    render(<TalentDashboardPage />)
    expect(screen.getByText('Pending Tasks')).toBeInTheDocument()
  })

  it('shows empty state messages', () => {
    render(<TalentDashboardPage />)
    expect(screen.getByText('No assigned jobs')).toBeInTheDocument()
    expect(screen.getByText('No pending tasks')).toBeInTheDocument()
  })
})
