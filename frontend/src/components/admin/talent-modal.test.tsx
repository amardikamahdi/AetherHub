import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TalentModal } from './talent-modal'

describe('TalentModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  }

  it('renders create form when no talent provided', () => {
    render(<TalentModal {...defaultProps} />)

    expect(screen.getByText('Create Talent')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(screen.getByLabelText('Phone')).toHaveValue('')
  })

  it('renders edit form when talent provided', () => {
    const talent = {
      id: '1',
      user_id: 'u1',
      name: 'Alice',
      email: 'alice@test.com',
      phone: '0812',
    }

    render(<TalentModal {...defaultProps} talent={talent} />)

    expect(screen.getByText('Edit Talent')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('Alice')
    expect(screen.getByLabelText('Email')).toHaveValue('alice@test.com')
    expect(screen.getByLabelText('Phone')).toHaveValue('0812')
  })

  it('does not render when isOpen is false', () => {
    render(<TalentModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Create Talent')).not.toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = vi.fn()
    render(<TalentModal {...defaultProps} onClose={onClose} />)

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with form data when submitted', async () => {
    const onSubmit = vi.fn()
    render(<TalentModal {...defaultProps} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Name'), 'New Talent')
    await userEvent.type(screen.getByLabelText('Email'), 'new@test.com')
    await userEvent.type(screen.getByLabelText('Phone'), '08123456789')

    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'New Talent',
      email: 'new@test.com',
      phone: '08123456789',
    })
  })

  it('does not submit when name is empty', async () => {
    const onSubmit = vi.fn()
    render(<TalentModal {...defaultProps} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Email'), 'new@test.com')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit when email is empty', async () => {
    const onSubmit = vi.fn()
    render(<TalentModal {...defaultProps} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Name'), 'New Talent')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
