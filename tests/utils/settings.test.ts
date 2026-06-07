import { beforeEach, describe, expect, it } from 'vitest'
import { loadSettings, saveSettings } from '../../src/utils/settings'

// ─── localStorage mock ──────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

const DEFAULTS = {
  theme: 'light',
  markdownEnabled: true,
  layout: '2panes',
  sidebarCollapsed: false,
}

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('loadSettings', () => {
  beforeEach(() => localStorageMock.clear())

  it('returns defaults when key is missing', () => {
    expect(loadSettings()).toEqual(DEFAULTS)
  })

  it('returns saved valid settings', () => {
    localStorageMock.setItem(
      'agent-studio-settings',
      JSON.stringify({
        theme: 'dark',
        markdownEnabled: false,
        layout: '3panes',
        sidebarCollapsed: true,
      })
    )
    expect(loadSettings()).toEqual({
      theme: 'dark',
      markdownEnabled: false,
      layout: '3panes',
      sidebarCollapsed: true,
    })
  })

  it('returns defaults for corrupt JSON', () => {
    localStorageMock.setItem('agent-studio-settings', 'not-json{{{')
    expect(loadSettings()).toEqual(DEFAULTS)
  })

  it('fills missing fields with defaults (partial object)', () => {
    localStorageMock.setItem('agent-studio-settings', JSON.stringify({}))
    expect(loadSettings()).toEqual(DEFAULTS)
  })

  it('rejects an invalid theme value and returns defaults', () => {
    localStorageMock.setItem('agent-studio-settings', JSON.stringify({ theme: 'solarized' }))
    expect(loadSettings()).toEqual(DEFAULTS)
  })

  it('fills markdownEnabled default when only theme is saved', () => {
    localStorageMock.setItem('agent-studio-settings', JSON.stringify({ theme: 'dark' }))
    expect(loadSettings()).toEqual({
      theme: 'dark',
      markdownEnabled: true,
      layout: '2panes',
      sidebarCollapsed: false,
    })
  })
})

describe('saveSettings', () => {
  beforeEach(() => localStorageMock.clear())

  it('persists settings as JSON', () => {
    saveSettings({
      theme: 'dark',
      markdownEnabled: false,
      layout: '3panes',
      sidebarCollapsed: true,
    })
    expect(localStorageMock.getItem('agent-studio-settings')).toBe(
      JSON.stringify({
        theme: 'dark',
        markdownEnabled: false,
        layout: '3panes',
        sidebarCollapsed: true,
      })
    )
  })

  it('round-trips: save then load returns same value', () => {
    saveSettings({
      theme: 'dark',
      markdownEnabled: false,
      layout: '3panes',
      sidebarCollapsed: true,
    })
    expect(loadSettings()).toEqual({
      theme: 'dark',
      markdownEnabled: false,
      layout: '3panes',
      sidebarCollapsed: true,
    })
  })
})
