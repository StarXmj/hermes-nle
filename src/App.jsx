// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { appRoutes } from './routeConfig.jsx'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TestModeModal from './components/TestModeModal';
import { Analytics } from '@vercel/analytics/react';
import './App.css'; 
import './pages/LegalPage.css';
import AutoLogout from './components/AutoLogout'; // <--- 1. IMPORTER ICI
import CookieConsent from './components/CookieConsent'; // <--- 1. IMPORTER

// --- NOUVEAU : Fonction pour créer les routes ---
// Cette fonction sait lire les routes "enfants" (children)
const createRoutes = (routes) => {
  return routes.map((route, index) => {
    if (route.children) {
      // C'est une route "parente" (comme ProtectedRoute)
      return (
        <Route key={index} element={route.element}>
          {/* On crée les routes enfants récursivement */}
          {createRoutes(route.children)} 
        </Route>
      );
    }
    // C'est une route simple
    return (
      <Route 
        key={index} 
        path={route.path} 
        element={route.element} 
      />
    );
  });
};
// --- FIN DE LA NOUVELLE FONCTION ---

function App() {
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <div className="App">
      <AutoLogout />
     
      <Navbar />

      <Routes>
        {/* On utilise notre nouvelle fonction pour créer les routes */}
        {createRoutes(appRoutes)}
      </Routes>

      <Footer />
      <Analytics />
      <CookieConsent />
    </div>
  );
}

export default App;