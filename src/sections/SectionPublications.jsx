// src/sections/SectionPublications.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaFilePdf, FaExternalLinkAlt } from 'react-icons/fa';
import './SectionPublications.css';

const formatSimpleDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

// Helper pour vérifier si le fichier est une image ou un PDF
const isImage = (url) => {
  if (!url) return false;
  return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
};

function SectionPublications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      // On récupère uniquement les publications "publie", triées par date de parution
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('status', 'publie')
        .order('date_publication', { ascending: false })
        .limit(10); // On limite aux 10 dernières pour la perf du carrousel

      if (!error && data) {
        setPublications(data);
      }
      setLoading(false);
    };

    fetchPublications();
  }, []);

  if (loading) {
    return (
      <section className="section-publications loading-state">
        <p>Chargement des publications...</p>
      </section>
    );
  }

  if (publications.length === 0) {
    return null; // Ne rien afficher s'il n'y a aucune publication
  }

  const heroPub = publications[0]; // La plus récente
  const carouselPubs = publications.slice(1); // Le reste

  return (
    <section className="section-publications">
      <div className="publications-header">
        <h2>Dernières Publications</h2>
        <p>Retrouvez nos journaux, newsletters et documents officiels.</p>
      </div>

      <div className="publications-layout">
        
        {/* --- PARTIE GAUCHE : MISE EN AVANT (HERO) --- */}
        <div className="pub-hero">
          <a href={heroPub.fichier_url} target="_blank" rel="noopener noreferrer" className="pub-card-hero">
            <div className="pub-hero-preview">
              {isImage(heroPub.fichier_url) ? (
                <img src={heroPub.fichier_url} alt={heroPub.titre} loading="lazy" />
              ) : (
                <div className="pub-pdf-placeholder">
                  <FaFilePdf className="pdf-icon-big" />
                  <span>Ouvrir le document</span>
                </div>
              )}
              <div className="pub-badge">{heroPub.type_publi}</div>
            </div>
            <div className="pub-hero-content">
              <h3>{heroPub.titre}</h3>
              <span className="pub-date">{formatSimpleDate(heroPub.date_publication)}</span>
              <div className="pub-read-more">
                Lire maintenant <FaExternalLinkAlt size={12} />
              </div>
            </div>
          </a>
        </div>

        {/* --- PARTIE DROITE : CARROUSEL --- */}
        {carouselPubs.length > 0 && (
          <div className="pub-carousel">
            {carouselPubs.map(pub => (
              <a href={pub.fichier_url} target="_blank" rel="noopener noreferrer" className="pub-card-small" key={pub.id}>
                <div className="pub-small-preview">
                  {isImage(pub.fichier_url) ? (
                    <img src={pub.fichier_url} alt={pub.titre} loading="lazy" />
                  ) : (
                    <FaFilePdf className="pdf-icon" />
                  )}
                  <div className="pub-badge-small">{pub.type_publi}</div>
                </div>
                <div className="pub-small-content">
                  <h4>{pub.titre}</h4>
                  <span className="pub-date">{formatSimpleDate(pub.date_publication)}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default SectionPublications;