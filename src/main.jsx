import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: 'font-vietnam',
        }}
      />
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
