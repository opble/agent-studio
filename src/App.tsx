import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Auth0Provider from './auth/Auth0Provider'
import ProtectedRoute from './auth/ProtectedRoute'
import Layout from './components/Layout'
import { SettingsProvider, useSettings } from './contexts/SettingsContext'
import AgentsPage from './pages/AgentsPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import WorkflowRunPage from './pages/WorkflowRunPage'
import WorkflowsPage from './pages/WorkflowsPage'
import ReactQueryProvider from './providers/ReactQueryProvider'

/** Redirects to the correct default page based on the user's Focus setting. */
function DefaultRedirect() {
  const { settings } = useSettings()
  const to = settings.focus === 'agent' ? '/agents' : '/workflows'
  return <Navigate to={to} replace />
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Auth0Provider must be inside BrowserRouter (it uses useNavigate) */}
      <Auth0Provider>
        {/* ReactQueryProvider must be inside Auth0Provider so QueryCache
            error handler can call logout() on 401 responses */}
        <ReactQueryProvider>
          <SettingsProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected — wrapped in Layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DefaultRedirect />} />
                <Route path="agents/*" element={<AgentsPage />} />
                <Route path="workflows" element={<WorkflowsPage />} />
                <Route path="workflows/:workflowId/runs/:runId" element={<WorkflowRunPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<DefaultRedirect />} />
              </Route>
            </Routes>
          </SettingsProvider>
        </ReactQueryProvider>
      </Auth0Provider>
    </BrowserRouter>
  )
}
