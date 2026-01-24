import { GAME_CONFIG, BIOMES } from './constants';
import { particleManager } from './ParticleManager'; // ✅ IMPORT AJOUTÉ

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

    // État de sécurité pour Flappy
    this.flappySafetyActive = false;
    this.flappyStartTime = 0;
  }

  setBiome(biome) {
    this.currentBiome = biome;
    this.vy = 0; 
    
    this.isSliding = false;
    this.height = this.originalHeight;
    
    // TP au bon endroit selon le biome
    if (biome === BIOMES.INVERTED) {
        // Collé au plafond
        this.y = GAME_CONFIG.GROUND_HEIGHT; 

    } else if (biome === BIOMES.FLAPPY) {
        // On place le joueur au milieu et on active la sécurité
        this.y = (GAME_CONFIG.CANVAS_HEIGHT / 2) - (this.height / 2);
        this.flappySafetyActive = true;
        this.flappyStartTime = Date.now();

    } else {
        // Collé au sol (Normal, Hades, Ares, etc.)
        this.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.height;
    }
  }

  update(input, biome) {
    // 1. GESTION GLISSADE
    if (input.keys.down && biome !== BIOMES.FLAPPY) {
      if (!this.isSliding) {
          this.isSliding = true;
          this.height = this.originalHeight / 2;
          if (biome !== BIOMES.INVERTED) {
              this.y += this.originalHeight / 2; 
          }
          // ✅ EFFET : Début de glissade (Burst)
          particleManager.createSlideDust(this.x + this.width / 2, this.y + this.height);
      }
      
      // ✅ EFFET : Traînée continue pendant la glissade (1 chance sur 5 par frame)
      if (Math.random() > 0.8) {
           const dustY = biome === BIOMES.INVERTED ? this.y : this.y + this.height;
           particleManager.createSlideDust(this.x, dustY);
      }

    } else {
      if (this.isSliding) {
          this.isSliding = false;
          if (biome !== BIOMES.INVERTED) {
              this.y -= this.originalHeight / 2;
          }
          this.height = this.originalHeight;
      }
    }

    // 2. PHYSIQUE & PARTICULES DE COURSE
    // Si on est au sol (vy === 0) et qu'on ne glisse pas, on génère un peu de poussière
    // On le fait dans les méthodes update spécifiques pour être sûr d'être au sol
    
    switch (biome) {
        case BIOMES.NORMAL:
        case BIOMES.HADES:
        case BIOMES.DIONYSOS: 
        case BIOMES.ARES: 
        case BIOMES.PHILOTES: 
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
            
            // ✅ EFFET : Gestion des particules de saut
            if (this.jumpCount === 0) {
                // Premier saut : Nuage de poussière sous les pieds
                particleManager.createJumpEffect(this.x + this.width / 2, this.y + this.height);
            } else {
                // Double saut : Explosion magique/dorée
                particleManager.createDoubleJumpEffect(this.x + this.width / 2, this.y + this.height);
            }
            
            this.jumpCount++;
        }
    }
    this.y += this.vy;
    
    const groundY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.height;
    if (this.y < groundY) {
        this.vy += GAME_CONFIG.GRAVITY;
    } else {
        // Atterrissage ou course au sol
        if (this.vy > 0) { 
            // Si on atterrit (vy était positif juste avant le reset), petit nuage
            particleManager.createDust(this.x + this.width / 2, this.y + this.height);
        }
        
        this.vy = 0;
        this.jumpCount = 0;
        this.y = groundY;

        // ✅ EFFET : Poussière de course (Random pour ne pas spammer)
        if (!this.isSliding && Math.random() > 0.9) {
             particleManager.createDust(this.x, this.y + this.height);
        }
    }
    this.jumpPressedBefore = input.keys.up;
  }

  updateInverted(input) {
    if (input.keys.up && !this.jumpPressedBefore) {
        if (this.jumpCount < this.maxJumps) {
            this.vy = -GAME_CONFIG.JUMP_FORCE; 
            
            // ✅ EFFET : Saut inversé (particules au plafond, donc à this.y)
            if (this.jumpCount === 0) {
                particleManager.createJumpEffect(this.x + this.width / 2, this.y);
            } else {
                particleManager.createDoubleJumpEffect(this.x + this.width / 2, this.y);
            }

            this.jumpCount++;
        }
    }
    this.y += this.vy;
    const ceilingY = GAME_CONFIG.GROUND_HEIGHT;
    if (this.y > ceilingY) {
        this.vy -= GAME_CONFIG.GRAVITY; 
    } else {
        this.vy = 0;
        this.jumpCount = 0;
        this.y = ceilingY;

        // ✅ EFFET : Poussière de course au plafond
        if (!this.isSliding && Math.random() > 0.9) {
             particleManager.createDust(this.x, this.y);
        }
    }
    this.jumpPressedBefore = input.keys.up;
  }

  updateFlappy(input) {
    // GESTION DE LA SÉCURITÉ AU DÉMARRAGE
    if (this.flappySafetyActive) {
        if (input.keys.up && !this.jumpPressedBefore) {
            this.flappySafetyActive = false;
        } 
        else if (Date.now() - this.flappyStartTime > 2000) {
            this.flappySafetyActive = false;
        } 
        else {
            this.y = (GAME_CONFIG.CANVAS_HEIGHT / 2) - (this.height / 2);
            this.vy = 0;
            this.jumpPressedBefore = input.keys.up; 
            return; 
        }
    }

    // --- PHYSIQUE STANDARD FLAPPY ---
    if (input.keys.up && !this.jumpPressedBefore) {
        this.vy = GAME_CONFIG.FLAPPY_JUMP_FORCE;
        // ✅ EFFET : Petit "pouf" blanc derrière le joueur en mode Flappy
        particleManager.createJumpEffect(this.x, this.y + this.height / 2);
    }
    this.y += this.vy;
    this.vy += GAME_CONFIG.FLAPPY_GRAVITY;

    const ceilingY = GAME_CONFIG.GROUND_HEIGHT;

    if (this.y < ceilingY) { this.y = ceilingY; this.vy = 0; }
    
    this.jumpPressedBefore = input.keys.up;
  }

  // ... (draw, getHitbox, getGhostHitbox restent inchangés)
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
      return {
          x: this.x + 8,
          y: (this.y - GAME_CONFIG.GHOST_OFFSET_Y) + 5,
          width: this.width - 16,
          height: this.height - 10
      };
  }
}