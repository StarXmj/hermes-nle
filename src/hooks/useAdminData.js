import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function useAdminData({ 
  table,           // Nom de la table (ex: 'actions')
  select = '*',    // Colonnes à sélectionner (avec jointures éventuelles)
  orderColumn = 'date_creat', 
  orderAsc = false,
  bucketName = null, // Nom du bucket pour supprimer les fichiers (optionnel)
  fileField = null   // Nom de la colonne contenant l'URL du fichier (ex: 'image', 'logo')
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fonction de chargement
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: err } = await supabase
        .from(table)
        .select(select)
        .order(orderColumn, { ascending: orderAsc });

      if (err) throw err;
      setData(result);
    } catch (err) {
      console.error(`Erreur fetch ${table}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [table, select, orderColumn, orderAsc]);

  // Charger au montage
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Fonction de suppression (Item + Fichier Storage)
  const deleteItem = async (item) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;

    try {
      // A. Suppression du fichier dans le Storage (si configuré)
      if (bucketName && fileField && item[fileField]) {
        const fileUrl = item[fileField];
        if (fileUrl.startsWith(SUPABASE_URL) && fileUrl.includes(`/${bucketName}/`)) {
          const path = decodeURIComponent(fileUrl.split(`/${bucketName}/`)[1]);
          await supabase.storage.from(bucketName).remove([path]);
        }
      }

      // B. Suppression de la ligne en BDD
      const { error: err } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id);

      if (err) throw err;

      // C. Mise à jour locale (plus rapide que de recharger)
      setData(prev => prev.filter(i => i.id !== item.id));
      
    } catch (err) {
      console.error("Erreur suppression:", err);
      setError(err.message);
    }
  };

  // 3. Fonction de bascule Publié/Brouillon
  const toggleStatus = async (item) => {
    const newStatus = item.status === 'publié' ? 'brouillon' : 'publié';
    
    // Optimistic UI (Mise à jour visuelle immédiate)
    setData(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));

    try {
      const { error: err } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', item.id);

      if (err) throw err;
      // Pas besoin de re-fetch si tout s'est bien passé grâce à l'Optimistic UI
    } catch (err) {
      setError("Erreur mise à jour statut");
      // Rollback en cas d'erreur
      setData(prev => prev.map(i => i.id === item.id ? { ...i, status: item.status } : i));
    }
  };

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    deleteItem,
    toggleStatus
  };
}