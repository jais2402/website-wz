import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { firstName } from '@/lib/enquiry'
import { EnquirySent } from './EnquiryForm'

describe('firstName', () => {
  it('tidies a name typed in one case and keeps mixed case as typed', () => {
    expect(firstName('JAIS')).toBe('Jais')
    expect(firstName('asha rao')).toBe('Asha')
    expect(firstName('McKenzie Smith')).toBe('McKenzie')
    expect(firstName('   ')).toBe('there')
  })
})

describe('EnquirySent', () => {
  it('says the message reached us, with the next steps', () => {
    render(<EnquirySent name="JAIS" via="endpoint" onReset={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Thanks, Jais. Your message is with us.' })).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
  it('is masked in Clarity replays, since it shows the visitor\'s name', () => {
    render(<EnquirySent name="Jais" via="endpoint" onReset={vi.fn()} />)
    expect(screen.getByRole('status').getAttribute('data-clarity-mask')).toBe('true')
  })
  it('asks the visitor to press Send when the email app took over, with email and phone as a fallback', () => {
    render(<EnquirySent name="Jais" via="mailto" onReset={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Almost there, Jais.' })).toBeTruthy()
    expect(screen.getByText(/Press Send there/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'contact@wezigns.com' }).getAttribute('href')).toBe('mailto:contact@wezigns.com')
  })
})
