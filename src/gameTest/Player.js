import { GAME_CONFIG, BIOMES } from './constants';

export class Player {
  constructor() {
    this.width = 40;
    this.height = 60;
    this.originalHeight = 60;
    this.x = 50;
    
    // Position initiale
    this.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.height;
    this.vy = 0;
    
    this.color = '#e74c3c';
    this.jumpCount = 0;
    this.maxJumps = 2; 
    this.isSliding = false;
    
    this.currentBiome = BIOMES.NORMAL;
    this.jumpPressedBefore = false;
  }

  setBiome(biome) {
    this.currentBiome = biome;
    this.vy = 0; 
    
    // Reset taille si on était en train de glisser pendant la transition
    this.isSliding = false;
    this.height = this.originalHeight;
    
    // TP au bon endroit
    if (biome === BIOMES.INVERTED) {
        // Collé au plafond
        this.y = GAME_CONFIG.GROUND_HEIGHT; 
    } else {
        // Collé au sol
        this.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.height;
    }
  }

  update(input, biome) {
    // 1. GESTION GLISSADE (Compatible Normal, Hades ET Inverted)
    // On exclut FLAPPY car on vole, pas besoin de glisser
    if (input.keys.down && biome !== BIOMES.FLAPPY) {
      if (!this.isSliding) {
          this.isSliding = true;
          this.height = this.originalHeight / 2;
          
          // AJUSTEMENT DE POSITION
          if (biome !== BIOMES.INVERTED) {
              // NORMAL/HADES : On compense pour que les pieds restent au sol
              this.y += this.originalHeight / 2; 
          }
          // INVERTED : Pas besoin de toucher Y, car Y est le point d'ancrage au plafond
      }
    } else {
      if (this.isSliding) {
          this.isSliding = false;
          // RELÈVEMENT
          if (biome !== BIOMES.INVERTED) {
              this.y -= this.originalHeight / 2;
          }
          this.height = this.originalHeight;
      }
    }

    // 2. PHYSIQUE
    switch (biome) {
        case BIOMES.NORMAL:
        case BIOMES.HADES:
        case BIOMES.DIONYSOS: // ✅ AJOUT : Physique normale
        case BIOMES.ARES: // ✅ AJOUT : Physique normale pour la guerre
        case BIOMES.PHILOTES: // ✅ AJOUT : Physique normale
            this.updateNormal(input);
            break;
            
        case BIOMES.INVERTED:
            this.updateInverted(input);
            break;
            
        case BIOMES.FLAPPY:
            this.updateFlappy(input);
            break;
            
        default:
            this.updateNormal(input);
            break;
    }
  }

  

  updateNormal(input) {
    if (input.keys.up && !this.jumpPressedBefore) {
        if (this.jumpCount < this.maxJumps) {
            this.vy = GAME_CONFIG.JUMP_FORCE;
            this.jumpCount++;
        }
    }
    this.y += this.vy;
    
    const groundY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.height;
    if (this.y < groundY) {
        this.vy += GAME_CONFIG.GRAVITY;
    } else {
        this.vy = 0;
        this.jumpCount = 0;
        this.y = groundY;
    }
    this.jumpPressedBefore = input.keys.up;
  }

  updateInverted(input) {
    // Saut vers le BAS (Force positive)
    if (input.keys.up && !this.jumpPressedBefore) {
        if (this.jumpCount < this.maxJumps) {
            this.vy = -GAME_CONFIG.JUMP_FORCE; // Inverse la force du saut
            this.jumpCount++;
        }
    }

    this.y += this.vy;

    // Le "Sol" est le Plafond (Y = Ground Height)
    const ceilingY = GAME_CONFIG.GROUND_HEIGHT;
    
    // Gravité inversée (Tire vers le HAUT, donc négatif)
    if (this.y > ceilingY) {
        this.vy -= GAME_CONFIG.GRAVITY; 
    } else {
        this.vy = 0;
        this.jumpCount = 0;
        this.y = ceilingY;
    }
    this.jumpPressedBefore = input.keys.up;
  }

  updateFlappy(input) {
    if (input.keys.up && !this.jumpPressedBefore) {
        this.vy = GAME_CONFIG.FLAPPY_JUMP_FORCE;
    }
    this.y += this.vy;
    this.vy += GAME_CONFIG.FLAPPY_GRAVITY;

    const groundY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.height;
    const ceilingY = GAME_CONFIG.GROUND_HEIGHT;

    if (this.y > groundY) { this.y = groundY; this.vy = 0; }
    if (this.y < ceilingY) { this.y = ceilingY; this.vy = 0; }
    
    this.jumpPressedBefore = input.keys.up;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';
    
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    if (this.currentBiome === BIOMES.FLAPPY) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x - 10, this.y + 10, 10, 20);
    }
    ctx.shadowBlur = 0;
  }
  
  getHitbox() {
      return {
          x: this.x + 8,
          y: this.y + 5,
          width: this.width - 16,
          height: this.height - 10
      };
  }
  
getGhostHitbox() {
      // Le fantôme est exactement au même X, mais Y décalé vers le haut
      return {
          x: this.x + 8,
          y: (this.y - GAME_CONFIG.GHOST_OFFSET_Y) + 5,
          width: this.width - 16,
          height: this.height - 10
      };
  }

  // (getHitbox classique reste inchangée)
  getHitbox() {
      return {
          x: this.x + 8,
          y: this.y + 5,
          width: this.width - 16,
          height: this.height - 10
      };
  }
}