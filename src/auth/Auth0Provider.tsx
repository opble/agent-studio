import { Auth0Provider as BaseAuth0Provider } from '@auth0/auth0-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCacheLocation, getEnv } from '../utils/env'

interface Props {
  children: ReactNode
}

/**
 * Wraps the app with Auth0 context.
 * Config is read at runtime from config.js (window.__ENV__),
 * falling back to import.meta.env for local dev.
 *
 * Required config keys:
 *   VITE_AUTH0_DOMAIN            e.g. your-tenant.auth0.com
 *   VITE_AUTH0_CLIENT_ID         SPA client ID
 *   VITE_AUTH0_AUDIENCE          API identifier, e.g. https://your-mastra-url/api
 *
 * Optional config keys:
 *   VITE_AUTH0_CACHE_LOCATION    'memory' (default) | 'localstorage'
 */
export default function Auth0Provider({ children }: Props) {
  const navigate = useNavigate()

  return (
    <BaseAuth0Provider
      domain={getEnv('VITE_AUTH0_DOMAIN')}
      clientId={getEnv('VITE_AUTH0_CLIENT_ID')}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: getEnv('VITE_AUTH0_AUDIENCE'),
      }}
      onRedirectCallback={appState => {
        // After Auth0 redirects back, go to the page the user originally wanted
        navigate(appState?.returnTo ?? '/', { replace: true })
      }}
      useRefreshTokens
      cacheLocation={getCacheLocation()}
    >
      {children}
    </BaseAuth0Provider>
  )
}
