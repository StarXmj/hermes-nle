import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { THEMES } from '../data/themes'; // On importe notre config
import './AdminActionsPage.css';

function AdminDecorsPage() {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Charger le thème actuel depuis la BDD
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'current_theme')
        .single();

      if (data) setCurrentTheme(data.value);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  // Sauvegarder le changement
  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('settings')
      .update({ value: currentTheme })
      .eq('key', 'current_theme');

    if (error) {
      setMessage({ type: 'error', text: "Erreur lors de la sauvegarde." });
    } else {
      setMessage({ type: 'success', text: "Thème mis à jour avec succès ! Le site a changé d'apparence." });
    }
    setLoading(false);
  };

  return (
    <main className="page-section">
<Helmet>
  <title>Liste Decors | Admin - Hermes by NLE</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>      
      <div className="admin-header">
        <Link to="/admin" className="admin-back-link">&larr; Retour</Link>
        <h1>Décoration du Site</h1>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <h3>Sélectionnez le thème actif</h3>
        <p>Ce choix s'applique immédiatement à tous les visiteurs.</p>

        <div className="form-group">
          <label htmlFor="theme-select">Thème :</label>
          <select 
            id="theme-select"
            value={currentTheme} 
            onChange={(e) => setCurrentTheme(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '1rem', marginBottom: '1.5rem' }}
          >
            {/* On génère les options depuis notre fichier themes.js */}
            {Object.values(THEMES).map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
            {message.text}
          </div>
        )}

        <button onClick={handleSave} className="cta-button" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Appliquer le thème'}
        </button>

      </div>
    </main>
  );
}

export default AdminDecorsPage;