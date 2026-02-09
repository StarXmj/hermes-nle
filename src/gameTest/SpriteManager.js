import { BIOMES } from './constants';

export const spriteManager = {
  // Stockage mémoire
  sprites: {
    player: {
      run: [],
      jump: []
    },
    obstacles: {},
    // ✅ Ajout du sprite pour la pièce
    coin: null 
  },
  
  loaded: false,
  MAX_FRAMES_SEARCH: 30,

  /**
   * Charge dynamiquement un skin et les assets globaux
   */
  async load(skinId = 'default') {
    console.log(`⚡ Chargement du skin : ${skinId}`);
    
    // 1. Reset
    this.sprites.player.run = [];
    this.sprites.player.jump = [];
    
    // 2. Scan des dossiers Joueur
    const runFrames = await this.scanFolder(skinId, 'run');
    const jumpFrames = await this.scanFolder(skinId, 'jump');

    this.sprites.player.run = runFrames;
    this.sprites.player.jump = jumpFrames;

    // 3. Chargement Obstacles & Objets
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
    // Si déjà chargé, on ignore
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

    // Chargement obstacles
    const promises = obsList.map(o => 
        this.loadImage(o.path).then(img => {
            if (img) this.sprites.obstacles[o.key] = img;
        })
    );

    // ✅ Chargement de la pièce (Coin)
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

  // --- RENDU JOUEUR (Inchangé) ---
  drawPlayer(ctx, player, biome) {
     if (!this.loaded) return;
     // ... (votre code drawPlayer existant, copiez-le ici si besoin, sinon gardez l'actuel)
     // Pour gagner de la place je ne le remets pas tout, mais gardez votre logique de slide/jump
     
     // Exemple minimal pour que ça compile si vous copiez tout :
     const spriteArray = (player.vy !== 0 && biome !== BIOMES.FLAPPY) ? this.sprites.player.jump : this.sprites.player.run;
     if (!spriteArray || spriteArray.length === 0) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        return;
     }
     const frameIndex = Math.floor(Date.now() / 60) % spriteArray.length;
     const img = spriteArray[frameIndex];
     
     if (img) {
        ctx.save();
        ctx.translate(player.x + player.width/2, player.y + player.height/2);
        if (biome === BIOMES.INVERTED) ctx.scale(1, -1);
        ctx.drawImage(img, -player.width/2, -player.height/2, player.width, player.height);
        ctx.restore();
     }
  },

  // --- RENDU OBSTACLE (Inchangé) ---
  drawObstacle(ctx, ent, biome) {
    // ... (votre code drawObstacle existant)
    // Gardez votre logique actuelle pour les obstacles
    
    // Exemple minimal :
    const img = this.sprites.obstacles[ent.drawType || 'column'];
    if(img) {
        ctx.drawImage(img, ent.x, ent.y, ent.width, ent.height);
    } else {
        ctx.fillStyle = 'grey';
        ctx.fillRect(ent.x, ent.y, ent.width, ent.height);
    }
  },

  // ✅ NOUVEAU : RENDU PIÈCE
  drawCoin(ctx, coin) {
      if (this.sprites.coin) {
          ctx.save();
          // Animation simple de flottement ou rotation
          const floatOffset = Math.sin(Date.now() / 200) * 5;
          const size = 30; // Taille d'affichage
          
          ctx.translate(coin.x + size/2, coin.y + size/2 + floatOffset);
          
          // Effet de rotation 3D simulée (scale X)
          const scaleX = Math.abs(Math.sin(Date.now() / 300));
          ctx.scale(scaleX, 1);
          
          ctx.drawImage(this.sprites.coin, -size/2, -size/2, size, size);
          ctx.restore();
      } else {
          // Fallback : Cercle Jaune
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(coin.x + 15, coin.y + 15, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#DAA520';
          ctx.stroke();
      }
  }
};