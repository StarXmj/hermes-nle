import { GAME_CONFIG, BIOMES } from './constants';
import { spriteManager } from './SpriteManager';

export class Background {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    
    // Éléments décoratifs
    this.clouds = [];
    this.birds = [];
    
    // Timers
    this.cloudTimer = 0;
    this.birdTimer = 0;
  }

  update(speed, biome) {
    // 1. GESTION DES NUAGES (Partout sauf en Enfer)
    if (biome !== BIOMES.HADES) {
        this.cloudTimer++;
        if (this.cloudTimer > 100) { 
            this.clouds.push({
                x: this.width,
                y: Math.random() * (this.height / 2),
                // ✅ VITESSE TRÈS LENTE (Loin en arrière-plan)
                // speed * 0.1 signifie qu'ils bougent à 10% de la vitesse du sol
                speed: Math.random() * 0.2 + 0.1, 
                scale: Math.random() * 0.4 + 0.4 // Un peu plus petits pour la profondeur
            });
            this.cloudTimer = 0;
        }
        
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            let cloud = this.clouds[i];
            // Parallaxe forte : Le nuage bouge très lentement par rapport au monde
            cloud.x -= speed * 0.15 + cloud.speed;
            if (cloud.x < -200) this.clouds.splice(i, 1);
        }
    } else {
        if (this.clouds.length > 0) this.clouds = [];
    }

    // 2. GESTION DES OISEAUX (Spécifique FLAPPY)
    if (biome === BIOMES.FLAPPY) {
        this.birdTimer++;
        if (this.birdTimer > 60) { // Un peu moins fréquent
            this.birds.push({
                x: this.width,
                y: Math.random() * (this.height - 150), // Plus haut dans le ciel
                // ✅ VITESSE MODÉRÉE (Arrière-plan moyen)
                // speed * 0.5 = 50% de la vitesse du sol. Ils "suivent" le scrolling mais de loin.
                speed: Math.random() * 1.5 + 0.5, 
                wingOffset: Math.random() * 10,
                scale: Math.random() * 0.3 + 0.5 // Variation de taille
            });
            this.birdTimer = 0;
        }

        for (let i = this.birds.length - 1; i >= 0; i--) {
            let bird = this.birds[i];
            // Parallaxe moyenne
            bird.x -= speed * 0.5 + bird.speed;
            if (bird.x < -50) this.birds.splice(i, 1);
        }
    } else {
        if (this.birds.length > 0) this.birds = [];
    }
  }

  draw(ctx, biome) {
    // 1. COULEUR DE FOND (GRADIENT)
    let grad;

    switch (biome) {
        case BIOMES.HADES:
            grad = ctx.createLinearGradient(0, 0, 0, this.height);
            grad.addColorStop(0, '#000000');
            grad.addColorStop(1, '#4a0000');
            break;

        case BIOMES.DIONYSOS:
            const time = Date.now() * 0.001;
            const c1 = `hsl(${(time * 50) % 360}, 70%, 50%)`;
            const c2 = `hsl(${(time * 50 + 180) % 360}, 70%, 20%)`;
            grad = ctx.createLinearGradient(0, 0, 0, this.height);
            grad.addColorStop(0, c1);
            grad.addColorStop(1, c2);
            break;

        case BIOMES.ARES:
            grad = ctx.createLinearGradient(0, 0, 0, this.height);
            grad.addColorStop(0, '#e67e22');
            grad.addColorStop(1, '#c0392b');
            break;

        case BIOMES.NORMAL:
        case BIOMES.INVERTED:
        case BIOMES.FLAPPY:
        default:
            grad = ctx.createLinearGradient(0, 0, 0, this.height);
            grad.addColorStop(0, '#4facfe');
            grad.addColorStop(1, '#00f2fe');
            break;
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. DESSIN DES ÉLÉMENTS
    
    // NUAGES
    if (biome !== BIOMES.HADES) {
        const cloudSprite = spriteManager.sprites.cloud;
        
        if (cloudSprite && cloudSprite.isReady) {
            this.clouds.forEach(c => {
                ctx.save();
                ctx.translate(c.x, c.y);
                
                // ✅ TRANSPARENCE : Indique que c'est du décor lointain
                ctx.globalAlpha = 0.6; 
                
                if (biome === BIOMES.INVERTED) {
                    ctx.scale(1, -1); 
                }

                ctx.scale(c.scale, c.scale);
                ctx.drawImage(cloudSprite, -75, -40, 150, 80); 
                ctx.restore();
            });
        }
    }

    // OISEAUX
    if (biome === BIOMES.FLAPPY) {
        // ✅ TRANSPARENCE & COULEUR : Gris foncé au lieu de noir pur pour adoucir
        ctx.fillStyle = '#2c3e50'; 
        
        this.birds.forEach(b => {
            const wingAnim = Math.sin((Date.now() / 100) + b.wingOffset) * 5;
            
            ctx.save();
            ctx.globalAlpha = 0.5; // Semi-transparent
            ctx.translate(b.x, b.y);
            ctx.scale(b.scale || 0.6, b.scale || 0.6); // Plus petit = plus loin

            ctx.beginPath();
            // Forme simple en "V"
            ctx.moveTo(0, 0);
            ctx.lineTo(10, 5 + wingAnim);
            ctx.lineTo(20, 0);
            ctx.lineTo(10, 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
  }
}