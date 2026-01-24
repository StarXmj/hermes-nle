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

  update(speed, biome) {
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

    // 2. Spawn des obstacles classiques
    if (this.lastSpawnX < GAME_CONFIG.CANVAS_WIDTH - this.minGap) {
        this.trySpawnObstacle(biome, speed);
    }

    // 3. Spawn des Projectiles (ARES)
    if (biome === BIOMES.ARES) {
        this.projectileTimer++;
        
        // ✅ MODIFICATION : Spawn beaucoup moins fréquent
        // Avant : random * 40 + 40 (toutes les 0.6s à 1.3s)
        // Après : random * 100 + 100 (toutes les 1.6s à 3.3s)
        if (this.projectileTimer > Math.random() * 100 + 100) {
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
              const heightFromGround = this.randomInt(90, 110);
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
              yPos = GAME_CONFIG.GROUND_HEIGHT + this.randomInt(80, 100);
          }
      }
      // 3. BIOME FLAPPY
      else if (biome === BIOMES.FLAPPY) {
           if (rand < 0.5) {
               def = ENTITY_TYPES.GROUND;
               finalHeight = this.randomInt(60, 100);
               finalType = 'column';
               yPos = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - finalHeight;
           } else {
               if (Math.random() < 0.5) {
                   def = ENTITY_TYPES.CHAIN;
                   finalHeight = this.randomInt(60, 120); 
                   finalType = 'chain';
               } else {
                   def = ENTITY_TYPES.CEILING;
                   finalHeight = this.randomInt(50, 80);
                   finalType = 'stalactite';
               }
               yPos = GAME_CONFIG.GROUND_HEIGHT;
           }
      }

      // --- CALCUL DU GAP (Difficulté) ---
      let reactionFrames = (biome === BIOMES.FLAPPY) ? 40 : 60; 
      if (biome === BIOMES.HADES) reactionFrames = 90; 
      
      // ✅ MODIFICATION : Plus d'espace pour ARES car il y a déjà des projectiles
      if (biome === BIOMES.ARES) reactionFrames = 80; 

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
          ctx.beginPath();
          ctx.moveTo(ent.x, ent.y);
          ctx.lineTo(ent.x + ent.width, ent.y);
          ctx.lineTo(ent.x + ent.width/2, ent.y + ent.height + 15); 
          ctx.fill();
      } else {
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
      }
    });
  }
}