import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProtectedRoute } from './protected-route'

// Mock useAuth
const mockUseAuth = vi.fn()
vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is authenticated and has allowed role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Admin', role: 'admin' },
      isLoading: false,
    })

    render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Protected content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    })

    render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Protected content</div>
      </ProtectedRoute>
    )

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('redirects to unauthorized when user role is not allowed', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Talent', role: 'talent' },
      isLoading: false,
    })

    render(
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <div>Protected content</div>
      </ProtectedRoute>
    )

    expect(mockPush).toHaveBeenCalledWith('/unauthorized')
  })

  it('shows loading state while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    })

    render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Protected content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('allows access when user role is in allowedRoles array', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Superadmin', role: 'superadmin' },
      isLoading: false,
    })

    render(
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <div>Protected content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('renders nothing while redirecting', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    })

    const { container } = render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Protected content</div>
      </ProtectedRoute>
    )

    expect(container.textContent).toBe('')
  })
})
