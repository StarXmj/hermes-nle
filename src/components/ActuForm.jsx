// src/components/ActuForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../pages/ContactPage.css';

// Helper pour formater les dates
const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

function ActuForm({ actu, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    titre: '',
    dateISO: '',
    categorie: '',
    description: '',
    lien: '',
    isPinned: false,
    status: 'brouillon'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (actu.id) {
      const isoDate = actu.dateISO ? new Date(actu.dateISO).toISOString().split('T')[0] : '';
      setFormData({
        titre: actu.titre || '',
        dateISO: isoDate,
        categorie: actu.categorie || 'Vie du Campus', // Valeur par défaut si vide
        description: actu.description || '',
        lien: actu.lien || '',
        isPinned: actu.isPinned || false,
        status: actu.status || 'brouillon'
      });
    } else {
      setFormData({
        titre: '', 
        dateISO: '', 
        categorie: 'Vie du Campus', // Catégorie par défaut
        description: '', 
        lien: '', 
        isPinned: false,
        status: 'brouillon'
      });
    }
  }, [actu]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (actu.id) {
          // On va vérifier la version actuelle en base de données
          const { data: currentDbVersion, error: checkError } = await supabase
            .from('actus')
            .select('last_modif')
            .eq('id', actu.id)
            .single();
    
          if (!checkError && currentDbVersion) {
            // On compare les timestamps (en millisecondes pour être précis)
            const dbTime = new Date(currentDbVersion.last_modif).getTime();
            const localTime = new Date(actu.last_modif).getTime();
    
            // Si la date en base est plus récente que celle qu'on a chargée
            if (dbTime > localTime) {
              setError("⚠️ CONFLIT DÉTECTÉ : Quelqu'un a modifié cette fiche pendant que vous l'éditiez. Vos modifications n'ont pas été enregistrées pour ne pas écraser son travail. Veuillez annuler et rafraîchir la page.");
              setLoading(false);
              return; // ON ARRÊTE TOUT ICI
            }
          }
        }

    const dataToSave = {
      ...formData,
      dateISO: new Date(formData.dateISO).toISOString(),
    };

    delete dataToSave.created_by_profile;
    delete dataToSave.modif_by_profile;

    let apiError;
    
    if (actu.id) {
      delete dataToSave.created_by; 
      const { error } = await supabase
        .from('actus')
        .update(dataToSave)
        .eq('id', actu.id);
      apiError = error;
    } else {
      delete dataToSave.id;
      const { error } = await supabase
        .from('actus')
        .insert(dataToSave);
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
      <h2>{actu.id ? "Modifier l'actualité" : "Créer une actualité"}</h2>
      
      <form onSubmit={handleSubmit} className="contact-form">
        
        <div className="form-group">
            <label>Titre</label>
            <input type="text" name="titre" value={formData.titre} onChange={handleChange} required />
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Date</label>
                <input type="date" name="dateISO" value={formData.dateISO} onChange={handleChange} required />
            </div>

            {/* MODIFICATION ICI : Menu déroulant pour les catégories */}
            <div className="form-group">
                <label>Catégorie</label>
                <select name="categorie" value={formData.categorie} onChange={handleChange}>
                  <option value="Vie du Campus">🏫 Vie du Campus</option>
                  <option value="Vie de l'Asso">💙 Vie de l'Asso</option>
                  <option value="Soirée / Event">🎉 Soirée / Event</option>
                  <option value="Info Scolaire">🎓 Info Scolaire</option>
                  <option value="Culture & Sport">🎨 Culture & Sport</option>
                  <option value="Bon Plan">💸 Bon Plan</option>
                  <option value="Partenaires">🤝 Partenaires</option>
                  <option value="Autre">ℹ️ Autre</option>
                </select>
            </div>
        </div>

        <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="4" value={formData.description} onChange={handleChange}></textarea>
        </div>

        <div className="form-group">
            <label>Lien externe (Optionnel)</label>
            <input type="url" name="lien" value={formData.lien} onChange={handleChange} placeholder="https://..." />
        </div>

        <div className="form-group">
          <label htmlFor="status">Statut</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="brouillon">Brouillon (Invisible)</option>
            <option value="publié">Publié (Visible)</option>
          </select>
        </div>

        <div className="form-group" style={{flexDirection:'row', alignItems:'center', gap:'1rem', marginTop:'1rem'}}>
          <label htmlFor="isPinned" style={{marginBottom:0, cursor:'pointer'}}>
            <strong>Épingler cette actualité ?</strong>
          </label>
          <input 
            type="checkbox" 
            id="isPinned" 
            name="isPinned" 
            checked={formData.isPinned} 
            onChange={handleChange} 
            style={{width:'20px', height:'20px', cursor:'pointer'}}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        {actu.id && (
          <div className="form-metadata" style={{backgroundColor:'#f9f9f9', padding:'10px', borderRadius:'5px', marginTop:'20px', border:'1px solid #eee'}}>
            <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
              <strong>Créé le :</strong> {formatFullDate(actu.date_creat)} 
              <strong> par :</strong> {actu.created_by_profile?.username || 'Inconnu'}
            </p>
            {actu.modif_by && (
              <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
                <strong>Dernière modif :</strong> {formatFullDate(actu.last_modif)} 
                <strong> par :</strong> {actu.modif_by_profile?.username || 'Inconnu'}
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

export default ActuForm;