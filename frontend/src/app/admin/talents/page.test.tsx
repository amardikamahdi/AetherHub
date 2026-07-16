import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TalentsPage from './page'

// Mock apiClient
const mockCreateTalent = vi.fn()
const mockUpdateTalent = vi.fn()
const mockDeleteTalent = vi.fn()
const mockListTalents = vi.fn()

vi.mock('@/lib/api', () => ({
  apiClient: {
    createTalent: (...args: any[]) => mockCreateTalent(...args),
    updateTalent: (...args: any[]) => mockUpdateTalent(...args),
    deleteTalent: (...args: any[]) => mockDeleteTalent(...args),
    listTalents: (...args: any[]) => mockListTalents(...args),
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/talents',
}))

// Mock auth provider
vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
    isLoading: false,
    logout: vi.fn(),
  }),
}))

describe('TalentsPage', () => {
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
    mockCreateTalent.mockResolvedValue({ success: true, data: { id: '3' } })
    mockUpdateTalent.mockResolvedValue({ success: true, data: { id: '1' } })
    mockDeleteTalent.mockResolvedValue({ success: true })
  })

  it('calls apiClient.createTalent when creating a new talent', async () => {
    render(<TalentsPage />)

    await screen.findByText('Alice')

    await userEvent.click(screen.getByRole('button', { name: /create talent/i }))

    await userEvent.type(screen.getByLabelText('Name'), 'Charlie')
    await userEvent.type(screen.getByLabelText('Email'), 'charlie@test.com')
    await userEvent.type(screen.getByLabelText('Phone'), '08123456789')

    await userEvent.click(screen.getByRole('button', { name: /^create$/i }))

    await waitFor(() => {
      expect(mockCreateTalent).toHaveBeenCalledWith({
        name: 'Charlie',
        email: 'charlie@test.com',
        phone: '08123456789',
      })
    })
  })

  it('calls apiClient.updateTalent when editing an existing talent', async () => {
    render(<TalentsPage />)

    await screen.findByText('Alice')

    const editButtons = await screen.findAllByRole('button', { name: /edit/i })
    await userEvent.click(editButtons[0])

    expect(screen.getByLabelText('Name')).toHaveValue('Alice')

    await userEvent.clear(screen.getByLabelText('Name'))
    await userEvent.type(screen.getByLabelText('Name'), 'Alice Updated')

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockUpdateTalent).toHaveBeenCalledWith('1', {
        name: 'Alice Updated',
        email: 'alice@test.com',
        phone: '0812',
      })
    })
  })

  it('calls apiClient.deleteTalent with confirmation when delete is clicked', async () => {
    render(<TalentsPage />)

    await screen.findByText('Alice')

    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i })
    await userEvent.click(deleteButtons[0])

    // Confirm the AlertDialog
    const confirmButton = await screen.findByRole('button', { name: /delete/i })
    await userEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteTalent).toHaveBeenCalledWith('1')
    })
  })

  it('does not call deleteTalent when confirmation is cancelled', async () => {
    render(<TalentsPage />)

    await screen.findByText('Alice')

    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i })
    await userEvent.click(deleteButtons[0])

    // Cancel the AlertDialog
    const cancelButton = await screen.findByRole('button', { name: /cancel/i })
    await userEvent.click(cancelButton)

    expect(mockDeleteTalent).not.toHaveBeenCalled()
  })
})
