// src/pages/PartenairesPage.jsx
import React from 'react';
import partenairesData from '../data/partenaires.json';
import PartnerCardList from '../components/PartnerCardList.jsx'; // On réutilise la carte
import { Helmet } from 'react-helmet-async'; // 1. IMPORTER HELMET


// 1. On n'importe PLUS Swiper

// 2. On importe le CSS de la page
import './PartenairesPage.css';

function PartenairesPage() {
  return (
    <main className="page-section">
       <Helmet>
             <title> Partenaires - Hermes by NLE</title>
              <meta name="description" content="Partenaire" />
      </Helmet>
      <div className="section-content">
        <h1>Nos Partenaires</h1>
        <p>Découvrez tous les partenaires qui s'engagent pour la vie étudiante à nos côtés.</p>

        {/* 3. On remplace le Swiper par une liste verticale */}
        <div className="partenaires-list">
          {partenairesData.map(partenaire => (
            // MODIFIÉ ICI :
            <PartnerCardList key={partenaire.id} partenaire={partenaire} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default PartenairesPage;