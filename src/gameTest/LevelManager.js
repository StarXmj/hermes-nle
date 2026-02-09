import { GAME_CONFIG, ENTITY_TYPES, BIOMES } from './constants';

export class LevelManager {
  constructor() {
    this.entities = []; 
    this.platforms = []; 
    this.coins = [];     
    
    this.lastSpawnX = 0;
    this.minGap = 0;
    this.projectileTimer = 0;
    this.platformTimer = 0; 
  }

  clearAll() {
    this.entities = [];
    this.platforms = [];
    this.coins = [];    
    this.lastSpawnX = GAME_CONFIG.CANVAS_WIDTH + 500;
    this.projectileTimer = 0;
    this.platformTimer = 0;
  }

  update(speed, biome, canSpawn = true, distance = 0) {
    // 1. Mise à jour des positions
    for (let i = this.entities.length - 1; i >= 0; i--) {
      let ent = this.entities[i];
      ent.x -= speed;
      if (ent.type === 'projectile') ent.y += ent.speedY;
      if (ent.x + ent.width < 0 || ent.y > GAME_CONFIG.CANVAS_HEIGHT || ent.markedForDeletion) {
        this.entities.splice(i, 1);
      }
    }

    for (let i = this.platforms.length - 1; i >= 0; i--) {
        let p = this.platforms[i];
        p.x -= speed;
        if (p.x + p.width < 0) this.platforms.splice(i, 1);
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
        let c = this.coins[i];
        c.x -= speed;
        if (c.x + c.width < 0 || c.collected) this.coins.splice(i, 1);
    }
    
    this.lastSpawnX -= speed;

    if (!canSpawn) return;

    if (this.lastSpawnX < GAME_CONFIG.CANVAS_WIDTH - this.minGap) {
        this.trySpawnObstacle(biome, speed);
    }

    if (biome === BIOMES.ARES) {
        this.projectileTimer++;
        if (this.projectileTimer > Math.random() * 150 + 150) {
            this.spawnProjectile();
            this.projectileTimer = 0;
        }
    }

    // Spawn Plateformes
    if (biome !== BIOMES.FLAPPY) {
        this.platformTimer += speed;
        if (this.platformTimer > 1500 + Math.random() * 1000) {
            this.spawnPlatform(distance, biome); 
            this.platformTimer = 0;
        }
    }
  }

  // ✅ CORRECTION LOGIQUE PIÈCE & PLATEFORME
  spawnPlatform(currentDistance, biome) {
      const width = Math.random() * 100 + 120; 
      const height = 20;
      
      // ✅ 1. Hauteur aléatoire basée sur les constantes
      const randomHeight = Math.random() * (GAME_CONFIG.PLATFORM_MAX_HEIGHT - GAME_CONFIG.PLATFORM_MIN_HEIGHT) + GAME_CONFIG.PLATFORM_MIN_HEIGHT;
      
      let y;
      if (biome === BIOMES.INVERTED) {
          // En inversé, on part du haut (GROUND_HEIGHT) et on descend vers le centre
          y = GAME_CONFIG.GROUND_HEIGHT + randomHeight;
      } else {
          // En normal, on part du bas et on monte
          y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - randomHeight;
      }
      
      const isLimiter = Math.random() < 0.3;
      
      const platform = {
        x: GAME_CONFIG.CANVAS_WIDTH,
        y: y,
        width: width,
        height: height,
        type: isLimiter ? 'limiter' : 'normal'
      };
      
      this.platforms.push(platform);

      // ✅ 2. Règle Pièce : Si > 600m, pièce GARANTIE (100% de chance) si plateforme spawn
      if (currentDistance >= 600) {
          // ✅ CORRECTION : La pièce est toujours placée "visuellement au-dessus" (y - 50)
          // Même en inversé, cela la place du côté "intérieur" du jeu, donc sur la plateforme pour le joueur
          const coinY = platform.y - 50;

          this.coins.push({
              x: platform.x + width / 2 - 15, 
              y: coinY,             
              width: 30,
              height: 30,
              collected: false
          });
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
      else if (biome === BIOMES.FLAPPY) {
           if (rand < 0.4) { 
               def = ENTITY_TYPES.GROUND;
               finalHeight = this.randomInt(80, 150); 
               finalType = 'column';
               yPos = GAME_CONFIG.CANVAS_HEIGHT - finalHeight;
           } else {
               if (Math.random() < 0.5) {
                   def = ENTITY_TYPES.CHAIN;
                   finalHeight = this.randomInt(100, 250); 
                   finalType = 'chain';
               } else {
                   def = ENTITY_TYPES.CEILING_COLUMN;
                   finalHeight = this.randomInt(100, 250);
                   finalType = 'column';
               }
               yPos = 0; 
           }
      }

      let reactionFrames = (biome === BIOMES.FLAPPY) ? 50 : 65; 
      if (biome === BIOMES.HADES) reactionFrames = 100; 
      if (biome === BIOMES.ARES) reactionFrames = 100;  

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
    this.platforms.forEach(platform => {
      if (platform.type === 'limiter') {
          ctx.fillStyle = '#b91c1c'; 
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 2;
          ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
          
          const centerX = platform.x + platform.width/2;
          const centerY = platform.y + platform.height/2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
          ctx.moveTo(centerX - 5, centerY - 5);
          ctx.lineTo(centerX + 5, centerY + 5);
          ctx.stroke();
      } else {
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(platform.x, platform.y, platform.width, 5);
      }
    });

    this.coins.forEach(coin => {
        if (!coin.collected) {
            ctx.fillStyle = '#FFD700'; 
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2 - 5, coin.y + coin.height/2 - 5, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    this.entities.forEach(ent => {
      ctx.fillStyle = ent.color;
      if (ent.type === 'projectile') {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(ent.x, ent.y);
          ctx.lineTo(ent.x + ent.width, ent.y);
          ctx.lineTo(ent.x + ent.width/2, ent.y + ent.height + 15); 
          ctx.fill();
          ctx.restore();
      } else {
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
      }
    });
  }
}