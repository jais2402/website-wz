import { Component, type ReactNode } from 'react'

/**
 * Wraps each page section so a runtime error in one section hides only that section, never the whole page.
 * Logs the error so it still shows up in the console.
 */
export class SectionBoundary extends Component<{ children: ReactNode; name?: string }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error(`[wezigns] section "${this.props.name ?? 'unknown'}" failed`, error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
