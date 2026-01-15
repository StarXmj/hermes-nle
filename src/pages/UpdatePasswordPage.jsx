// src/pages/UpdatePasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import toast from 'react-hot-toast'; // 1. Importer
import { Helmet } from 'react-helmet-async';

function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // On vérifie si l'utilisateur est bien là (le lien email a fonctionné)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Si pas de session, le lien est invalide ou expiré
        navigate('/login'); 
      }
    });
  }, [navigate]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // On met à jour le mot de passe de l'utilisateur connecté
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Si succès, on redirige vers l'admin
      toast.success("Mot de passe modifié avec succès !");
      navigate('/admin');

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-section login-page">
      <Helmet>
  <title>Nouveaux mots de passe oublié</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>
      <div className="login-container">
        <h2>Nouveau mot de passe</h2>
        <p>Veuillez choisir votre nouveau mot de passe.</p>

        <form onSubmit={handleUpdatePassword} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="cta-button" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Enregistrer le mot de passe'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default UpdatePasswordPage;