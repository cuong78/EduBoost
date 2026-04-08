import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/auth-context.jsx'
import { LanguageProvider } from './contexts/language-context.jsx'

const savedTheme = localStorage.getItem('eduboost-theme');
const isDarkMode = savedTheme === 'dark';
document.body.classList.toggle('dark-mode', isDarkMode);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
