// src/App.jsx
import React, { useState, useEffect } from 'react'; // <-- MODIFIÉ ICI
import { Routes, Route } from 'react-router-dom';

// 1. On importe la liste des routes
import { appRoutes } from './routeConfig.jsx'; 

// On importe le layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TestModeModal from './components/TestModeModal'; // 2. IMPORTER LE MODAL
import { Analytics } from '@vercel/analytics/react';
// On importe les CSS
import './App.css'; 
// On importe le CSS des pages légales (car il n'est plus importé par elles)
import './pages/LegalPage.css';

function App() {
  // 3. Logique pour gérer l'ouverture du modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 4. Ce hook se lance UNE SEULE FOIS au chargement
  useEffect(() => {
    // On l'ouvre au démarrage
    setIsModalOpen(true);
  }, []); // Le tableau vide [] signifie "ne s'exécute qu'une fois"
  return (
    <div className="App">
      <TestModeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
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
      <Analytics />
    </div>
  );
}

export default App;