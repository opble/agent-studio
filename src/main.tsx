import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { loadSettings } from './utils/settings'
import { applyTheme } from './utils/theme'

// Apply saved theme before first paint to avoid flash
applyTheme(loadSettings().theme)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
