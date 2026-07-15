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
          {
            id: '1',
            title: 'Campaign A',
            brand_name: 'Test Brand',
            status: 'active',
            progress: [
              {
                assignment_id: 'assign-1',
                job_id: '1',
                talent_id: 'talent-1',
                steps: [
                  { step: 'absen', status: 'completed' },
                  { step: 'draft_storyline', status: 'pending' },
                  { step: 'input_link', status: 'pending' },
                  { step: 'insight', status: 'pending' },
                ],
              },
            ],
          },
          {
            id: '2',
            title: 'Campaign B',
            brand_name: 'Test Brand',
            status: 'pending',
            progress: [],
          },
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
    const brandNames = await screen.findAllByText('Test Brand')
    expect(brandNames.length).toBeGreaterThanOrEqual(1)
  })

  it('displays job titles', async () => {
    render(<BrandDashboardPage />)
    expect(await screen.findByText('Campaign A')).toBeInTheDocument()
    expect(screen.getByText('Campaign B')).toBeInTheDocument()
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
