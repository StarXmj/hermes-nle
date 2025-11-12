// src/components/PartnerCard.jsx
import React from 'react';
import './PartnerCardList.css'; 
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa'; 

function PartnerCardList({ partenaire }) {
  return (
    // On utilise un layout "photo à gauche, texte à droite"
    <div className="partner-card">
      
      {/* 1. Colonne de gauche (Logo) */}
      <div className="partner-logo-container">
        <img src={partenaire.logo} alt={`Logo de ${partenaire.nom}`} className="partner-logo" />
      </div>
      
      {/* 2. Colonne de droite (Infos) */}
      <div className="partner-content">
        <h3>{partenaire.nom}</h3>
        <p>{partenaire.description}</p>
        
        {/* 3. Les liens sont maintenant TOUJOURS visibles */}
        <div className="partner-links-visible">
          <a 
            href={partenaire.lienAdresse} 
            className="partner-link" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <FaMapMarkerAlt size={12} /> Google Maps
          </a>

          <a 
            href={partenaire.lienSite} 
            className="partner-link" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <FaExternalLinkAlt size={12} /> Voir le site
          </a>
        </div>
      </div>
    </div>
  );
}

export default PartnerCardList;