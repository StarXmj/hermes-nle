// src/components/ActuCard.jsx
import React from 'react';
import './ActuCard.css'; // On importe le CSS

function ActuCard({ article }) {
  // Formattage de la date (ne change pas)
  const formattedDate = new Date(article.dateISO).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    // 1. On ajoute une classe 'no-image' pour le style
    <a href={article.lien} target="_blank" rel="noopener noreferrer" className="actu-card no-image">
      
      {/* 2. On a SUPPRIMÉ le <div> "actu-card-image-container" */}

      {/* 3. Tout est maintenant dans "actu-card-content" */}
      <div className="actu-card-content">
        
        {/* L'étiquette est maintenant en haut du texte */}
        <span className={`actu-card-category ${article.categorie.toLowerCase()}`}>
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