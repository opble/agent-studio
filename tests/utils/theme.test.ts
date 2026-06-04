import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getSavedTheme, saveTheme, applyTheme, toggleTheme } from '../../src/utils/theme'

// ─── localStorage mock ──────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// ─── document.documentElement mock ─────────────────────────────────────────
const classList = { add: vi.fn(), remove: vi.fn() }
Object.defineProperty(document, 'documentElement', {
  value: { classList },
  writable: true,
})

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('getSavedTheme', () => {
  beforeEach(() => localStorageMock.clear())

  it('returns "light" when nothing is saved', () => {
    expect(getSavedTheme()).toBe('light')
  })

  it('returns "dark" when "dark" is saved', () => {
    localStorageMock.setItem('agent-studio-theme', 'dark')
    expect(getSavedTheme()).toBe('dark')
  })

  it('returns "light" for an unrecognised saved value', () => {
    localStorageMock.setItem('agent-studio-theme', 'solarized')
    expect(getSavedTheme()).toBe('light')
  })
})

describe('saveTheme', () => {
  beforeEach(() => localStorageMock.clear())

  it('persists the theme value', () => {
    saveTheme('dark')
    expect(localStorageMock.getItem('agent-studio-theme')).toBe('dark')
  })
})

describe('applyTheme', () => {
  beforeEach(() => { classList.add.mockClear(); classList.remove.mockClear() })

  it('adds "dark" class for dark theme', () => {
    applyTheme('dark')
    expect(classList.add).toHaveBeenCalledWith('dark')
    expect(classList.remove).not.toHaveBeenCalled()
  })

  it('removes "dark" class for light theme', () => {
    applyTheme('light')
    expect(classList.remove).toHaveBeenCalledWith('dark')
    expect(classList.add).not.toHaveBeenCalled()
  })
})

describe('toggleTheme', () => {
  it('toggles light → dark', () => {
    expect(toggleTheme('light')).toBe('dark')
  })

  it('toggles dark → light', () => {
    expect(toggleTheme('dark')).toBe('light')
  })
})
