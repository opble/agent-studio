import { Auth0Provider as BaseAuth0Provider } from '@auth0/auth0-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  children: ReactNode
}

/**
 * Wraps the app with Auth0 context.
 * All config is read from env vars — no secrets in source code.
 *
 * Required env vars:
 *   VITE_AUTH0_DOMAIN      e.g. your-tenant.auth0.com
 *   VITE_AUTH0_CLIENT_ID   SPA client ID
 *   VITE_AUTH0_AUDIENCE    API identifier, e.g. https://your-mastra-url/api
 */
export default function Auth0Provider({ children }: Props) {
  const navigate = useNavigate()

  return (
    <BaseAuth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      onRedirectCallback={(appState) => {
        // After Auth0 redirects back, go to the page the user originally wanted
        navigate(appState?.returnTo ?? '/', { replace: true })
      }}
      useRefreshTokens
      cacheLocation="memory"
    >
      {children}
    </BaseAuth0Provider>
  )
}
