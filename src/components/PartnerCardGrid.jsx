// src/components/PartnerCardGrid.jsx
import React from 'react';
import './PartnerCardGrid.css'; 
import { FaMapMarkerAlt, FaGlobe, FaInfoCircle } from 'react-icons/fa'; 
import { getOptimizedImageUrl } from '../utils';

function PartnerCardGrid({ partenaire }) {
  const optimizedLogo = getOptimizedImageUrl(partenaire.logo, 400);

  return (
    <article className="partner-card-modern" data-aos="fade-up">
      {/* HEADER : LOGO */}
      <div className="partner-card-header">
        <div className="img-wrapper">
          <img 
            src={optimizedLogo} 
            alt={`Logo ${partenaire.nom}`} 
            className="partner-logo-img" 
            loading="lazy"
          />
        </div>
      </div>

      {/* BODY : CONTENU */}
      <div className="partner-card-body">
        <h3 className="partner-title">{partenaire.nom}</h3>
        
        {/* On affiche l'histoire, ou la description en fallback */}
        <p className="partner-history">
          {partenaire.histoire || partenaire.description || "Un partenaire de confiance pour les étudiants."}
        </p>

        {/* FOOTER : ACTIONS */}
        <div className="partner-actions">
          {partenaire.lienAdresse && (
            <a 
              href={partenaire.lienAdresse} 
              target="_blank" 
              rel="noopener noreferrer"
              className="action-btn secondary"
              title="Voir sur Google Maps"
            >
              <FaMapMarkerAlt /> <span>Localiser</span>
            </a>
          )}
          
          {partenaire.lienSite && (
            <a 
              href={partenaire.lienSite} 
              target="_blank" 
              rel="noopener noreferrer"
              className="action-btn primary"
              title="Visiter le site web"
            >
              <FaGlobe /> <span>Site Web</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default PartnerCardGrid;