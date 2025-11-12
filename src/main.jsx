// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'; // 1. IMPORTER

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. ENVELOPPER L'APPLICATION */}
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)