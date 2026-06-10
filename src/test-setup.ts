import { afterEach, vi } from 'vitest';

// Theme state leaks between tests via localStorage and the <html> attribute.
afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
}
