import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCacheLocation, getEnv } from '../../src/utils/env'

beforeEach(() => {
  vi.unstubAllEnvs()
  delete window.__ENV__
})

describe('getEnv', () => {
  it('returns the runtime value when window.__ENV__ key is set', () => {
    window.__ENV__ = { VITE_AUTH0_DOMAIN: 'runtime.auth0.com' }
    vi.stubEnv('VITE_AUTH0_DOMAIN', 'buildtime.auth0.com')
    expect(getEnv('VITE_AUTH0_DOMAIN')).toBe('runtime.auth0.com')
  })

  it('falls back to import.meta.env when window.__ENV__ key is absent', () => {
    window.__ENV__ = {}
    vi.stubEnv('VITE_AUTH0_DOMAIN', 'buildtime.auth0.com')
    expect(getEnv('VITE_AUTH0_DOMAIN')).toBe('buildtime.auth0.com')
  })

  it('falls back to import.meta.env when window.__ENV__ key is empty string', () => {
    window.__ENV__ = { VITE_AUTH0_DOMAIN: '' }
    vi.stubEnv('VITE_AUTH0_DOMAIN', 'buildtime.auth0.com')
    expect(getEnv('VITE_AUTH0_DOMAIN')).toBe('buildtime.auth0.com')
  })

  it('falls back to import.meta.env when window.__ENV__ is undefined', () => {
    vi.stubEnv('VITE_AUTH0_DOMAIN', 'buildtime.auth0.com')
    expect(getEnv('VITE_AUTH0_DOMAIN')).toBe('buildtime.auth0.com')
  })

  it('returns empty string when neither source has a value', () => {
    vi.stubEnv('VITE_AUTH0_DOMAIN', '')
    expect(getEnv('VITE_AUTH0_DOMAIN')).toBe('')
  })

  it('runtime VITE_MASTRA_API_URL takes precedence over build-time', () => {
    window.__ENV__ = { VITE_MASTRA_API_URL: 'https://prod.example.com' }
    vi.stubEnv('VITE_MASTRA_API_URL', 'https://dev.example.com')
    expect(getEnv('VITE_MASTRA_API_URL')).toBe('https://prod.example.com')
  })
})

describe('getCacheLocation', () => {
  it('returns "memory" by default when nothing is configured', () => {
    vi.stubEnv('VITE_AUTH0_CACHE_LOCATION', '')
    expect(getCacheLocation()).toBe('memory')
  })

  it('returns "localstorage" when runtime config is localstorage', () => {
    window.__ENV__ = { VITE_AUTH0_CACHE_LOCATION: 'localstorage' }
    expect(getCacheLocation()).toBe('localstorage')
  })

  it('returns "memory" when runtime config is memory', () => {
    window.__ENV__ = { VITE_AUTH0_CACHE_LOCATION: 'memory' }
    expect(getCacheLocation()).toBe('memory')
  })

  it('returns "memory" for unrecognised values', () => {
    window.__ENV__ = { VITE_AUTH0_CACHE_LOCATION: 'invalid' }
    expect(getCacheLocation()).toBe('memory')
  })

  it('falls back to import.meta.env when runtime key is empty string', () => {
    window.__ENV__ = { VITE_AUTH0_CACHE_LOCATION: '' }
    vi.stubEnv('VITE_AUTH0_CACHE_LOCATION', 'localstorage')
    expect(getCacheLocation()).toBe('localstorage')
  })
})
