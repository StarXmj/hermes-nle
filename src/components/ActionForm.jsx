// src/components/ActionForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaTrash, FaPlus, FaFilePdf, FaImage, FaLink } from 'react-icons/fa'; 
import '../pages/ContactPage.css'; 

const BUCKET_NAME = 'programmes';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const supabaseStorageUrlStart = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

// Helper pour savoir si une URL vient de notre stockage
const isStorageFile = (url) => {
  return url && url.startsWith(supabaseStorageUrlStart);
};

function ActionForm({ action, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    titre: '',
    infoDate: '',
    dateISO: '',
    lieu: '',
    lienLieu: '',
    description: '',
    status: 'brouillon',
  });

  // State pour les liens modulaires uniquement
  const [extraLinks, setExtraLinks] = useState([]); 
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (action.id) {
      const isoDate = action.dateISO ? new Date(action.dateISO).toISOString().split('T')[0] : '';
      
      // On ne charge plus 'lienProgramme'
      const baseData = { ...action, dateISO: isoDate };
      // On nettoie l'objet pour ne pas garder l'ancien champ dans le formData
      delete baseData.lienProgramme; 
      
      setFormData({ ...baseData });

     
      setExtraLinks(action.extra_links || []);
      
    } else {
      setFormData({
        titre: '', infoDate: '', dateISO: '', lieu: '',
        lienLieu: '', description: '', status: 'brouillon',
      });
      setExtraLinks([]);
    }
  }, [action]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  
  const addLink = () => {
    setExtraLinks([...extraLinks, { label: '', url: '', file: null }]);
  };

  const removeLink = (index) => {
    const newLinks = [...extraLinks];
    newLinks.splice(index, 1);
    setExtraLinks(newLinks);
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...extraLinks];
    newLinks[index][field] = value;
    // Si on change l'URL manuellement, on enlève le fichier en attente
    if (field === 'url' && value) {
      newLinks[index].file = null;
    }
    setExtraLinks(newLinks);
  };

  const updateLinkFile = (index, fileObj) => {
    const newLinks = [...extraLinks];
    newLinks[index].file = fileObj;
    newLinks[index].url = ''; 
    setExtraLinks(newLinks);
  };

  const clearLinkFile = (index) => {
    const newLinks = [...extraLinks];
    newLinks[index].file = null;
    newLinks[index].url = ''; 
    setExtraLinks(newLinks);
  };

  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploading(false);
    setError(null);

    try {
        const processedExtraLinks = await Promise.all(extraLinks.map(async (link, index) => {
            // Si un NOUVEAU fichier est sélectionné
            if (link.file) {
                setUploading(true); 
                const fileName = `public/${Date.now()}-EXTRA-${index}-${link.file.name}`;
                const { error: uploadErr } = await supabase.storage.from(BUCKET_NAME).upload(fileName, link.file);
                
                if (uploadErr) throw new Error(`Erreur upload lien "${link.label}": ${uploadErr.message}`);
                
                const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
                
                // On retourne l'objet propre
                return { label: link.label, url: publicUrlData.publicUrl };
            }
            // Sinon on garde l'existant
            return { label: link.label, url: link.url };
        }));

        const dataToSave = {
            ...formData,
            dateISO: new Date(formData.dateISO).toISOString(),
            extra_links: processedExtraLinks,
            // On peut explicitement mettre null pour nettoyer la base si la colonne existe encore
            lienProgramme: null 
        };

        // Nettoyage champs techniques
        delete dataToSave.created_by_profile;
        delete dataToSave.modif_by_profile;
        delete dataToSave.created_by;
        delete dataToSave.modif_by;
        delete dataToSave.date_creat;
        delete dataToSave.last_modif;
        if (!action.id) delete dataToSave.id;

        // 3. Envoi BDD
        let apiError;
        if (action.id) {
            const { error } = await supabase.from('actions').update(dataToSave).eq('id', action.id);
            apiError = error;
        } else {
            const { error } = await supabase.from('actions').insert(dataToSave);
            apiError = error;
        }

        if (apiError) throw apiError;

        setLoading(false);
        onSave();

    } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
        setUploading(false);
    }
  };

  return (
    <div className="section-content" style={{maxWidth: '800px', textAlign: 'left'}}>
      <h2>{action.id ? "Modifier l'action" : "Créer une nouvelle action"}</h2>
      
      <form onSubmit={handleSubmit} className="contact-form">
        
        <div className="form-group">
          <label htmlFor="titre">Titre de l'action</label>
          <input type="text" name="titre" value={formData.titre} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateISO">Date (tri)</label>
            <input type="date" name="dateISO" value={formData.dateISO} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="infoDate">Info Pratique (ex: Jeudi 20h)</label>
            <input type="text" name="infoDate" value={formData.infoDate} onChange={handleChange} />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="lieu">Lieu</label>
          <input type="text" name="lieu" value={formData.lieu} onChange={handleChange} />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea name="description" rows="3" value={formData.description} onChange={handleChange}></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="lienLieu">Lien Google Maps</label>
          <input type="url" name="lienLieu" value={formData.lienLieu} onChange={handleChange} />
        </div>

        {/* --- SECTION LIENS MODULAIRES (Unique gestionnaire de liens/fichiers) --- */}
        <div className="form-group" style={{background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0', marginTop: '1rem'}}>
          <label style={{marginBottom: '1rem', display: 'block', fontWeight: 'bold', color: '#003366'}}>
            <FaLink style={{marginRight:'8px'}}/> 
            Liens, Affiches & Programmes
          </label>
          
          {extraLinks.map((link, index) => {
            const isFileMode = !!link.file || isStorageFile(link.url);
            const displayUrl = link.file ? `Fichier prêt : ${link.file.name}` : (isStorageFile(link.url) ? `Fichier hébergé` : link.url);

            return (
              <div key={index} style={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px', 
                  marginBottom: '15px', 
                  padding: '10px', 
                  backgroundColor: '#fff', 
                  borderRadius: '6px',
                  border: '1px solid #ddd'
              }}>
                {/* Ligne 1 : Nom et Boutons */}
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <div style={{flex: 1}}>
                        <input 
                        type="text" 
                        placeholder="Nom (ex: Programme, Billetterie...)" 
                        value={link.label}
                        onChange={(e) => updateLink(index, 'label', e.target.value)}
                        style={{marginBottom: 0, fontWeight: '500'}}
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={() => removeLink(index)}
                        className="admin-btn icon-btn danger"
                        title="Supprimer ce lien"
                    >
                        <FaTrash />
                    </button>
                </div>

                {/* Ligne 2 : Choix Type (URL ou Fichier) */}
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    {/* Input URL */}
                    <div style={{flex: 1, position: 'relative'}}>
                        {!link.file && !isStorageFile(link.url) ? (
                            <input 
                                type="url" 
                                placeholder="https://..." 
                                value={link.url}
                                onChange={(e) => updateLink(index, 'url', e.target.value)}
                                style={{marginBottom: 0, width: '100%', boxSizing: 'border-box'}}
                            />
                        ) : (
                            <div style={{
                                padding: '10px', 
                                background: '#e6f4ea', 
                                borderRadius: '5px', 
                                color: '#1e7e34', 
                                fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                {isStorageFile(link.url) ? <FaFilePdf /> : <FaImage />} 
                                <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth:'200px'}}>
                                    {displayUrl}
                                </span>
                            </div>
                        )}
                    </div>

                    <span style={{fontSize:'0.8rem', color:'#777', fontWeight:'bold'}}>OU</span>

                    {/* Input Fichier */}
                    <div style={{flex: 0.5}}>
                        {isFileMode ? (
                            <button 
                                type="button" 
                                className="cta-button secondary"
                                style={{padding: '8px 12px', fontSize: '0.8rem', width: '100%'}}
                                onClick={() => clearLinkFile(index)}
                            >
                                Retirer Fichier
                            </button>
                        ) : (
                            <label className="cta-button secondary" style={{
                                padding: '8px 12px', 
                                fontSize: '0.8rem', 
                                width: '100%', 
                                display: 'inline-block', 
                                textAlign: 'center',
                                cursor: 'pointer',
                                margin: 0
                            }}>
                                Upload
                                <input 
                                    type="file" 
                                    style={{display: 'none'}} 
                                    accept="image/*,application/pdf"
                                    onChange={(e) => {
                                        if(e.target.files[0]) updateLinkFile(index, e.target.files[0]);
                                    }}
                                />
                            </label>
                        )}
                    </div>
                </div>
              </div>
            );
          })}

          <button 
            type="button" 
            onClick={addLink} 
            className="cta-button"
            style={{fontSize: '0.9rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto'}}
          >
            <FaPlus /> Ajouter un élément
          </button>
        </div>
        
        {/* Statut et Boutons */}
        <div className="form-group">
          <label>Statut</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="brouillon">Brouillon</option>
            <option value="publié">Publié</option>
          </select>
        </div>
        
        {error && <p className="error-message">{error}</p>}

        <div className="form-buttons">
          <button type="button" className="cta-button secondary" onClick={onCancel}>Annuler</button>
          <button type="submit" className="cta-button" disabled={loading || uploading}>
            {uploading ? 'Upload en cours...' : (loading ? 'Enregistrement...' : 'Enregistrer')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ActionForm;