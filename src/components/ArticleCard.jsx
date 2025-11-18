// src/components/ArticleCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import './ArticleCard.css'; // On va créer ce CSS juste après

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

function ArticleCard({ article }) {
  return (
    <div className="article-card" data-aos="fade-up">
      {/* Image (ou placeholder gris si pas d'image) */}
      <div className="article-card-image" style={{
        backgroundImage: article.image ? `url(${article.image})` : 'none',
        backgroundColor: article.image ? 'transparent' : '#eee'
      }}>
        {!article.image && <span style={{color: '#aaa'}}>Pas d'image</span>}
      </div>

      <div className="article-card-content">
        <div className="article-meta">
          <span><FaCalendarAlt /> {formatDate(article.date_creat)}</span>
          {/* On pourrait ajouter l'auteur ici si vous le récupérez dans la requête */}
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