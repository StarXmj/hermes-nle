import { GAME_CONFIG, ENTITY_TYPES, BIOMES } from './constants';

export class LevelManager {
  constructor() {
    this.entities = [];
    this.lastSpawnX = 0;
    this.minGap = 0;

    // Timer spécifique pour la pluie de projectiles d'Ares
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
      
      // Déplacement horizontal standard (tout le monde recule)
      ent.x -= speed;
      
      // NOUVEAU : Déplacement vertical pour les projectiles
      if (ent.type === 'projectile') {
          ent.y += ent.speedY;
      }

      // Nettoyage si hors écran (gauche OU bas)
      if (ent.x + ent.width < 0 || ent.y > GAME_CONFIG.CANVAS_HEIGHT || ent.markedForDeletion) {
        this.entities.splice(i, 1);
      }
    }
    
    this.lastSpawnX -= speed;

    // 2. Spawn des obstacles classiques (Sol/Plafond) - Géré par le Gap
    if (this.lastSpawnX < GAME_CONFIG.CANVAS_WIDTH - this.minGap) {
        this.trySpawnObstacle(biome, speed);
    }

    // 3. NOUVEAU : Spawn des Projectiles (Uniquement en ARES)
    if (biome === BIOMES.ARES) {
        this.projectileTimer++;
        // Spawn toutes les 40 à 80 frames (rythme soutenu)
        if (this.projectileTimer > Math.random() * 40 + 40) {
            this.spawnProjectile();
            this.projectileTimer = 0;
        }
    }
  }

  // Nouvelle méthode dédiée aux projectiles tombants
  spawnProjectile() {
      const def = ENTITY_TYPES.PROJECTILE;
      // Apparaît à une position X aléatoire devant le joueur
      // entre le milieu de l'écran et la droite
      const randomX = GAME_CONFIG.CANVAS_WIDTH * 0.5 + Math.random() * (GAME_CONFIG.CANVAS_WIDTH * 0.5);
      
      this.entities.push({
          x: randomX,
          y: -100, // Commence au-dessus de l'écran
          width: def.width,
          height: def.height,
          color: def.color,
          type: def.type,
          speedY: def.speedY, // Vitesse de chute
          markedForDeletion: false
      });
      // Note : On ne touche pas à lastSpawnX ici, car les projectiles sont indépendants du rythme au sol
  }

  // L'ancienne méthode trySpawn renommée pour plus de clarté
  // Dans src/game/LevelManager.js

  // Helper pour avoir un entier aléatoire entre min et max
  randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
  }

  trySpawnObstacle(biome, speed) {
      if (Math.random() < 0.05) return; 

      const rand = Math.random();
      let def = null;
      let yPos = 0;
      let finalHeight = 0;
      let finalType = 'obstacle'; // par défaut

      // --- LOGIQUE DE SÉLECTION ET TAILLE ---

      // 1. BIOMES CLASSIQUES (Normal, Ares, Dionysos)
      if (biome === BIOMES.NORMAL || biome === BIOMES.HADES || biome === BIOMES.DIONYSOS || biome === BIOMES.ARES || biome === BIOMES.PHILOTES) {
          
          if (rand < 0.65) { 
              // === SOL (65% de chance) ===
              const subRand = Math.random();
              
              if (subRand < 0.4) {
                  // VASE (Petit) : 30px à 45px
                  def = ENTITY_TYPES.AMPHORA;
                  finalHeight = this.randomInt(30, 45);
                  finalType = 'amphora'; // Pour le SpriteManager
              } else if (subRand < 0.7) {
                  // BOUCLIER (Moyen) : 40px à 50px
                  def = ENTITY_TYPES.SHIELD;
                  finalHeight = this.randomInt(40, 50);
                  finalType = 'shield';
              } else {
                  // COLONNE (Grand) : 50px à 75px
                  def = ENTITY_TYPES.GROUND;
                  finalHeight = this.randomInt(50, 75);
                  finalType = 'column';
              }
              
              // Calcule Y en fonction de la hauteur aléatoire choisie
              yPos = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - finalHeight;

          } else {
              // === AÉRIEN / HARPIE (35% de chance) ===
              def = ENTITY_TYPES.HIGH;
              finalHeight = 40; // Taille fixe pour les ennemis volants
              finalType = 'harpy';
              // Hauteur de vol : entre 90 et 110px du sol (pour forcer glissade)
              const heightFromGround = this.randomInt(90, 110);
              yPos = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - heightFromGround;
          }
      }
      
      // 2. BIOME INVERTED
      else if (biome === BIOMES.INVERTED) {
          // Même logique mais Y inversé
          if (rand < 0.6) {
              def = ENTITY_TYPES.GROUND; // Stalactite inversée
              finalHeight = this.randomInt(50, 80);
              finalType = 'stalactite';
              yPos = GAME_CONFIG.GROUND_HEIGHT; // Collé au plafond
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
               // Obstacle SOL
               def = ENTITY_TYPES.GROUND;
               finalHeight = this.randomInt(60, 100);
               finalType = 'column';
               yPos = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - finalHeight;
           } else {
               // Obstacle PLAFOND (Chaînes ou Piques)
               if (Math.random() < 0.5) {
                   def = ENTITY_TYPES.CHAIN;
                   finalHeight = this.randomInt(60, 120); // Chaînes longues
                   finalType = 'chain';
               } else {
                   def = ENTITY_TYPES.CEILING;
                   finalHeight = this.randomInt(50, 80);
                   finalType = 'stalactite';
               }
               yPos = GAME_CONFIG.GROUND_HEIGHT;
           }
      }

      // --- CRÉATION ---
      
      // Ajustement Gap selon difficulté
      let reactionFrames = (biome === BIOMES.FLAPPY) ? 40 : 60; 
      if (biome === BIOMES.HADES) reactionFrames = 90; 
      this.minGap = (speed * reactionFrames) + (Math.random() * 200); 

      if (def) {
          this.entities.push({
              x: GAME_CONFIG.CANVAS_WIDTH,
              y: yPos,
              width: def.width,
              height: finalHeight, // ✅ La taille aléatoire est appliquée ici
              color: def.color,
              type: def.type,
              drawType: finalType, // ✅ Nouveau champ pour dire au SpriteManager quoi dessiner
              markedForDeletion: false
          });
          this.lastSpawnX = GAME_CONFIG.CANVAS_WIDTH;
      }
  }

  draw(ctx) {
    this.entities.forEach(ent => {
      ctx.fillStyle = ent.color;
      
      if (ent.type === 'projectile') {
          // Dessin d'une lance/flèche (pointe vers le bas)
          ctx.beginPath();
          ctx.moveTo(ent.x, ent.y);
          ctx.lineTo(ent.x + ent.width, ent.y);
          // Pointe
          ctx.lineTo(ent.x + ent.width/2, ent.y + ent.height + 15); 
          ctx.fill();
      } else {
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
      }
    });
  }
}