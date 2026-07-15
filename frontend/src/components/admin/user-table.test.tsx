import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserTable } from './user-table'

// Mock apiClient
const mockListUsers = vi.fn()
vi.mock('@/lib/api', () => ({
  apiClient: {
    listUsers: (...args: any[]) => mockListUsers(...args),
  },
}))

describe('UserTable', () => {
  const mockUsers = [
    { id: '1', name: 'Alice', email: 'alice@test.com', role: 'admin' },
    { id: '2', name: 'Bob', email: 'bob@test.com', role: 'talent' },
    { id: '3', name: 'Charlie', email: 'charlie@test.com', role: 'talent' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockListUsers.mockResolvedValue({
      success: true,
      data: mockUsers,
      total: 3,
    })
  })

  it('renders a table with user data', async () => {
    render(<UserTable />)

    expect(await screen.findByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('displays column headers', async () => {
    render(<UserTable />)

    // Wait for loading to finish
    await screen.findByText('Alice')

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('displays user roles', async () => {
    render(<UserTable />)

    expect(await screen.findByText('admin')).toBeInTheDocument()
    expect(screen.getAllByText('talent')).toHaveLength(2)
  })

  it('displays edit and delete buttons for each user', async () => {
    render(<UserTable />)

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      expect(editButtons).toHaveLength(3)
      expect(deleteButtons).toHaveLength(3)
    })
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<UserTable onEdit={onEdit} />)

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      editButtons[0].click()
    })

    expect(onEdit).toHaveBeenCalledWith(mockUsers[0])
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<UserTable onDelete={onDelete} />)

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      deleteButtons[0].click()
    })

    expect(onDelete).toHaveBeenCalledWith(mockUsers[0])
  })

  it('shows empty state when no users', async () => {
    mockListUsers.mockResolvedValue({ success: true, data: [], total: 0 })
    render(<UserTable />)

    expect(await screen.findByText(/no users found/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockListUsers.mockReturnValue(new Promise(() => {})) // never resolves
    render(<UserTable />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('filters by role when role filter is changed', async () => {
    render(<UserTable />)

    await screen.findByText('Alice')

    const filterSelect = screen.getByLabelText(/filter by role/i)
    await userEvent.selectOptions(filterSelect, 'talent')

    expect(mockListUsers).toHaveBeenCalledWith(0, 20, 'talent')
  })

  it('paginates when next button is clicked', async () => {
    mockListUsers.mockResolvedValueOnce({
      success: true,
      data: mockUsers,
      total: 50,
    })

    render(<UserTable />)

    await screen.findByText('Alice')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await userEvent.click(nextButton)

    expect(mockListUsers).toHaveBeenCalledWith(20, 20, undefined)
  })
})
