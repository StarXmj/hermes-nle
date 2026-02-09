import { Player } from './Player';
import { LevelManager } from './LevelManager';
import { Background } from './Background';
import { InputHandler } from './InputHandler';
import { GAME_CONFIG, BIOMES, BIOME_SEQUENCE } from './constants';
import { spriteManager } from './SpriteManager';
import { particleManager } from './ParticleManager';
import { soundManager } from './SoundManager'; 

export class GameEngine {
  constructor(canvas, config, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // 1. Configuration
    this.config = config || { skin: 'default' }; 
    this.callbacks = callbacks;
    
    this.input = new InputHandler();
    this.resize();
    this.reset(); 
    
    // 2. Gestion du Temps
    this.lastTime = 0;
    this.accumulator = 0;
    this.step = 1000 / 60; 
    
    // 3. Gestion Pause & Score
    this.isPaused = false;
    this.coinsCollected = 0;
    this.lastCoinScore = 0; // Pour espacer les pièces

    this.resizeHandler = () => this.resize();
    window.addEventListener('resize', this.resizeHandler);
  }

  resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.width = width;
      this.height = height;
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2); 
      
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); 
      this.ctx.scale(dpr, dpr);
      
      this.gameScale = Math.min(width / GAME_CONFIG.CANVAS_WIDTH, height / GAME_CONFIG.CANVAS_HEIGHT);
      const offsetX = (width - GAME_CONFIG.CANVAS_WIDTH * this.gameScale) / 2;
      const offsetY = (height - GAME_CONFIG.CANVAS_HEIGHT * this.gameScale) / 2;
      
      this.ctx.translate(offsetX, offsetY);
      this.ctx.scale(this.gameScale, this.gameScale);
  }

  reset() {
    this.background = new Background(GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    
    spriteManager.load(this.config.skin);

    this.player = new Player(this.config.skin);
    this.level = new LevelManager();
    particleManager.clear();
    
    this.speed = GAME_CONFIG.SPEED_START;
    this.score = 0;
    this.coinsCollected = 0;
    this.lastCoinScore = 0;
    
    this.running = true;
    this.isPaused = false; 
    
    this.biomeSequenceIndex = 0;
    this.currentBiome = BIOME_SEQUENCE[0].type;
    this.biomeDurationTarget = BIOME_SEQUENCE[0].duration;
    this.biomeTimer = 0;
    this.transitionAlpha = 0; 
    this.gameStartTime = Date.now();

    this.lastTime = performance.now();
    this.accumulator = 0;

    soundManager.startAmbience();
  }

  start() { 
      this.lastTime = performance.now();
      requestAnimationFrame(this.loop); 
  }

  togglePause(shouldPause) {
      this.isPaused = shouldPause;

      if (this.isPaused) {
          soundManager.stopAmbience();
      } else {
          soundManager.startAmbience();
          this.lastTime = performance.now();
          requestAnimationFrame(this.loop);
      }
  }

  loop = (timestamp) => {
    if (!this.running || this.isPaused) return;

    let deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (deltaTime > 100) deltaTime = 100;

    this.accumulator += deltaTime;

    while (this.accumulator >= this.step) {
        this.update(); 
        this.accumulator -= this.step;
    }

    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    this.draw(); 
    
    // UI Update (Throttle pour perf)
    if (this.score % 10 < 1) {
        this.callbacks.onUpdateUI({
            score: Math.floor(this.score),
            biome: this.currentBiome,
            coins: this.coinsCollected 
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

    // Effet de vitesse visuel
    if (this.speed > 16) {
        if (Math.random() < 0.1 + (this.speed - 16) * 0.02) {
             particleManager.createSpeedLine(GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
        }
    }

    const isSafeMode = (Date.now() - this.gameStartTime) < 3000;

    this.background.update(worldSpeed, this.currentBiome);
    this.level.update(worldSpeed, this.currentBiome, !isSafeMode);
    
    // ✅ GESTION DU SPAWN INTELLIGENT DES PIÈCES
    this.spawnCoin(); 

    this.player.update(this.input, this.currentBiome);
    particleManager.update(); 

    this.checkCollisions();
  }

  // ✅ NOUVELLE MÉTHODE : SPAWN LOGIQUE DES PIÈCES
  // ✅ MÉTHODE MISE À JOUR : SPAWN PLUS NATUREL
  // ✅ GESTION DES PIÈCES (Règles : > 600m, Rare sur obstacle)
  spawnCoin() {
    // RÈGLE 1 : Pas de pièces avant 600 mètres
    if (this.score < 600) return;

    // RÈGLE 2 : Espacement minimum (pour ne pas spammer)
    if (this.score - this.lastCoinScore < 40) return;

    const spawnZoneX = GAME_CONFIG.CANVAS_WIDTH; 
    const margin = 100;

    // Chercher support
    const platform = this.level.platforms.find(p => p.x > spawnZoneX - margin && p.x < spawnZoneX + margin);
    const obstacle = this.level.entities.find(o => o.x > spawnZoneX - margin && o.x < spawnZoneX + margin && o.type !== 'projectile');

    let coinX = 0;
    let coinY = 0;
    let found = false;

    if (platform) {
        // SUR PLATEFORME : On garde une bonne probabilité (c'est une récompense pour être monté)
        coinX = platform.x + (platform.width / 2) - 15; 
        coinY = platform.y - 45; 
        found = true;
    } 
    else if (obstacle) {
        // SUR OBSTACLE : RÈGLE 3 -> 1 chance sur 5 (20%)
        // Et seulement si l'obstacle n'est pas trop haut
        if (obstacle.height < 100 && Math.random() < 0.2) {
            coinX = obstacle.x + (obstacle.width / 2) - 15;
            coinY = obstacle.y - 40; // Juste au-dessus
            found = true;
        }
    }

    if (found) {
        this.level.coins.push({
            x: coinX,
            y: coinY,
            width: 30,
            height: 30,
            collected: false,
            baseY: coinY 
        });
        this.lastCoinScore = this.score;
    }
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
    
    // 1. GAME OVER FLAPPY
    if (this.currentBiome === BIOMES.FLAPPY) {
        if (this.player.y + this.player.height > GAME_CONFIG.CANVAS_HEIGHT) {
            this.gameOver();
            return;
        }
    }
    
    // 2. OBSTACLES & FANTÔMES
    let ghostBox = null;
    if (this.currentBiome === BIOMES.PHILOTES) {
        ghostBox = this.player.getGhostHitbox ? this.player.getGhostHitbox() : null;
    }

    for (let ent of this.level.entities) {
        if (this.isColliding(pBox, ent)) {
            this.gameOver(); return;
        }
        if (ghostBox && this.isColliding(ghostBox, ent)) {
            this.gameOver(); return;
        }
    }

    // 3. ✅ PLATEFORMES (TOUS TYPES) - ONE WAY (TRAVERSABLES)
    if (this.level.platforms) {
        for (let plat of this.level.platforms) {
            // Logique précise pour atterrir dessus sans se cogner la tête
            // A. Le joueur doit tomber (vy >= 0)
            const isFalling = this.player.vy >= 0;
            
            // B. Les pieds du joueur doivent être proches du haut de la plateforme
            const feetY = this.player.y + this.player.height;
            const platformTop = plat.y;
            
            // C. On autorise une marge égale à la vitesse de chute pour ne pas "passer au travers" d'une frame à l'autre
            const margin = this.player.vy + 10; 

            // D. Vérification Horizontale (Le joueur est bien au-dessus de la plateforme)
            const isAlignedX = (this.player.x + this.player.width > plat.x + 10) && 
                               (this.player.x < plat.x + plat.width - 10);

            if (isFalling && isAlignedX && feetY >= platformTop && feetY <= platformTop + margin) {
                this.player.setOnPlatform(plat);
            }
        }
    }

    // 4. PIÈCES
    if (this.level.coins) {
        for (let coin of this.level.coins) {
            if (!coin.collected && this.isColliding(pBox, coin)) {
                coin.collected = true;
                this.coinsCollected++;
                soundManager.play('coin');
            }
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
    soundManager.stopAmbience();
    soundManager.play('death');
    this.callbacks.onGameOver({ 
        score: Math.floor(this.score),
        coins: this.coinsCollected 
    });
  }

  draw() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    this.ctx.clip();

    // Effet visuel Dionysos
    if (this.currentBiome === BIOMES.DIONYSOS) {
        const cx = GAME_CONFIG.CANVAS_WIDTH / 2;
        const cy = GAME_CONFIG.CANVAS_HEIGHT / 2;
        this.ctx.translate(cx, cy);
        this.ctx.rotate(Math.sin(this.biomeTimer * 0.03) * 0.05);
        const s = 1 + Math.sin(this.biomeTimer * 0.05) * 0.02;
        this.ctx.scale(s, s);
        this.ctx.translate(-cx, -cy);
    }

    this.background.draw(this.ctx, this.currentBiome); 
    
    // Sol classique
    if (this.currentBiome !== BIOMES.FLAPPY) {
        this.ctx.fillStyle = '#222';
        if (this.currentBiome !== BIOMES.INVERTED) {
            this.ctx.fillRect(0, GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.GROUND_HEIGHT);
        }
        if (this.currentBiome === BIOMES.INVERTED) {
            this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.GROUND_HEIGHT);
        }
    }

    // --- DESSIN DES PLATEFORMES ---
    if (this.level.platforms) {
        this.level.platforms.forEach(plat => {
             // On garde votre logique de style
             if (plat.type === 'limiter') {
                  this.ctx.fillStyle = '#b91c1c'; 
                  this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
                  this.ctx.strokeStyle = '#fca5a5';
                  this.ctx.lineWidth = 2;
                  this.ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
                  // Croix
                  const cx = plat.x + plat.width/2;
                  const cy = plat.y + plat.height/2;
                  this.ctx.beginPath();
                  this.ctx.moveTo(cx - 5, cy - 5); this.ctx.lineTo(cx + 5, cy + 5);
                  this.ctx.moveTo(cx + 5, cy - 5); this.ctx.lineTo(cx - 5, cy + 5);
                  this.ctx.strokeStyle = 'white';
                  this.ctx.stroke();
             } else {
                  this.ctx.fillStyle = '#22c55e';
                  this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
             }
        });
    }

    // --- ✅ DESSIN DES PIÈCES VIA SPRITE MANAGER ---
    if (this.level.coins) {
        this.level.coins.forEach(coin => {
             if (!coin.collected) {
                // Utilise le nouveau système de sprite
                spriteManager.drawCoin(this.ctx, coin);
             }
        });
    }

    // Dessin des obstacles
    this.level.entities.forEach(ent => {
        spriteManager.drawObstacle(this.ctx, ent, this.currentBiome);
    });

    // Dessin du joueur
    spriteManager.drawPlayer(
        this.ctx, this.player, this.currentBiome 
    );

    // Fantôme Philotes
    if (this.currentBiome === BIOMES.PHILOTES) {
        const ghostY = this.player.y - (GAME_CONFIG.GHOST_OFFSET_Y || 120);
        this.ctx.save();
        this.ctx.globalAlpha = 0.5; 
        // Copie des propriétés joueur pour dessiner le fantôme
        const ghostPlayer = { ...this.player, y: ghostY }; 
        spriteManager.drawPlayer(this.ctx, ghostPlayer, this.currentBiome);
        this.ctx.restore();
    }

    particleManager.draw(this.ctx);

    // Effets d'ambiance et tutoriels (inchangés)
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

    this.ctx.restore(); 

    // Tutos
    const isSafeMode = (Date.now() - this.gameStartTime) < 3000;
    if (this.running && (isSafeMode || this.score < 50) && this.currentBiome !== BIOMES.FLAPPY) {
        this.drawStartTutorial();
    }
    if (this.running && this.currentBiome === BIOMES.FLAPPY && this.biomeTimer < 300) {
        this.drawFlappyTutorial();
    }
    if (this.input.isTouchDevice) {
        this.drawTouchMarkers();
    }
  }

  drawFlappyTutorial() {
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      const w = this.canvas.width;
      const h = this.canvas.height;
      const dpr = window.devicePixelRatio || 1;
      this.ctx.textAlign = 'center';
      this.ctx.font = `bold ${30 * dpr}px Arial`;
      this.ctx.fillStyle = '#FFFFFF';
      const actionText = this.input.isTouchDevice ? "TAP POUR STABILISER" : "ESPACE POUR STABILISER";
      this.ctx.fillText(actionText, w / 2, h * 0.3);
      this.ctx.font = `bold ${24 * dpr}px Arial`;
      this.ctx.fillStyle = '#FF4444'; 
      this.ctx.fillText("ATTENTION : LE SOL EST MORTEL !", w / 2, h * 0.5);
      this.ctx.restore();
  }

  drawStartTutorial() {
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      const w = this.canvas.width;
      const h = this.canvas.height;
      const dpr = window.devicePixelRatio || 1;
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#FFD700'; 
      this.ctx.font = `bold ${28 * dpr}px Arial`;
      this.ctx.fillText("ÉVITE LES OBSTACLES", w / 2, h * 0.15); 
      if (this.input.isTouchDevice) {
          this.ctx.fillStyle = 'rgba(52, 152, 219, 0.2)'; 
          this.ctx.fillRect(0, 0, w/2, h);
          this.ctx.fillStyle = 'rgba(231, 76, 60, 0.2)'; 
          this.ctx.fillRect(w/2, 0, w/2, h);
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          this.ctx.lineWidth = 4;
          this.ctx.beginPath();
          this.ctx.moveTo(w/2, 0);
          this.ctx.lineTo(w/2, h);
          this.ctx.stroke();
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.font = `bold ${24 * dpr}px Arial`;
          this.ctx.fillText("GAUCHE : GLISSER", w * 0.25, h * 0.5);
          this.ctx.fillText("DROITE : SAUTER | x2 DOUBLE SAUT", w * 0.75, h * 0.5);
      } else {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `bold ${20 * dpr}px Arial`;
        this.ctx.fillText("ESPACE / ↑ : SAUTER | x2 DOUBLE SAUT", w / 2, h * 0.4);
        this.ctx.fillText("↓ : GLISSER", w / 2, h * 0.6);
      }
      this.ctx.restore();
  }

  drawTouchMarkers() {
      const touches = this.input.touches;
      if (!touches || touches.length === 0) return;
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); 
      const dpr = window.devicePixelRatio || 1;
      touches.forEach(t => {
          const x = t.x * dpr;
          const y = t.y * dpr;
          this.ctx.beginPath();
          this.ctx.arc(x, y, 30 * dpr, 0, Math.PI * 2);
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          this.ctx.lineWidth = 3 * dpr;
          this.ctx.stroke();
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          this.ctx.fill();
          const jumpsLeft = this.player.maxJumps - this.player.jumpCount;
          if (jumpsLeft > 0) {
              this.ctx.fillStyle = '#00FF00'; 
              for (let i = 0; i < jumpsLeft; i++) {
                  const angle = -Math.PI / 2 + (i * 0.5); 
                  const dotX = x + Math.cos(angle) * (40 * dpr);
                  const dotY = y + Math.sin(angle) * (40 * dpr);
                  this.ctx.beginPath();
                  this.ctx.arc(dotX, dotY, 6 * dpr, 0, Math.PI * 2);
                  this.ctx.fill();
                  this.ctx.stroke(); 
              }
          } else {
             this.ctx.fillStyle = '#FF0000';
             const dotX = x + Math.cos(-Math.PI/2) * (40 * dpr);
             const dotY = y + Math.sin(-Math.PI/2) * (40 * dpr);
             this.ctx.beginPath();
             this.ctx.arc(dotX, dotY, 4 * dpr, 0, Math.PI * 2);
             this.ctx.fill();
          }
      });
      this.ctx.restore();
  }

  destroy() {
    this.running = false;
    soundManager.stopAmbience();
    this.input.cleanup();
    window.removeEventListener('resize', this.resizeHandler);
  }
}