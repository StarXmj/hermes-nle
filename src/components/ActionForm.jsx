// src/components/admin/ActionForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../pages/ContactPage.css'; // On réutilise le style du formulaire de contact

function ActionForm({ action, onSave, onCancel }) {
  // On utilise un état local pour tous les champs du formulaire
  const [formData, setFormData] = useState({
    titre: '',
    infoPratique: '',
    dateISO: '',
    lieu: '',
    lienLieu: '',
    description: '',
    lienProgramme: '',
    status: 'brouillon',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quand la prop 'action' change, on remplit le formulaire
  useEffect(() => {
    if (action.id) {
      // On convertit la date 'timestamp' de Supabase en format 'yyyy-mm-dd'
      const isoDate = action.dateISO ? new Date(action.dateISO).toISOString().split('T')[0] : '';
      setFormData({ ...action, dateISO: isoDate });
    } else {
      // C'est une nouvelle action
      setFormData({
        titre: '', infoPratique: '', dateISO: '', lieu: '',
        lienLieu: '', description: '', lienProgramme: '', status: 'brouillon',
      });
    }
  }, [action]);

  // Met à jour l'état local quand on tape dans un champ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Quand on clique sur "Enregistrer"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // On prépare les données à envoyer
    const dataToSave = {
      ...formData,
      // On s'assure que la date est bien un timestamp avec fuseau horaire
      dateISO: new Date(formData.dateISO).toISOString(), 
    };
    
    let error;
    
    if (action.id) {
      // Mode UPDATE (Mise à jour)
      const { error: updateError } = await supabase
        .from('actions')
        .update(dataToSave)
        .eq('id', action.id);
      error = updateError;
    } else {
      // Mode CREATE (Création)
      // On enlève l'ID (géré par Supabase)
      delete dataToSave.id; 
      const { error: insertError } = await supabase
        .from('actions')
        .insert(dataToSave);
      error = insertError;
    }

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      onSave(); // On appelle la fonction "onSave" du parent (qui rafraîchit et ferme)
    }
  };

  return (
    <div className="section-content" style={{maxWidth: '800px', textAlign: 'left'}}>
      <h2>{action.id ? "Modifier l'action" : "Créer une nouvelle action"}</h2>
      
      {/* On réutilise le style du formulaire de contact */}
      <form onSubmit={handleSubmit} className="contact-form">
        
        <div className="form-group">
          <label htmlFor="titre">Titre de l'action</label>
          <input type="text" name="titre" value={formData.titre} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateISO">Date</label>
            <input type="date" name="dateISO" value={formData.dateISO} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="infoPratique">Info Pratique (ex: 18h00)</label>
            <input type="text" name="infoPratique" value={formData.infoPratique} onChange={handleChange} />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="lieu">Lieu</label>
          <input type="text" name="lieu" value={formData.lieu} onChange={handleChange} />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange}></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lienLieu">Lien Google Maps</label>
            <input type="url" name="lienLieu" value={formData.lienLieu} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="lienProgramme">Lien Programme (PDF/PNG)</label>
            <input type="url" name="lienProgramme" value={formData.lienProgramme} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Statut</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="brouillon">Brouillon</option>
            <option value="publié">Publié</option>
          </select>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-buttons">
          <button type="button" className="cta-button secondary" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="cta-button" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ActionForm;