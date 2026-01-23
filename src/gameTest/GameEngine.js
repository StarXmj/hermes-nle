import { Player } from './Player';
import { LevelManager } from './LevelManager';
import { Background } from './Background';
import { InputHandler } from './InputHandler';
import { GAME_CONFIG, BIOMES, BIOME_SEQUENCE } from './constants';
import { spriteManager } from './SpriteManager';

export class GameEngine {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;
    
    this.input = new InputHandler();
    this.resize();
    this.reset();
    
    this.resizeHandler = () => this.resize();
    window.addEventListener('resize', this.resizeHandler);
  }

  resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.width = width;
      this.height = height;
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); 
      this.ctx.scale(dpr, dpr);
      const scale = Math.min(width / GAME_CONFIG.CANVAS_WIDTH, height / GAME_CONFIG.CANVAS_HEIGHT);
      const offsetX = (width - GAME_CONFIG.CANVAS_WIDTH * scale) / 2;
      const offsetY = (height - GAME_CONFIG.CANVAS_HEIGHT * scale) / 2;
      this.ctx.translate(offsetX, offsetY);
      this.ctx.scale(scale, scale);
  }

  reset() {
    this.background = new Background(GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    this.player = new Player();
    this.level = new LevelManager();
    
    this.speed = GAME_CONFIG.SPEED_START;
    this.score = 0;
    this.running = true;
    
    this.biomeSequenceIndex = 0;
    this.currentBiome = BIOME_SEQUENCE[0].type;
    this.biomeDurationTarget = BIOME_SEQUENCE[0].duration;
    this.biomeTimer = 0;
    this.transitionAlpha = 0; 
  }

  start() { this.loop(); }

  loop = () => {
    if (!this.running) return;

    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    this.update();
    this.draw(); // C'est ici que tout se dessine
    
    if (this.score % 10 < 1) {
        this.callbacks.onUpdateUI({
            score: Math.floor(this.score),
            biome: this.currentBiome
        });
    }
    requestAnimationFrame(this.loop);
  }

  update() {
    if (this.transitionAlpha > 0) {
        this.transitionAlpha -= 0.02; 
        if(this.transitionAlpha < 0) this.transitionAlpha = 0;
    }

    this.biomeTimer++;
    if (this.biomeTimer > this.biomeDurationTarget) {
        this.nextBiome();
    }

    const worldSpeed = this.speed;
    this.speed += GAME_CONFIG.SPEED_INCREMENT;
    this.score += worldSpeed * 0.1;

    this.background.update(worldSpeed);
    this.level.update(worldSpeed, this.currentBiome);
    this.player.update(this.input, this.currentBiome);

    this.checkCollisions();
  }

  nextBiome() {
      this.biomeSequenceIndex++;
      if (this.biomeSequenceIndex >= BIOME_SEQUENCE.length) {
          this.biomeSequenceIndex = 0;
      }
      const nextConfig = BIOME_SEQUENCE[this.biomeSequenceIndex];
      this.currentBiome = nextConfig.type;
      this.biomeDurationTarget = nextConfig.duration;
      this.biomeTimer = 0;

      this.level.clearAll();
      this.player.setBiome(this.currentBiome);
      this.transitionAlpha = 1.0;
  }

  // ✅ CORRIGÉ : Cette méthode ne fait QUE des calculs (plus de dessin ici)
  checkCollisions() {
    const pBox = this.player.getHitbox();
    let ghostBox = null;
    
    if (this.currentBiome === BIOMES.PHILOTES) {
        if (this.player.getGhostHitbox) {
            ghostBox = this.player.getGhostHitbox();
        } else {
            const ghostY = this.player.y - (GAME_CONFIG.GHOST_OFFSET_Y || 120);
            ghostBox = {
                x: this.player.x + 8,
                y: ghostY + 5,
                width: this.player.width - 16,
                height: this.player.height - 10
            };
        }
    }

    for (let ent of this.level.entities) {
        if (this.isColliding(pBox, ent)) {
            this.gameOver();
            return;
        }
        if (ghostBox && this.isColliding(ghostBox, ent)) {
            this.gameOver();
            return;
        }
    }
  }

  isColliding(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
  }

  gameOver() {
    this.running = false;
    this.callbacks.onGameOver({ score: Math.floor(this.score) });
  }

  draw() {
    this.ctx.save();
    
    // Clip Zone de Jeu
    this.ctx.beginPath();
    this.ctx.rect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    this.ctx.clip();

    // --- EFFET DIONYSOS ---
    if (this.currentBiome === BIOMES.DIONYSOS) {
        const cx = GAME_CONFIG.CANVAS_WIDTH / 2;
        const cy = GAME_CONFIG.CANVAS_HEIGHT / 2;
        this.ctx.translate(cx, cy);
        this.ctx.rotate(Math.sin(this.biomeTimer * 0.03) * 0.05);
        const s = 1 + Math.sin(this.biomeTimer * 0.05) * 0.02;
        this.ctx.scale(s, s);
        this.ctx.translate(-cx, -cy);
    }

    // 1. DESSIN DU FOND (SPRITES)
    this.background.draw(this.ctx);
    
    // 2. SOL / PLAFOND (PHYSIQUE)
    this.ctx.fillStyle = '#222';
    if (this.currentBiome !== BIOMES.INVERTED) {
        this.ctx.fillRect(0, GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.GROUND_HEIGHT);
    }
    if (this.currentBiome === BIOMES.INVERTED || this.currentBiome === BIOMES.FLAPPY) {
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.GROUND_HEIGHT);
    }

    // 3. OBSTACLES (SPRITES)
    this.level.entities.forEach(ent => {
        spriteManager.drawObstacle(this.ctx, ent, this.currentBiome);
    });

    // 4. JOUEUR (SPRITE)
    spriteManager.drawPlayer(
        this.ctx, 
        this.player.x, 
        this.player.y, 
        this.player.width, 
        this.player.height, 
        this.player.isSliding,
        this.player.jumpCount > 0
    );

    // 5. FANTÔME (SPRITE - PHILOTES)
    if (this.currentBiome === BIOMES.PHILOTES) {
        const ghostY = this.player.y - (GAME_CONFIG.GHOST_OFFSET_Y || 120);
        
        // Lien visuel
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width/2, this.player.y);
        this.ctx.lineTo(this.player.x + this.player.width/2, ghostY + this.player.height);
        this.ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.save();
        this.ctx.globalAlpha = 0.5; 
        spriteManager.drawPlayer(this.ctx, this.player.x, ghostY, this.player.width, this.player.height, this.player.isSliding, this.player.jumpCount > 0);
        this.ctx.restore();
    }

    // --- OVERLAYS VISUELS ---
    if (this.currentBiome === BIOMES.ARES) {
        this.ctx.fillStyle = 'rgba(231, 76, 60, 0.2)'; 
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    }
    if (this.currentBiome === BIOMES.HADES) {
        const pCenterX = this.player.x + 20;
        const pCenterY = this.player.y + 30;
        const gradient = this.ctx.createRadialGradient(pCenterX, pCenterY, 120, pCenterX, pCenterY, 450);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');   
        gradient.addColorStop(1, 'rgba(0,0,0,0.95)');   
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    }
    if (this.transitionAlpha > 0) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.transitionAlpha})`;
        this.ctx.fillRect(0,0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    }

    // ============================================================
    // 🛠️ MODE DEBUG : HITBOXES TRANSPARENTES
    // ============================================================
    // Mets à 'false' pour désactiver l'affichage des zones de collision
    const DEBUG_MODE = true; 

    if (DEBUG_MODE) {
        this.ctx.save();
        this.ctx.lineWidth = 2;

        // A. HITBOX JOUEUR (VERT)
        // On récupère la vraie hitbox utilisée pour les calculs
        const pBox = this.player.getHitbox ? this.player.getHitbox() : { x: this.player.x, y: this.player.y, width: this.player.width, height: this.player.height };
        
        this.ctx.strokeStyle = '#00FF00'; // Contour Vert fluo
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Fond Vert transparent
        this.ctx.fillRect(pBox.x, pBox.y, pBox.width, pBox.height);
        this.ctx.strokeRect(pBox.x, pBox.y, pBox.width, pBox.height);

        // B. HITBOX OBSTACLES (ROUGE)
        this.ctx.strokeStyle = '#FF0000'; // Contour Rouge
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Fond Rouge transparent
        this.level.entities.forEach(ent => {
             this.ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
             this.ctx.strokeRect(ent.x, ent.y, ent.width, ent.height);
        });

        // C. HITBOX FANTÔME (BLEU - Philotes)
        if (this.currentBiome === BIOMES.PHILOTES) {
             let ghostBox = null;
             if (this.player.getGhostHitbox) {
                 ghostBox = this.player.getGhostHitbox();
             } else {
                 const ghostOffset = GAME_CONFIG.GHOST_OFFSET_Y || 120;
                 ghostBox = { x: this.player.x + 8, y: this.player.y - ghostOffset + 5, width: this.player.width - 16, height: this.player.height - 10 };
             }
             
             if (ghostBox) {
                 this.ctx.strokeStyle = '#00FFFF'; // Cyan
                 this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                 this.ctx.fillRect(ghostBox.x, ghostBox.y, ghostBox.width, ghostBox.height);
                 this.ctx.strokeRect(ghostBox.x, ghostBox.y, ghostBox.width, ghostBox.height);
             }
        }
        this.ctx.restore();
    }
    // ============================================================

    this.ctx.restore();
  }

  destroy() {
    this.running = false;
    this.input.cleanup();
    window.removeEventListener('resize', this.resizeHandler);
  }
}