// src/components/PartnerForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../pages/ContactPage.css'; // On réutilise le CSS global

const BUCKET_NAME = 'partenaires';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const supabaseStorageUrlStart = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

// Helper date
const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// Helper suppression fichier
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

function PartnerForm({ partenaire, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nom: '',
    logo: '', // URL du logo
    description: '',
    histoire: '',
    lienAdresse: '',
    lienSite: '',
    status: 'brouillon'
  });

  const [file, setFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (partenaire.id) {
      const currentLogo = partenaire.logo || '';
      
      if (currentLogo.startsWith(supabaseStorageUrlStart)) {
        setExistingFileName(decodeURIComponent(currentLogo.split('/').pop()));
        setFormData({ ...partenaire, logo: '' });
      } else {
        setFormData(partenaire);
      }
    } else {
      setFormData({
        nom: '', logo: '', description: '', histoire: '', lienAdresse: '', lienSite: '', status: 'brouillon'
      });
    }
  }, [partenaire]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'logo' && value) {
      setFile(null);
      setExistingFileName('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFormData(prev => ({ ...prev, logo: '' }));
      setExistingFileName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalLogo = formData.logo;
    let fileToDelete = null;
    const originalLogo = partenaire.logo || '';
    const isOriginalFile = originalLogo.startsWith(supabaseStorageUrlStart);

    // 1. Upload du logo si nécessaire
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
      if (isOriginalFile) fileToDelete = originalLogo;
      
    } else if (formData.logo) {
      finalLogo = formData.logo;
      if (isOriginalFile) fileToDelete = originalLogo;
    } else if (existingFileName) {
      finalLogo = originalLogo;
    } else {
      finalLogo = '';
      if (isOriginalFile) fileToDelete = originalLogo;
    }

    // 2. Nettoyage
    if (fileToDelete) await deleteStorageFile(fileToDelete);

    // 3. Sauvegarde
    const dataToSave = { ...formData, logo: finalLogo };
    
    // On enlève les champs techniques non modifiables
    delete dataToSave.created_by_profile;
    delete dataToSave.modif_by_profile;
    delete dataToSave.date_creat;
    delete dataToSave.last_modif;
    delete dataToSave.created_by;
    delete dataToSave.modif_by;

    let apiError;
    if (partenaire.id) {
      const { error } = await supabase.from('partenaires').update(dataToSave).eq('id', partenaire.id);
      apiError = error;
    } else {
      delete dataToSave.id; // ID généré par la base (int8 auto-increment ou équivalent)
      const { error } = await supabase.from('partenaires').insert(dataToSave);
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
      <h2>{partenaire.id ? "Modifier le partenaire" : "Ajouter un partenaire"}</h2>
      
      <form onSubmit={handleSubmit} className="contact-form">
        
        <div className="form-group">
          <label>Nom du partenaire</label>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Description (Courte)</label>
          <textarea name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Apparaît sur la carte..."></textarea>
        </div>

        <div className="form-group">
          <label>Histoire / Détails (Long)</label>
          <textarea name="histoire" rows="5" value={formData.histoire} onChange={handleChange} placeholder="L'histoire complète ou l'offre détaillée..."></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Lien Site Web</label>
            <input type="url" name="lienSite" value={formData.lienSite} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Lien Google Maps</label>
            <input type="url" name="lienAdresse" value={formData.lienAdresse} onChange={handleChange} placeholder="https://maps..." />
          </div>
        </div>

        {/* Gestion du Logo */}
        <div className="form-group">
          <label>Logo (URL)</label>
          <input type="url" name="logo" value={formData.logo} onChange={handleChange} disabled={!!file} placeholder="https://..." />
        </div>
        <p style={{textAlign:'center', margin:'0.5rem 0', fontWeight:'bold'}}>OU</p>
        {existingFileName && (
          <div className="form-group-existing-file">
            <p>Logo actuel : {existingFileName}</p>
            <button type="button" onClick={() => setExistingFileName('')} className="cta-button secondary" style={{padding:'5px 10px', fontSize:'0.8rem'}}>Supprimer</button>
          </div>
        )}
        <div className="form-group">
          <label>Téléverser un logo (PNG/JPG)</label>
          <input type="file" onChange={handleFileChange} accept="image/*" disabled={!!formData.logo} />
        </div>

        <div className="form-group">
          <label>Statut</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="brouillon">Brouillon</option>
            <option value="publié">Publié</option>
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* Métadonnées */}
        {partenaire.id && (
          <div className="form-metadata" style={{backgroundColor:'#f9f9f9', padding:'10px', borderRadius:'5px', marginTop:'20px', border:'1px solid #eee'}}>
            <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
              <strong>Créé le :</strong> {formatFullDate(partenaire.date_creat)} 
              <strong> par :</strong> {partenaire.created_by_profile?.username || 'Inconnu'}
            </p>
            {partenaire.modif_by && (
              <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
                <strong>Dernière modif :</strong> {formatFullDate(partenaire.last_modif)} 
                <strong> par :</strong> {partenaire.modif_by_profile?.username || 'Inconnu'}
              </p>
            )}
          </div>
        )}

        <div className="form-buttons">
          <button type="button" className="cta-button secondary" onClick={onCancel}>Annuler</button>
          <button type="submit" className="cta-button" disabled={loading || uploading}>
            {uploading ? 'Envoi...' : (loading ? 'Enregistrement...' : 'Enregistrer')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PartnerForm;