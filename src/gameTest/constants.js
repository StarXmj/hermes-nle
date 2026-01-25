export const GAME_CONFIG = {
  // --- PHYSIQUE ---
  GRAVITY: 0.55,
  FLAPPY_GRAVITY: 0.5,     
  JUMP_FORCE: -9,
  FLAPPY_JUMP_FORCE: -7,   
  
  // --- VITESSE ---
  SPEED_START: 5,       // Avant: 6
  SPEED_MAX: 20,          // Avant: 20
  SPEED_INCREMENT: 0.0011,// Avant: 0.0015 (Monte beaucoup moins vite)
  
  // --- DIMENSIONS ---
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  GROUND_HEIGHT: 50,
  
  // --- DIVERS ---
  TRANSITION_DURATION: 60, 
  GHOST_OFFSET_Y: 120,     
  COIN_SCORE_BONUS: 50     
};

export const BIOMES = {
  NORMAL: 'NORMAL',
  INVERTED: 'INVERTED',
  FLAPPY: 'FLAPPY',
  HADES: 'HADES',
  DIONYSOS: 'DIONYSOS',
  ARES: 'ARES',
  PHILOTES: 'PHILOTES'
};

export const BIOME_SEQUENCE = [
  { type: BIOMES.NORMAL,   duration: 1500 }, 
  { type: BIOMES.INVERTED, duration: 1000 }, 
  { type: BIOMES.NORMAL,   duration: 1500 }, 
  { type: BIOMES.DIONYSOS, duration: 1000 }, 
  { type: BIOMES.NORMAL,   duration: 1500 },
  { type: BIOMES.HADES,    duration: 750  }, 
  { type: BIOMES.INVERTED, duration: 1000 },
  { type: BIOMES.NORMAL,   duration: 1500 },
  { type: BIOMES.FLAPPY,   duration: 1000 }, 
  { type: BIOMES.NORMAL,   duration: 1500 },
  { type: BIOMES.ARES,     duration: 1300 }  
  
];

export const ENTITY_TYPES = {
  // ==========================================
  // 1. OBSTACLES AU SOL
  // ==========================================
  
  GROUND: { 
    width: 40, height: 60, color: '#C0C0C0', type: 'obstacle', drawType: 'column' 
  },
  
  BROKEN_COLUMN: { 
    width: 60, height: 100, color: '#7f8c8d', type: 'obstacle', drawType: 'column' 
  },
  
  STALAGMITE: { 
    width: 30, height: 50, color: '#555', type: 'obstacle', drawType: 'stalactite' 
  },

  AMPHORA: { 
    width: 30, height: 35, color: '#d35400', type: 'obstacle', drawType: 'amphora' 
  },

  SHIELD: { 
    width: 40, height: 40, color: '#c0392b', type: 'obstacle', drawType: 'shield' 
  },

  // ==========================================
  // 2. OBSTACLES AÉRIENS
  // ==========================================
  
  HIGH: { 
    width: 50, height: 40, color: '#C0392B', type: 'obstacle', drawType: 'harpy' 
  },
  
  HARPY: { 
    width: 50, height: 40, color: '#C0392B', type: 'obstacle', drawType: 'harpy' 
  },

  // ==========================================
  // 3. OBSTACLES PLAFOND
  // ==========================================
  
  // Stalactite (Garde pour Inverted, mais supprimé de Flappy)
  CEILING: { 
    width: 40, height: 80, color: '#555', type: 'obstacle', drawType: 'stalactite' 
  },
  
  // ✅ MODIFICATION : Chaîne plus large et plus imposante
  CHAIN: { 
    width: 30, height: 120, color: '#7f8c8d', type: 'obstacle', drawType: 'chain' 
  },

  // ✅ NOUVEAU : Colonne des Dieux (Plafond) - Massive
  CEILING_COLUMN: { 
    width: 60, height: 150, color: '#C0C0C0', type: 'obstacle', drawType: 'column' 
  },

  // ==========================================
  // 4. SPÉCIAUX & BONUS
  // ==========================================
  
  PROJECTILE: { 
    width: 25, height: 60, color: '#FF0000', type: 'projectile', speedY: 4.5, drawType: 'projectile' 
  },

  COIN: { 
    width: 30, height: 30, color: '#FFD700', type: 'collectible', drawType: 'coin' 
  }
};