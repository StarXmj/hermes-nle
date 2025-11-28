// src/components/ActionCard.jsx
import React from 'react';
// On ajoute FaLink pour les liens génériques
import { FaCalendarAlt, FaMapMarkerAlt, FaExternalLinkAlt, FaBell, FaLink, FaTicketAlt } from 'react-icons/fa';
import './ActionCard.css';

function ActionCard({ action, status, isUpcoming }) {
  
  const cardClasses = `action-card ${status === 'past' ? 'past-action' : ''}`;
  
  // On sécurise : si extra_links est null, on prend un tableau vide
  const extraLinks = action.extra_links || [];

  // Petite fonction pour choisir l'icône selon le nom du lien (Bonus UX)
  const getLinkIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes('billet') || l.includes('ticket')) return <FaTicketAlt size={12} />;
    if (l.includes('program')) return <FaExternalLinkAlt size={12} />;
    return <FaLink size={12} />;
  };

  return (
    <div className={cardClasses} data-aos="fade-up">
      
      {isUpcoming && (
        <div className="upcoming-badge">
          <FaBell size={12} /> À venir
        </div>
      )}

      <h3>{action.titre}</h3>
      
      <div className="action-details">
        <div className="action-detail-item">
          <FaCalendarAlt className="action-icon" /> 
          <span>{action.infoDate}</span>
        </div>
        
        {action.lieu && (
          <a 
            href={action.lienLieu}
            target="_blank" 
            rel="noopener noreferrer"
            className="action-detail-item location-link"
          >
            <FaMapMarkerAlt className="action-icon" /> 
            <span>{action.lieu}</span>
          </a>
        )}
      </div>

      <p className="action-desc">{action.description}</p>
      
      {/* --- ZONE DES LIENS --- */}
      <div className="action-links-group">
        
        {/* 1. Le lien Programme principal (s'il existe) */}
        {action.lienProgramme && (
          <a 
            href={action.lienProgramme} 
            className="action-btn-link"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Voir le programme <FaExternalLinkAlt size={12} />
          </a>
        )}

        {/* 2. Les liens modulaires (Billetterie, etc.) */}
        {extraLinks.map((link, index) => (
          <a 
            key={index}
            href={link.url} 
            className="action-btn-link secondary" // Classe différente pour varier le style
            target="_blank" 
            rel="noopener noreferrer"
          >
            {link.label} {getLinkIcon(link.label)}
          </a>
        ))}
        
      </div>

    </div>
  );
}

export default ActionCard;