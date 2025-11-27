// src/data/themes.js

export const THEMES = {
  default: {
    id: 'default',
    label: '✨ Classique (Défaut)',
    className: '', 
    elements: {
      snow: false,
      santa: false,
      garland: false
    }
  },
  christmas: {
    id: 'christmas',
    label: '🎄 Noël Féerique',
    className: 'theme-christmas',
    elements: {
      snow: true,
      snowColor: '#a0d2eb', // Bleu glace pour voir sur fond blanc
      santa: true,
      // Une image de traineau plus détaillée (vous pourrez la remplacer par "/images/santa.png")
      santaImg: "https://www.gifsanimes.com/data/media/1084/traineau-de-noel-image-animee-0011.gif", 
      garland: true,
      // Une image de branche de sapin qui se répète
      garlandImg: "https://lh3.googleusercontent.com/proxy/C8uwFzHqi71vzwbhnl4q0w7m3YWg483nJ5rfrKK-GLLKd7CkWf27LMp58uDSo_cy0yuSwR6pI8O0PPWWuo4fD8qVkeEV_tJdcQ" 
    }
  },
  // ... (Halloween etc.)
};