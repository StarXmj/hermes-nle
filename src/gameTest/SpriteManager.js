import { GAME_CONFIG, BIOMES } from './constants';

class SpriteManager {
  constructor() {
    this.sprites = {};
    
    // CONFIGURATION DES SÉQUENCES
    this.playerConfig = {
        run: {
            base: 'run-hermes/webp/hermes-run',  
            count: 12,            
            startAt: 1,          
            ext: '.webp',         
            speed: 80
        },
        jump: {
            base: 'jump-hermes/webp/hermes-jump',  
            count: 10,            
            startAt: 2,          
            ext: '.webp',         
            speed: 100           
        },
        // ✅ NOUVEAU : Séquence pour le mode FLAPPY
        fly: {
            base: 'run-hermes/webp/hermes-run',  
            count: 12,            
            startAt: 1,          
            ext: '.webp',         
            speed: 80
        },
    };

    this.initSprites();
  }

  loadImage(filename) {
      const img = new Image();
      const path = filename.startsWith('/') ? filename : `/images/${filename}`;
      img.src = path;
      img.isReady = false; 
      img.onload = () => { img.isReady = true; };
      return img;
  }

  loadSequence(config) {
      const frames = [];
      const start = (config.startAt !== undefined) ? config.startAt : 0;
      for (let i = 0; i < config.count; i++) {
          const index = start + i;
          const filename = `${config.base}-${index}${config.ext}`;
          frames.push(this.loadImage(filename));
      }
      return frames;
  }

  initSprites() {
    // 1. JOUEUR
    this.sprites.player_run = this.loadSequence(this.playerConfig.run);
    this.sprites.player_jump = this.loadSequence(this.playerConfig.jump);
    this.sprites.player_fly  = this.loadSequence(this.playerConfig.fly); // ✅ Chargement Flappy

    // 2. OBSTACLES
    this.sprites.column = this.loadImage('column.webp');
    this.sprites.amphora = this.loadImage('amphora.webp');
    this.sprites.shield = this.loadImage('shield.webp');
    this.sprites.harpy = this.loadImage('harpy.webp');
    this.sprites.column_broken = this.loadImage('column_broken.webp');
    this.sprites.spear = this.loadImage('spear.webp');
    this.sprites.stalagmite = this.loadImage('stalagmite.webp');
    this.sprites.stalactite = this.loadImage('stalactite.webp');
    this.sprites.chain = this.loadImage('chain.webp');
    this.sprites.cloud = this.loadImage('cloud.webp');
  }

  drawPlayer(ctx, x, y, width, height, isSliding, isJumping, biome) {
    let sequence = this.sprites.player_run;
    let config = this.playerConfig.run;

    // Choix de l'animation
    if (biome === BIOMES.FLAPPY) {
        // ✅ Mode Avion
        sequence = this.sprites.player_fly;
        config = this.playerConfig.fly;
    } else if (isJumping) {
        // Mode Saut
        sequence = this.sprites.player_jump;
        config = this.playerConfig.jump;
    }

    // Calcul Frame
    let frameIndex = 0;
    if (config.count > 1) {
        frameIndex = Math.floor(Date.now() / config.speed) % config.count;
    }
    const currentImg = sequence[frameIndex];

    // Fallback
    if (!currentImg || !currentImg.isReady) {
        ctx.fillStyle = '#FFD700'; 
        ctx.fillRect(x, y, width, height);
        return; 
    }

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    // --- ORIENTATION & BIOME ---
    if (biome === BIOMES.INVERTED) {
        ctx.scale(1, -1);
    }

    // --- ✅ AURA LUMINEUSE (Bleue & Grande) ---
    // Bleu Cyan électrique (0, 255, 255) ou Bleu Roi (0, 100, 255)
    ctx.shadowColor = "rgba(0, 200, 255, 1)"; 
    ctx.shadowBlur = 25; // Très grand flou pour être visible
    // Astuce : On dessine parfois 2 fois pour intensifier l'aura si le fond est noir
    
    // DESSIN
    // Pas de scale(-1, 1) car vous avez dit qu'il était bien orienté maintenant.
    
    if (isSliding) {
        ctx.drawImage(currentImg, -width/2, -height/2, width, height);
    } else {
        ctx.drawImage(currentImg, -width/2, -height/2, width, height);
    }

    ctx.shadowBlur = 0; // Reset
    ctx.restore();
  }

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
      
      // ✅ LOGIQUE PICS (Stalagmite/Stalactite)
      // Stalagmite = Pic qui monte du sol. Stalactite = Pic qui descend du plafond.
      if (biome === BIOMES.HADES && ent.drawType === 'column') { img = this.sprites.stalagmite; shapeType = 'triangleUp'; }
      if (ent.type === 'projectile') { img = this.sprites.spear; shapeType = 'triangleUp'; }

      if (img && img.isReady) {
          ctx.save();
          ctx.translate(ent.x + ent.width / 2, ent.y + ent.height / 2);

          let scaleX = 1;
          let scaleY = 1;

          if (ent.drawType === 'harpy') {
              const flyOffset = Math.sin(Date.now() / 200) * 5;
              ctx.translate(0, flyOffset);
              scaleX = -1; 
          }

          // ✅ CORRECTION BIOME INVERSÉ (PICS AU PLAFOND)
          if (biome === BIOMES.INVERTED) {
              scaleY = -1; // On inverse tout le monde
              
              // EXCEPTION : Si c'est un pic au sol (qui se retrouve au plafond),
              // et que l'image pointe vers le haut (stalagmite), en inversant Y elle pointe vers le bas.
              // C'est CORRECT pour un pic au plafond.
              
              // MAIS si c'est une "stalactite" (déjà pointe vers le bas),
              // en inversant Y elle pointerait vers le haut.
              // Si vous voyez une mauvaise orientation, c'est ici qu'on force :
              if (ent.drawType === 'stalactite') {
                  scaleY = 1; // On annule l'inversion pour garder la pointe vers le bas (si besoin)
              }
          }

          ctx.scale(scaleX, scaleY);
          ctx.drawImage(img, -ent.width / 2, -ent.height / 2, ent.width, ent.height);
          ctx.restore();
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
      } else {
          ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
      }
  }
}

export const spriteManager = new SpriteManager();