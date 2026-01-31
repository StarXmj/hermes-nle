// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async';

// --- LE MOUCHARD D'ERREUR (INDISPENSABLE POUR LE MOBILE) ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CRASH MOBILE:", error, errorInfo);
    this.state.errorInfo = errorInfo;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '20px', backgroundColor: 'black', color: 'red', height: '100vh', overflow: 'auto', zIndex: 99999, position: 'relative'}}>
          <h1>⚠️ CRASH DÉTECTÉ</h1>
          <h3 style={{color: 'white'}}>Erreur :</h3>
          <pre style={{whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px'}}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <h3 style={{color: 'white'}}>Détails :</h3>
          <pre style={{fontSize: '10px', color: '#ccc'}}>
             {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary> {/* On enveloppe tout ici */}
      <HelmetProvider>

        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)