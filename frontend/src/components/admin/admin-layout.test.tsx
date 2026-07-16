import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminLayout } from './admin-layout'

// Mock useAuth
const mockUseAuth = vi.fn()
vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/admin/dashboard',
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('AdminLayout', () => {
  const adminUser = {
    id: '1',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'admin',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: adminUser,
      isLoading: false,
      logout: vi.fn(),
    })
  })

  it('renders sidebar with navigation links', () => {
    render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Jobs')).toBeInTheDocument()
    expect(screen.getByText('Talents')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>
    )

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/admin/dashboard')
    expect(screen.getByText('Jobs').closest('a')).toHaveAttribute('href', '/admin/jobs')
    expect(screen.getByText('Talents').closest('a')).toHaveAttribute('href', '/admin/talents')
    expect(screen.getByText('Users').closest('a')).toHaveAttribute('href', '/admin/users')
  })

  it('displays user name and role', () => {
    render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>
    )

    expect(screen.getByText('Test Admin')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('calls logout when logout button is clicked', async () => {
    const mockLogout = vi.fn()
    mockUseAuth.mockReturnValue({
      user: adminUser,
      isLoading: false,
      logout: mockLogout,
    })

    render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>
    )

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await userEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      logout: vi.fn(),
    })

    render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>
    )

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('redirects to login when user role is talent', () => {
    mockUseAuth.mockReturnValue({
      user: { ...adminUser, role: 'talent' },
      isLoading: false,
      logout: vi.fn(),
    })

    render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>
    )

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('shows skeleton loading state while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      logout: vi.fn(),
    })

    const { container } = render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>
    )

    // Skeleton components are rendered during loading
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })

  it('allows superadmin role access', () => {
    mockUseAuth.mockReturnValue({
      user: { ...adminUser, role: 'superadmin' },
      isLoading: false,
      logout: vi.fn(),
    })

    render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
