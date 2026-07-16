import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JobTable } from './job-table'

const mockListJobs = vi.fn()

vi.mock('@/lib/api', () => ({
  apiClient: {
    listJobs: (...args: any[]) => mockListJobs(...args),
  },
}))

describe('JobTable', () => {
  const mockJobs = [
    { id: '1', title: 'Summer Campaign', brand_name: 'Nike', status: 'active', deadline: '2025-06-01' },
    { id: '2', title: 'Holiday Promo', brand_name: 'Adidas', status: 'draft' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockListJobs.mockResolvedValue({
      success: true,
      data: mockJobs,
      total: 2,
    })
  })

  it('renders table with job data', async () => {
    render(<JobTable />)

    await waitFor(() => {
      expect(screen.getByText('Summer Campaign')).toBeInTheDocument()
      expect(screen.getByText('Nike')).toBeInTheDocument()
      expect(screen.getByText('Holiday Promo')).toBeInTheDocument()
      expect(screen.getByText('Adidas')).toBeInTheDocument()
    })
  })

  it('shows status badges', async () => {
    render(<JobTable />)

    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument()
      expect(screen.getByText('draft')).toBeInTheDocument()
    })
  })

  it('shows formatted deadline', async () => {
    render(<JobTable />)

    await waitFor(() => {
      expect(screen.getByText(/6\/1\/2025/)).toBeInTheDocument()
    })
  })

  it('shows edit and delete buttons for each job', async () => {
    render(<JobTable />)

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      expect(editButtons).toHaveLength(2)
      expect(deleteButtons).toHaveLength(2)
    })
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<JobTable onEdit={onEdit} />)

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      editButtons[0].click()
    })

    expect(onEdit).toHaveBeenCalledWith(mockJobs[0])
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<JobTable onDelete={onDelete} />)

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      deleteButtons[0].click()
    })

    expect(onDelete).toHaveBeenCalledWith(mockJobs[0])
  })

  it('shows empty state when no jobs', async () => {
    mockListJobs.mockResolvedValue({ success: true, data: [], total: 0 })
    render(<JobTable />)

    expect(await screen.findByText(/no jobs found/i)).toBeInTheDocument()
  })

  it('shows skeleton loading state', () => {
    mockListJobs.mockReturnValue(new Promise(() => {}))
    const { container } = render(<JobTable />)

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })

  it('paginates when next button is clicked', async () => {
    mockListJobs.mockResolvedValueOnce({
      success: true,
      data: mockJobs,
      total: 50,
    })

    render(<JobTable />)

    await screen.findByText('Summer Campaign')

    const nextButton = screen.getByRole('button', { name: /next/i })
    nextButton.click()

    await waitFor(() => {
      expect(mockListJobs).toHaveBeenCalledWith(20, 20)
    })
  })
})
