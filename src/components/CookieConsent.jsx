// src/components/CookieConsent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // On vérifie si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Si pas de trace, on affiche la bannière après un petit délai (effet visuel)
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
    // Ici, vous pourriez activer Google Analytics ou d'autres traceurs
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShowBanner(false);
    // Ici, on s'assure que rien n'est activé
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>
          🍪 Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic. 
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