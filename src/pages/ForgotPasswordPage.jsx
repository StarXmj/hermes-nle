// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import './LoginPage.css'; // On réutilise le style du login

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // On demande à Supabase d'envoyer un mail de reset
      // IMPORTANT : redirectTo doit pointer vers la page de changement de mot de passe
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password',
      });

      if (error) throw error;

      setMessage("Si cet email existe, un lien de réinitialisation a été envoyé. Vérifiez vos spams !");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-section login-page">
      <div className="login-container">
        <h2>Mot de passe oublié</h2>
        <p>Entrez votre email pour recevoir un lien de réinitialisation.</p>

        {message ? (
          <div className="success-message" style={{color: 'green', margin: '1rem 0'}}>
            {message}
            <br /><br />
            <Link to="/login" className="cta-button secondary">Retour à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="cta-button" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>

            <Link to="/login" className="forgot-password-link">
              Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}

export default ForgotPasswordPage;