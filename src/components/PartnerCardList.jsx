// src/components/PartnerCardList.jsx
import React from 'react';
import './PartnerCardList.css'; 
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
// IMPORT UTILS
import { getOptimizedImageUrl } from '../utils';

function PartnerCardList({ partenaire }) {
  // Optimisation du logo (300px de large max)
  const optimizedLogo = getOptimizedImageUrl(partenaire.logo, 300);

  return (
    <div className="partner-card" data-aos="zoom-in">
      
      <div className="partner-logo-container">
        <img 
          src={optimizedLogo} 
          alt={`Logo de ${partenaire.nom}`} 
          className="partner-logo" 
          loading="lazy" 
        />
      </div>
      
      <div className="partner-content">
        <h3>{partenaire.nom}</h3>
        <p>{partenaire.description}</p>
        <br/><br/>
        {partenaire.histoire && (
            <p className="partner-history">
                {partenaire.histoire}
            </p>
        )}<br/>
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