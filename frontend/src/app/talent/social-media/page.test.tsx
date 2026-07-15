import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SocialMediaPage from './page'

const mockCreateSocialMedia = vi.fn()
const mockUpdateSocialMedia = vi.fn()
const mockDeleteSocialMedia = vi.fn()
const mockListSocialMedia = vi.fn()

vi.mock('@/lib/api', () => ({
  apiClient: {
    createSocialMedia: (...args: any[]) => mockCreateSocialMedia(...args),
    updateSocialMedia: (...args: any[]) => mockUpdateSocialMedia(...args),
    deleteSocialMedia: (...args: any[]) => mockDeleteSocialMedia(...args),
    listSocialMedia: (...args: any[]) => mockListSocialMedia(...args),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/talent/social-media',
}))

vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({
    user: { id: 'talent-1', name: 'Talent User', email: 'talent@test.com', role: 'talent' },
    isLoading: false,
    logout: vi.fn(),
  }),
}))

describe('SocialMediaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListSocialMedia.mockResolvedValue({
      success: true,
      data: [
        { id: 'sm-1', talent_id: 'talent-1', platform: 'instagram', username: '@talent' },
      ],
    })
    mockCreateSocialMedia.mockResolvedValue({ success: true, data: { id: 'sm-2' } })
    mockDeleteSocialMedia.mockResolvedValue({ success: true })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('renders page with social media accounts', async () => {
    render(<SocialMediaPage />)

    expect(await screen.findByText('My Social Media Accounts')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('@talent')).toBeInTheDocument()
  })

  it('calls apiClient.createSocialMedia when adding an account', async () => {
    render(<SocialMediaPage />)

    await screen.findByText('Instagram')

    await userEvent.click(screen.getByRole('button', { name: /add account/i }))

    await userEvent.selectOptions(screen.getByLabelText('Platform'), 'tiktok')
    await userEvent.type(screen.getByLabelText('Username'), '@newaccount')

    await userEvent.click(screen.getByRole('button', { name: /^add$/i }))

    await waitFor(() => {
      expect(mockCreateSocialMedia).toHaveBeenCalledWith('talent-1', {
        platform: 'tiktok',
        username: '@newaccount',
        url: '',
      })
    })
  })

  it('calls apiClient.deleteSocialMedia with confirmation', async () => {
    render(<SocialMediaPage />)

    await screen.findByText('Instagram')

    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i })
    await userEvent.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalled()

    await waitFor(() => {
      expect(mockDeleteSocialMedia).toHaveBeenCalledWith('sm-1')
    })
  })
})
