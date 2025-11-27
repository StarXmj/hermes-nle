import React, { useState, useEffect, Suspense  } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { appRoutes } from './routeConfig.jsx'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AutoLogout from './components/AutoLogout';
import CookieConsent from './components/CookieConsent';
import RouteTracker from './components/RouteTracker';
import './App.css'; 
import './pages/LegalPage.css';

// Imports Animation & Decor
import AOS from 'aos';
import 'aos/dist/aos.css';
import Snowfall from 'react-snowfall';
import { THEMES } from './data/themes'; // Import de la config

import LoadingSpinner from './components/LoadingSpinner'; // 2. Importez votre spinner
// URL Image Père Noël (ou autre assets)
const SANTA_URL = "https://cdn-icons-png.flaticon.com/512/744/744546.png";

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
  const [activeThemeId, setActiveThemeId] = useState('default');

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });

    // 1. Charger le thème actif
    const fetchTheme = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'current_theme')
        .single();
      
      if (data) setActiveThemeId(data.value);
    };
    fetchTheme();

    // 2. Écouter les changements en direct
    const channel = supabase
      .channel('theme_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.new.key === 'current_theme') {
          setActiveThemeId(payload.new.value);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Récupérer l'objet de configuration complet basé sur l'ID
  const currentThemeConfig = THEMES[activeThemeId] || THEMES['default'];

  return (
    <div className={`App ${currentThemeConfig.className}`}>
      <RouteTracker />
      <AutoLogout />
      
      {/* --- GESTION DU DÉCOR --- */}
      
      {/* 1. Neige */}
      {currentThemeConfig.elements.snow && (
        <Snowfall 
          color={currentThemeConfig.elements.snowColor || '#fff'}
          snowflakeCount={150} // Un peu plus de neige
          style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 9998, pointerEvents: 'none' }}
        />
      )}

      {/* 2. Guirlande */}
      {currentThemeConfig.elements.garland && (
        <div 
          className="christmas-garland"
          style={{ 
            backgroundImage: `url('${currentThemeConfig.elements.garlandImg}')` 
          }}
        ></div>
      )}

      {/* 3. Père Noël */}
      {currentThemeConfig.elements.santa && (
        <div className="santa-container">
          <img 
            src={currentThemeConfig.elements.santaImg} 
            alt="Père Noël" 
            className="santa-sleigh" 
          />
        </div>
      )}

      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>{createRoutes(appRoutes)}</Routes>
      </Suspense>
      <Footer />
      <CookieConsent />
    </div>
  );
}

export default App;