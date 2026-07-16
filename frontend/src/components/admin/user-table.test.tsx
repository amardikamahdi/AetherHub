import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserTable } from './user-table'

const mockListUsers = vi.fn()
const mockDeleteUser = vi.fn()

vi.mock('@/lib/api', () => ({
  apiClient: {
    listUsers: (...args: any[]) => mockListUsers(...args),
    deleteUser: (...args: any[]) => mockDeleteUser(...args),
  },
}))

describe('UserTable', () => {
  const mockUsers = [
    { id: '1', name: 'Alice', email: 'alice@test.com', role: 'admin' },
    { id: '2', name: 'Bob', email: 'bob@test.com', role: 'talent' },
    { id: '3', name: 'Charlie', email: 'charlie@test.com', role: 'superadmin' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockListUsers.mockResolvedValue({
      success: true,
      data: mockUsers,
      total: 3,
    })
  })

  it('renders table with user data', async () => {
    render(<UserTable />)

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })
  })

  it('shows role badges', async () => {
    render(<UserTable />)

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('talent')).toBeInTheDocument()
      expect(screen.getByText('superadmin')).toBeInTheDocument()
    })
  })

  it('shows edit and delete buttons for each user', async () => {
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

  it('shows skeleton loading state', () => {
    mockListUsers.mockReturnValue(new Promise(() => {})) // never resolves
    const { container } = render(<UserTable />)

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
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
