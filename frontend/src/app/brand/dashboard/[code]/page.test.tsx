import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BrandDashboardPage from './page'

const mockGetBrandAccess = vi.fn()

vi.mock('@/lib/api', () => ({
  apiClient: {
    getBrandAccess: (...args: any[]) => mockGetBrandAccess(...args),
  },
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({ code: 'TEST123' }),
}))

describe('BrandDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows skeleton loading state', () => {
    mockGetBrandAccess.mockReturnValue(new Promise(() => {}))
    const { container } = render(<BrandDashboardPage />)

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    mockGetBrandAccess.mockRejectedValue(new Error('Access denied'))
    render(<BrandDashboardPage />)

    expect(await screen.findByText(/access denied/i)).toBeInTheDocument()
  })

  it('renders brand data', async () => {
    mockGetBrandAccess.mockResolvedValue({
      data: {
        brand_name: 'Nike',
        code: 'TEST123',
        jobs: [],
      },
    })
    render(<BrandDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Brand Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Nike')).toBeInTheDocument()
    })
  })
})
