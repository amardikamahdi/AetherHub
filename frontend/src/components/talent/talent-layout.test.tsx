import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TalentLayout } from './talent-layout'

// Mock useAuth
const mockUseAuth = vi.fn()
vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/talent/dashboard',
}))

describe('TalentLayout', () => {
  const talentUser = {
    id: '1',
    email: 'talent@test.com',
    name: 'Test Talent',
    role: 'talent',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: talentUser,
      isLoading: false,
      logout: vi.fn(),
    })
  })

  it('renders header with app name', () => {
    const { container } = render(
      <TalentLayout>
        <div>Child content</div>
      </TalentLayout>
    )

    expect(screen.getByText('AetherHub')).toBeInTheDocument()
  })

  it('displays user name', () => {
    const { container } = render(
      <TalentLayout>
        <div>Child content</div>
      </TalentLayout>
    )

    expect(screen.getByText('Test Talent')).toBeInTheDocument()
  })

  it('renders children content', () => {
    const { container } = render(
      <TalentLayout>
        <div>Child content</div>
      </TalentLayout>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('has a logout button', () => {
    const { container } = render(
      <TalentLayout>
        <div>Child content</div>
      </TalentLayout>
    )

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('calls logout when logout button is clicked', async () => {
    const mockLogout = vi.fn()
    mockUseAuth.mockReturnValue({
      user: talentUser,
      isLoading: false,
      logout: mockLogout,
    })

    const { container } = render(
      <TalentLayout>
        <div>Child content</div>
      </TalentLayout>
    )

    await userEvent.click(screen.getByRole('button', { name: /logout/i }))

    expect(mockLogout).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      logout: vi.fn(),
    })

    const { container } = render(
      <TalentLayout>
        <div>Child content</div>
      </TalentLayout>
    )

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('redirects to login when user role is admin', () => {
    mockUseAuth.mockReturnValue({
      user: { ...talentUser, role: 'admin' },
      isLoading: false,
      logout: vi.fn(),
    })

    const { container } = render(
      <TalentLayout>
        <div>Child content</div>
      </TalentLayout>
    )

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('shows loading state while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      logout: vi.fn(),
    })

    const { container } = render(
      <TalentLayout>
        <div>Child content</div>
      </TalentLayout>
    )

    // Skeleton components are rendered during loading
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })
})
