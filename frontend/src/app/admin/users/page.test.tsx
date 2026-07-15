import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UsersPage from './page'

// Mock apiClient
const mockCreateUser = vi.fn()
const mockUpdateUser = vi.fn()
const mockDeleteUser = vi.fn()
const mockListUsers = vi.fn()

vi.mock('@/lib/api', () => ({
  apiClient: {
    createUser: (...args: any[]) => mockCreateUser(...args),
    updateUser: (...args: any[]) => mockUpdateUser(...args),
    deleteUser: (...args: any[]) => mockDeleteUser(...args),
    listUsers: (...args: any[]) => mockListUsers(...args),
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/users',
}))

// Mock auth provider
vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
    isLoading: false,
    logout: vi.fn(),
  }),
}))

describe('UsersPage', () => {
  const mockUsers = [
    { id: '1', name: 'Alice', email: 'alice@test.com', role: 'admin' },
    { id: '2', name: 'Bob', email: 'bob@test.com', role: 'talent' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockListUsers.mockResolvedValue({
      success: true,
      data: mockUsers,
      total: 2,
    })
    mockCreateUser.mockResolvedValue({ success: true, data: { id: '3' } })
    mockUpdateUser.mockResolvedValue({ success: true, data: { id: '1' } })
    mockDeleteUser.mockResolvedValue({ success: true })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('calls apiClient.createUser when creating a new user', async () => {
    render(<UsersPage />)

    // Wait for table to load
    await screen.findByText('Alice')

    // Open create modal
    await userEvent.click(screen.getByRole('button', { name: /create user/i }))

    // Fill form using the modal's specific label (exact match for "Role", not "Filter by role")
    await userEvent.type(screen.getByLabelText('Name'), 'Charlie')
    await userEvent.type(screen.getByLabelText('Email'), 'charlie@test.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.selectOptions(screen.getByLabelText('Role'), 'talent')

    // Submit using the form submit button
    await userEvent.click(screen.getByRole('button', { name: /^create$/i }))

    // Verify API was called
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        name: 'Charlie',
        email: 'charlie@test.com',
        password: 'password123',
        role: 'talent',
      })
    })
  })

  it('calls apiClient.updateUser when editing an existing user', async () => {
    render(<UsersPage />)

    // Wait for table to load
    await screen.findByText('Alice')

    // Click edit on first user
    const editButtons = await screen.findAllByRole('button', { name: /edit/i })
    await userEvent.click(editButtons[0])

    // Verify modal opened with pre-filled data
    expect(screen.getByLabelText('Name')).toHaveValue('Alice')

    // Modify name
    await userEvent.clear(screen.getByLabelText('Name'))
    await userEvent.type(screen.getByLabelText('Name'), 'Alice Updated')

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    // Verify API was called with user ID
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith('1', {
        name: 'Alice Updated',
        email: 'alice@test.com',
        password: '',
        role: 'admin',
      })
    })
  })

  it('calls apiClient.deleteUser with confirmation when delete is clicked', async () => {
    render(<UsersPage />)

    // Wait for table to load
    await screen.findByText('Alice')

    // Click delete on first user
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i })
    await userEvent.click(deleteButtons[0])

    // Verify confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this user?')

    // Verify API was called
    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith('1')
    })
  })

  it('does not call deleteUser when confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<UsersPage />)

    // Wait for table to load
    await screen.findByText('Alice')

    // Click delete on first user
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i })
    await userEvent.click(deleteButtons[0])

    // Verify API was NOT called
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it('refreshes user list after successful create', async () => {
    render(<UsersPage />)

    // Wait for initial load
    await screen.findByText('Alice')
    expect(mockListUsers).toHaveBeenCalledTimes(1)

    // Open create modal and submit
    await userEvent.click(screen.getByRole('button', { name: /create user/i }))
    await userEvent.type(screen.getByLabelText('Name'), 'Charlie')
    await userEvent.type(screen.getByLabelText('Email'), 'charlie@test.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /^create$/i }))

    // Verify list was refreshed
    await waitFor(() => {
      expect(mockListUsers).toHaveBeenCalledTimes(2)
    })
  })

  it('refreshes user list after successful delete', async () => {
    render(<UsersPage />)

    // Wait for initial load
    await screen.findByText('Alice')
    expect(mockListUsers).toHaveBeenCalledTimes(1)

    // Click delete
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i })
    await userEvent.click(deleteButtons[0])

    // Verify list was refreshed
    await waitFor(() => {
      expect(mockListUsers).toHaveBeenCalledTimes(2)
    })
  })
})
