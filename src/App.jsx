// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { appRoutes } from './routeConfig.jsx'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TestModeModal from './components/TestModeModal';
import AutoLogout from './components/AutoLogout';
import CookieConsent from './components/CookieConsent';
import RouteTracker from './components/RouteTracker'; // <--- 1. Import du Tracker
import './App.css'; 
import './pages/LegalPage.css';

// (On a supprimé l'import @vercel/analytics)

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
      <Route 
        key={index} 
        path={route.path} 
        element={route.element} 
      />
    );
  });
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <div className="App">
      {/* 2. Tracker Google Analytics (invisible) */}
      <RouteTracker />

      <AutoLogout />
      <TestModeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <Navbar />

      <Routes>
        {createRoutes(appRoutes)}
      </Routes>

      <Footer />
      
      {/* 3. Bannière Cookies (qui initialise GA) */}
      <CookieConsent />
    </div>
  );
}

export default App;