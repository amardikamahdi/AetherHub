import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardPage from './page'

// Mock apiClient
vi.mock('@/lib/api', () => ({
  apiClient: {
    listUsers: vi.fn().mockResolvedValue({
      success: true,
      data: [
        { id: '1', name: 'User 1', role: 'talent' },
        { id: '2', name: 'User 2', role: 'admin' },
      ],
      total: 2,
    }),
  },
}))

// Mock AdminLayout to isolate page tests
vi.mock('@/components/admin/admin-layout', () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('DashboardPage', () => {
  it('renders dashboard heading', () => {
    render(<DashboardPage />)
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('displays total users stat', async () => {
    render(<DashboardPage />)
    expect(await screen.findByText('Total Users')).toBeInTheDocument()
    expect(await screen.findByText('2')).toBeInTheDocument()
  })

  it('displays total talents stat', async () => {
    render(<DashboardPage />)
    const label = await screen.findByText('Total Talents')
    const card = label.closest('div')!
    expect(card.querySelector('.text-3xl')).toHaveTextContent('1')
  })

  it('displays total admins stat', async () => {
    render(<DashboardPage />)
    const label = await screen.findByText('Total Admins')
    const card = label.closest('div')!
    expect(card.querySelector('.text-3xl')).toHaveTextContent('1')
  })

  it('displays quick actions section', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument()
  })

  it('has a link to create new user', () => {
    render(<DashboardPage />)
    const link = screen.getByRole('link', { name: /create user/i })
    expect(link).toHaveAttribute('href', '/admin/users?action=create')
  })
})
