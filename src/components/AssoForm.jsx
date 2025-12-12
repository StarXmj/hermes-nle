// src/components/AssoForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../pages/ContactPage.css'; // Style global

// Configuration Storage
const BUCKET_NAME = 'assos';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const supabaseStorageUrlStart = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// Helper suppression image
async function deleteStorageFile(url) {
  if (!url || !url.startsWith(supabaseStorageUrlStart)) return;
  try {
    const urlParts = url.split(`/${BUCKET_NAME}/`);
    if (urlParts.length > 1) {
      const filePath = decodeURIComponent(urlParts[1]);
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    }
  } catch (e) { console.warn("Erreur suppression logo:", e); }
}

function AssoForm({ asso, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    lien: '',
    mots_cles_input: '',
    color: '#0056b3', // Valeur par défaut
    logo: '',
    status: 'brouillon'
  });
  
  // États pour l'upload d'image
  const [file, setFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (asso.id) {
      // Gestion Mots clés
      let tagsString = '';
      if (Array.isArray(asso.mots_cles)) {
        tagsString = asso.mots_cles.join(', ');
      }

      // Gestion Logo existant
      const currentLogo = asso.logo || '';
      if (currentLogo.startsWith(supabaseStorageUrlStart)) {
        setExistingFileName(decodeURIComponent(currentLogo.split('/').pop()));
      }

      setFormData({
        nom: asso.nom || '',
        description: asso.description || '',
        lien: asso.lien || '',
        mots_cles_input: tagsString,
        color: asso.color || '#0056b3',
        logo: '', // On vide pour ne pas conflit avec le fichier
        status: asso.status || 'brouillon'
      });
    } else {
      setFormData({ nom: '', description: '', lien: '', mots_cles_input: '', color: '#0056b3', logo: '', status: 'brouillon' });
    }
  }, [asso]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExistingFileName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Gestion Upload Image
    let finalLogo = asso.logo || ''; // Par défaut, on garde l'ancien
    let fileToDelete = null;
    const isOriginalFile = finalLogo.startsWith(supabaseStorageUrlStart);

    if (file) {
      setUploading(true);
      const fileName = `public/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
      
      if (uploadError) {
        setError(`Erreur upload: ${uploadError.message}`);
        setLoading(false); setUploading(false); return;
      }
      
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      finalLogo = urlData.publicUrl;
      setUploading(false);
      
      // Si on remplace une image existante, on la supprimera
      if (isOriginalFile) fileToDelete = asso.logo;
    } else if (existingFileName === '' && !file && asso.logo) {
       // Si l'utilisateur a supprimé le fichier existant via l'UI (bouton supprimer non implémenté ici mais bonne pratique)
       // Pour l'instant on garde l'ancien si pas de nouveau fichier
    }

    if (fileToDelete) await deleteStorageFile(fileToDelete);

    // 2. Préparation des données
    const tagsArray = formData.mots_cles_input
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const dataToSave = {
      nom: formData.nom,
      description: formData.description,
      lien: formData.lien,
      status: formData.status,
      color: formData.color,
      logo: finalLogo,
      mots_cles: tagsArray
    };

    let apiError;
    if (asso.id) {
      const { error } = await supabase.from('asso').update(dataToSave).eq('id', asso.id);
      apiError = error;
    } else {
      const { error } = await supabase.from('asso').insert(dataToSave);
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
      <h2>{asso.id ? "Modifier l'association" : "Ajouter une association"}</h2>
      
      <form onSubmit={handleSubmit} className="contact-form">
        
        {/* Nom & Couleur sur la même ligne */}
        <div className="form-row">
          <div className="form-group" style={{flex: 3}}>
            <label>Nom de l'association</label>
            <input type="text" name="nom" value={formData.nom} onChange={handleChange} required placeholder="Ex: BDE Sciences" />
          </div>
          <div className="form-group" style={{flex: 1}}>
            <label>Couleur (Thème)</label>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <input 
                type="color" 
                name="color" 
                value={formData.color} 
                onChange={handleChange} 
                style={{height:'45px', padding:'0', cursor:'pointer'}} 
              />
              <span style={{fontSize:'0.8rem', color:'#666'}}>{formData.color}</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} required placeholder="Courte description..."></textarea>
        </div>

        {/* Upload Logo */}
        <div className="form-group">
          <label>Logo de l'asso</label>
          <input type="file" onChange={handleFileChange} accept="image/*" />
          {existingFileName && <p style={{fontSize:'0.85rem', color:'green', marginTop:'5px'}}>Fichier actuel : {existingFileName}</p>}
          {file && <p style={{fontSize:'0.85rem', color:'blue', marginTop:'5px'}}>Nouveau fichier sélectionné : {file.name}</p>}
        </div>

        <div className="form-group">
          <label>Mots-clés (séparés par des virgules)</label>
          <input type="text" name="mots_cles_input" value={formData.mots_cles_input} onChange={handleChange} placeholder="Ex: sport, football, compétition" />
        </div>

        <div className="form-group">
          <label>Lien</label>
          <input type="url" name="lien" value={formData.lien} onChange={handleChange} placeholder="https://..." />
        </div>

        <div className="form-group">
          <label>Statut</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="brouillon">Brouillon (Invisible)</option>
            <option value="publié">Publié (Visible)</option>
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* Métadonnées : On vérifie bien created_by_profile */}
        {asso.id && (
          <div className="form-metadata" style={{backgroundColor:'#f9f9f9', padding:'10px', borderRadius:'5px', marginTop:'20px', border:'1px solid #eee'}}>
            <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
              <strong>Créé le :</strong> {formatFullDate(asso.date_creat)} 
              {/* Correction ici pour l'affichage du nom */}
              <strong> par :</strong> {asso.created_by_profile?.username || 'Inconnu'}
            </p>
            {asso.last_modif && (
              <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
                <strong>Dernière modif :</strong> {formatFullDate(asso.last_modif)} 
                <strong> par :</strong> {asso.modif_by_profile?.username || 'Inconnu'}
              </p>
            )}
          </div>
        )}

        <div className="form-buttons">
          <button type="button" className="cta-button secondary" onClick={onCancel}>Annuler</button>
          <button type="submit" className="cta-button" disabled={loading || uploading}>
            {uploading ? 'Upload...' : (loading ? 'Enregistrement...' : 'Enregistrer')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssoForm;