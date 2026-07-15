import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JobTable } from './job-table'

// Mock apiClient
const mockListJobs = vi.fn()
vi.mock('@/lib/api', () => ({
  apiClient: {
    listJobs: (...args: any[]) => mockListJobs(...args),
  },
}))

describe('JobTable', () => {
  const mockJobs = [
    { id: '1', title: 'Instagram Campaign', brand_name: 'Nike', status: 'active', deadline: '2026-12-31' },
    { id: '2', title: 'TikTok Promo', brand_name: 'Adidas', status: 'draft' },
    { id: '3', title: 'YouTube Review', brand_name: 'Puma', status: 'completed' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockListJobs.mockResolvedValue({
      success: true,
      data: mockJobs,
      total: 3,
    })
  })

  it('renders a table with job data', async () => {
    render(<JobTable />)

    expect(await screen.findByText('Instagram Campaign')).toBeInTheDocument()
    expect(screen.getByText('TikTok Promo')).toBeInTheDocument()
    expect(screen.getByText('YouTube Review')).toBeInTheDocument()
  })

  it('displays column headers', async () => {
    render(<JobTable />)

    await screen.findByText('Instagram Campaign')

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Brand')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Deadline')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('displays status badges', async () => {
    render(<JobTable />)

    await screen.findByText('Instagram Campaign')

    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
  })

  it('displays brand names', async () => {
    render(<JobTable />)

    await screen.findByText('Instagram Campaign')

    expect(screen.getByText('Nike')).toBeInTheDocument()
    expect(screen.getByText('Adidas')).toBeInTheDocument()
    expect(screen.getByText('Puma')).toBeInTheDocument()
  })

  it('displays edit, assign, and delete buttons for each job', async () => {
    render(<JobTable />)

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      const assignButtons = screen.getAllByRole('button', { name: /assign/i })
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      expect(editButtons).toHaveLength(3)
      expect(assignButtons).toHaveLength(3)
      expect(deleteButtons).toHaveLength(3)
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

  it('calls onAssign when assign button is clicked', async () => {
    const onAssign = vi.fn()
    render(<JobTable onAssign={onAssign} />)

    await waitFor(() => {
      const assignButtons = screen.getAllByRole('button', { name: /assign/i })
      assignButtons[0].click()
    })

    expect(onAssign).toHaveBeenCalledWith(mockJobs[0])
  })

  it('shows empty state when no jobs', async () => {
    mockListJobs.mockResolvedValue({ success: true, data: [], total: 0 })
    render(<JobTable />)

    expect(await screen.findByText(/no jobs found/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockListJobs.mockReturnValue(new Promise(() => {}))
    render(<JobTable />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('paginates when next button is clicked', async () => {
    mockListJobs.mockResolvedValueOnce({
      success: true,
      data: mockJobs,
      total: 50,
    })

    render(<JobTable />)

    await screen.findByText('Instagram Campaign')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await userEvent.click(nextButton)

    expect(mockListJobs).toHaveBeenCalledWith(20, 20)
  })
})
