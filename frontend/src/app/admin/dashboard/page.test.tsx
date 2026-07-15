import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardPage from './page'

// Mock apiClient
vi.mock('@/lib/api', () => ({
  apiClient: {
    getDashboard: vi.fn().mockResolvedValue({
      success: true,
      data: {
        total_jobs: 5,
        active_jobs: 3,
        completed_jobs: 2,
        total_assignments: 10,
        completed_steps: 20,
        total_steps: 40,
      },
    }),
    listJobs: vi.fn().mockResolvedValue({
      success: true,
      data: [
        { id: '1', title: 'Campaign A', brand_name: 'Brand A', status: 'active' },
        { id: '2', title: 'Campaign B', brand_name: 'Brand B', status: 'completed' },
      ],
      total: 2,
    }),
    listAssignmentsByJob: vi.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
  },
}))

// Mock AdminLayout to isolate page tests
vi.mock('@/components/admin/admin-layout', () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('DashboardPage', () => {
  it('renders dashboard heading', async () => {
    render(<DashboardPage />)
    expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('displays stats cards', async () => {
    render(<DashboardPage />)
    expect(await screen.findByText('Total Jobs')).toBeInTheDocument()
    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    expect(screen.getByText('Total Assignments')).toBeInTheDocument()
    expect(screen.getByText('Completion')).toBeInTheDocument()
  })

  it('displays correct stat values', async () => {
    render(<DashboardPage />)
    expect(await screen.findByText('5')).toBeInTheDocument() // total_jobs
    expect(screen.getByText('3')).toBeInTheDocument() // active_jobs
    expect(screen.getByText('10')).toBeInTheDocument() // total_assignments
    expect(screen.getByText('50%')).toBeInTheDocument() // completion (20/40 = 50%)
  })

  it('displays job progress section', async () => {
    render(<DashboardPage />)
    expect(await screen.findByText('Job Progress')).toBeInTheDocument()
  })

  it('displays job titles', async () => {
    render(<DashboardPage />)
    expect(await screen.findByText('Campaign A')).toBeInTheDocument()
    expect(screen.getByText('Campaign B')).toBeInTheDocument()
  })

  it('has a link to manage jobs', async () => {
    render(<DashboardPage />)
    const link = await screen.findByRole('link', { name: /manage jobs/i })
    expect(link).toHaveAttribute('href', '/admin/jobs')
  })
})
