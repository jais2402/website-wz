import { cleanPath, inSection, isCurrentPage } from './navCurrent'

describe('navCurrent', () => {
  it('treats .html, trailing slashes and clean URLs as one page', () => {
    expect(cleanPath('/systems/people.html')).toBe('/systems/people')
    expect(cleanPath('/about/')).toBe('/about')
    expect(cleanPath('/index.html')).toBe('/')
    expect(cleanPath('/')).toBe('/')
  })

  it('matches page links to the current page only', () => {
    expect(isCurrentPage('/about.html', '/about')).toBe(true)
    expect(isCurrentPage('/ai', '/about')).toBe(false)
    expect(isCurrentPage('/technology', '/technology?x=1')).toBe(true)
  })

  it('never marks in-page anchors as current', () => {
    expect(isCurrentPage('/', '#work')).toBe(false)
    expect(isCurrentPage('/about', '/#work')).toBe(false)
  })

  it('knows when a page belongs to a section', () => {
    expect(inSection('/systems/finance.html', '/systems/')).toBe(true)
    expect(inSection('/about', '/systems/')).toBe(false)
  })
})
