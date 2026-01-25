import React from 'react';
import { FaUser } from 'react-icons/fa';
import './MemberCard.css'; // On importe le nouveau CSS

function MemberCard({ membre }) {
  if (!membre) return null;

  return (
    <div className="member-card">
      {/* Image en arrière-plan */}
      {membre.photo ? (
        <img 
          src={membre.photo} 
          alt={membre.nom} 
          className="member-card-image" 
        />
      ) : (
        <div className="member-card-placeholder">
          <FaUser />
        </div>
      )}

      {/* Contenu en bas (Overlay) */}
      <div className="member-card-content">
        <h3 className="member-card-name">{membre.nom}</h3>
        <p className="member-card-role">{membre.role}</p>
      </div>
    </div>
  );
}

export default MemberCard;