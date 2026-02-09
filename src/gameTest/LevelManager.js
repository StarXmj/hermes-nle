import { GAME_CONFIG, ENTITY_TYPES, BIOMES } from './constants';

export class LevelManager {
  constructor() {
    this.entities = []; // Obstacles mortels
    this.platforms = []; // --- NOUVEAU : Plateformes sur lesquelles on marche
    this.coins = [];     // --- NOUVEAU : Pièces à collecter
    
    this.lastSpawnX = 0;
    this.minGap = 0;
    this.projectileTimer = 0;
    
    // Timer pour faire apparaître des plateformes indépendamment des obstacles au sol
    this.platformTimer = 0; 
  }

  clearAll() {
    this.entities = [];
    this.platforms = []; // Clear
    this.coins = [];     // Clear
    this.lastSpawnX = GAME_CONFIG.CANVAS_WIDTH + 500;
    this.projectileTimer = 0;
    this.platformTimer = 0;
  }

  update(speed, biome, canSpawn = true) {
    // 1. Mise à jour des positions (OBSTACLES MORTELS)
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

    // --- NOUVEAU : Mise à jour des PLATEFORMES ---
    for (let i = this.platforms.length - 1; i >= 0; i--) {
        let p = this.platforms[i];
        p.x -= speed;
        if (p.x + p.width < 0) this.platforms.splice(i, 1);
    }

    // --- NOUVEAU : Mise à jour des PIÈCES ---
    for (let i = this.coins.length - 1; i >= 0; i--) {
        let c = this.coins[i];
        c.x -= speed;
        if (c.x + c.width < 0 || c.collected) this.coins.splice(i, 1);
    }
    
    this.lastSpawnX -= speed;

    // SÉCURITÉ : Si on est dans les 3 premières secondes, on arrête ici
    if (!canSpawn) return;

    // 2. Spawn des obstacles classiques (VOTRE LOGIQUE EXISTANTE)
    if (this.lastSpawnX < GAME_CONFIG.CANVAS_WIDTH - this.minGap) {
        this.trySpawnObstacle(biome, speed);
    }

    // 3. Spawn des Projectiles (ARES)
    if (biome === BIOMES.ARES) {
        this.projectileTimer++;
        if (this.projectileTimer > Math.random() * 150 + 150) {
            this.spawnProjectile();
            this.projectileTimer = 0;
        }
    }

    // --- NOUVEAU : Spawn des PLATEFORMES et PIÈCES ---
    // On ne fait pas spawn de plateformes en mode Flappy ou Inverted pour simplifier
    if (biome !== BIOMES.FLAPPY && biome !== BIOMES.INVERTED) {
        this.platformTimer += speed;
        // Toutes les ~2000 unités de distance (ajustable)
        if (this.platformTimer > 1500 + Math.random() * 1000) {
            this.spawnPlatform();
            this.platformTimer = 0;
        }
    }
  }

  // --- NOUVELLE MÉTHODE : Création des plateformes et pièces ---
  spawnPlatform() {
      const width = Math.random() * 100 + 120; // Largeur entre 120 et 220
      const height = 20;
      // Hauteur accessible pour un saut
      const y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - (Math.random() * 120 + 80); 
      
      // 30% de chance d'être un "Limiteur" (Rouge)
      const isLimiter = Math.random() < 0.3;
      
      const platform = {
        x: GAME_CONFIG.CANVAS_WIDTH,
        y: y,
        width: width,
        height: height,
        type: isLimiter ? 'limiter' : 'normal'
      };
      
      this.platforms.push(platform);

      // 60% de chance d'ajouter une PIÈCE au-dessus
      if (Math.random() < 0.6) {
          this.coins.push({
              x: platform.x + width / 2 - 15, // Centré
              y: platform.y - 50,             // Au dessus
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
    // 1. DESSINER LES PLATEFORMES (NOUVEAU)
    this.platforms.forEach(platform => {
      if (platform.type === 'limiter') {
          // Style "Limiteur" : Rouge + Bordure + Croix
          ctx.fillStyle = '#b91c1c'; 
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
          
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 2;
          ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
          
          // Petit symbole "Interdit" au milieu
          const centerX = platform.x + platform.width/2;
          const centerY = platform.y + platform.height/2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
          ctx.moveTo(centerX - 5, centerY - 5);
          ctx.lineTo(centerX + 5, centerY + 5);
          ctx.stroke();

      } else {
          // Style Standard : Vert/Nature
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
          // Petite déco herbe
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(platform.x, platform.y, platform.width, 5);
      }
    });

    // 2. DESSINER LES PIÈCES (NOUVEAU)
    this.coins.forEach(coin => {
        if (!coin.collected) {
            // Effet brillant Or
            ctx.fillStyle = '#FFD700'; 
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Reflet
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2 - 5, coin.y + coin.height/2 - 5, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // 3. DESSINER LES OBSTACLES (VOTRE CODE)
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