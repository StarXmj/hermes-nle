import { GAME_CONFIG, BIOMES } from './constants';
import { particleManager } from './ParticleManager'; // ✅ IMPORT PARTICULES
import { soundManager } from './SoundManager';       // ✅ IMPORT SONS

export class Player {
  constructor() {
    this.width = 40; // Ajusté pour mieux coller aux sprites (était 50)
    this.height = 60; // Ajusté (était 50)
    this.originalHeight = 60;
    this.x = 50;
    
    // Position initiale
    this.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.height;
    this.vy = 0; // Vélocité Verticale
    
    this.color = '#e74c3c'; // Fallback couleur
    this.jumpCount = 0;
    this.maxJumps = 2; 
    this.isSliding = false;
    
    this.currentBiome = BIOMES.NORMAL;
    this.jumpPressedBefore = false; // Anti-spam saut

    // État de sécurité pour Flappy (2 secondes d'invincibilité/stabilité)
    this.flappySafetyActive = false;
    this.flappyStartTime = 0;
    
    // Pour l'animation (SpriteManager)
    this.rotation = 0;
  }

  setBiome(biome) {
    this.currentBiome = biome;
    this.vy = 0; 
    
    this.isSliding = false;
    this.height = this.originalHeight;
    this.rotation = 0;
    
    // Téléportation au bon endroit selon le biome pour éviter les bugs
    if (biome === BIOMES.INVERTED) {
        this.y = GAME_CONFIG.GROUND_HEIGHT; 
    } else if (biome === BIOMES.FLAPPY) {
        this.y = (GAME_CONFIG.CANVAS_HEIGHT / 2) - (this.height / 2);
        this.flappySafetyActive = true;
        this.flappyStartTime = Date.now();
    } else {
        this.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.height;
    }
  }

  update(input, biome) {
    // 1. GESTION GLISSADE (Sauf Flappy)
    if (input.keys.down && biome !== BIOMES.FLAPPY) {
      if (!this.isSliding) {
          this.isSliding = true;
          this.height = this.originalHeight / 2;
          
          if (biome !== BIOMES.INVERTED) {
              this.y += this.originalHeight / 2; 
          }
          
          // ⚡ EFFET VISUEL : Poussière explosive
          particleManager.createSlideDust(this.x + this.width / 2, this.y + this.height);
          
          // 🔊 EFFET SONORE : Glissade
          soundManager.play('slide');
      }
      
      // ⚡ EFFET VISUEL : Traînée continue (aléatoire)
      if (Math.random() > 0.8) {
           const dustY = biome === BIOMES.INVERTED ? this.y : this.y + this.height;
           particleManager.createSlideDust(this.x, dustY);
      }

    } else {
      // Remise debout
      if (this.isSliding) {
          this.isSliding = false;
          if (biome !== BIOMES.INVERTED) {
              this.y -= this.originalHeight / 2;
          }
          this.height = this.originalHeight;
      }
    }

    // 2. LOGIQUE SPÉCIFIQUE PAR BIOME
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
    // Gestion du Saut
    if (input.keys.up && !this.jumpPressedBefore) {
        if (this.jumpCount < this.maxJumps) {
            this.vy = GAME_CONFIG.JUMP_FORCE;
            
            // 🔊 SON
            soundManager.play('jump');

            // ⚡ PARTICULES
            if (this.jumpCount === 0) {
                // Saut 1 : Poussière sol
                particleManager.createJumpEffect(this.x + this.width / 2, this.y + this.height);
            } else {
                // Saut 2 : Explosion aérienne
                particleManager.createDoubleJumpEffect(this.x + this.width / 2, this.y + this.height);
            }
            
            this.jumpCount++;
        }
    }
    
    // Physique
    this.y += this.vy;
    
    // Gravité & Sol
    const groundY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.height;
    if (this.y < groundY) {
        this.vy += GAME_CONFIG.GRAVITY;
        this.rotation += 0.15; // Rotation pendant le saut
    } else {
        // Atterrissage
        if (this.vy > 0) { 
            particleManager.createDust(this.x + this.width / 2, this.y + this.height);
        }
        
        this.vy = 0;
        this.jumpCount = 0;
        this.y = groundY;
        this.rotation = 0;

        // ⚡ Poussière de course
        if (!this.isSliding && Math.random() > 0.9) {
             particleManager.createDust(this.x, this.y + this.height);
        }
    }
    this.jumpPressedBefore = input.keys.up;
  }

