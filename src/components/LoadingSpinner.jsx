// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh', // Prend la moitié de l'écran
      color: '#003366',
      fontSize: '1.2rem',
      fontWeight: '500'
    }}>
      <div className="spinner">Chargement...</div>
      {/* Vous pourrez ajouter une animation CSS ici plus tard */}
    </div>
  );
};

export default LoadingSpinner;