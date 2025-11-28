// src/components/PartnerCardGrid.jsx
import React from 'react';
import './PartnerCardGrid.css'; 
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa'; 
// 1. Import de l'utilitaire d'optimisation
import { getOptimizedImageUrl } from '../utils';

function PartnerCardGrid({ partenaire }) {
  // 2. On optimise l'URL du logo (300px est suffisant pour la grille)
  const optimizedLogo = getOptimizedImageUrl(partenaire.logo, 300);

  return (
    <div className="partner-card-grid" data-aos="zoom-in">
      <div className="partner-logo-container">
        {/* 3. On utilise la version optimisée */}
        <img 
          src={optimizedLogo} 
          alt={partenaire.nom} 
          className="partner-logo" 
          loading="lazy"
        />
      </div>
      <div className="partner-content">
        <h3>{partenaire.nom}</h3>
        <p>{partenaire.description}</p>
        <div className="partner-hover-links">
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
export default PartnerCardGrid;