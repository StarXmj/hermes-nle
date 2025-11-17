// src/components/MemberForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../pages/ContactPage.css'; // CSS Global

const BUCKET_NAME = 'membres';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const supabaseStorageUrlStart = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

async function deleteStorageFile(url) {
  if (!url || !url.startsWith(supabaseStorageUrlStart)) return;
  try {
    const urlParts = url.split(`/${BUCKET_NAME}/`);
    if (urlParts.length > 1) {
      const filePath = decodeURIComponent(urlParts[1]);
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    }
  } catch (e) { console.warn("Erreur suppression photo:", e); }
}

function MemberForm({ membre, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nom: '',
    role: '',
    bio: '',
    photo: '',
    status: 'brouillon'
  });

  const [file, setFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (membre.id) {
      const currentPhoto = membre.photo || '';
      if (currentPhoto.startsWith(supabaseStorageUrlStart)) {
        setExistingFileName(decodeURIComponent(currentPhoto.split('/').pop()));
        setFormData({ ...membre, photo: '' });
      } else {
        setFormData(membre);
      }
    } else {
      setFormData({ nom: '', role: '', bio: '', photo: '', status: 'brouillon' });
    }
  }, [membre]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'photo' && value) {
      setFile(null);
      setExistingFileName('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFormData(prev => ({ ...prev, photo: '' }));
      setExistingFileName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalPhoto = formData.photo;
    let fileToDelete = null;
    const originalPhoto = membre.photo || '';
    const isOriginalFile = originalPhoto.startsWith(supabaseStorageUrlStart);

    // Upload
    if (file) {
      setUploading(true);
      const fileName = `public/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
      
      if (uploadError) {
        setError(`Erreur upload: ${uploadError.message}`);
        setLoading(false); setUploading(false); return;
      }
      
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      finalPhoto = urlData.publicUrl;
      setUploading(false);
      if (isOriginalFile) fileToDelete = originalPhoto;
    } else if (formData.photo) {
      finalPhoto = formData.photo;
      if (isOriginalFile) fileToDelete = originalPhoto;
    } else if (existingFileName) {
      finalPhoto = originalPhoto;
    } else {
      finalPhoto = '';
      if (isOriginalFile) fileToDelete = originalPhoto;
    }

    if (fileToDelete) await deleteStorageFile(fileToDelete);

    // Sauvegarde BDD
    const dataToSave = { ...formData, photo: finalPhoto };
    delete dataToSave.created_by_profile;
    delete dataToSave.modif_by_profile;
    delete dataToSave.date_creat;
    delete dataToSave.last_modif;
    delete dataToSave.created_by;
    delete dataToSave.modif_by;

    let apiError;
    if (membre.id) {
      const { error } = await supabase.from('membres').update(dataToSave).eq('id', membre.id);
      apiError = error;
    } else {
      delete dataToSave.id;
      const { error } = await supabase.from('membres').insert(dataToSave);
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
      <h2>{membre.id ? "Modifier le membre" : "Ajouter un membre"}</h2>
      
      <form onSubmit={handleSubmit} className="contact-form">
        
        <div className="form-row">
            <div className="form-group">
                <label>Nom / Prénom</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Rôle (ex: Président, Trésorier...)</label>
                <input type="text" name="role" value={formData.role} onChange={handleChange} required />
            </div>
        </div>

        <div className="form-group">
          <label>Bio / Description</label>
          <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} placeholder="Quelques mots sur cette personne..."></textarea>
        </div>

        {/* Photo */}
        <div className="form-group">
          <label>Photo (URL)</label>
          <input type="url" name="photo" value={formData.photo} onChange={handleChange} disabled={!!file} placeholder="https://..." />
        </div>
        <p style={{textAlign:'center', margin:'0.5rem 0', fontWeight:'bold'}}>OU</p>
        {existingFileName && (
          <div className="form-group-existing-file">
            <p>Fichier actuel : {existingFileName}</p>
            <button type="button" onClick={() => setExistingFileName('')} className="cta-button secondary" style={{padding:'5px 10px', fontSize:'0.8rem'}}>Supprimer</button>
          </div>
        )}
        <div className="form-group">
          <label>Téléverser une photo (PNG/JPG)</label>
          <input type="file" onChange={handleFileChange} accept="image/*" disabled={!!formData.photo} />
        </div>

        <div className="form-group">
          <label>Statut</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="brouillon">Brouillon (Caché)</option>
            <option value="publié">Publié (Visible)</option>
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}

        {membre.id && (
          <div className="form-metadata" style={{backgroundColor:'#f9f9f9', padding:'10px', borderRadius:'5px', marginTop:'20px', border:'1px solid #eee'}}>
            <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
              <strong>Créé le :</strong> {formatFullDate(membre.date_creat)} 
              <strong> par :</strong> {membre.created_by_profile?.username || 'Inconnu'}
            </p>
            {membre.modif_by && (
              <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
                <strong>Dernière modif :</strong> {formatFullDate(membre.last_modif)} 
                <strong> par :</strong> {membre.modif_by_profile?.username || 'Inconnu'}
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

export default MemberForm;