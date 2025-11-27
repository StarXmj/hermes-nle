// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { appRoutes } from './routeConfig.jsx'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AutoLogout from './components/AutoLogout';
import CookieConsent from './components/CookieConsent';
import RouteTracker from './components/RouteTracker';
import './App.css'; 
import './pages/LegalPage.css';

// Imports Animation & Noël
import AOS from 'aos';
import 'aos/dist/aos.css';
import Snowfall from 'react-snowfall'; // 1. Import Neige

const createRoutes = (routes) => {
  return routes.map((route, index) => {
    if (route.children) {
      return (
        <Route key={index} element={route.element}>
          {createRoutes(route.children)} 
        </Route>
      );
    }
    return (
      <Route key={index} path={route.path} element={route.element} />
    );
  });
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 3. État pour la neige (activé par défaut en période de fêtes ?)
  // Ici je le mets à false par défaut, l'utilisateur clique pour activer.
  // Si vous voulez que ça neige direct, mettez useState(true).
  const [isChristmasMode, setIsChristmasMode] = useState(false);

  useEffect(() => {
    setIsModalOpen(true);
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      offset: 100,
    });
  }, []);

  return (
    <div className="App">
      <div className={`App ${isChristmasMode ? 'christmas-mode' : ''}`}></div>
      <RouteTracker />
      <AutoLogout />
      
      {/* 4. LA NEIGE (Conditionnelle) */}
      {isChristmasMode && (
        <Snowfall 
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            zIndex: 9999, // Au dessus de tout
            pointerEvents: 'none' // Important : permet de cliquer au travers !
          }}
          snowflakeCount={150} // Nombre de flocons
        />
      )}

      <Navbar />

      <Routes>
        {createRoutes(appRoutes)}
      </Routes>

      {/* 5. LE SAPIN INTERACTIF */}
      

      <Footer />
      <CookieConsent />
    </div>
  );
}

export default App;