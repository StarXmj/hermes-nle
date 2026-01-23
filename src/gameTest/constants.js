export const GAME_CONFIG = {
  GRAVITY: 0.6,
  FLAPPY_GRAVITY: 0.35,
  JUMP_FORCE: -12,
  FLAPPY_JUMP_FORCE: -7,
  
  SPEED_START: 8,
  SPEED_MAX: 22,
  SPEED_INCREMENT: 0.0015,
  
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  GROUND_HEIGHT: 50,
  
  TRANSITION_DURATION: 60,
  
  // Ecart vertical entre le joueur et son fantôme
  GHOST_OFFSET_Y: 120 
};



export const BIOMES = {
  NORMAL: 'NORMAL',
  INVERTED: 'INVERTED',
  FLAPPY: 'FLAPPY',
  HADES: 'HADES',
  DIONYSOS: 'DIONYSOS',
  ARES: 'ARES',
  PHILOTES: 'PHILOTES' // 🤝 Nouveau
};

export const BIOME_SEQUENCE = [
  
  
  //{ type: BIOMES.NORMAL,   duration: 1000 }, // Le test d'amitié !
 
  //{ type: BIOMES.DIONYSOS, duration: 1200 },
  //{ type: BIOMES.PHILOTES, duration: 1400 },
  //{ type: BIOMES.HADES,    duration: 900  },
  //{ type: BIOMES.INVERTED, duration: 1000 },
  //{ type: BIOMES.HADES,    duration: 900  }, 
  { type: BIOMES.FLAPPY,   duration: 1500 } ,
   { type: BIOMES.ARES,     duration: 1300 }
];

export const ENTITY_TYPES = {
  // --- OBSTACLES AU SOL ---
  // Colonne classique
  GROUND:   { width: 40, height: 60, color: '#C0C0C0', type: 'obstacle' },
  // Vase (Petit)
  AMPHORA:  { width: 30, height: 35, color: '#d35400', type: 'obstacle' },
  // Bouclier (Moyen)
  SHIELD:   { width: 40, height: 40, color: '#c0392b', type: 'obstacle' },
  
  // --- OBSTACLES AÉRIENS ---
  // Force la glissade
  HIGH:     { width: 50, height: 40, color: '#C0392B', type: 'obstacle' }, 
  
  // --- OBSTACLES PLAFOND (Hades/Flappy) ---
  CEILING:  { width: 40, height: 80, color: '#555', type: 'obstacle' },
  // Chaînes (Fin et long)
  CHAIN:    { width: 20, height: 70, color: '#7f8c8d', type: 'obstacle' },

  // --- AUTRES ---
  PROJECTILE: { width: 8, height: 50, color: '#c0392b', type: 'projectile', speedY: 6 }
};

// src/game/constants.js

