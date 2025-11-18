// src/components/PartnerCardGrid.jsx
import React from 'react';
import './PartnerCardGrid.css'; 
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa'; 

function PartnerCardGrid({ partenaire }) {
  return (
    <div className="partner-card-grid" data-aos="zoom-in">
      <div className="partner-logo-container">
        <img src={partenaire.logo} alt={partenaire.nom} className="partner-logo" />
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