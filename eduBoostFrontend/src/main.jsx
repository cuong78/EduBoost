import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/auth-context.jsx'

const savedTheme = localStorage.getItem('eduboost-theme');
const isDarkMode = savedTheme === 'dark';
document.body.classList.toggle('dark-mode', isDarkMode);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
