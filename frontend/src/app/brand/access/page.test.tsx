import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BrandAccessPage from './page'

// Mock apiClient
const mockValidateCode = vi.fn()
vi.mock('@/lib/api', () => ({
  apiClient: {
    validateBrandCode: (...args: any[]) => mockValidateCode(...args),
  },
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('BrandAccessPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the brand access heading', () => {
    render(<BrandAccessPage />)
    expect(screen.getByText('Brand Access')).toBeInTheDocument()
  })

  it('renders a code input field', () => {
    render(<BrandAccessPage />)
    expect(screen.getByLabelText(/access code/i)).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    render(<BrandAccessPage />)
    expect(screen.getByRole('button', { name: /access/i })).toBeInTheDocument()
  })

  it('validates code is not empty', async () => {
    render(<BrandAccessPage />)

    await userEvent.click(screen.getByRole('button', { name: /access/i }))

    expect(mockValidateCode).not.toHaveBeenCalled()
  })

  it('calls validateBrandCode when form is submitted', async () => {
    mockValidateCode.mockResolvedValue({ success: true })
    render(<BrandAccessPage />)

    await userEvent.type(screen.getByLabelText(/access code/i), 'ABC123')
    await userEvent.click(screen.getByRole('button', { name: /access/i }))

    expect(mockValidateCode).toHaveBeenCalledWith('ABC123')
  })

  it('redirects to brand dashboard on valid code', async () => {
    mockValidateCode.mockResolvedValue({ success: true })
    render(<BrandAccessPage />)

    await userEvent.type(screen.getByLabelText(/access code/i), 'ABC123')
    await userEvent.click(screen.getByRole('button', { name: /access/i }))

    expect(mockPush).toHaveBeenCalledWith('/brand/dashboard/ABC123')
  })

  it('shows error message on invalid code', async () => {
    mockValidateCode.mockRejectedValue(new Error('Invalid code'))
    render(<BrandAccessPage />)

    await userEvent.type(screen.getByLabelText(/access code/i), 'INVALID')
    await userEvent.click(screen.getByRole('button', { name: /access/i }))

    expect(await screen.findByText(/invalid code/i)).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows loading state while validating', async () => {
    mockValidateCode.mockReturnValue(new Promise(() => {})) // never resolves
    render(<BrandAccessPage />)

    await userEvent.type(screen.getByLabelText(/access code/i), 'ABC123')
    await userEvent.click(screen.getByRole('button', { name: /access/i }))

    expect(screen.getByText(/validating/i)).toBeInTheDocument()
  })
})
