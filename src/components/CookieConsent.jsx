// src/components/CookieConsent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga4'; // 1. Import
import './CookieConsent.css';

// On récupère l'ID depuis le .env
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID;

function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  // Fonction d'initialisation
  const initGA = () => {
    if (GA_MEASUREMENT_ID) {
      ReactGA.initialize(GA_MEASUREMENT_ID);
      console.log("Google Analytics activé !");
    }
  };

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    
    if (consent === 'accepted') {
      // 2. Si déjà accepté par le passé, on lance GA tout de suite
      initGA();
    } else if (!consent) {
      // Sinon, on affiche la bannière
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
    // Si 'declined', on ne fait rien
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
    // 3. On lance GA au moment du clic
    initGA();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShowBanner(false);
    // On ne lance rien
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>
          🍪 Nous utilisons des cookies pour analyser le trafic (Google Analytics) et améliorer votre expérience.
          Pour en savoir plus, consultez notre <Link to="/politique-de-confidentialite">Politique de Confidentialité</Link>.
        </p>
      </div>
      <div className="cookie-buttons">
        <button onClick={handleDecline} className="cookie-btn decline">
          Refuser
        </button>
        <button onClick={handleAccept} className="cookie-btn accept">
          Accepter
        </button>
      </div>
    </div>
  );
}

export default CookieConsent;