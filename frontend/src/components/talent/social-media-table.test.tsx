import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SocialMediaTable } from './social-media-table'

const mockListSocialMedia = vi.fn()

vi.mock('@/lib/api', () => ({
  apiClient: {
    listSocialMedia: (...args: any[]) => mockListSocialMedia(...args),
  },
}))

describe('SocialMediaTable', () => {
  const mockAccounts = [
    { id: 'sm-1', talent_id: 't1', platform: 'instagram', username: '@alice', url: 'https://instagram.com/alice' },
    { id: 'sm-2', talent_id: 't1', platform: 'tiktok', username: '@alice_tiktok' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockListSocialMedia.mockResolvedValue({
      success: true,
      data: mockAccounts,
    })
  })

  it('renders table with account data', async () => {
    render(<SocialMediaTable talentId="t1" />)

    await waitFor(() => {
      expect(screen.getByText('Instagram')).toBeInTheDocument()
      expect(screen.getByText('@alice')).toBeInTheDocument()
      expect(screen.getByText('Tiktok')).toBeInTheDocument()
      expect(screen.getByText('@alice_tiktok')).toBeInTheDocument()
    })
  })

  it('displays URL as link when present', async () => {
    render(<SocialMediaTable talentId="t1" />)

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /link/i })
      expect(link).toHaveAttribute('href', 'https://instagram.com/alice')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  it('shows edit and delete buttons', async () => {
    render(<SocialMediaTable talentId="t1" />)

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(2)
    })
  })

  it('shows skeleton loading state', () => {
    mockListSocialMedia.mockReturnValue(new Promise(() => {}))
    const { container } = render(<SocialMediaTable talentId="t1" />)

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    mockListSocialMedia.mockResolvedValue({ success: true, data: [] })
    render(<SocialMediaTable talentId="t1" />)

    expect(await screen.findByText(/no social media accounts found/i)).toBeInTheDocument()
  })
})
