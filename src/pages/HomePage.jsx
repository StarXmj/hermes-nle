import React from 'react';
import '../App.css'; 
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // 1. IMPORTER HELMET

// On importe les sections
import SectionActions from '../sections/SectionActions';
import SectionPartenaires from '../sections/SectionPartenaires';
import SectionActus from '../sections/SectionActus';
import SectionNewsletter from '../sections/SectionNewsletter';

function HomePage() {
  return (
    <main>
      <Helmet>
        <title>Hermes by NLE</title>
        {/* Bonus : Vous pouvez aussi ajouter la méta-description pour le SEO */}
        <meta name="description" content="L'association étudiante qui t'accompagne, t'informe et te défend au quotidien sur le campus de Pau." />
      </Helmet>
      {/* Section 1 : Bienvenue */}
      <section className="hero-section">
        
        <div className="collage-photo photo-1"></div>
        <div className="collage-photo photo-2"></div>

        <h1>Un relais pour tous, une parole pour chacun.</h1>
        <p className="hero-subtitle">
          L'association étudiante qui t'accompagne, t'informe et te défend au quotidien.
        </p>
        
        {/* Le conteneur vertical pour les deux boutons/groupes */}
        <div className="hero-buttons-container">
          
          
          
          {/* NOUVEAU : Groupe pour le bouton Insta + incitation */}
          <div className="instagram-cta-group">
            <a 
              href="https://www.instagram.com/hermes_by_nle/?igsh=MTZmaTk1amtjOTZudA%3D%3D#" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cta-button-insta"
            >


              
              Abonne-toi à notre Instagram
            </a>

            {/* L'incitation que vous avez demandée */}
            <p className="hero-incitation">
              Jeux concours, infos de dernière minute... tout se passe là-bas !
            </p>
          </div>
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