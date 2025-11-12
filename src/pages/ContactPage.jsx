// src/pages/ContactPage.jsx
import React, { useState, useEffect } from 'react'; // 1. IMPORTER useState et useEffect
import { useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import './ContactPage.css';

function ContactPage() {
  const location = useLocation();

  // 2. DÉFINIR L'ÉTAT LOCAL (géré par React)
  const [sujetSelectionne, setSujetSelectionne] = useState('information');
  const [isSujetBloque, setIsSujetBloque] = useState(false);
  const [titre, setTitre] = useState("Contactez-nous");
  const [sousTitre, setSousTitre] = useState("Vous voulez nous contacter ou avoir des informations ?");

  // 3. "useEffect" se lance À CHAQUE FOIS que vous arrivez sur cette page
  useEffect(() => {
    // On lit le state du lien sur lequel vous venez de cliquer
    const sujetParDefaut = location.state?.sujetParDefaut;

    if (sujetParDefaut === 'devenir_partenaire') {
      setSujetSelectionne('devenir_partenaire');
      setIsSujetBloque(true);
      setTitre("Devenir Partenaire");
      setSousTitre("Vous souhaitez soutenir la vie étudiante ? Parlons-en !");
    } else if (sujetParDefaut === 'rejoindre_association') {
      setSujetSelectionne('rejoindre_association');
      setIsSujetBloque(true);
      setTitre("Nous Rejoindre");
      setSousTitre("Prêt(e) à faire bouger le campus ? Devenez adhérent !");
    } else {
      // Cas par défaut (lien "Contact" générique)
      setSujetSelectionne('information');
      setIsSujetBloque(false);
      setTitre("Contactez-nous");
      setSousTitre("Vous voulez nous contacter ou avoir des informations ?");
    }
    
    // Cette fonction s'exécute à chaque fois que le 'state' du lien change
  }, [location.state]);

  // Permet de changer le <select> s'il n'est pas bloqué
  const handleSujetChange = (e) => {
    setSujetSelectionne(e.target.value);
  };

  return (
    <main className="page-section">
      <div className="section-content">
        <h1>{titre}</h1>
        <p>{sousTitre}</p>

        {/* ... (Infos Adresse/Email) ... */}
        <div className="contact-info-container">
          <div className="contact-info-item">
            <FaMapMarkerAlt size={20} className="contact-icon" />
            <h3>Adresse</h3>
            <p>[Votre Adresse, ex: Maison de l'Étudiant, UPPA]</p>
          </div>
          <div className="contact-info-item">
            <FaEnvelope size={20} className="contact-icon" />
            <h3>Email</h3>
            <p>[Votre Email, ex: contact@hermes-nle.fr]</p>
          </div>
        </div>

        <form 
          className="contact-form"
          name="contact"
          method="POST"
          data-netlify="true"
        >
          <input type="hidden" name="form-name" value="contact" />

          {/* ... (Champ 'Qui êtes-vous ?') ... */}
          <div className="form-group">
            <label htmlFor="role">Qui êtes-vous ?</label>
            <select id="role" name="role" required>
              <option value="">-- Choisissez une option --</option>
              <option value="etudiant">Étudiant(e)</option>
              <option value="professeur">Professeur / Personnel UPPA</option>
              <option value="entreprise">Entreprise / Organisation</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* 4. LE CHAMP <select> EST MAINTENANT CONTRÔLÉ PAR REACT */}
          <div className="form-group">
            <label htmlFor="sujet">Pourquoi nous contactez-vous ?</label>
            <select 
              id="sujet" 
              name="sujet" 
              required
              value={sujetSelectionne}   // On utilise "value" (piloté par l'état)
              onChange={handleSujetChange} // On gère le changement
              disabled={isSujetBloque}   // On bloque si besoin
            >
              {/* On n'affiche les options que si le champ n'est PAS bloqué */}
              {!isSujetBloque && <option value="information">Demande d'information</option>}
              
              <option value="devenir_partenaire">Devenir partenaire</option>
              <option value="rejoindre_association">Rejoindre l'association</option>
              
              {!isSujetBloque && <option value="autre">Autre sujet</option>}
            </select>
          </div>

          {/* ... (Reste du formulaire : Nom, Prénom, Email, etc.) ... */}
           <div className="form-row">
            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input type="text" id="prenom" name="prenom" required />
            </div>
            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input type="text" id="nom" name="nom" required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Votre email (pour vous recontacter)</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="message">Votre message</label>
            <textarea id="message" name="message" rows="6" required></textarea>
          </div>
          <button type="submit" className="cta-button">
            Envoyer le message
          </button>

        </form>
      </div>
    </main>
  );
}

export default ContactPage;