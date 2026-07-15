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
    { id: '1', talent_id: 't1', platform: 'instagram', username: '@alice', url: 'https://instagram.com/alice' },
    { id: '2', talent_id: 't1', platform: 'tiktok', username: '@alice' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockListSocialMedia.mockResolvedValue({ success: true, data: mockAccounts })
  })

  it('renders table with account data', async () => {
    render(<SocialMediaTable talentId="t1" />)

    expect(await screen.findByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('Tiktok')).toBeInTheDocument()
    expect(screen.getAllByText('@alice')).toHaveLength(2)
  })

  it('displays column headers', async () => {
    render(<SocialMediaTable talentId="t1" />)

    await screen.findByText('Instagram')

    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('URL')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('displays URL as link when present', async () => {
    render(<SocialMediaTable talentId="t1" />)

    await screen.findByText('Instagram')

    const link = screen.getByRole('link', { name: /instagram\.com\/alice/i })
    expect(link).toHaveAttribute('href', 'https://instagram.com/alice')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('displays dash for missing URL', async () => {
    render(<SocialMediaTable talentId="t1" />)

    await screen.findByText('Tiktok')

    const tiktokRow = screen.getByText('Tiktok').closest('tr')
    expect(tiktokRow).toHaveTextContent('-')
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<SocialMediaTable talentId="t1" onEdit={onEdit} />)

    await screen.findByText('Instagram')

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    editButtons[0].click()

    expect(onEdit).toHaveBeenCalledWith(mockAccounts[0])
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<SocialMediaTable talentId="t1" onDelete={onDelete} />)

    await screen.findByText('Instagram')

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    deleteButtons[0].click()

    expect(onDelete).toHaveBeenCalledWith(mockAccounts[0])
  })

  it('shows empty state when no accounts', async () => {
    mockListSocialMedia.mockResolvedValue({ success: true, data: [] })
    render(<SocialMediaTable talentId="t1" />)

    expect(await screen.findByText(/no social media accounts found/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockListSocialMedia.mockReturnValue(new Promise(() => {}))
    render(<SocialMediaTable talentId="t1" />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
