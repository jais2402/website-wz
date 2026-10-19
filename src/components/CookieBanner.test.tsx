import { act, fireEvent, render, screen } from '@testing-library/react'

async function load(id: string) {
  vi.resetModules()
  vi.stubEnv('VITE_GA_MEASUREMENT_ID', id)
  const { CookieBanner, CookieSettingsButton } = await import('./CookieBanner')
  const consent = await import('@/lib/consent')
  return { CookieBanner, CookieSettingsButton, ...consent }
}

describe('CookieBanner', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllEnvs())

  it('renders nothing without a GA ID', async () => {
    const { CookieBanner, CookieSettingsButton } = await load('')
    render(
      <>
        <CookieBanner />
        <CookieSettingsButton />
      </>,
    )
    expect(screen.queryByRole('region', { name: 'Cookie consent' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cookie settings' })).toBeNull()
  })

  it('waits for ready, stores the choice and reopens from Cookie settings', async () => {
    const { CookieBanner, CookieSettingsButton, getConsent } = await load('G-TEST123')
    const { rerender } = render(
      <>
        <CookieBanner ready={false} />
        <CookieSettingsButton />
      </>,
    )
    expect(screen.queryByRole('region', { name: 'Cookie consent' })).toBeNull()
    rerender(
      <>
        <CookieBanner ready />
        <CookieSettingsButton />
      </>,
    )
    const region = screen.getByRole('region', { name: 'Cookie consent' })
    // Escape is not an answer.
    fireEvent.keyDown(region, { key: 'Escape' })
    expect(screen.getByRole('region', { name: 'Cookie consent' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
    expect(getConsent()?.analytics).toBe(false)
    expect(screen.queryByRole('region', { name: 'Cookie consent' })).toBeNull()

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Cookie settings' }))
    })
    expect(screen.getByText('Analytics is off.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }))
    expect(getConsent()?.analytics).toBe(true)
  })
})
