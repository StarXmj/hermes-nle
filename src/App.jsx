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
import HeartRain from './components/HeartRain';
import CupidAnimation from './components/CupidAnimation';

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
  // On commence par défaut pour ne pas spoiler l'effet
  const [activeThemeId, setActiveThemeId] = useState('default');
  const [showCupid, setShowCupid] = useState(false);
  
  // On stocke le thème réel de la BDD
  const [targetTheme, setTargetTheme] = useState('default');

  const location = useLocation();
  const isGameMode = ['/host', '/join', '/lobby', '/multiplayer-run'].includes(location.pathname);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 100 });

    const fetchTheme = async () => {
      const { data } = await supabase.from('settings').select('current_theme').single();
      
      if (data) {
        const dbTheme = data.current_theme;

        if (dbTheme === 'valentine') {
            // ✅ CONDITION AJOUTÉE : 
            // 1. Être sur la Home Page ('/') 
            // 2. Ne pas avoir déjà vu l'anim (optionnel si vous voulez le garder)
            const isHomePage = location.pathname === '/';

            // Pour tester "à chaque fois", on retire la verif localStorage ici
            // Si vous voulez remettre la sécurité "une seule fois", décommentez le localStorage plus tard
            if (isHomePage) {
                console.log("💘 Home Page détectée : Lancement Cupidon !");
                setActiveThemeId('default'); 
                setShowCupid(true);
            } else {
                // Si on est sur /about, /contact, etc. -> On met le thème rose direct, sans animation
                console.log("🌹 Autre page : Thème Valentine sans animation.");
                setActiveThemeId('valentine');
            }
        } else {
            setActiveThemeId(dbTheme);
        }
      }
    };
    fetchTheme();

    // Écoute Temps Réel
    const channel = supabase
      .channel('theme_changes')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'settings' }, 
          (payload) => {
            if (payload.new && payload.new.current_theme) {
               console.log("🔔 Changement LIVE détecté :", payload.new.current_theme);
               // Si l'admin change en direct, on applique directement pour que tout le monde le voie
               setActiveThemeId(payload.new.current_theme);
            }
          }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // --- CALLBACK DÉCLENCHÉ AU "BOUM" ---
  const handleCupidImpact = () => {
      console.log("💥 IMPACT ! Passage au thème Valentine.");
      setActiveThemeId('valentine');
  };

  const handleCupidDone = () => {
      setShowCupid(false);
      localStorage.setItem('hasSeenCupid_v1', 'true');
  };

  const currentThemeConfig = THEMES[activeThemeId] || THEMES['default'];

  return (
    <div className={`App min-h-screen ${currentThemeConfig.className || ''}`}>
      <Toaster position="top-center" toastOptions={{ 
        duration: 4000, 
        style: { background: '#333', color: '#fff' }
      }} />
      <RouteTracker />
      <AutoLogout />
      <MobileGameManager />

      {/* --- DÉCORS ET EFFETS --- */}
      
      {/* 1. Neige (Noël) */}
      {currentThemeConfig.elements?.snow && (
        <Snowfall 
          color={currentThemeConfig.elements.snowColor || '#fff'} 
          snowflakeCount={150} 
          style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 9998, pointerEvents: 'none' }} 
        />
      )}

      {/* 2. Pluie de Cœurs (Saint Valentin) */}
      {currentThemeConfig.elements?.hearts && (
        <HeartRain />
      )}

      {/* 3. Animation Cupidon (Saint Valentin - Intro) */}
      {showCupid && (
          <CupidAnimation 
            onImpact={handleCupidImpact}   // DÉCLENCHE LE CHANGEMENT DE COULEUR
            onComplete={handleCupidDone}   // NETTOIE L'ANIMATION À LA FIN
          />
      )}

      {/* 4. Guirlandes (Noël) */}
      {!isGameMode && currentThemeConfig.elements?.garland && (
        <div className="christmas-garland" style={{ backgroundImage: `url('${currentThemeConfig.elements.garlandImg}')` }}></div>
      )}

      {/* 5. Traîneau (Noël) */}
      {!isGameMode && currentThemeConfig.elements?.santa && (
        <div className="santa-container">
          <img src={currentThemeConfig.elements.santaImg} alt="Père Noël" className="santa-sleigh" />
        </div>
      )}

      {/* --- NAVIGATION & CONTENU --- */}

{!isGameMode && <Navbar activeTheme={activeThemeId} />}
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