// src/components/FaqForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../pages/ContactPage.css';

const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

function FaqForm({ faq, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    question: '',
    reponse: '',
    status: 'brouillon'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (faq.id) {
      setFormData({
        question: faq.question || '',
        reponse: faq.reponse || '',
        status: faq.status || 'brouillon'
      });
    } else {
      setFormData({ question: '', reponse: '', status: 'brouillon' });
    }
  }, [faq]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSave = { ...formData };
    
    // On nettoie les champs techniques
    delete dataToSave.created_by_profile;
    delete dataToSave.modif_by_profile;
    delete dataToSave.created_by;
    delete dataToSave.modif_by;
    delete dataToSave.date_creat;
    delete dataToSave.last_modif;

    let apiError;
    if (faq.id) {
      // Utilisation de la table 'faq'
      const { error } = await supabase.from('faq').update(dataToSave).eq('id', faq.id);
      apiError = error;
    } else {
      // Utilisation de la table 'faq'
      const { error } = await supabase.from('faq').insert(dataToSave);
      apiError = error;
    }

    if (apiError) {
      setError(apiError.message);
      setLoading(false);
    } else {
      setLoading(false);
      onSave();
    }
  };

  return (
    <div className="section-content" style={{maxWidth: '800px', textAlign: 'left'}}>
      <h2>{faq.id ? "Modifier la question" : "Ajouter une question"}</h2>
      
      <form onSubmit={handleSubmit} className="contact-form">
        
        <div className="form-group">
          <label>Question</label>
          <input type="text" name="question" value={formData.question} onChange={handleChange} required placeholder="Ex: Comment adhérer ?" />
        </div>

        <div className="form-group">
          <label>Réponse</label>
          <textarea name="reponse" rows="5" value={formData.reponse} onChange={handleChange} required placeholder="La réponse détaillée..."></textarea>
        </div>

        <div className="form-group">
          <label>Statut</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="brouillon">Brouillon (Caché)</option>
            <option value="publié">Publié (Visible)</option>
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}

        {faq.id && (
          <div className="form-metadata" style={{backgroundColor:'#f9f9f9', padding:'10px', borderRadius:'5px', marginTop:'20px', border:'1px solid #eee'}}>
            <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
              <strong>Créé le :</strong> {formatFullDate(faq.date_creat)} 
              <strong> par :</strong> {faq.created_by_profile?.username || 'Inconnu'}
            </p>
            {faq.modif_by && (
              <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
                <strong>Dernière modif :</strong> {formatFullDate(faq.last_modif)} 
                <strong> par :</strong> {faq.modif_by_profile?.username || 'Inconnu'}
              </p>
            )}
          </div>
        )}

        <div className="form-buttons">
          <button type="button" className="cta-button secondary" onClick={onCancel}>Annuler</button>
          <button type="submit" className="cta-button" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FaqForm;