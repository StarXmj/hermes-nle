// src/pages/CreditsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// On réutilise le même CSS que pour les pages légales
import './LegalPage.css'; 

function CreditsPage() {
  return (
    <main className="page-section legal-page">
      <div className="section-content">
        <h1>Crédits</h1>
        
        <article>
          <h2>Conception et Développement</h2>
          <p>
            Ce site a été conçu et développé par les membres bénévoles de l'association <strong>Hermes by NLE</strong>.
          </p>
          <p>
            {/* Si vous voulez vous créditer personnellement, vous pouvez ajouter :
              "Développement principal par : [Votre Prénom Nom]"
            */}
          </p>
        </article>

        <article>
          <h2>Technologies</h2>
          <p>Ce site est propulsé par les technologies open-source suivantes :</p>
          <ul>
            <li>
              <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
                React
              </a>
            </li>
            <li>
              <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">
                Vite
              </a>
            </li>
            <li>
              <a href="https://reactrouter.com/" target="_blank" rel="noopener noreferrer">
                React Router
              </a>
            </li>
          </ul>
        </article>

        <article>
          <h2>Ressources Graphiques</h2>
          <p>
            Les icônes utilisées sur ce site proviennent de la bibliothèque {' '}
            <a href="https://react-icons.github.io/react-icons/" target="_blank" rel="noopener noreferrer">
              React-Icons
            </a> 
            (incluant Font Awesome, FaIcons, etc.).
          </p>
          <p>
            L'illustration des montagnes sur la page d'accueil est une création originale pour l'association.
          </p>
          <p>
            Les logos des partenaires sont la propriété intellectuelle de leurs sociétés respectives 
            et sont utilisés avec leur aimable autorisation.
          </p>
          <p>
            {/* Si vous utilisez des photos prises par quelqu'un :
              "Photographies du campus par : [Nom du Photographe]"
            */}
          </p>
        </article>

        <article>
          <h2>Hébergement</h2>
          <p>
            Les informations complètes sur l'hébergeur du site sont disponibles sur notre page {' '}
            <Link to="/mentions-legales">Mentions Légales</Link>.
          </p>
        </article>
        
      </div>
    </main>
  );
}

export default CreditsPage;