import { GAME_CONFIG, BIOMES } from './constants';
import { particleManager } from './ParticleManager';
import { soundManager } from './SoundManager';

export class Player {
  constructor() {
    this.width = 40; 
    this.height = 60; 
    this.originalHeight = 60;
    this.x = 50;
    
    this.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.height;
    this.vy = 0; 
    
    this.color = '#e74c3c'; 
    this.jumpCount = 0;
    this.maxJumps = 2; 
    this.isSliding = false;
    
    this.currentBiome = BIOMES.NORMAL;
    this.jumpPressedBefore = false; 

    this.flappySafetyActive = false;
    this.flappyStartTime = 0;
    
    this.rotation = 0;

    // ✅ OPTIMISATION GC : Pré-allocation des objets Hitbox
    // On ne les crée qu'une seule fois au démarrage !
    this.hitbox = { x: 0, y: 0, width: 0, height: 0 };
    this.ghostHitbox = { x: 0, y: 0, width: 0, height: 0 };
  }

  // ... (setBiome, update, updateNormal, updateInverted, updateFlappy INCHANGÉS) ...
  // Copiez-collez les méthodes update précédentes ici, elles ne changent pas.
  // Je remets juste setBiome et update pour la clarté du contexte, mais vous gardez votre logique existante.
  
  setBiome(biome) {
    this.currentBiome = biome;
    this.vy = 0; 
    this.isSliding = false;
    this.height = this.originalHeight;
    this.rotation = 0;
    
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
    if (input.keys.down && biome !== BIOMES.FLAPPY) {
      if (!this.isSliding) {
          this.isSliding = true;
          this.height = this.originalHeight / 2;
          if (biome !== BIOMES.INVERTED) this.y += this.originalHeight / 2; 
          particleManager.createSlideDust(this.x + this.width / 2, this.y + this.height);
          soundManager.play('slide');
      }
      if (Math.random() > 0.8) {
           const dustY = biome === BIOMES.INVERTED ? this.y : this.y + this.height;
           particleManager.createSlideDust(this.x, dustY);
      }
    } else {
      if (this.isSliding) {
          this.isSliding = false;
          if (biome !== BIOMES.INVERTED) this.y -= this.originalHeight / 2;
          this.height = this.originalHeight;
      }
    }

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
            soundManager.play('jump');
            if (this.jumpCount === 0) particleManager.createJumpEffect(this.x + this.width / 2, this.y + this.height);
            else particleManager.createDoubleJumpEffect(this.x + this.width / 2, this.y + this.height);
            this.jumpCount++;
        }
    }
    this.y += this.vy;
    const groundY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - this.height;
    if (this.y < groundY) {
        this.vy += GAME_CONFIG.GRAVITY;
        this.rotation += 0.15; 
    } else {
        if (this.vy > 0) particleManager.createDust(this.x + this.width / 2, this.y + this.height);
        this.vy = 0;
        this.jumpCount = 0;
        this.y = groundY;
        this.rotation = 0;
        if (!this.isSliding && Math.random() > 0.9) particleManager.createDust(this.x, this.y + this.height);
    }
    this.jumpPressedBefore = input.keys.up;
  }

  updateInverted(input) {
    if (input.keys.up && !this.jumpPressedBefore) {
        if (this.jumpCount < this.maxJumps) {
            this.vy = -GAME_CONFIG.JUMP_FORCE; 
            soundManager.play('jump');
            if (this.jumpCount === 0) particleManager.createJumpEffect(this.x + this.width / 2, this.y);
            else particleManager.createDoubleJumpEffect(this.x + this.width / 2, this.y);
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
        if (!this.isSliding && Math.random() > 0.9) particleManager.createDust(this.x, this.y);
    }
    this.jumpPressedBefore = input.keys.up;
  }

  updateFlappy(input) {
    this.rotation = 0; 
    if (this.flappySafetyActive) {
        if (input.keys.up && !this.jumpPressedBefore) this.flappySafetyActive = false; 
        else if (Date.now() - this.flappyStartTime > 2000) this.flappySafetyActive = false; 
        else {
            this.y = (GAME_CONFIG.CANVAS_HEIGHT / 2) - (this.height / 2);
            this.vy = 0;
            this.jumpPressedBefore = input.keys.up; 
            return; 
        }
    }
    if (input.keys.up && !this.jumpPressedBefore) {
        this.vy = GAME_CONFIG.FLAPPY_JUMP_FORCE;
        soundManager.play('jump');
        particleManager.createJumpEffect(this.x, this.y + this.height / 2);
    }
    this.y += this.vy;
    this.vy += GAME_CONFIG.FLAPPY_GRAVITY;
    const ceilingY = GAME_CONFIG.GROUND_HEIGHT; 
    if (this.y < ceilingY) { this.y = ceilingY; this.vy = 0; }
    this.jumpPressedBefore = input.keys.up;
  }

  // ✅ MÉTHODES OPTIMISÉES : Pas de "new Object()"
  getHitbox() {
      this.hitbox.x = this.x + 8;
      this.hitbox.y = this.y + 5;
      this.hitbox.width = this.width - 16;
      this.hitbox.height = this.height - 10;
      return this.hitbox;
  }
  
  getGhostHitbox() {
      this.ghostHitbox.x = this.x + 8;
      this.ghostHitbox.y = (this.y - GAME_CONFIG.GHOST_OFFSET_Y) + 5;
      this.ghostHitbox.width = this.width - 16;
      this.ghostHitbox.height = this.height - 10;
      return this.ghostHitbox;
  }
  
  draw(ctx) {
      // (Méthode draw optimisée précédemment sans les ombres)
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      if (this.currentBiome === BIOMES.FLAPPY) {
          ctx.fillStyle = '#FFF';
          ctx.fillRect(this.x - 10, this.y + 10, 10, 20);
      }
  }
}