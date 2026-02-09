// src/components/ActionCard.jsx
import React from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaExternalLinkAlt, FaBell, FaLink, FaTicketAlt } from 'react-icons/fa';
import './ActionCard.css';
import logoHermes from '../assets/logo-hermes.png';

// On utilise l'amphore pour Dionysos (chemin public)
const LOGO_DIONYSOS = '/src/assets/logo-dionysus.png';

function ActionCard({ action, status, isUpcoming }) {
  const isDionysos = action.typeEvenement === 'dionysos';
  const cardClasses = `action-card ${status === 'past' ? 'past-action' : ''} ${isDionysos ? 'dionysos-card' : ''}`;
  const extraLinks = action.extra_links || [];

  const getLinkIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes('billet') || l.includes('ticket')) return <FaTicketAlt size={12} />;
    if (l.includes('program')) return <FaExternalLinkAlt size={12} />;
    return <FaLink size={12} />;
  };

  // Sélection du logo à afficher
  const currentLogo = isDionysos ? LOGO_DIONYSOS : logoHermes;

  return (
    <div className={cardClasses} data-aos="fade-up">
      
      {isUpcoming && (
        <div className={`upcoming-badge ${isDionysos ? 'dionysos-badge' : ''}`}>
          <FaBell size={12} /> À venir
        </div>
      )}

      {/* Titre avec LOGO DIRECTEMENT */}
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
            src={currentLogo} 
            alt="Logo Type" 
            style={{ 
                width: '28px', 
                height: '28px', 
                objectFit: 'contain',
                filter: status === 'past' ? 'grayscale(100%) opacity(0.6)' : 'none' // Petit bonus : logo gris si passé
            }} 
        />
        {action.titre}
      </h3>
      
      <div className="action-details">
        <div className="action-detail-item">
          <FaCalendarAlt className="action-icon" /> 
          <span>{action.infoDate}</span>
        </div>
        
        {action.lieu && (
          <a href={action.lienLieu} target="_blank" rel="noopener noreferrer" className="action-detail-item location-link">
            <FaMapMarkerAlt className="action-icon" /> 
            <span>{action.lieu}</span>
          </a>
        )}
      </div>

      <p className="action-desc">{action.description}</p>
      
      <div className="action-links-group">
        
        {action.lienProgramme && (
          <a href={action.lienProgramme} className={`action-btn-link ${isDionysos ? 'dionysos-btn' : ''}`} target="_blank" rel="noopener noreferrer">
            Voir le programme <FaExternalLinkAlt size={12} />
          </a>
        )}

        {extraLinks.map((link, index) => (
          <a key={index} href={link.url} className={`action-btn-link secondary ${isDionysos ? 'dionysos-btn-sec' : ''}`} target="_blank" rel="noopener noreferrer">
            {link.label} {getLinkIcon(link.label)}
          </a>
        ))}
        
      </div>

    </div>
  );
}

export default ActionCard;