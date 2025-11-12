// src/components/TestModeModal.jsx
import React from 'react';
import './TestModeModal.css'; 

function TestModeModal({ isOpen, onClose }) {

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* --- DÉBUT DU NOUVEAU TEXTE --- */}

        <h2>⚠️ Site en version Bêta</h2>
        <p>
          Bienvenue sur la première version de notre site ! Nous sommes encore en 
          <strong>pleine phase de construction.</strong>
        </p>
        
        <p>
          Nous travaillons activement pour tout finaliser, mais pour le moment :
        </p>

        {/* On utilise une liste pour plus de clarté */}
        <ul className="modal-list">
            <li>
            Les <strong>Partenaires</strong>, <strong>Actions</strong> et <strong>Actualités</strong> sont des exemples factices pour se projeter.
          </li>
          <li>De <strong>nombreux bugs</strong> peuvent être présents.</li>
          <li>La <strong>page Contact</strong> et la Newsletter ne sont <strong>pas encore fonctionnelles</strong>.</li>
          <li>Certains <strong>liens du menu</strong> n'ont pas encore de page de destination.</li>
        </ul>

        <p>
          Merci de votre compréhension et à très bientôt pour la version finale !
        </p>
        
        <button className="cta-button" onClick={onClose}>
          J'ai compris
        </button>
        
        {/* --- FIN DU NOUVEAU TEXTE --- */}
        
      </div>
    </div>
  );
}

export default TestModeModal;