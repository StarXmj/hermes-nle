export const GAME_CONFIG = {
  // --- PHYSIQUE ---
  GRAVITY: 0.6,
  FLAPPY_GRAVITY: 0.5,     // Gravité plus douce pour le mode Flappy
  JUMP_FORCE: -12,
  FLAPPY_JUMP_FORCE: -7,   // Petit saut pour Flappy
  
  // --- VITESSE ---
  SPEED_START: 6,
  SPEED_MAX: 20,
  SPEED_INCREMENT: 0.0015,
  
  // --- DIMENSIONS ---
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  GROUND_HEIGHT: 50,
  
  // --- DIVERS ---
  TRANSITION_DURATION: 60, // Durée du flash blanc
  GHOST_OFFSET_Y: 120,     // Décalage du fantôme (Philotes)
  COIN_SCORE_BONUS: 50     // Points gagnés par pièce
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
  { type: BIOMES.NORMAL,   duration: 1000 }, // Départ tranquille
  { type: BIOMES.PHILOTES, duration: 1200 }, // Test du fantôme
  { type: BIOMES.DIONYSOS, duration: 1200 }, // Effet visuel
  { type: BIOMES.HADES,    duration: 900  }, // Ambiance sombre
  { type: BIOMES.INVERTED, duration: 1000 }, // Tête en bas
  { type: BIOMES.HADES,    duration: 900  }, 
  { type: BIOMES.NORMAL,   duration: 300  }, // Petite pause avant Flappy
  { type: BIOMES.FLAPPY,   duration: 1500 }, // Mode avion
  { type: BIOMES.ARES,     duration: 1300 }  // Pluie de lances
];

export const ENTITY_TYPES = {
  // ==========================================
  // 1. OBSTACLES AU SOL (Il faut sauter)
  // ==========================================
  
  // Colonne Grecque (Obstacle de base)
  GROUND: { 
    width: 40, height: 60, color: '#C0C0C0', type: 'obstacle', drawType: 'column' 
  },
  
  // Colonne Brisée (ARES)
  BROKEN_COLUMN: { 
    width: 40, height: 50, color: '#7f8c8d', type: 'obstacle', drawType: 'column' 
  },
  
  // Stalagmite (HADES - Pic sol)
  STALAGMITE: { 
    width: 30, height: 50, color: '#555', type: 'obstacle', drawType: 'stalactite' // Utilise texture pointue
  },

  // Vase / Amphore (Petit obstacle)
  AMPHORA: { 
    width: 30, height: 35, color: '#d35400', type: 'obstacle', drawType: 'amphora' 
  },

  // Bouclier (Obstacle moyen)
  SHIELD: { 
    width: 40, height: 40, color: '#c0392b', type: 'obstacle', drawType: 'shield' 
  },

  // ==========================================
  // 2. OBSTACLES AÉRIENS (Il faut glisser)
  // ==========================================
  
  // Harpie (Ennemi volant)
  HIGH: { 
    width: 50, height: 40, color: '#C0392B', type: 'obstacle', drawType: 'harpy' 
  },
  
  // Alias explicite
  HARPY: { 
    width: 50, height: 40, color: '#C0392B', type: 'obstacle', drawType: 'harpy' 
  },

  // ==========================================
  // 3. OBSTACLES PLAFOND (Pour Flappy / Inverted)
  // ==========================================
  
  // Stalactite (Pic plafond)
  CEILING: { 
    width: 40, height: 80, color: '#555', type: 'obstacle', drawType: 'stalactite' 
  },
  
  // Chaîne (Obstacle fin)
  CHAIN: { 
    width: 20, height: 90, color: '#7f8c8d', type: 'obstacle', drawType: 'chain' 
  },

  // ==========================================
  // 4. SPÉCIAUX & BONUS
  // ==========================================
  
  // Lance d'Arès (Tombe du ciel)
  // Vitesse 4.5 pour être esquivable
  PROJECTILE: { 
    width: 10, height: 60, color: '#c0392b', type: 'projectile', speedY: 4.5, drawType: 'projectile' 
  },

  // Pièce (Drachme) - Bonus de score
  COIN: { 
    width: 30, height: 30, color: '#FFD700', type: 'collectible', drawType: 'coin' 
  }
};