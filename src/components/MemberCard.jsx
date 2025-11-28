// src/components/MemberCard.jsx
import React from 'react';
import './MemberCard.css';
// IMPORT UTILS
import { getOptimizedImageUrl } from '../utils';

function MemberCard({ membre }) {
  // Optimisation de la photo de profil (200px carré)
  const optimizedPhoto = getOptimizedImageUrl(membre.photo, 200);

  return (
    <div className="member-card" data-aos="fade-left">
      
      <div className="member-photo-container">
        <img 
          src={optimizedPhoto} 
          alt={membre.nom} 
          className="member-photo" 
          loading="lazy" // Bonne pratique pour les longues listes
        />
      </div>
      
      <div className="member-info">
        <h3 className="member-name">{membre.nom}</h3>
        <span className="member-role">{membre.role}</span>
        <p className="member-bio">{membre.bio}</p>
      </div>

    </div>
  );
}
export default MemberCard;