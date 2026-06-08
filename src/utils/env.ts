/**
 * Runtime environment variable access.
 *
 * In production, values come from `window.__ENV__` (set by `config.js`,
 * which ships inside the dist zip for end-users to edit before deploying).
 *
 * In local dev, `config.js` has empty-string placeholders, so we fall back
 * to `import.meta.env` which Vite populates from `.env` files as usual.
 */

type EnvKey = keyof ImportMetaEnv

declare global {
  interface Window {
    __ENV__?: Partial<Record<EnvKey, string>>
  }
}

export function getEnv(key: EnvKey): string {
  // Only use the runtime value if it's actually set to a non-empty string.
  // Empty string means "not configured yet" (the default template state).
  const runtime = window.__ENV__?.[key]
  if (runtime !== undefined && runtime !== '') return runtime
  return (import.meta.env[key] as string | undefined) ?? ''
}

export function getCacheLocation(): 'memory' | 'localstorage' {
  return getEnv('VITE_AUTH0_CACHE_LOCATION') === 'localstorage' ? 'localstorage' : 'memory'
}
