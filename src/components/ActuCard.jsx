// src/components/ActuCard.jsx
import React from 'react';
import './ActuCard.css';

function ActuCard({ article, status }) { // 1. On récupère 'status'
  
  const formattedDate = new Date(article.dateISO).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  // 2. On détermine la classe
  const isPast = status === 'past';
  const cardClassName = `actu-card no-image ${isPast ? 'past-actu' : ''}`;

  return (
    <a 
      href={article.lien} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={cardClassName} // 3. On applique la classe
      data-aos="fade-up"
    >
      <div className="actu-card-content">
        
        {/* On grise aussi la catégorie si c'est passé */}
        <span 
          className={`actu-card-category ${article.categorie.toLowerCase()}`}
          style={isPast ? { backgroundColor: '#999', color: '#fff' } : {}}
        >
          {article.categorie}
        </span>
        
        <span className="actu-card-date">{formattedDate}</span>
        <h3>{article.titre}</h3>
        <p>{article.description}</p>
      </div>
    </a>
  );
}

export default ActuCard;