import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from '../../src/utils/error'

describe('getApiErrorMessage', () => {
  it('returns permission message for 403 status', () => {
    const error = { status: 403 }
    expect(getApiErrorMessage(error)).toBe('You do not have permission to access this feature.')
  })

  it('returns fallback for non-403 status', () => {
    const error = { status: 500 }
    expect(getApiErrorMessage(error, 'Custom fallback')).toBe('Custom fallback')
  })

  it('returns fallback for non-object error', () => {
    expect(getApiErrorMessage(new Error('oops'), 'Custom fallback')).toBe('Custom fallback')
  })

  it('returns fallback for null', () => {
    expect(getApiErrorMessage(null, 'Custom fallback')).toBe('Custom fallback')
  })

  it('uses default fallback when none provided', () => {
    expect(getApiErrorMessage(null)).toBe(
      'Something went wrong. Check your Mastra server connection.'
    )
  })
})
