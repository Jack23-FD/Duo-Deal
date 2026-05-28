import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Clear any old mock data from browser localStorage on startup
localStorage.removeItem('duo_deals_challenges');
localStorage.removeItem('duo_deals_normal_tasks');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
