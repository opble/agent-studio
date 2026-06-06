import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyTheme, toggleTheme } from '../../src/utils/theme'

// ─── document.documentElement mock ─────────────────────────────────────────
const classList = { add: vi.fn(), remove: vi.fn() }
Object.defineProperty(document, 'documentElement', {
  value: { classList },
  writable: true,
})

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('applyTheme', () => {
  beforeEach(() => {
    classList.add.mockClear()
    classList.remove.mockClear()
  })

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
