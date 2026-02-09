import React, { useState, useEffect } from 'react';
// ✅ CORRECTION IMPORT : Un seul '..' car le fichier est dans src/pages/
import { supabase } from '../supabaseClient'; 
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// ✅ CORRECTION IMPORT : Un seul '..'
import { THEMES } from '../data/themes'; 
// Si vous n'avez pas ce CSS, commentez la ligne ci-dessous
// import './AdminActionsPage.css'; 

function AdminDecorsPage() {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [recordId, setRecordId] = useState(null); // ID de la ligne à modifier
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // 1. Charger le thème (NOUVELLE LOGIQUE BDD)
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      
      // ❌ AVANT (ce qui causait l'erreur 400) :
      // .select('value').eq('key', 'current_theme')

      // ✅ MAINTENANT (La bonne méthode) :
      // On récupère la colonne 'current_theme' directement
      const { data, error } = await supabase
        .from('settings')
        .select('id, current_theme') 
        .single(); // On prend l'unique ligne de configuration

      if (error) {
        console.error("Erreur chargement:", error);
      }

      if (data) {
        setCurrentTheme(data.current_theme); 
        setRecordId(data.id); // On stocke l'ID pour pouvoir sauvegarder plus tard
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  // 2. Sauvegarder (NOUVELLE LOGIQUE BDD)
  const handleSave = async () => {
    console.log("💾 Tentative de sauvegarde...", { currentTheme, recordId }); // Debug

    if (!recordId) {
        alert("Erreur : Impossible de trouver l'ID de configuration. Rechargez la page.");
        return;
    }

    setLoading(true);
    // Update simple
    const { error } = await supabase
      .from('settings')
      .update({ current_theme: currentTheme })
      .eq('id', recordId); // On utilise l'ID récupéré au chargement

    if (error) {
      console.error("❌ Erreur Save:", error);
      setMessage({ type: 'error', text: "Erreur BDD : " + error.message });
    } else {
      console.log("✅ Sauvegarde réussie !");
      setMessage({ type: 'success', text: "Thème appliqué !" });
    }
    setLoading(false);
  };

  return (
    <main className="p-6 md:p-10 bg-slate-50 min-h-screen text-slate-800">
      <Helmet>
        <title>Décoration | Admin - Hermes</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>      
      
      <div className="flex items-center justify-between mb-8">
        <Link to="/admin" className="text-blue-600 hover:underline">&larr; Retour Dashboard</Link>
        <h1 className="text-2xl font-bold">Décoration du Site</h1>
      </div>

      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        
        <h3 className="text-xl font-semibold mb-2">Thème Actif</h3>
        <p className="text-sm text-gray-500 mb-6">
            Sélectionnez l'ambiance globale du site. Ce changement est immédiat pour tous les visiteurs (Admin inclus).
        </p>

        <div className="mb-6">
          <label htmlFor="theme-select" className="block font-bold mb-2">Thème sélectionné :</label>
          <select 
            id="theme-select"
            value={currentTheme} 
            onChange={(e) => setCurrentTheme(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {/* On génère les options depuis le fichier themes.js */}
            {Object.values(THEMES).map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.id === 'valentine' ? '💘 ' : theme.id === 'christmas' ? '🎄 ' : '✨ '}
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        {/* Message de confirmation/erreur */}
        {message && (
          <div className={`p-4 mb-6 rounded-lg text-center font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <button 
            onClick={handleSave} 
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Chargement...' : '💾 Appliquer le thème'}
        </button>

      </div>
    </main>
  );
}

export default AdminDecorsPage;