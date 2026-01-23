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
    
    // Initialisation Séquence Biome
    this.biomeSequenceIndex = 0;
    this.currentBiome = BIOME_SEQUENCE[0].type;
    this.biomeDurationTarget = BIOME_SEQUENCE[0].duration;
    this.biomeTimer = 0;
    this.transitionAlpha = 0; 
  }

  start() { this.loop(); }

  loop = () => {
    if (!this.running) return;

    // Clear écran complet
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    this.update();
    this.draw();
    
    if (this.score % 10 < 1) {
        this.callbacks.onUpdateUI({
            score: Math.floor(this.score),
            biome: this.currentBiome
        });
    }
    requestAnimationFrame(this.loop);
  }

  update() {
    // Transition
    if (this.transitionAlpha > 0) {
        this.transitionAlpha -= 0.02; 
        if(this.transitionAlpha < 0) this.transitionAlpha = 0;
    }

    // Gestion Biomes
    this.biomeTimer++;
    if (this.biomeTimer > this.biomeDurationTarget) {
        this.nextBiome();
    }

    // Physique
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

  checkCollisions() {
    const pBox = this.player.getHitbox();
    let ghostBox = null;
    
    // Récupérer la hitbox fantôme seulement en Philotes
    this.level.entities.forEach(ent => {
        // On délègue le dessin au manager qui choisit la bonne image selon le biome
        spriteManager.drawObstacle(this.ctx, ent, this.currentBiome);
    });

    // 2. JOUEUR (Utilise le SpriteManager)
    // On dessine le joueur
    // 2. JOUEUR (Utilise le SpriteManager)
    spriteManager.drawPlayer(
        this.ctx, 
        this.player.x, 
        this.player.y, 
        this.player.width, 
        this.player.height, 
        this.player.isSliding,
        this.player.jumpCount > 0 // ✅ On passe true si on saute (détecté par jumpCount ou vy)
    );

    // 3. FANTÔME PHILOTES
    if (this.currentBiome === BIOMES.PHILOTES) {
        const p = this.player;
        const ghostY = p.y - 120; // Récupère la constante GHOST_OFFSET_Y si tu l'as exportée, sinon 120

        // Lien magique
        this.ctx.beginPath();
        this.ctx.moveTo(p.x + p.width/2, p.y);
        this.ctx.lineTo(p.x + p.width/2, ghostY + p.height);
        this.ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)';
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Dessin du fantôme (Joueur semi-transparent)
        this.ctx.save();
        this.ctx.globalAlpha = 0.5; // Transparence
        // On applique un filtre rose si possible ou juste l'image standard
        spriteManager.drawPlayer(this.ctx, p.x, ghostY, p.width, p.height, p.isSliding);
        this.ctx.restore();
    }

    for (let ent of this.level.entities) {
        // 1. Collision Joueur
        if (this.isColliding(pBox, ent)) {
            this.gameOver();
            return;
        }
        // 2. Collision Fantôme
        if (ghostBox && this.isColliding(ghostBox, ent)) {
            this.gameOver(); // Si le fantôme meurt, tu meurs
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

    // --- EFFET DIONYSOS (Caméra Ivre) ---
    if (this.currentBiome === BIOMES.DIONYSOS) {
        const cx = GAME_CONFIG.CANVAS_WIDTH / 2;
        const cy = GAME_CONFIG.CANVAS_HEIGHT / 2;
        this.ctx.translate(cx, cy);
        this.ctx.rotate(Math.sin(this.biomeTimer * 0.03) * 0.05);
        const s = 1 + Math.sin(this.biomeTimer * 0.05) * 0.02;
        this.ctx.scale(s, s);
        this.ctx.translate(-cx, -cy);
    }

    // --- DESSIN PRINCIPAL ---
    this.background.draw(this.ctx);
    
    // Sol / Plafond
    this.ctx.fillStyle = '#222';
    if (this.currentBiome !== BIOMES.INVERTED) {
        this.ctx.fillRect(0, GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.GROUND_HEIGHT);
    }
    if (this.currentBiome === BIOMES.INVERTED || this.currentBiome === BIOMES.FLAPPY) {
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.GROUND_HEIGHT);
    }

    this.level.draw(this.ctx);
    this.player.draw(this.ctx);

    // ✅ VISUEL PHILOTES : LE FANTÔME (C'est ici qu'il se dessine)
    if (this.currentBiome === BIOMES.PHILOTES) {
        const p = this.player;
        // On utilise la config pour la hauteur
        const ghostY = p.y - GAME_CONFIG.GHOST_OFFSET_Y;

        // Lien
        this.ctx.beginPath();
        this.ctx.moveTo(p.x + p.width/2, p.y);
        this.ctx.lineTo(p.x + p.width/2, ghostY + p.height);
        this.ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Corps du Fantôme
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Plus opaque pour bien le voir
        this.ctx.fillRect(p.x, ghostY, p.width, p.height);
        
        // Yeux
        this.ctx.fillStyle = '#ff1493';
        this.ctx.fillRect(p.x + 10, ghostY + 15, 6, 6);
        this.ctx.fillRect(p.x + 24, ghostY + 15, 6, 6);
    }

    // --- OVERLAYS VISUELS ---

    // Ares (Rouge)
    if (this.currentBiome === BIOMES.ARES) {
        this.ctx.fillStyle = 'rgba(231, 76, 60, 0.2)'; 
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    }
    
    // Dionysos (Violet)
    if (this.currentBiome === BIOMES.DIONYSOS) {
        this.ctx.fillStyle = 'rgba(142, 68, 173, 0.15)';
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    }

    // Hades (Brouillard Noir)
    if (this.currentBiome === BIOMES.HADES) {
        const pCenterX = this.player.x + 20;
        const pCenterY = this.player.y + 30;
        const gradient = this.ctx.createRadialGradient(pCenterX, pCenterY, 120, pCenterX, pCenterY, 450);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');   
        gradient.addColorStop(0.3, 'rgba(0,0,0,0.4)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.98)');   
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
        // Yeux rouges
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.player.x + 25, this.player.y + 10, 4, 4);
    }

    // Transition (Flash Blanc)
    if (this.transitionAlpha > 0) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.transitionAlpha})`;
        this.ctx.fillRect(0,0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
        
        if (this.transitionAlpha > 0.5) {
            this.ctx.fillStyle = '#000';
            this.ctx.font = "bold 40px Courier";
            this.ctx.textAlign = "center";
            this.ctx.fillText(`ZONE: ${this.currentBiome}`, GAME_CONFIG.CANVAS_WIDTH/2, GAME_CONFIG.CANVAS_HEIGHT/2);
            this.ctx.textAlign = "left";
        }
    }

    this.ctx.restore();
  }

  destroy() {
    this.running = false;
    this.input.cleanup();
    window.removeEventListener('resize', this.resizeHandler);
  }
}