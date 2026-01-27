import { GAME_CONFIG, ENTITY_TYPES, BIOMES } from './constants';

export class LevelManager {
  constructor() {
    this.entities = [];
    this.lastSpawnX = 0;
    this.minGap = 0;
    this.projectileTimer = 0;
  }

  clearAll() {
    this.entities = [];
    this.lastSpawnX = GAME_CONFIG.CANVAS_WIDTH + 500;
    this.projectileTimer = 0;
  }

  update(speed, biome, canSpawn = true) {
    // 1. Mise à jour des positions
    for (let i = this.entities.length - 1; i >= 0; i--) {
      let ent = this.entities[i];
      
      ent.x -= speed;
      
      if (ent.type === 'projectile') {
          ent.y += ent.speedY;
      }

      if (ent.x + ent.width < 0 || ent.y > GAME_CONFIG.CANVAS_HEIGHT || ent.markedForDeletion) {
        this.entities.splice(i, 1);
      }
    }
    
    this.lastSpawnX -= speed;

    // SÉCURITÉ : Si on est dans les 3 premières secondes, on arrête ici
    if (!canSpawn) return;

    // 2. Spawn des obstacles classiques
    if (this.lastSpawnX < GAME_CONFIG.CANVAS_WIDTH - this.minGap) {
        this.trySpawnObstacle(biome, speed);
    }

    // 3. Spawn des Projectiles (ARES) - Moins fréquent
    if (biome === BIOMES.ARES) {
        this.projectileTimer++;
        // Augmentation du délai aléatoire pour moins de projectiles (150-300 frames au lieu de 100-200)
        if (this.projectileTimer > Math.random() * 150 + 150) {
            this.spawnProjectile();
            this.projectileTimer = 0;
        }
    }
  }

  spawnProjectile() {
      const def = ENTITY_TYPES.PROJECTILE;
      const randomX = GAME_CONFIG.CANVAS_WIDTH * 0.5 + Math.random() * (GAME_CONFIG.CANVAS_WIDTH * 0.5);
      
      this.entities.push({
          x: randomX,
          y: -100, 
          width: def.width,
          height: def.height,
          color: def.color,
          type: def.type,
          speedY: def.speedY, 
          markedForDeletion: false
      });
  }

  randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
  }

  trySpawnObstacle(biome, speed) {
      if (Math.random() < 0.05) return; 

      const rand = Math.random();
      let def = null;
      let yPos = 0;
      let finalHeight = 0;
      let finalType = 'obstacle'; 

      // 1. BIOMES CLASSIQUES
      if (biome === BIOMES.NORMAL || biome === BIOMES.HADES || biome === BIOMES.DIONYSOS || biome === BIOMES.ARES || biome === BIOMES.PHILOTES) {
          
          if (rand < 0.65) { 
              const subRand = Math.random();
              if (subRand < 0.4) {
                  def = ENTITY_TYPES.AMPHORA;
                  finalHeight = this.randomInt(30, 45);
                  finalType = 'amphora'; 
              } else if (subRand < 0.7) {
                  def = ENTITY_TYPES.SHIELD;
                  finalHeight = this.randomInt(40, 50);
                  finalType = 'shield';
              } else {
                  def = ENTITY_TYPES.GROUND;
                  finalHeight = this.randomInt(50, 75);
                  finalType = 'column';
              }
              yPos = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - finalHeight;

          } else {
              def = ENTITY_TYPES.HIGH;
              finalHeight = 40; 
              finalType = 'harpy';
              const heightFromGround = this.randomInt(55, 85);
              yPos = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - heightFromGround;
          }
      }
      // 2. BIOME INVERTED
      else if (biome === BIOMES.INVERTED) {
          if (rand < 0.6) {
              def = ENTITY_TYPES.GROUND; 
              finalHeight = this.randomInt(50, 80);
              finalType = 'stalactite';
              yPos = GAME_CONFIG.GROUND_HEIGHT; 
          } else {
              def = ENTITY_TYPES.HIGH;
              finalHeight = 40;
              finalType = 'harpy';
              yPos = GAME_CONFIG.GROUND_HEIGHT + this.randomInt(50, 70);
          }
      }
      // 3. BIOME FLAPPY
      else if (biome === BIOMES.FLAPPY) {
           if (rand < 0.4) { // Un peu moins de sol, plus de plafond
               // Obstacles du SOL
               def = ENTITY_TYPES.GROUND;
               finalHeight = this.randomInt(80, 150); // Plus grands aussi
               finalType = 'column';
               yPos = GAME_CONFIG.CANVAS_HEIGHT - finalHeight;
           } else {
               // ✅ PLAFOND : Uniquement CHAÎNE ou COLONNE DES DIEUX
               if (Math.random() < 0.5) {
                   def = ENTITY_TYPES.CHAIN;
                   // Très longue chaîne pour forcer à descendre
                   finalHeight = this.randomInt(100, 250); 
                   finalType = 'chain';
               } else {
                   // Colonne divine (remplace la stalactite)
                   def = ENTITY_TYPES.CEILING_COLUMN;
                   finalHeight = this.randomInt(100, 250);
                   finalType = 'column';
               }
               yPos = 0; // Ancré au plafond
           }
      }

      // --- CALCUL DU GAP (Difficulté Simplifiée) ---
      // Plus "reactionFrames" est grand, plus il y a d'espace entre les obstacles
      let reactionFrames = (biome === BIOMES.FLAPPY) ? 50 : 65; // Était 35 : 60 (Beaucoup plus d'espace)
      
      if (biome === BIOMES.HADES) reactionFrames = 100; // Était 90
      if (biome === BIOMES.ARES) reactionFrames = 100;  // Était 80

      this.minGap = (speed * reactionFrames) + (Math.random() * 200); 

      if (def) {
          this.entities.push({
              x: GAME_CONFIG.CANVAS_WIDTH,
              y: yPos,
              width: def.width,
              height: finalHeight, 
              color: def.color,
              type: def.type,
              drawType: finalType, 
              markedForDeletion: false
          });
          this.lastSpawnX = GAME_CONFIG.CANVAS_WIDTH;
      }
  }

  draw(ctx) {
    this.entities.forEach(ent => {
      ctx.fillStyle = ent.color;
      
      if (ent.type === 'projectile') {
          // ✅ OPTIMISATION : Suppression du shadowBlur (Lueur rouge)
          // On garde juste la forme géométrique, c'est instantané à dessiner.
          ctx.save();
          
          ctx.beginPath();
          ctx.moveTo(ent.x, ent.y);
          ctx.lineTo(ent.x + ent.width, ent.y);
          ctx.lineTo(ent.x + ent.width/2, ent.y + ent.height + 15); 
          ctx.fill();
          
          ctx.restore();
      } else {
          // Obstacles classiques (Rectangles)
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
      }
    });
  }
}