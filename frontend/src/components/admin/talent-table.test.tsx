import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TalentTable } from './talent-table'

const mockListTalents = vi.fn()

vi.mock('@/lib/api', () => ({
  apiClient: {
    listTalents: (...args: any[]) => mockListTalents(...args),
  },
}))

describe('TalentTable', () => {
  const mockTalents = [
    { id: '1', user_id: 'u1', name: 'Alice', email: 'alice@test.com', phone: '0812' },
    { id: '2', user_id: 'u2', name: 'Bob', email: 'bob@test.com' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockListTalents.mockResolvedValue({
      success: true,
      data: mockTalents,
      total: 2,
    })
  })

  it('renders table with talent data', async () => {
    render(<TalentTable />)

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('alice@test.com')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })
  })

  it('shows phone when available', async () => {
    render(<TalentTable />)

    await waitFor(() => {
      expect(screen.getByText('0812')).toBeInTheDocument()
    })
  })

  it('shows edit and delete buttons', async () => {
    render(<TalentTable />)

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(2)
    })
  })

  it('shows skeleton loading state', () => {
    mockListTalents.mockReturnValue(new Promise(() => {}))
    const { container } = render(<TalentTable />)

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    mockListTalents.mockResolvedValue({ success: true, data: [], total: 0 })
    render(<TalentTable />)

    expect(await screen.findByText(/no talents found/i)).toBeInTheDocument()
  })
})
