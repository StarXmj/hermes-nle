// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 1. On importe la liste des routes
import { appRoutes } from './routeConfig.jsx'; 

// On importe le layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// On importe les CSS
import './App.css'; 
// On importe le CSS des pages légales (car il n'est plus importé par elles)
import './pages/LegalPage.css';

function App() {
  return (
    <div className="App">
      <Navbar />

      <Routes>
        {/* 2. On génère les routes automatiquement ! */}
        {appRoutes.map((route, index) => (
          <Route 
            key={index} 
            path={route.path} 
            element={route.element} 
          />
        ))}
      </Routes>

      <Footer />
    </div>
  );
}

export default App;