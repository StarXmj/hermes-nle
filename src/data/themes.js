export const THEMES = {
  // 1. THÈME CLASSIQUE
  default: {
    id: 'default',
    label: '✨ Classique (Défaut)',
    className: '', // Pas de classe spécifique
    elements: {
      snow: false,
      santa: false,
      garland: false,
      hearts: false,
      cupidArrow: false
    }
  },

  // 2. THÈME NOËL (COMPLET) 🎄
  christmas: {
    id: 'christmas',
    label: '🎄 Noël Féerique',
    className: 'theme-christmas', // Déclenche le CSS bleu nuit / sapin
    elements: {
      snow: true,
      snowColor: '#a0d2eb', // Bleu glace
      
      santa: true,
      // Image animée du traîneau (GIF transparent)
      santaImg: "https://www.gifsanimes.com/data/media/1084/traineau-de-noel-image-animee-0011.gif", 
      
      garland: true,
      // Image de guirlande sapin (PNG transparent qui se répète)
      garlandImg: "https://static.vecteezy.com/system/resources/thumbnails/068/507/592/small/festive-holiday-garland-adorned-with-pine-branches-berries-ornaments-and-pinecones-bringing-a-touch-of-christmas-magic-png.png",
      
      hearts: false,
      cupidArrow: false
    }
  },

  // 3. THÈME SAINT VALENTIN (NOUVEAU) 💘
  valentine: {
    id: 'valentine',
    label: '💘 Saint Valentin',
    className: 'theme-valentine', // Déclenche le CSS Rose
    elements: {
      snow: false,
      santa: false,
      garland: false,
      
      hearts: true,       // Pluie de coeurs
      cupidArrow: true    // Animation Cupidon au démarrage
    }
  }
};