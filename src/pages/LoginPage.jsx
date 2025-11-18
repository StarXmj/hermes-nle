// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // On va créer ce CSS
import { Helmet } from 'react-helmet-async';


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // On tente de se connecter
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      // Si c'est réussi, on redirige vers l'admin
      navigate('/admin');
    }
    setLoading(false);
  };

  return (
    <main className="page-section login-page">
      <div className="login-container">
        <h2>Connexion Admin</h2>
        <p>Veuillez vous connecter pour accéder au panneau de gestion.</p>
        
        <form onSubmit={handleLogin} className="login-form">
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
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="cta-button" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        {/* Lien pour le mot de passe oublié */}
        <Link to="/mot-de-passe-oublie" className="forgot-password-link">
          Mot de passe oublié ?
        </Link>
      </div>
    </main>
  );
}

export default LoginPage;