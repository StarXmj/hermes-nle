// src/sections/SectionPartenaires.jsx
import React from 'react';
import partenairesData from '../data/partenaires.json';
// MODIFIÉ ICI : On importe la carte de la grille
import PartnerCardGrid from '../components/PartnerCardGrid'; 
import './SectionPartenaires.css';

function SectionPartenaires() {
  return (
    <section id="partenaires" className="page-section alternate-bg">
      <div className="section-content">
        <h2>Nos Partenaires</h2>
        <p>Ils nous font confiance et soutiennent la vie étudiante.</p>

        {/* On garde la grille, mais elle utilise la nouvelle carte */}
        <div className="partenaires-grid">
          {partenairesData.map(partenaire => (
            // MODIFIÉ ICI :
            <PartnerCardGrid key={partenaire.id} partenaire={partenaire} />
          ))}
        </div>

        {/* On remet le lien vers la page dédiée */}
        <div className="partenaires-links">
            <a href="/partenaires" className="cta-button secondary">
                Voir tous nos partenaires
            </a>
        </div>
      </div>
    </section>
  );
}
export default SectionPartenaires;