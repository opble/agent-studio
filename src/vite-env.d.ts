/// <reference types="vite/client" />

declare const __APP_VERSION__: string
declare const __COMMIT_HASH__: string

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN: string
  readonly VITE_AUTH0_CLIENT_ID: string
  readonly VITE_AUTH0_AUDIENCE: string
  readonly VITE_MASTRA_API_URL: string
  readonly VITE_AUTH0_CACHE_LOCATION?: 'memory' | 'localstorage'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
