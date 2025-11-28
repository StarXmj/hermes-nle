// src/utils.js

/**
 * Optimise une URL d'image Supabase Storage
 * @param {string} url - L'URL originale de l'image
 * @param {number} width - La largeur désirée en pixels (ex: 500)
 * @param {number} quality - La qualité de compression (0-100, défaut 80)
 * @returns {string} L'URL optimisée avec les paramètres de transformation
 */
export const getOptimizedImageUrl = (url, width = 500, quality = 80) => {
  if (!url) return null;
  
  // Si ce n'est pas une image hébergée chez Supabase, on la renvoie telle quelle
  // (pour éviter de casser les liens externes ou locaux)
  if (!url.includes('supabase.co')) {
    return url;
  }

  // On ajoute les paramètres de transformation de Supabase
  // Note: 'resize=contain' ou 'cover' peut aussi être ajouté si besoin
  return `${url}?width=${width}&format=webp&quality=${quality}`;
};

/**
 * Formate une date ISO en français
 * (On peut aussi déplacer cette fonction ici pour la réutiliser partout)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  });
};