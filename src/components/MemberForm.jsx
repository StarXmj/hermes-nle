// src/components/MemberForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../pages/ContactPage.css'; // CSS Global

const BUCKET_NAME = 'membres';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const supabaseStorageUrlStart = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

// 1. DÉFINITION DES ÉQUIPES
const AVAILABLE_TEAMS = [
  { id: 'bureau', label: 'Le Bureau' },
  { id: 'redaction', label: 'Équipe Rédaction' },
  { id: 'web', label: 'Équipe Web' },
  { id: 'evenementiel', label: 'Équipe Événementiel' },
  { id: 'communication', label: 'Équipe Communication' },
  { id: 'elus', label: 'Élus Liste Étudiante' }
];

// 2. DÉFINITION DES RANGS DANS L'ÉQUIPE
const TEAM_RANKS = [
  { id: 'responsable', label: 'Responsable' },
  { id: 'co-responsable', label: 'Co-Responsable' },
  { id: 'membre', label: 'Membre' }
];

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
  // Parsing initial des équipes (ex: "bureau:responsable") vers objets
  const parseEquipes = (equipesArray) => {
    if (!equipesArray) return [];
    return equipesArray.map(str => {
      const [teamId, rankId] = str.split(':');
      return { teamId, rankId: rankId || 'membre' }; // Défaut à 'membre' si pas de rang
    });
  };

  const [formData, setFormData] = useState({
    nom: '',
    role: '',
    bio: '',
    photo: '',
    status: 'brouillon',
    equipes: [], // Stocké sous forme d'objets { teamId, rankId }
    ordre: 99
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
        setFormData({ 
          ...membre, 
          photo: '',
          equipes: parseEquipes(membre.equipes), // Conversion ici
          ordre: membre.ordre !== undefined ? membre.ordre : 99 
        });
      } else {
        setFormData({
          ...membre,
          equipes: parseEquipes(membre.equipes),
          ordre: membre.ordre !== undefined ? membre.ordre : 99
        });
      }
    } else {
      setFormData({ 
        nom: '', role: '', bio: '', photo: '', status: 'brouillon', 
        equipes: [], ordre: 99 
      });
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

  // --- GESTION INTELLIGENTE DES ÉQUIPES ---
  
  // Activer/Désactiver une équipe
  const toggleTeam = (teamId) => {
    setFormData(prev => {
      const exists = prev.equipes.find(eq => eq.teamId === teamId);
      if (exists) {
        // Suppression
        return { ...prev, equipes: prev.equipes.filter(eq => eq.teamId !== teamId) };
      } else {
        // Ajout (par défaut : membre)
        return { ...prev, equipes: [...prev.equipes, { teamId, rankId: 'membre' }] };
      }
    });
  };

  // Changer le rang dans une équipe
  const changeTeamRank = (teamId, newRank) => {
    setFormData(prev => ({
      ...prev,
      equipes: prev.equipes.map(eq => 
        eq.teamId === teamId ? { ...eq, rankId: newRank } : eq
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Conflit check
    if (membre.id) {
      const { data: currentDbVersion, error: checkError } = await supabase
        .from('membres')
        .select('last_modif')
        .eq('id', membre.id)
        .single();

      if (!checkError && currentDbVersion) {
        const dbTime = new Date(currentDbVersion.last_modif).getTime();
        const localTime = new Date(membre.last_modif).getTime();
        if (dbTime > localTime) {
          setError("⚠️ CONFLIT : Ce membre a été modifié par quelqu'un d'autre. Rafraîchissez la page.");
          setLoading(false);
          return; 
        }
      }
    }

    // Gestion Photo
    let finalPhoto = formData.photo;
    let fileToDelete = null;
    const originalPhoto = membre.photo || '';
    const isOriginalFile = originalPhoto.startsWith(supabaseStorageUrlStart);

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

    // --- PRÉPARATION DONNÉES (Stringify Equipes) ---
    // On transforme les objets [{teamId: 'web', rankId: 'responsable'}] -> ["web:responsable"]
    const formattedEquipes = formData.equipes.map(eq => `${eq.teamId}:${eq.rankId}`);

    const dataToSave = { 
      ...formData, 
      photo: finalPhoto,
      equipes: formattedEquipes, // C'est ici que ça part en base
      ordre: parseInt(formData.ordre, 10)
    };

    // Clean
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
        
        {/* Identité */}
        <div className="form-row">
            <div className="form-group">
                <label>Nom / Prénom</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} required placeholder="Ex: Sarah Connor" />
            </div>
            <div className="form-group">
                <label>Titre Public (Carte)</label>
                <input type="text" name="role" value={formData.role} onChange={handleChange} required placeholder="Ex: Présidente, Graphiste..." />
                <small style={{color:'#666'}}>C'est le titre exact qui s'affichera sous le nom.</small>
            </div>
        </div>

        {/* --- NOUVELLE GESTION DES ÉQUIPES --- */}
        <div style={{ backgroundColor: '#f0f4f8', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #dceefb' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#003366', borderBottom:'1px solid #cce4f7', paddingBottom:'10px' }}>
                Appartenance aux Équipes
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {AVAILABLE_TEAMS.map(team => {
                    const isSelected = formData.equipes.find(eq => eq.teamId === team.id);
                    
                    return (
                        <div key={team.id} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            backgroundColor: isSelected ? 'white' : 'transparent',
                            padding: '10px',
                            borderRadius: '6px',
                            border: isSelected ? '1px solid #b3d7f2' : '1px solid transparent',
                            transition: 'all 0.2s'
                        }}>
                            {/* Checkbox Equipe */}
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: isSelected ? '600' : 'normal', flex: 1 }}>
                                <input 
                                    type="checkbox" 
                                    checked={!!isSelected} 
                                    onChange={() => toggleTeam(team.id)}
                                    style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                                />
                                {team.label}
                            </label>

                            {/* Sélecteur de Rang (visible uniquement si coché) */}
                            {isSelected && (
                                <div style={{ marginLeft: '20px' }}>
                                    <select 
                                        value={isSelected.rankId} 
                                        onChange={(e) => changeTeamRank(team.id, e.target.value)}
                                        style={{ 
                                            padding: '5px 10px', 
                                            borderRadius: '4px', 
                                            border: '1px solid #ccc',
                                            backgroundColor: '#fafafa',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {TEAM_RANKS.map(rank => (
                                            <option key={rank.id} value={rank.id}>
                                                {rank.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Bio & Photo */}
        <div className="form-group">
          <label>Bio / Description</label>
          <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} placeholder="Une petite description sympa..."></textarea>
        </div>

        <div className="form-group">
          <label>Photo (URL ou Upload)</label>
          <input type="url" name="photo" value={formData.photo} onChange={handleChange} disabled={!!file} placeholder="https://..." style={{marginBottom:'10px'}} />
          
          <input type="file" onChange={handleFileChange} accept="image/*" disabled={!!formData.photo} />
          
          {existingFileName && (
            <div style={{marginTop:'5px', fontSize:'0.9rem', color:'#666', display:'flex', alignItems:'center', gap:'10px'}}>
              <span>Fichier actuel : {existingFileName}</span>
              <button type="button" onClick={() => setExistingFileName('')} style={{border:'1px solid #ccc', background:'white', cursor:'pointer'}}>Supprimer</button>
            </div>
          )}
        </div>

        {/* Statut & Ordre Global */}
        <div className="form-row">
            <div className="form-group">
                <label>Statut</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="brouillon">Brouillon (Caché)</option>
                    <option value="publié">Publié (Visible)</option>
                </select>
            </div>
            <div className="form-group">
                <label>Priorité Globale (Optionnel)</label>
                <input 
                    type="number" 
                    name="ordre" 
                    value={formData.ordre} 
                    onChange={handleChange} 
                    placeholder="99"
                />
                <small style={{color:'#999'}}>1=Le plus important, 99=Défaut.</small>
            </div>
        </div>

        {error && <p className="error-message">{error}</p>}

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