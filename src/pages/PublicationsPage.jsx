// src/pages/PublicationsPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';
import { FaFilePdf, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';
import './PublicationsPage.css';

const formatSimpleDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

const isImage = (url) => {
  if (!url) return false;
  return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
};

function PublicationsPage() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous'); // 'tous' | 'journal' | 'newsletter'

  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('status', 'publie')
        .order('date_publication', { ascending: false });

      if (!error && data) {
        setPublications(data);
      }
      setLoading(false);
    };

    fetchPublications();
  }, []);

  // Logique de filtrage côté client (ultra rapide)
  const filteredPubs = publications.filter(pub => {
    if (filter === 'tous') return true;
    return pub.type_publi === filter;
  });

  return (
    <main className="page-section publications-page">
      <Helmet>
        <title>Publications & Journaux | Hermes by NLE</title>
        <meta name="description" content="Découvrez nos derniers journaux de l'association, newsletters et documents officiels." />
      </Helmet>

      <div className="publications-page-header">
        <h1>Nos Publications</h1>
        <p>Retrouvez toute l'actualité de l'association à travers nos journaux et newsletters.</p>
        
        {/* NOUVEAU : Le système de filtres */}
        <div className="publications-filters">
          <button className={`filter-btn ${filter === 'tous' ? 'active' : ''}`} onClick={() => setFilter('tous')}>
            Tout voir
          </button>
          <button className={`filter-btn ${filter === 'journal' ? 'active' : ''}`} onClick={() => setFilter('journal')}>
            Journaux
          </button>
          <button className={`filter-btn ${filter === 'newsletter' ? 'active' : ''}`} onClick={() => setFilter('newsletter')}>
            Newsletters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spin" size={40} />
          <p>Chargement de la bibliothèque...</p>
        </div>
      ) : (
        <div className="publications-grid">
          {filteredPubs.length > 0 ? (
            filteredPubs.map(pub => (
              <a href={pub.fichier_url} target="_blank" rel="noopener noreferrer" className="pub-card" key={pub.id}>
                <div className="pub-preview">
                  {isImage(pub.fichier_url) ? (
                    <img src={pub.fichier_url} alt={pub.titre} loading="lazy" />
                  ) : (
                    <FaFilePdf className="pdf-icon" />
                  )}
                  <div className="pub-badge">{pub.type_publi}</div>
                </div>
                <div className="pub-content">
                  <h3>{pub.titre}</h3>
                  <span className="pub-date">{formatSimpleDate(pub.date_publication)}</span>
                  <div className="pub-read-more">
                    Ouvrir <FaExternalLinkAlt size={12} />
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="empty-state">
              <p>Aucune publication trouvée dans cette catégorie.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default PublicationsPage;