import { GAME_CONFIG, BIOMES } from './constants';

// ==========================================
// ✅ IMPORT DU SPRITE SHEET
// Assure-toi que "new-hermes-run.png" est dans "src/gameTest/"
import runSheetImg from './hermes-run.gif'; 
import jumpImg from './hermes-tiger-run.gif'; 
// ==========================================

class SpriteManager {
  constructor() {
    this.sprites = {};
    
    this.playerConfig = {
        run: {
            // ✅ On passe juste le chemin (la variable importée)
            src: runSheetImg, 
            frames: 6,      
            speed: 100      
        },
        jump: {
            // Fallback si pas d'image de saut
            src: jumpImg || runSheetImg,
            frames: 1, 
            speed: 0
        }
    };

    this.initSprites();
  }

  // ✅ CORRECTION : La méthode est maintenant DANS la classe
  loadImage(filename) {
      const img = new Image();
      
      // Si filename est une chaîne (chemin importé ou URL), on l'utilise.
      // Sinon, on cherche dans /images/ (pour les obstacles)
      if (typeof filename === 'string' && (filename.startsWith('/') || filename.startsWith('http') || filename.startsWith('data:'))) {
          img.src = filename;
      } else {
          // Tu as demandé de chercher dans /images/ pour les fichiers manuels
          img.src = `/images/${filename}`;
      }
      
      img.isReady = false; 
      img.isError = false;

      img.onload = () => { img.isReady = true; };
      img.onerror = () => { 
          // console.warn(`⚠️ Image introuvable : ${img.src}`);
          img.isError = true;
      };
      return img;
  }

  initSprites() {
    // 1. JOUEUR (Chargement via les imports)
    this.sprites.player_run = this.loadImage(this.playerConfig.run.src);
    this.sprites.player_jump = this.loadImage(this.playerConfig.jump.src);

    // 2. OBSTACLES (Chargement via dossier public/images/)
    this.sprites.column = this.loadImage('column.png');
    this.sprites.amphora = this.loadImage('amphora.png');
    this.sprites.shield = this.loadImage('shield.png');
    this.sprites.harpy = this.loadImage('harpy.png');
    this.sprites.column_broken = this.loadImage('column_broken.png');
    this.sprites.spear = this.loadImage('spear.png');
    this.sprites.stalagmite = this.loadImage('stalagmite.png');
    this.sprites.stalactite = this.loadImage('stalactite.png');
    this.sprites.chain = this.loadImage('chain.png');
    this.sprites.cloud = this.loadImage('cloud.png');
  }

  drawPlayer(ctx, x, y, width, height, isSliding, isJumping) {
    let spriteObj = this.sprites.player_run;
    let config = this.playerConfig.run;

    // Gestion du saut
    if (isJumping && this.sprites.player_jump.isReady && !this.sprites.player_jump.isError) {
        spriteObj = this.sprites.player_jump;
        config = this.playerConfig.jump;
    }

    // Fallback Doré (Si l'image n'est pas chargée)
    if (!spriteObj.isReady || spriteObj.isError || spriteObj.naturalWidth === 0) {
        ctx.fillStyle = '#FFD700'; 
        ctx.fillRect(x, y, width, height);
        return; 
    }

    // --- CALCUL DE L'ANIMATION ---
    let frameIndex = 0;
    if (config.frames > 1) {
        frameIndex = Math.floor(Date.now() / config.speed) % config.frames;
    }

    // Calcul de la découpe
    const frameWidthSource = spriteObj.naturalWidth / config.frames;
    const frameHeightSource = spriteObj.naturalHeight;
    const sx = frameIndex * frameWidthSource; 
    
    // Dessin
    if (isSliding) {
        ctx.drawImage(spriteObj, sx, 0, frameWidthSource, frameHeightSource, x, y + height/4, width, height/2);
    } else {
        ctx.drawImage(
            spriteObj, 
            sx, 0, frameWidthSource, frameHeightSource, 
            x, y, width, height
        );
    }
  }

  // --- DESSIN OBSTACLES ---
  drawObstacle(ctx, ent, biome) {
      let img = this.sprites.column; 
      let shapeType = 'rect';

      switch (ent.drawType) {
          case 'amphora': img = this.sprites.amphora; shapeType = 'circle'; break;
          case 'shield': img = this.sprites.shield; shapeType = 'circle'; break;
          case 'chain': img = this.sprites.chain; shapeType = 'line'; break;
          case 'harpy': img = this.sprites.harpy; shapeType = 'circle'; break;
          case 'stalactite': img = this.sprites.stalactite; shapeType = 'triangleDown'; break;
          default: img = this.sprites.column; shapeType = 'rect'; break;
      }
      
      if (biome === BIOMES.ARES && ent.drawType === 'column') img = this.sprites.column_broken;
      if (biome === BIOMES.HADES && ent.drawType === 'column') { img = this.sprites.stalagmite; shapeType = 'triangleUp'; }
      if (ent.type === 'projectile') { img = this.sprites.spear; shapeType = 'triangleUp'; }

      if (img && img.isReady && !img.isError) {
          ctx.drawImage(img, ent.x, ent.y, ent.width, ent.height);
      } else {
          this.drawGeometricFallback(ctx, ent, shapeType);
      }
  }

  drawGeometricFallback(ctx, ent, shapeType) {
      ctx.fillStyle = ent.color || '#C0C0C0';
      if (shapeType === 'circle') {
          ctx.beginPath(); ctx.arc(ent.x + ent.width/2, ent.y + ent.height/2, ent.width/2, 0, Math.PI*2); ctx.fill();
      } else if (shapeType === 'triangleUp') {
          ctx.beginPath(); ctx.moveTo(ent.x, ent.y + ent.height); ctx.lineTo(ent.x + ent.width, ent.y + ent.height); ctx.lineTo(ent.x + ent.width/2, ent.y); ctx.fill();
      } else if (shapeType === 'triangleDown') {
          ctx.beginPath(); ctx.moveTo(ent.x, ent.y); ctx.lineTo(ent.x + ent.width, ent.y); ctx.lineTo(ent.x + ent.width/2, ent.y + ent.height); ctx.fill();
      } else if (shapeType === 'line') {
          ctx.fillRect(ent.x + ent.width/2 - 2, ent.y, 4, ent.height);
      } else {
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
      }
  }
}

export const spriteManager = new SpriteManager();