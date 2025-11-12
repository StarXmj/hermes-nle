// src/sections/SectionNewsletter.jsx
import React from 'react';
import './SectionNewsletter.css'; // On importe le CSS

function SectionNewsletter() {
  return (
    <section id ="newsletter" className="page-section alternate-bg">
      <div className="section-content">
        {/* 2. Colonne de gauche (Infos) */}
          <div className="newsletter-info">
            <h2>S'inscrire à notre newsletter</h2>
            <p>Ne manquez aucune info importante, aucun bon plan, ni aucun événement !</p>
        {/* 1. Le nouveau conteneur à 2 colonnes */}
        <div className="newsletter-layout">
          
          
            
            {/* La liste des "pourquoi s'inscrire" */}
            <ul className="newsletter-benefits">
              <li>✅ Recevez les <strong>offres exclusives</strong> de nos partenaires.</li>
              <li>🎉 Soyez le premier au courant de nos <strong>événements</strong>.</li>
              <li>📰 Un <strong>résumé mensuel</strong> de l'actu du campus.</li>
            </ul>
          </div>

          {/* 3. Colonne de droite (Formulaire) */}
          <div className="newsletter-form-container">
            <form 
              className="newsletter-form" 
              action="[URL_DE_VOTRE_SERVICE_MAILCHIMP_OU_AUTRE]" 
              method="POST"
              target="_blank"
            >
              <label htmlFor="newsletter-email" className="newsletter-label">
                Votre meilleur e-mail :
              </label>
              <input 
                type="email" 
                id="newsletter-email" // L'id correspond au "for" du label
                name="EMAIL" 
                className="newsletter-input"
                placeholder="Votre-email@domaine.com" 
                required 
              />
              <button 
                type="submit" 
                className="cta-button" // On réutilise le style
              >
                S'inscrire
              </button>
            </form>
          </div>

        </div> {/* Fin de .newsletter-layout */}
        
      </div>
    </section>
  );
}

export default SectionNewsletter;