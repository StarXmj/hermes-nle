// src/pages/ContactPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import './ContactPage.css';
import { Helmet } from 'react-helmet-async';

// Fonction pour encoder les données pour Netlify
const encode = (data) => {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

function ContactPage() {
  const location = useLocation();
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    role: '',
    sujet: 'information',
    prenom: '',
    nom: '',
    email: '',
    message: ''
  });

  const [isSujetBloque, setIsSujetBloque] = useState(false);
  const [titre, setTitre] = useState("Contactez-nous");
  const [sousTitre, setSousTitre] = useState("Vous voulez nous contacter ou avoir des informations ?");
  const [status, setStatus] = useState(null); // null, 'success', 'error'

  useEffect(() => {
    const sujetParDefaut = location.state?.sujetParDefaut;

    if (sujetParDefaut === 'devenir_partenaire') {
      setFormData(prev => ({ ...prev, sujet: 'devenir_partenaire' }));
      setIsSujetBloque(true);
      setTitre("Devenir Partenaire");
      setSousTitre("Vous souhaitez soutenir la vie étudiante ? Parlons-en !");
    } else if (sujetParDefaut === 'rejoindre_association') {
      setFormData(prev => ({ ...prev, sujet: 'rejoindre_association' }));
      setIsSujetBloque(true);
      setTitre("Nous Rejoindre");
      setSousTitre("Prêt(e) à faire bouger le campus ? Devenez adhérent !");
    } else {
      setFormData(prev => ({ ...prev, sujet: 'information' }));
      setIsSujetBloque(false);
      setTitre("Contactez-nous");
      setSousTitre("Vous voulez nous contacter ou avoir des informations ?");
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const form = e.target;
    
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({
        "form-name": form.getAttribute("name"),
        ...formData
      })
    })
      .then(() => {
        setStatus('success');
        setFormData({ ...formData, message: '' }); // On vide le message
      })
      .catch((error) => {
        console.error(error);
        setStatus('error');
      });
  };

  return (
    <main className="page-section">
      <Helmet>
        <title>{titre} - Hermes by NLE</title>
        <meta name="description" content="Contactez l'association Hermes." />
      </Helmet>
      <div className="section-content">
                <header className="contact-page-header">

        <h1>{titre}</h1>
        <p>{sousTitre}</p>
        </header>

        <div className="contact-info-container">
          <div className="contact-info-item">
            <FaMapMarkerAlt size={20} className="contact-icon" />
            <h3>Adresse</h3>
            <p>Maison de l'Étudiant, UPPA</p>
          </div>
          <div className="contact-info-item">
            <FaEnvelope size={20} className="contact-icon" />
            <h3>Email</h3>
            <p>hermesbynle@gmail.com</p>
          </div>
        </div>

        {/* Message de succès */}
        {status === 'success' ? (
          <div style={{padding: '2rem', background: '#d4edda', color: '#155724', borderRadius: '8px', maxWidth: '700px', margin: '0 auto'}}>
            <h3>Message envoyé ! 🚀</h3>
            <p>Merci de nous avoir contactés. Nous reviendrons vers vous très rapidement.</p>
            <button className="cta-button secondary" onClick={() => setStatus(null)}>Envoyer un autre message</button>
          </div>
        ) : (

          <form 
            className="contact-form"
            name="contact"
            method="POST"
            data-netlify="true"
            onSubmit={handleSubmit}
          >
            {/* Champ caché OBLIGATOIRE pour Netlify */}
            <input type="hidden" name="form-name" value="contact" />

            <div className="form-group">
              <label htmlFor="role">Qui êtes-vous ?</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} required>
                <option value="">-- Choisissez une option --</option>
                <option value="etudiant">Étudiant(e)</option>
                <option value="professeur">Professeur / Personnel UPPA</option>
                <option value="entreprise">Entreprise / Organisation</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sujet">Pourquoi nous contactez-vous ?</label>
              <select 
                id="sujet" 
                name="sujet" 
                required
                value={formData.sujet}
                onChange={handleChange}
                disabled={isSujetBloque}
              >
                {!isSujetBloque && <option value="information">Demande d'information</option>}
                <option value="devenir_partenaire">Devenir partenaire</option>
                <option value="rejoindre_association">Rejoindre l'association</option>
                {!isSujetBloque && <option value="autre">Autre sujet</option>}
              </select>
            </div>

             <div className="form-row">
              <div className="form-group">
                <label htmlFor="prenom">Prénom</label>
                <input type="text" id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="nom">Nom</label>
                <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Votre email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Votre message</label>
              <textarea id="message" name="message" rows="6" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            
            {status === 'error' && <p style={{color:'red'}}>Une erreur est survenue. Veuillez réessayer.</p>}

            <button type="submit" className="cta-button">
              Envoyer le message
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default ContactPage;