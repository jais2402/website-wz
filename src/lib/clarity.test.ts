import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Microsoft Clarity', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    document.head.querySelectorAll('script[data-wz-clarity]').forEach((s) => s.remove())
    delete window.clarity
  })
  afterEach(() => localStorage.clear())

  it('uses the explicit setting first, else the Wezigns project on production and preview deployments', async () => {
    const { resolveClarityId, CLARITY_PROJECT, validClarityId } = await import('./clarity')
    expect(CLARITY_PROJECT).toBe('z80jzy0skf')
    expect(validClarityId(CLARITY_PROJECT)).toBe(true)
    expect(validClarityId('x"><script>')).toBe(false)
    expect(resolveClarityId('abc123xyz', 'production')).toBe('abc123xyz')
    expect(resolveClarityId('', 'production')).toBe('z80jzy0skf')
    expect(resolveClarityId('', 'preview')).toBe('z80jzy0skf')
    expect(resolveClarityId('', '')).toBe('')
  })

  it('loads nothing before consent, then the tag once the visitor accepts', async () => {
    const { initClarity } = await import('./clarity')
    const { setConsent } = await import('./consent')
    initClarity('z80jzy0skf')
    expect(document.querySelector('script[data-wz-clarity]')).toBeNull()
    setConsent(true)
    const s = document.querySelector<HTMLScriptElement>('script[data-wz-clarity]')
    expect(s?.src).toBe('https://www.clarity.ms/tag/z80jzy0skf')
  })

  it('stops Clarity and deletes its cookies when consent is withdrawn', async () => {
    const { initClarity, isClarityCookie } = await import('./clarity')
    const { setConsent } = await import('./consent')
    initClarity('z80jzy0skf')
    setConsent(true)
    const calls: unknown[][] = []
    window.clarity = Object.assign((...a: unknown[]) => calls.push(a), { q: [] })
    document.cookie = '_clck=abc; path=/'
    setConsent(false)
    expect(calls).toContainEqual(['consent', false])
    expect(document.cookie).not.toContain('_clck=abc')
    expect(isClarityCookie('_clsk')).toBe(true)
    expect(isClarityCookie('_ga')).toBe(false)
  })
})
