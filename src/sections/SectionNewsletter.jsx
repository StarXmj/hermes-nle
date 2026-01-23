// src/sections/SectionNewsletter.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './SectionNewsletter.css';

function SectionNewsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Envoi à Supabase
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email: email }]);

    setLoading(false);

    if (error) {
      // Code erreur 23505 = Violation d'unicité (Email déjà présent)
      if (error.code === '23505') {
        setMessage({ type: 'info', text: "Vous êtes déjà inscrit, merci !" });
      } else {
        console.error(error);
        setMessage({ type: 'error', text: "Une erreur est survenue. Réessayez." });
      }
    } else {
      setMessage({ type: 'success', text: "Merci ! Vous êtes bien inscrit à la newsletter." });
      setEmail(''); // On vide le champ
    }
  };

  return (
    <section id="newsletter" className="page-section alternate-bg">
      <div className="section-content">
        <div className="newsletter-layout">
          
          {/* Colonne de gauche (Infos) */}
          <div className="newsletter-info">
           
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-3">
          S'inscrire à notre  <span className="text-hermes-primary">newsletter</span>
        </h2>
            <p>Ne manquez aucune info importante, aucun bon plan, ni aucun événement !</p>
            
            <ul className="newsletter-benefits">
              <li>✅ Recevez les <strong>offres exclusives</strong> de nos partenaires.</li>
              <li>🎉 Soyez le premier au courant de nos <strong>événements</strong>.</li>
              <li>📰 Un <strong>résumé mensuel</strong> de l'actu du campus.</li>
            </ul>
          </div>

          {/* Colonne de droite (Formulaire) */}
          <div className="newsletter-form-container">
            {message && message.type === 'success' ? (
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#d4edda', 
                color: '#155724', 
                borderRadius: '8px',
                textAlign: 'center',
                width: '100%'
              }}>
                <strong>{message.text}</strong>
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <label htmlFor="newsletter-email" className="newsletter-label">
                  Votre meilleur e-mail :
                </label>
                
                <input 
                  type="email" 
                  id="newsletter-email" 
                  className="newsletter-input"
                  placeholder="exemple@univ-pau.fr" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />

                {message && message.type !== 'success' && (
                  <p style={{ color: message.type === 'error' ? 'red' : '#0056b3', margin: '0.5rem 0', fontSize: '0.9rem' }}>
                    {message.text}
                  </p>
                )}

                <button 
                  type="submit" 
                  className="cta-button" 
                  disabled={loading}
                >
                  {loading ? 'Inscription...' : "S'inscrire"}
                </button>
              </form>
            )}
          </div>

        </div> 
      </div>
    </section>
  );
}

export default SectionNewsletter;