// src/components/ArticleCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';
import './ArticleCard.css';

// 1. IMPORT DU FICHIER UTILS
import { getOptimizedImageUrl, formatDate } from '../utils'; // Assurez-vous que le chemin est bon

function ArticleCard({ article }) {
  
  // 2. UTILISATION DE L'OPTIMISATION
  // On demande une largeur de 600px (suffisant pour une carte) et une qualité de 80%
  const optimizedImage = getOptimizedImageUrl(article.image, 600, 80);

  return (
    <div className="article-card" data-aos="fade-up">
      {/* Image optimisée en background */}
      <div className="article-card-image" style={{
        backgroundImage: optimizedImage ? `url(${optimizedImage})` : 'none',
        backgroundColor: optimizedImage ? 'transparent' : '#eee'
      }}>
        {!article.image && <span style={{color: '#aaa'}}>Pas d'image</span>}
      </div>

      <div className="article-card-content">
        <div className="article-meta">
          {/* On utilise aussi la fonction formatDate centralisée */}
          <span><FaCalendarAlt /> {formatDate(article.date_creat)}</span>
        </div>

        <h3>{article.titre}</h3>
        <p>{article.resume}</p>

        <Link to={`/blog/${article.id}`} className="read-more-link">
          Lire la suite &rarr;
        </Link>
      </div>
    </div>
  );
}

export default ArticleCard;