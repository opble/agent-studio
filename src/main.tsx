import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { applyTheme, getSavedTheme } from './utils/theme'

// Apply saved theme before first paint to avoid flash
applyTheme(getSavedTheme())

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
