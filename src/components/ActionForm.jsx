// src/components/ActionForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../pages/ContactPage.css'; // On réutilise le style

// --- CONFIGURATION DU STORAGE ---
const BUCKET_NAME = 'programmes';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const supabaseStorageUrlStart = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

// Fonction helper pour formater les dates
const formatFullDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fonction helper pour supprimer un ancien fichier du storage
async function deleteStorageFile(lien) {
  // (Logique de suppression de fichier...)
  if (!lien || !lien.startsWith(supabaseStorageUrlStart)) return;
  try {
    const urlParts = lien.split(`/${BUCKET_NAME}/`);
    if (urlParts.length > 1) {
      const filePath = decodeURIComponent(urlParts[1]);
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    }
  } catch (e) {
    console.warn("Erreur lors de la suppression du fichier:", e);
  }
}

function ActionForm({ action, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    titre: '',
    infoDate: '',
    dateISO: '',
    lieu: '',
    lienLieu: '',
    description: '',
    lienProgramme: '', // URLS CLASSIQUES
    status: 'brouillon',
  });
  
  const [file, setFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // useEffect "intelligent"
  useEffect(() => {
    setFile(null);
    setExistingFileName('');
    
    if (action.id) {
      const isoDate = action.dateISO ? new Date(action.dateISO).toISOString().split('T')[0] : '';
      const currentLien = action.lienProgramme || '';
      
      // On ne copie que les champs du formulaire,
      // on garde 'action' complet pour les métadonnées
      const baseData = { ...action, dateISO: isoDate };
      
      if (currentLien.startsWith(supabaseStorageUrlStart)) {
        setExistingFileName(decodeURIComponent(currentLien.split('/').pop()));
        setFormData({ ...baseData, lienProgramme: '' }); 
      } else {
        setFormData({ ...baseData });
      }
      
    } else {
      setFormData({
        titre: '', infoDate: '', dateISO: '', lieu: '',
        lienLieu: '', description: '', lienProgramme: '', status: 'brouillon',
      });
    }
  }, [action]);

  const handleChange = (e) => {
    // (Logique handleChange...)
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'lienProgramme' && value) {
      setFile(null);
      setExistingFileName('');
    }
  };
  
  const handleFileChange = (e) => {
    // (Logique handleFileChange...)
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFormData(prev => ({ ...prev, lienProgramme: '' }));
      setExistingFileName('');
    }
  };
  
  const handleRemoveExistingFile = () => {
    setExistingFileName(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploading(false);
    setError(null);

    if (action.id) {
      // On va vérifier la version actuelle en base de données
      const { data: currentDbVersion, error: checkError } = await supabase
        .from('actions')
        .select('last_modif')
        .eq('id', action.id)
        .single();

      if (!checkError && currentDbVersion) {
        // On compare les timestamps (en millisecondes pour être précis)
        const dbTime = new Date(currentDbVersion.last_modif).getTime();
        const localTime = new Date(action.last_modif).getTime();

        // Si la date en base est plus récente que celle qu'on a chargée
        if (dbTime > localTime) {
          setError("⚠️ CONFLIT DÉTECTÉ : Quelqu'un a modifié cette fiche pendant que vous l'éditiez. Vos modifications n'ont pas été enregistrées pour ne pas écraser son travail. Veuillez annuler et rafraîchir la page.");
          setLoading(false);
          return; // ON ARRÊTE TOUT ICI
        }
      }
    }

    // IMPORTANT : On utilise 'action.lienProgramme' pour avoir l'original
    const originalLienProgramme = action.lienProgramme || '';
    let finalLienProgramme = '';
    let fileToDelete = null;
    const isOriginalFile = originalLienProgramme.startsWith(supabaseStorageUrlStart);

    // Scénario 1 : Nouveau fichier
    if (file) {
      setUploading(true);
      const fileName = `public/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME).upload(fileName, file);
      if (uploadError) {
        setError(`Erreur d'upload : ${uploadError.message}`);
        setLoading(false); setUploading(false); return;
      }
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME).getPublicUrl(fileName);
      finalLienProgramme = urlData.publicUrl;
      setUploading(false);
      if (isOriginalFile) fileToDelete = originalLienProgramme;
    } 
    // Scénario 2 : Nouvelle URL
    else if (formData.lienProgramme) {
      finalLienProgramme = formData.lienProgramme;
      if (isOriginalFile) fileToDelete = originalLienProgramme;
    } 
    // Scénario 3 : Ancien fichier conservé
    else if (existingFileName) {
      finalLienProgramme = originalLienProgramme;
    } 
    // Scénario 4 : Tout est vide
    else {
      finalLienProgramme = '';
      if (isOriginalFile) fileToDelete = originalLienProgramme;
    }

    if (fileToDelete) {
      await deleteStorageFile(fileToDelete);
    }

    // On prépare la sauvegarde BDD
    // On retire les données jointes (les profils) avant l'update
    const { 
      created_by_profile, 
      modif_by_profile, 
      ...dataToSave 
    } = formData;

    // On remet les bons champs
    dataToSave.lienProgramme = finalLienProgramme;
    dataToSave.dateISO = new Date(formData.dateISO).toISOString();
    // created_by et modif_by sont gérés par les Triggers/Defaults SQL

    let error;
    
    if (action.id) { // Mode UPDATE
      // On retire created_by car il ne doit pas être modifié
      delete dataToSave.created_by; 
      const { error: updateError } = await supabase
        .from('actions')
        .update(dataToSave)
        .eq('id', action.id);
      error = updateError;
    } else { // Mode CREATE
      delete dataToSave.id; 
      const { error: insertError } = await supabase
        .from('actions')
        .insert(dataToSave);
      error = insertError;
    }

    if (error) {
      setError(error.message);
    } else {
      onSave(); 
    }
    setLoading(false);
  };

  return (
    <div className="section-content" style={{maxWidth: '800px', textAlign: 'left'}}>
      <h2>{action.id ? "Modifier l'action" : "Créer une nouvelle action"}</h2>
      
      <form onSubmit={handleSubmit} className="contact-form">
        
        {/* ... (tous vos champs : titre, date, lieu, description...) ... */}
        <div className="form-group">
          <label htmlFor="titre">Titre de l'action</label>
          <input type="text" name="titre" value={formData.titre} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateISO">Date ( pour classement ordre chronologique)</label>
            <input type="date" name="dateISO" value={formData.dateISO} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="infoDate">Info Pratique (ex: Jeudi 20 Novembre 2025)</label>
            <input type="text" name="infoDate" value={formData.infoDate} onChange={handleChange} />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="lieu">Lieu (ex: Bar 'Le Campus', Centre-ville)</label>
          <input type="text" name="lieu" value={formData.lieu} onChange={handleChange} />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange}></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="lienLieu">Lien Google Maps</label>
          <input type="url" name="lienLieu" value={formData.lienLieu} onChange={handleChange} />
        </div>
        
        {/* ... (logique du lien programme/fichier...) ... */}
        <div className="form-group">
          <label htmlFor="lienProgramme">Lien Programme (URL classique)</label>
          <input 
            type="url" 
            name="lienProgramme" 
            value={formData.lienProgramme} 
            onChange={handleChange}
            disabled={!!file || !!existingFileName} 
            placeholder={existingFileName ? "Un fichier est déjà sélectionné ci-dessous" : "https://..."}
          />
        </div>
        
        <p style={{textAlign: 'center', margin: '0.5rem 0', fontWeight: 'bold'}}>OU</p>

        {existingFileName && (
          <div className="form-group-existing-file">
            <p>Fichier actuel : {existingFileName}</p>
            <button 
              type="button" 
              onClick={handleRemoveExistingFile} 
              className="cta-button secondary"
              style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto', background: '#6c757d', border: 'none'}}
            >
              Changer/Supprimer
            </button>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="fileProgramme">Téléverser un fichier (PDF/PNG/JPG)</label>
          <input 
            type="file" 
            name="fileProgramme"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            disabled={uploading || !!formData.lienProgramme}
          />
          {file && <p style={{margin: '0.5rem 0', fontStyle: 'italic'}}>Nouveau fichier : {file.name}</p>}
          {uploading && <p>Téléversement en cours...</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Statut</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="brouillon">Brouillon</option>
            <option value="publié">Publié</option>
          </select>
        </div>
        
        {error && <p className="error-message">{error}</p>}

        {/* --- MODIFICATION ICI : Affichage des métadonnées --- */}
        {/* On affiche seulement si on est en mode "modification" (action.id existe) */}
        {action.id && (
          <div className="form-metadata">
            <p>
              <strong>Créé le:</strong> {formatFullDate(action.date_creat)} 
              {/* On lit la prop 'action' (avec données jointes), pas 'formData' */}
              <strong> par:</strong> {action.created_by_profile?.username || 'Utilisateur supprimé'}
            </p>
            
            {/* On n'affiche la modif que si elle existe */}
            {action.modif_by && (
              <p>
                <strong>Dernière modif:</strong> {formatFullDate(action.last_modif)} 
                <strong> par:</strong> {action.modif_by_profile?.username || 'Utilisateur supprimé'}
              </p>
            )}
          </div>
        )}
        {/* --- FIN DE LA MODIFICATION --- */}

        <div className="form-buttons">
          <button type="button" className="cta-button secondary" onClick={onCancel}>
            Annuler
          </button>
          <button 
            type="submit" 
            className="cta-button" 
            disabled={loading || uploading} 
          >
            {uploading ? 'Téléversement...' : (loading ? 'Enregistrement...' : 'Enregistrer')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ActionForm;