import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SentText from './SentText.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SentText />
  </StrictMode>,
)
