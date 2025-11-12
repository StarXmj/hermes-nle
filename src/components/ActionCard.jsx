// src/components/ActionCard.jsx
import React from 'react';
// On importe l'icône "À venir"
import { FaCalendarAlt, FaMapMarkerAlt, FaExternalLinkAlt, FaBell } from 'react-icons/fa';
import './ActionCard.css';

// 1. On accepte les nouvelles props : status, isUpcoming
function ActionCard({ action, status, isUpcoming }) {
  
  // 2. On définit la classe CSS en fonction du statut
  const cardClasses = `action-card ${status === 'past' ? 'past-action' : ''}`;

  return (
    <div className={cardClasses}> {/* On utilise la variable de classe */}
      
      {/* 3. On affiche le badge si 'isUpcoming' est true */}
      {isUpcoming && (
        <div className="upcoming-badge">
          <FaBell size={12} /> À venir
        </div>
      )}

      <h3>{action.titre}</h3>
      
      <div className="action-details">
        {/* ... (le reste de la carte ne change pas) ... */}
        <div className="action-detail-item">
          <FaCalendarAlt className="action-icon" /> 
          <span>{action.infoPratique}</span>
        </div>
        
        <a 
          href={action.lienLieu}
          target="_blank" 
          rel="noopener noreferrer"
          className="action-detail-item location-link"
        >
          <FaMapMarkerAlt className="action-icon" /> 
          <span>{action.lieu}</span>
        </a>
      </div>

      <p className="action-desc">{action.description}</p>
      
      <a 
        href={action.lienProgramme} 
        className="action-program-link"
        target="_blank" 
        rel="noopener noreferrer"
      >
        Voir le programme <FaExternalLinkAlt size={12} />
      </a>
    </div>
  );
}

export default ActionCard;