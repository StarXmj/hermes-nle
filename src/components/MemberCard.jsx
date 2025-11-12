// src/components/MemberCard.jsx
import React from 'react';
import './MemberCard.css';

function MemberCard({ membre }) {
  return (
    // Le rectangle principal
    <div className="member-card">
      
      {/* 1. Colonne de gauche (Photo) */}
      <div className="member-photo-container">
        <img src={membre.photo} alt={membre.nom} className="member-photo" />
      </div>
      
      {/* 2. Colonne de droite (Infos) */}
      <div className="member-info">
        <h3 className="member-name">{membre.nom}</h3>
        <span className="member-role">{membre.role}</span>
        <p className="member-bio">{membre.bio}</p>
      </div>

    </div>
  );
}
export default MemberCard;