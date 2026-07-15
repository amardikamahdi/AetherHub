import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { JobModal } from './job-modal'

describe('JobModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  }

  it('renders create mode by default', () => {
    render(<JobModal {...defaultProps} />)

    expect(screen.getByText('Create Job')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('renders edit mode when job is provided', () => {
    const job = {
      id: '1',
      title: 'Test Job',
      brand_name: 'Nike',
      status: 'active',
    }

    render(<JobModal {...defaultProps} job={job} />)

    expect(screen.getByText('Edit Job')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<JobModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Create Job')).not.toBeInTheDocument()
  })

  it('displays form fields', () => {
    render(<JobModal {...defaultProps} />)

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/brand name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/deadline/i)).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<JobModal {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with form data when submitted', () => {
    const onSubmit = vi.fn()
    render(<JobModal {...defaultProps} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Campaign' } })
    fireEvent.change(screen.getByLabelText(/brand name/i), { target: { value: 'Nike' } })
    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Campaign',
        brand_name: 'Nike',
      })
    )
  })

  it('pre-fills form in edit mode', () => {
    const job = {
      id: '1',
      title: 'Existing Job',
      brand_name: 'Adidas',
      status: 'draft',
    }

    render(<JobModal {...defaultProps} job={job} />)

    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Job')
    expect(screen.getByLabelText(/brand name/i)).toHaveValue('Adidas')
  })

  it('shows status select in edit mode', () => {
    const job = {
      id: '1',
      title: 'Test Job',
      brand_name: 'Nike',
      status: 'draft',
    }

    render(<JobModal {...defaultProps} job={job} />)

    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  })

  it('does not show status select in create mode', () => {
    render(<JobModal {...defaultProps} />)

    expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument()
  })
})
