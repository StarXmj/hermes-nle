// src/App.jsx
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { appRoutes } from './routeConfig.jsx'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AutoLogout from './components/AutoLogout';
import CookieConsent from './components/CookieConsent';
import RouteTracker from './components/RouteTracker';
import './App.css'; 
import './pages/LegalPage.css';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Snowfall from 'react-snowfall';
import { THEMES } from './data/themes'; 
import InstallPWA from './components/InstallPWA'; 
import LoadingSpinner from './components/LoadingSpinner';
import MobileGameManager from './components/MobileGameManager';

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
  const location = useLocation();

  const isGameMode = ['/host', '/join', '/lobby', '/multiplayer-run'].includes(location.pathname);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });

    const fetchTheme = async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'current_theme').single();
      if (data) setActiveThemeId(data.value);
    };
    fetchTheme();

    const channel = supabase
      .channel('theme_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.new.key === 'current_theme') setActiveThemeId(payload.new.value);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const currentThemeConfig = THEMES[activeThemeId] || THEMES['default'];

  return (
    /* On utilise min-h-screen pour que le fond sombre couvre toute la page */
    <div className={`App min-h-screen ${currentThemeConfig.className}`}>
      <Toaster position="top-center" toastOptions={{ 
        duration: 4000, 
        style: { background: '#333', color: '#fff' }
      }} />
      <RouteTracker />
      <AutoLogout />
      <MobileGameManager />

      {/* Décors */}
      {currentThemeConfig.elements.snow && (
        <Snowfall 
          color={currentThemeConfig.elements.snowColor || '#fff'} 
          snowflakeCount={150} 
          style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 9998, pointerEvents: 'none' }} 
        />
      )}
      {!isGameMode && currentThemeConfig.elements.garland && (
        <div className="christmas-garland" style={{ backgroundImage: `url('${currentThemeConfig.elements.garlandImg}')` }}></div>
      )}
      {!isGameMode && currentThemeConfig.elements.santa && (
        <div className="santa-container">
          <img src={currentThemeConfig.elements.santaImg} alt="Père Noël" className="santa-sleigh" />
        </div>
      )}

      {!isGameMode && <Navbar />}

      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>{createRoutes(appRoutes)}</Routes>
        </Suspense>
      </main>

      <InstallPWA />
      
      {!isGameMode && <Footer />}
      
      <CookieConsent />
    </div>
  );
}

export default App;