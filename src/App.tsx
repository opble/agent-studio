import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Auth0Provider from './auth/Auth0Provider'
import ProtectedRoute from './auth/ProtectedRoute'
import Layout from './components/Layout'
import { SettingsProvider } from './contexts/SettingsContext'
import AgentsPage from './pages/AgentsPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import WorkflowRunPage from './pages/WorkflowRunPage'
import WorkflowsPage from './pages/WorkflowsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Auth0Provider>
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
                <Route index element={<Navigate to="/agents" replace />} />
                <Route path="agents/*" element={<AgentsPage />} />
                <Route path="workflows" element={<WorkflowsPage />} />
                <Route path="workflows/:workflowId/runs/:runId" element={<WorkflowRunPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/agents" replace />} />
              </Route>
            </Routes>
          </Auth0Provider>
        </BrowserRouter>
      </SettingsProvider>
    </QueryClientProvider>
  )
}
