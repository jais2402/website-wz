import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(cleanup);

/**
 * jsdom implements neither of these. Both are stubbed rather than mocked per
 * test, so a component that reaches for them degrades the way it does in a
 * browser that lacks the feature.
 *
 * matchMedia reports `false` by default, which puts responsive components in
 * their below-lg mode — every sequence open, nothing sticky, no hover
 * dependency. That is deliberately the path unit tests exercise, because it is
 * the one ~45% of visitors get.
 */
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

if (!('IntersectionObserver' in window)) {
  class StubIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds: ReadonlyArray<number> = [];
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: StubIntersectionObserver,
  });
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: StubIntersectionObserver,
  });
}
