import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TalentTable } from './talent-table'

// Mock apiClient
const mockListTalents = vi.fn()
vi.mock('@/lib/api', () => ({
  apiClient: {
    listTalents: (...args: any[]) => mockListTalents(...args),
  },
}))

describe('TalentTable', () => {
  const mockTalents = [
    { id: '1', user_id: 'u1', name: 'Alice', email: 'alice@test.com', phone: '0812' },
    { id: '2', user_id: 'u2', name: 'Bob', email: 'bob@test.com', phone: '0813' },
    { id: '3', user_id: 'u3', name: 'Charlie', email: 'charlie@test.com' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockListTalents.mockResolvedValue({
      success: true,
      data: mockTalents,
      total: 3,
    })
  })

  it('renders a table with talent data', async () => {
    render(<TalentTable />)

    expect(await screen.findByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('displays column headers', async () => {
    render(<TalentTable />)

    await screen.findByText('Alice')

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('displays phone numbers', async () => {
    render(<TalentTable />)

    await screen.findByText('Alice')

    expect(screen.getByText('0812')).toBeInTheDocument()
    expect(screen.getByText('0813')).toBeInTheDocument()
  })

  it('displays dash for missing phone', async () => {
    render(<TalentTable />)

    await screen.findByText('Charlie')

    const charlieRow = screen.getByText('Charlie').closest('tr')
    expect(charlieRow).toHaveTextContent('-')
  })

  it('displays edit and delete buttons for each talent', async () => {
    render(<TalentTable />)

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      expect(editButtons).toHaveLength(3)
      expect(deleteButtons).toHaveLength(3)
    })
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<TalentTable onEdit={onEdit} />)

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      editButtons[0].click()
    })

    expect(onEdit).toHaveBeenCalledWith(mockTalents[0])
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<TalentTable onDelete={onDelete} />)

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      deleteButtons[0].click()
    })

    expect(onDelete).toHaveBeenCalledWith(mockTalents[0])
  })

  it('shows empty state when no talents', async () => {
    mockListTalents.mockResolvedValue({ success: true, data: [], total: 0 })
    render(<TalentTable />)

    expect(await screen.findByText(/no talents found/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockListTalents.mockReturnValue(new Promise(() => {}))
    render(<TalentTable />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('paginates when next button is clicked', async () => {
    mockListTalents.mockResolvedValueOnce({
      success: true,
      data: mockTalents,
      total: 50,
    })

    render(<TalentTable />)

    await screen.findByText('Alice')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await userEvent.click(nextButton)

    expect(mockListTalents).toHaveBeenCalledWith(20, 20)
  })
})