  updateInverted(input) {
    if (input.keys.up && !this.jumpPressedBefore) {
        if (this.jumpCount < this.maxJumps) {
            this.vy = -GAME_CONFIG.JUMP_FORCE; // Saut vers le bas
            
            // 🔊 SON
            soundManager.play('jump');

            // ⚡ PARTICULES (Au niveau du plafond this.y)
            if (this.jumpCount === 0) {
                particleManager.createJumpEffect(this.x + this.width / 2, this.y);
            } else {
                particleManager.createDoubleJumpEffect(this.x + this.width / 2, this.y);
            }

            this.jumpCount++;
        }
    }
    
    this.y += this.vy;
    
    // Gravité inversée (vers le haut/plafond)
    const ceilingY = GAME_CONFIG.GROUND_HEIGHT;
    if (this.y > ceilingY) {
        this.vy -= GAME_CONFIG.GRAVITY; 
    } else {
        this.vy = 0;
        this.jumpCount = 0;
        this.y = ceilingY;

        // ⚡ Poussière plafond
        if (!this.isSliding && Math.random() > 0.9) {
             particleManager.createDust(this.x, this.y);
        }
    }
    this.jumpPressedBefore = input.keys.up;
  }

  updateFlappy(input) {
    this.rotation = 0; // Pas de rotation en Flappy

    // Sécurité au début du biome Flappy
    if (this.flappySafetyActive) {
        if (input.keys.up && !this.jumpPressedBefore) {
            this.flappySafetyActive = false; // Désactive si le joueur appuie
        } 
        else if (Date.now() - this.flappyStartTime > 2000) {
            this.flappySafetyActive = false; // Désactive après 2s
        } 
        else {
            // Maintien au centre
            this.y = (GAME_CONFIG.CANVAS_HEIGHT / 2) - (this.height / 2);
            this.vy = 0;
            this.jumpPressedBefore = input.keys.up; 
            return; 
        }
    }

    // Physique Flappy
    if (input.keys.up && !this.jumpPressedBefore) {
        this.vy = GAME_CONFIG.FLAPPY_JUMP_FORCE;
        
        // 🔊 SON
        soundManager.play('jump');
        
        // ⚡ PARTICULE (Petit effet derrière)
        particleManager.createJumpEffect(this.x, this.y + this.height / 2);
    }
    
    this.y += this.vy;
    this.vy += GAME_CONFIG.FLAPPY_GRAVITY;

    // Plafond bloquant
    const ceilingY = GAME_CONFIG.GROUND_HEIGHT; // Ou 0 selon préférence
    if (this.y < ceilingY) { 
        this.y = ceilingY; 
        this.vy = 0; 
    }
    
    // La mort au sol est gérée par GameEngine.checkCollisions
    
    this.jumpPressedBefore = input.keys.up;
  }

  // Méthodes de Hitbox
  getHitbox() {
      // Hitbox légèrement plus petite que le sprite pour être sympa
      return {
          x: this.x + 8,
          y: this.y + 5,
          width: this.width - 16,
          height: this.height - 10
      };
  }
  
  getGhostHitbox() {
      // Hitbox du double (Philotes)
      return {
          x: this.x + 8,
          y: (this.y - GAME_CONFIG.GHOST_OFFSET_Y) + 5,
          width: this.width - 16,
          height: this.height - 10
      };
  }
  
  // Méthode draw optionnelle (si GameEngine l'appelle, sinon c'est SpriteManager)
  draw(ctx) {
      // Utile pour le debug si les sprites ne chargent pas
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}