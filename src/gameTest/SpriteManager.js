import { GAME_CONFIG, BIOMES } from './constants';

// Imports des images du joueur (si elles sont dans src)
import runImg from './hermes-run.gif'; 


class SpriteManager {
  constructor() {
    this.sprites = {};
    
    this.playerConfig = {
        run: {
            src: runImg, 
            frames: 5,      
            speed: 100
        },
        jump: {
            src: runImg,
            frames: 1,
            speed: 0
        }
    };

    this.initSprites();
  }

  // --- CHARGEUR D'IMAGE ---
  loadImage(filename) {
      const img = new Image();
      // Gestion des chemins : si commence par http/data, on garde, sinon on cherche dans public/assets/
      img.src = filename.startsWith('http') || filename.startsWith('data:') ? filename : `/assets/${filename}`;
      
      img.isReady = false; 
      img.isError = false;

      img.onload = () => { img.isReady = true; };
      img.onerror = () => { 
          // console.warn(`⚠️ Image manquante : ${filename} -> Fallback géométrique activé.`);
          img.isError = true;
      };
      return img;
  }

  initSprites() {
    // 1. JOUEUR
    this.sprites.player_run = this.loadImage(this.playerConfig.run.src);
    this.sprites.player_jump = this.loadImage(this.playerConfig.jump.src);

    // 2. OBSTACLES (Noms de fichiers attendus dans public/assets/)
    this.sprites.column = this.loadImage('column.png');
    this.sprites.amphora = this.loadImage('amphora.png');
    this.sprites.shield = this.loadImage('shield.png');
    this.sprites.harpy = this.loadImage('harpy.png');
    this.sprites.column_broken = this.loadImage('column_broken.png');
    this.sprites.spear = this.loadImage('spear.png');
    this.sprites.stalagmite = this.loadImage('stalagmite.png');
    this.sprites.stalactite = this.loadImage('stalactite.png');
    this.sprites.chain = this.loadImage('chain.png');

    // 3. FONDS
    this.sprites.cloud = this.loadImage('cloud.png');
    this.sprites.mountain = this.loadImage('mountain.png');
  }

  // --- DESSIN DU JOUEUR ---
  drawPlayer(ctx, x, y, width, height, isSliding, isJumping) {
    let spriteObj = this.sprites.player_run;
    let config = this.playerConfig.run;

    if (isJumping) {
        spriteObj = this.sprites.player_jump;
        config = this.playerConfig.jump;
    }

    // FALLBACK JOUEUR : Si l'image n'est pas prête, carré doré
    if (!spriteObj.isReady || spriteObj.isError || spriteObj.naturalWidth === 0) {
        ctx.fillStyle = '#FFD700'; 
        if (isSliding) ctx.fillRect(x, y + height/2, width, height/2);
        else ctx.fillRect(x, y, width, height);
        return; 
    }

    // Calcul Animation
    let frameIndex = 0;
    if (config.frames > 1) frameIndex = Math.floor(Date.now() / config.speed) % config.frames;
    const frameWidthSource = spriteObj.naturalWidth / config.frames;
    const frameHeightSource = spriteObj.naturalHeight;
    const sx = frameIndex * frameWidthSource; 
    
    // Dessin
    if (isSliding) {
        ctx.drawImage(spriteObj, sx, 0, frameWidthSource, frameHeightSource, x, y + height/4, width, height/2);
    } else {
        ctx.drawImage(spriteObj, sx, 0, frameWidthSource, frameHeightSource, x, y, width, height);
    }
  }

  // --- DESSIN OBSTACLES INTELLIGENT ---
  drawObstacle(ctx, ent, biome) {
      let img = this.sprites.column; 
      let shapeType = 'rect'; // Par défaut pour le fallback

      // 1. Identification de l'image et de la forme de secours
      switch (ent.drawType) {
          case 'amphora': 
              img = this.sprites.amphora; 
              shapeType = 'circle'; 
              break;
          case 'shield': 
              img = this.sprites.shield; 
              shapeType = 'circle'; 
              break;
          case 'chain': 
              img = this.sprites.chain; 
              shapeType = 'line'; 
              break;
          case 'harpy': 
              img = this.sprites.harpy; 
              shapeType = 'circle'; 
              break;
          case 'stalactite': 
              img = this.sprites.stalactite; 
              shapeType = 'triangleDown'; 
              break;
          default: // 'column'
              img = this.sprites.column; 
              shapeType = 'rect';
              break;
      }
      
      // 2. Surcharges Biome
      if (biome === BIOMES.ARES && ent.drawType === 'column') {
          img = this.sprites.column_broken;
          shapeType = 'rect';
      }
      if (biome === BIOMES.HADES) {
          if (ent.drawType === 'column' || ent.drawType === 'amphora') {
              img = this.sprites.stalagmite;
              shapeType = 'triangleUp';
          }
      }
      if (ent.type === 'projectile') {
          img = this.sprites.spear;
          shapeType = 'triangleUp'; // Lance vers le bas ou haut selon usage, ici simple
      }

      // 3. LOGIQUE DE DESSIN FINALE
      if (img && img.isReady && !img.isError) {
          // A. L'image existe : on la dessine
          ctx.drawImage(img, ent.x, ent.y, ent.width, ent.height);
      } else {
          // B. L'image n'existe pas : on dessine la forme géométrique
          this.drawGeometricFallback(ctx, ent, shapeType);
      }
  }

  // --- DESSIN DES FORMES DE SECOURS (VECTORIEL) ---
  drawGeometricFallback(ctx, ent, shapeType) {
      ctx.fillStyle = ent.color || '#C0C0C0';
      ctx.strokeStyle = ent.color || '#C0C0C0';
      
      switch (shapeType) {
          case 'circle': // Pour Vases, Boucliers, Harpies
              ctx.beginPath();
              ctx.ellipse(
                  ent.x + ent.width/2, 
                  ent.y + ent.height/2, 
                  ent.width/2, 
                  ent.height/2, 
                  0, 0, Math.PI*2
              );
              ctx.fill();
              break;

          case 'triangleUp': // Pour Stalagmites, Lances
              ctx.beginPath();
              ctx.moveTo(ent.x, ent.y + ent.height); // Bas gauche
              ctx.lineTo(ent.x + ent.width, ent.y + ent.height); // Bas droite
              ctx.lineTo(ent.x + ent.width/2, ent.y); // Haut milieu
              ctx.fill();
              break;

          case 'triangleDown': // Pour Stalactites
              ctx.beginPath();
              ctx.moveTo(ent.x, ent.y); // Haut gauche
              ctx.lineTo(ent.x + ent.width, ent.y); // Haut droite
              ctx.lineTo(ent.x + ent.width/2, ent.y + ent.height); // Bas milieu
              ctx.fill();
              break;

          case 'line': // Pour Chaînes
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(ent.x + ent.width/2, ent.y);
              ctx.lineTo(ent.x + ent.width/2, ent.y + ent.height);
              ctx.stroke();
              // Petit rond au bout
              ctx.beginPath();
              ctx.arc(ent.x + ent.width/2, ent.y + ent.height, 5, 0, Math.PI*2);
              ctx.fill();
              break;

          case 'rect':
          default: // Pour Colonnes
              ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
              break;
      }
  }
}

export const spriteManager = new SpriteManager();