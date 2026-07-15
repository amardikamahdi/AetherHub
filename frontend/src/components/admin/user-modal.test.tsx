import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { UserModal } from './user-modal'

describe('UserModal', () => {
  const mockUser = {
    id: '1',
    name: 'Alice',
    email: 'alice@test.com',
    role: 'admin',
  }

  it('renders create mode by default', () => {
    render(<UserModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} />)

    expect(screen.getByText('Create User')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('renders edit mode when user is provided', () => {
    render(<UserModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} user={mockUser} />)

    expect(screen.getByText('Edit User')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('pre-fills form fields in edit mode', () => {
    render(<UserModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} user={mockUser} />)

    expect(screen.getByLabelText(/name/i)).toHaveValue('Alice')
    expect(screen.getByLabelText(/email/i)).toHaveValue('alice@test.com')
    expect(screen.getByLabelText(/role/i)).toHaveValue('admin')
  })

  it('does not render when isOpen is false', () => {
    render(<UserModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />)

    expect(screen.queryByText('Create User')).not.toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = vi.fn()
    render(<UserModal isOpen onClose={onClose} onSubmit={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with form data when submitted', async () => {
    const onSubmit = vi.fn()
    render(<UserModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/name/i), 'Bob')
    await userEvent.type(screen.getByLabelText(/email/i), 'bob@test.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.selectOptions(screen.getByLabelText(/role/i), 'talent')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Bob',
      email: 'bob@test.com',
      password: 'password123',
      role: 'talent',
    })
  })

  it('validates required fields', async () => {
    const onSubmit = vi.fn()
    render(<UserModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not require password in edit mode', async () => {
    const onSubmit = vi.fn()
    render(<UserModal isOpen onClose={vi.fn()} onSubmit={onSubmit} user={mockUser} />)

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@test.com',
      password: '',
      role: 'admin',
    })
  })

  it('shows role options', () => {
    render(<UserModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} />)

    const roleSelect = screen.getByLabelText(/role/i)
    expect(roleSelect).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /^admin$/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /^talent$/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /^superadmin$/i })).toBeInTheDocument()
  })
})
