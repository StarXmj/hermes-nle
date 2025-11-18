// src/components/BlogForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FaEye, FaTimes, FaCalendarAlt } from 'react-icons/fa'; // Icônes

import '../pages/ContactPage.css'; // CSS Formulaire
import '../pages/ArticleDetailPage.css'; // CSS pour la PRÉVISUALISATION (Important !)
import '../components/TestModeModal.css'; // CSS pour la MODALE
import DOMPurify from 'dompurify'; // <--- AJOUTER L'IMPORT

const BUCKET_NAME = 'blog';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const supabaseStorageUrlStart = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image'],
    ['clean']
  ],
};

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
  } catch (e) { console.warn("Erreur suppression image:", e); }
}

function BlogForm({ article, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    titre: '',
    resume: '',
    contenu: '',
    image: '',
    status: 'brouillon'
  });

  const [file, setFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // NOUVEAU : État pour la prévisualisation
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (article.id) {
      const currentImage = article.image || '';
      if (currentImage.startsWith(supabaseStorageUrlStart)) {
        setExistingFileName(decodeURIComponent(currentImage.split('/').pop()));
        setFormData({ ...article, image: '' });
      } else {
        setFormData(article);
      }
    } else {
      setFormData({ titre: '', resume: '', contenu: '', image: '', status: 'brouillon' });
    }
  }, [article]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'image' && value) {
      setFile(null);
      setExistingFileName('');
    }
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({ ...prev, contenu: content }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFormData(prev => ({ ...prev, image: '' }));
      setExistingFileName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (article.id) {
              // On va vérifier la version actuelle en base de données
              const { data: currentDbVersion, error: checkError } = await supabase
                .from('articles')
                .select('last_modif')
                .eq('id', article.id)
                .single();
        
              if (!checkError && currentDbVersion) {
                // On compare les timestamps (en millisecondes pour être précis)
                const dbTime = new Date(currentDbVersion.last_modif).getTime();
                const localTime = new Date(article.last_modif).getTime();
        
                // Si la date en base est plus récente que celle qu'on a chargée
                if (dbTime > localTime) {
                  setError("⚠️ CONFLIT DÉTECTÉ : Quelqu'un a modifié cette fiche pendant que vous l'éditiez. Vos modifications n'ont pas été enregistrées pour ne pas écraser son travail. Veuillez annuler et rafraîchir la page.");
                  setLoading(false);
                  return; // ON ARRÊTE TOUT ICI
                }
              }
            }

    let finalImage = formData.image;
    let fileToDelete = null;
    const originalImage = article.image || '';
    const isOriginalFile = originalImage.startsWith(supabaseStorageUrlStart);

    if (file) {
      setUploading(true);
      const fileName = `public/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
      
      if (uploadError) {
        setError(`Erreur upload: ${uploadError.message}`);
        setLoading(false); setUploading(false); return;
      }
      
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      finalImage = urlData.publicUrl;
      setUploading(false);
      if (isOriginalFile) fileToDelete = originalImage;
    } else if (formData.image) {
      finalImage = formData.image;
      if (isOriginalFile) fileToDelete = originalImage;
    } else if (existingFileName) {
      finalImage = originalImage;
    } else {
      finalImage = '';
      if (isOriginalFile) fileToDelete = originalImage;
    }

    if (fileToDelete) await deleteStorageFile(fileToDelete);

    const dataToSave = { ...formData, image: finalImage };
    delete dataToSave.created_by_profile;
    delete dataToSave.modif_by_profile;
    delete dataToSave.created_by;
    delete dataToSave.modif_by;
    delete dataToSave.date_creat;
    delete dataToSave.last_modif;

    let apiError;
    if (article.id) {
      const { error } = await supabase.from('articles').update(dataToSave).eq('id', article.id);
      apiError = error;
    } else {
      delete dataToSave.id;
      const { error } = await supabase.from('articles').insert(dataToSave);
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

  // --- NOUVEAU : Composant de Prévisualisation ---
  const PreviewModal = () => {
    let previewImageSrc = formData.image;
    if (file) {
      previewImageSrc = URL.createObjectURL(file);
    } else if (existingFileName && article.image) {
      previewImageSrc = article.image;
    }

    // NETTOYAGE
    const cleanPreviewContent = DOMPurify.sanitize(formData.contenu);

    return (
      <div className="modal-overlay" style={{zIndex: 9999, alignItems: 'flex-start', paddingTop: '2rem'}}>
        <div className="modal-content" style={{width: '95%', maxWidth: '900px', height: '90vh', overflowY: 'auto', padding: '0', textAlign: 'left', position: 'relative'}}>
          
          {/* Barre d'en-tête de la preview */}
          <div style={{
            position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #eee', 
            padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10
          }}>
            <h3 style={{margin: 0, color: '#555'}}>Prévisualisation</h3>
            <button onClick={() => setShowPreview(false)} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}>
              <FaTimes />
            </button>
          </div>

          {/* Contenu mimant la page article */}
          <div className="article-detail-page" style={{padding: '2rem'}}>
             <div className="article-container" style={{margin: '0 auto'}}>
                <header className="article-header">
                  <h1 style={{fontSize: '2.5rem', color: '#003366', marginBottom: '0.5rem'}}>
                    {formData.titre || "Titre de l'article"}
                  </h1>
                  <div className="article-meta-detail" style={{color: '#777', fontSize: '0.9rem', display: 'flex', gap: '1.5rem'}}>
                    <span><FaCalendarAlt /> {new Date().toLocaleDateString('fr-FR')} (Aujourd'hui)</span>
                    <span>Par <strong>Vous</strong></span>
                  </div>
                </header>

                {/* On affiche le résumé en italique pour info */}
                {formData.resume && (
                  <div style={{fontStyle: 'italic', color: '#666', marginBottom: '2rem', borderLeft: '4px solid #0056b3', paddingLeft: '1rem'}}>
                    {formData.resume}
                  </div>
                )}

                {previewImageSrc && (
                  <div className="article-cover-image">
                    <img src={previewImageSrc} alt="Preview" style={{width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '2rem'}} />
                  </div>
                )}

                <div 
                  className="article-content ql-editor"
              dangerouslySetInnerHTML={{ __html: cleanPreviewContent }} // <--- UTILISER LA VERSION NETTOYÉE
                />
             </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="section-content" style={{maxWidth: '900px', textAlign: 'left'}}>
      <h2>{article.id ? "Modifier l'article" : "Rédiger un article"}</h2>
      
      {/* AFFICHER LA MODALE SI ACTIVE */}
      {showPreview && <PreviewModal />}

      <form onSubmit={handleSubmit} className="contact-form">
        
        <div className="form-group">
          <label>Titre</label>
          <input type="text" name="titre" value={formData.titre} onChange={handleChange} required style={{fontSize: '1.2rem', fontWeight: 'bold'}} />
        </div>

        <div className="form-group">
          <label>Résumé / Accroche</label>
          <textarea name="resume" rows="2" value={formData.resume} onChange={handleChange} placeholder="Apparaîtra dans la liste des articles..." style={{resize:'none'}}></textarea>
        </div>

        <div className="form-group" style={{marginBottom: '3rem'}}> 
          <label>Contenu de l'article</label>
          <div style={{backgroundColor: 'white', color: 'black'}}>
            <ReactQuill 
              theme="snow" 
              value={formData.contenu} 
              onChange={handleEditorChange} 
              modules={modules}
              style={{height: '400px'}} 
            />
          </div>
        </div>

        <div className="form-group" style={{marginTop: '4rem'}}>
          <label>Image de couverture (URL)</label>
          <input type="url" name="image" value={formData.image} onChange={handleChange} disabled={!!file} placeholder="https://..." />
        </div>
        <p style={{textAlign:'center', margin:'0.5rem 0', fontWeight:'bold'}}>OU</p>
        {existingFileName && (
          <div className="form-group-existing-file">
            <p>Fichier actuel : {existingFileName}</p>
            <button type="button" onClick={() => setExistingFileName('')} className="cta-button secondary" style={{padding:'5px 10px', fontSize:'0.8rem'}}>Supprimer</button>
          </div>
        )}
        <div className="form-group">
          <label>Téléverser une image de couverture</label>
          <input type="file" onChange={handleFileChange} accept="image/*" disabled={!!formData.image} />
        </div>

        <div className="form-group">
          <label>Statut</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="brouillon">Brouillon (Caché)</option>
            <option value="publié">Publié (Visible)</option>
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}

        {article.id && (
          <div className="form-metadata" style={{backgroundColor:'#f9f9f9', padding:'10px', borderRadius:'5px', marginTop:'20px', border:'1px solid #eee'}}>
            <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
              <strong>Créé le :</strong> {formatFullDate(article.date_creat)} 
              <strong> par :</strong> {article.created_by_profile?.username || 'Inconnu'}
            </p>
            {article.modif_by && (
              <p style={{margin:'5px 0', fontSize:'0.9rem', color:'#555'}}>
                <strong>Dernière modif :</strong> {formatFullDate(article.last_modif)} 
                <strong> par :</strong> {article.modif_by_profile?.username || 'Inconnu'}
              </p>
            )}
          </div>
        )}

        <div className="form-buttons" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          
          {/* BOUTON PRÉVISUALISER (à gauche) */}
          <button 
            type="button" 
            className="cta-button secondary" 
            onClick={() => setShowPreview(true)}
            style={{display: 'flex', alignItems: 'center', gap: '8px'}}
          >
            <FaEye /> Prévisualiser
          </button>

          <div style={{display: 'flex', gap: '1rem'}}>
            <button type="button" className="cta-button secondary" onClick={onCancel}>Annuler</button>
            <button type="submit" className="cta-button" disabled={loading || uploading}>
              {uploading ? 'Envoi...' : (loading ? 'Enregistrement...' : 'Enregistrer')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default BlogForm;