// src/pages/HomePage.jsx
import React from 'react';
import '../App.css'; 
import { Link } from 'react-router-dom'; // 1. IMPORTER LINK

// On importe les sections
import SectionActions from '../sections/SectionActions';
import SectionPartenaires from '../sections/SectionPartenaires';
import SectionActus from '../sections/SectionActus';
import SectionNewsletter from '../sections/SectionNewsletter';

function HomePage() {
  return (
    <main>
      {/* Section 1 : Bienvenue */}
      <section className="hero-section">
        
        <div className="collage-photo photo-1"></div>
        <div className="collage-photo photo-2"></div>

        <h1>UN RELAIS POUR TOUS, UNE PAROLE POUR CHACUN.</h1>
        <p className="hero-subtitle">
          L'association étudiante qui t'accompagne, t'informe et te défend au quotidien.
        </p>
        
        {/* 2. NOUVEAU CONTENEUR POUR LES BOUTONS */}
        <div className="-buttons-containeheror">
          {/* Bouton 1 : Lien interne */}
          <Link to="/actions" className="cta-button">
            Découvrir nos actions
          </Link>
          
          {/* Bouton 2 : Lien externe */}
          <a 
            href="https://www.instagram.com/[VOTRE_COMPTE_INSTA]" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="cta-button secondary"
          >
            Abonne-toi à notre Instagram
          </a>
        </div>

      </section>

      {/* Le reste de vos sections */}
      <SectionActions />
      <SectionPartenaires />
      <SectionActus />
      <SectionNewsletter />
    </main>
  );
}
export default HomePage;