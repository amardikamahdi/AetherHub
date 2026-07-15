import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BrandDashboardPage from './page'

// Mock apiClient
const mockGetBrandAccess = vi.fn()
vi.mock('@/lib/api', () => ({
  apiClient: {
    getBrandAccess: (...args: any[]) => mockGetBrandAccess(...args),
  },
}))

// Mock useParams
vi.mock('next/navigation', () => ({
  useParams: () => ({ code: 'ABC123' }),
}))

describe('BrandDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetBrandAccess.mockResolvedValue({
      success: true,
      data: {
        brand_name: 'Test Brand',
        jobs: [
          { id: '1', title: 'Campaign A', status: 'active' },
          { id: '2', title: 'Campaign B', status: 'pending' },
        ],
      },
    })
  })

  it('renders brand dashboard heading', async () => {
    render(<BrandDashboardPage />)
    expect(await screen.findByRole('heading', { name: /brand dashboard/i })).toBeInTheDocument()
  })

  it('displays brand name', async () => {
    render(<BrandDashboardPage />)
    expect(await screen.findByText('Test Brand')).toBeInTheDocument()
  })

  it('displays assigned jobs section', async () => {
    render(<BrandDashboardPage />)
    expect(await screen.findByRole('heading', { name: /assigned jobs/i })).toBeInTheDocument()
  })

  it('displays job list', async () => {
    render(<BrandDashboardPage />)
    expect(await screen.findByText('Campaign A')).toBeInTheDocument()
    expect(screen.getByText('Campaign B')).toBeInTheDocument()
  })

  it('displays job status', async () => {
    render(<BrandDashboardPage />)
    expect(await screen.findByText('active')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockGetBrandAccess.mockReturnValue(new Promise(() => {}))
    render(<BrandDashboardPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows error state when API fails', async () => {
    mockGetBrandAccess.mockRejectedValue(new Error('Access denied'))
    render(<BrandDashboardPage />)
    expect(await screen.findByText(/access denied/i)).toBeInTheDocument()
  })
})
