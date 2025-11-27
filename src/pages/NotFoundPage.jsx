// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa'; // Assurez-vous que react-icons est installé

function NotFoundPage() {
  return (
    <main className="page-section" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Helmet>
        <title>Page introuvable (404) - Hermes by NLE</title>
        {/* Indique aux robots de NE PAS indexer cette page d'erreur */}
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <FaExclamationTriangle size={50} color="#FFA500" style={{ marginBottom: '1rem' }} />
      
      <h1 style={{ fontSize: '3rem', margin: '0 0 1rem', color: '#003366' }}>404</h1>
      <h2 style={{ marginBottom: '1.5rem', color: '#555' }}>Oups ! Cette page n'existe pas.</h2>
      
      <p style={{ maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
        Il semble que le lien que vous avez suivi soit cassé ou que la page ait été déplacée.
      </p>

      <Link to="/" className="cta-button">
        <FaHome style={{ marginRight: '8px' }} />
        Retour à l'accueil
      </Link>
    </main>
  );
}

export default NotFoundPage;