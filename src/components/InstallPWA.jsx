import React, { useEffect, useState } from 'react';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // Empêcher la mini-infobar standard sur mobile
      setSupportsPWA(true);
      setPromptInstall(e); // Sauvegarder l'événement pour plus tard
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt(); // Afficher la demande d'installation
  };

  if (!supportsPWA) {
    return null; // Ne rien afficher si pas installable (déjà installé ou pas compatible)
  }

  return (
    <button
      className="install-button" // Ajoutez votre classe CSS ici
      id="setup_button"
      aria-label="Installer l'application"
      title="Installer l'application"
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}
    >
      Télécharger l'App
    </button>
  );
};

export default InstallPWA;