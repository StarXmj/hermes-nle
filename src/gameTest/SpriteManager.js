import { BIOMES } from './constants';

export const spriteManager = {
  sprites: {
    player: { run: [], jump: [] },
    obstacles: {},
    coin: null 
  },
  
  loaded: false,
  MAX_FRAMES_SEARCH: 30,

  async load(skinId = 'default') {
    console.log(`⚡ Chargement du skin : ${skinId}`);
    this.sprites.player.run = [];
    this.sprites.player.jump = [];
    
    // On charge bien 'run' et 'jump' comme indiqué dans ta structure
    const runFrames = await this.scanFolder(skinId, 'run');
    const jumpFrames = await this.scanFolder(skinId, 'jump');

    this.sprites.player.run = runFrames;
    this.sprites.player.jump = jumpFrames;

    await this.loadObstacles();
    this.loaded = true;
    console.log(`✅ Skin "${skinId}" chargé.`);
  },

  async scanFolder(skinId, type) {
      const promises = [];
      for (let i = 1; i <= this.MAX_FRAMES_SEARCH; i++) {
          const path = `/images/skins/${skinId}/${type}/${i}.webp`;
          promises.push(this.loadImage(path).then(img => img));
      }
      const results = await Promise.all(promises);
      return results.filter(img => img !== null);
  },

  async loadObstacles() {
    if (Object.keys(this.sprites.obstacles).length > 0 && this.sprites.coin) return; 

    const obsList = [
        { key: 'column', path: '/images/column.webp' },
        { key: 'column_broken', path: '/images/column_broken.webp' },
        { key: 'amphora', path: '/images/amphora.webp' },
        { key: 'shield', path: '/images/shield.webp' },
        { key: 'chain', path: '/images/chain.webp' },
        { key: 'harpy', path: '/images/harpy.webp' },
        { key: 'stalactite', path: '/images/stalactite.webp' },
        { key: 'stalagmite', path: '/images/stalagmite.webp' },
        { key: 'spear', path: '/images/spear.webp' },
        { key: 'cloud', path: '/images/cloud.webp' }
    ];

    const promises = obsList.map(o => 
        this.loadImage(o.path).then(img => {
            if (img) this.sprites.obstacles[o.key] = img;
        })
    );

    promises.push(
        this.loadImage('/images/coin.webp').then(img => {
            if(img) this.sprites.coin = img;
        })
    );

    await Promise.all(promises);
  },

  loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null); 
    });
  },

  // --- RENDU JOUEUR CORRIGÉ (FLUIDE) ---
  drawPlayer(ctx, player, biome) {
     if (!this.loaded) return;
     
     // Sélection du bon tableau de sprites
     const spriteArray = (player.vy !== 0 && biome !== BIOMES.FLAPPY) ? this.sprites.player.jump : this.sprites.player.run;
     
     if (!spriteArray || spriteArray.length === 0) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        return;
     }

     // ✅ CORRECTION : Utilise player.animFrame pour une animation stable
     // On divise par 5 pour ralentir l'animation (ajustable selon la vitesse souhaitée)
     const frameIndex = Math.floor(player.animFrame / 5) % spriteArray.length;
     const img = spriteArray[frameIndex];
     
     if (img) {
        ctx.save();
        ctx.translate(player.x + player.width/2, player.y + player.height/2);
        
        // Rotation pour le saut (flip, salto...)
        if (player.rotation) ctx.rotate(player.rotation);

        // Effet miroir pour le biome inversé
        if (biome === BIOMES.INVERTED) ctx.scale(1, -1);
        
        ctx.drawImage(img, -player.width/2, -player.height/2, player.width, player.height);
        ctx.restore();
     }
  },

  // --- RENDU OBSTACLE CORRIGÉ (HARPIE) ---
  drawObstacle(ctx, ent, biome) {
    const img = this.sprites.obstacles[ent.drawType || 'column'];
    
    if(img) {
        // ✅ CORRECTION HARPIE : Elle doit regarder à GAUCHE (-1 scaleX)
        if (ent.drawType === 'harpy') {
            ctx.save();
            // On se place au centre de l'obstacle
            ctx.translate(ent.x + ent.width/2, ent.y + ent.height/2);
            
            // 1. Miroir horizontal par défaut (pour qu'elle regarde vers le joueur)
            let scaleX = -1;
            let scaleY = 1;

            // 2. Miroir vertical SI biome inversé (tête en bas)
            if (biome === BIOMES.INVERTED) {
                scaleY = -1;
            }

            ctx.scale(scaleX, scaleY);
            
            // On dessine centré
            ctx.drawImage(img, -ent.width/2, -ent.height/2, ent.width, ent.height);
            ctx.restore();
        } else {
            // Obstacles classiques (colonnes, etc.)
            ctx.drawImage(img, ent.x, ent.y, ent.width, ent.height);
        }
    } else {
        ctx.fillStyle = 'grey';
        ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
    }
  },

  drawCoin(ctx, coin) {
      if (this.sprites.coin) {
          ctx.save();
          const floatOffset = Math.sin(Date.now() / 200) * 5;
          const size = 30; 
          
          ctx.translate(coin.x + size/2, coin.y + size/2 + floatOffset);
          const scaleX = Math.abs(Math.sin(Date.now() / 300));
          ctx.scale(scaleX, 1);
          
          ctx.drawImage(this.sprites.coin, -size/2, -size/2, size, size);
          ctx.restore();
      } else {
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(coin.x + 15, coin.y + 15, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#DAA520';
          ctx.stroke();
      }
  }
};