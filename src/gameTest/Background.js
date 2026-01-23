import { spriteManager } from './SpriteManager';

export class Background {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    
    // Configuration des couches (Parallaxe)
    this.layers = [
      // Fond (Montagnes) - Bouge lentement (0.1)
      { speedMod: 0.1, x: 0, type: 'mountain', y: height - 150 }, 
      // Premier plan (Nuages) - Bouge moyennement (0.5)
      { speedMod: 0.5, x: 0, type: 'cloud', y: 50 },             
      // Très premier plan (Nuages rapides)
      { speedMod: 0.8, x: 200, type: 'cloud', y: 100 }           
    ];
  }

  update(speed) {
    this.layers.forEach(layer => {
      // On fait bouger chaque couche selon sa vitesse
      layer.x -= speed * layer.speedMod;
      
      // Boucle infinie : quand l'image sort à gauche, on la remet à droite
      // On suppose une largeur de motif de 800px
      if (layer.x <= -800) {
        layer.x = 0;
      }
    });
  }

  draw(ctx) {
    // 1. Fond du Ciel (Dégradé)
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#0f2027'); // Nuit/Sombre en haut
    grad.addColorStop(1, '#2c5364'); // Bleu gris en bas
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Dessin des couches
    this.layers.forEach(layer => {
      let sprite;
      let fallbackColor = '#FFF';

      // Choix du sprite via le manager
      if (layer.type === 'mountain') {
          sprite = spriteManager.sprites.mountain;
          fallbackColor = '#2c3e50';
      }
      if (layer.type === 'cloud') {
          sprite = spriteManager.sprites.cloud;
          fallbackColor = 'rgba(255,255,255,0.3)';
      }

      // --- DESSIN SÉCURISÉ ---
      // On vérifie si l'image est chargée et valide
      if (sprite && sprite.isReady && !sprite.isError && sprite.naturalWidth > 0) {
          // ✅ L'IMAGE EXISTE : On la dessine 3 fois pour couvrir l'écran (boucle)
          ctx.drawImage(sprite, layer.x, layer.y);
          ctx.drawImage(sprite, layer.x + 800, layer.y); 
          ctx.drawImage(sprite, layer.x + 1600, layer.y);
      } else {
          // ⚠️ L'IMAGE MANQUE : On dessine des formes géométriques (Fallback)
          this.drawFallback(ctx, layer, fallbackColor);
      }
    });
  }

  // Fonction de secours si pas d'image
  drawFallback(ctx, layer, color) {
      ctx.fillStyle = color;
      
      // On dessine le motif 3 fois pour la boucle
      [0, 800, 1600].forEach(offsetX => {
          const drawX = layer.x + offsetX;

          if (layer.type === 'cloud') {
              // Dessine 3 ronds pour faire un nuage
              ctx.beginPath(); ctx.arc(drawX + 30, layer.y + 30, 20, 0, Math.PI*2); ctx.fill();
              ctx.beginPath(); ctx.arc(drawX + 50, layer.y + 25, 25, 0, Math.PI*2); ctx.fill();
              ctx.beginPath(); ctx.arc(drawX + 70, layer.y + 30, 20, 0, Math.PI*2); ctx.fill();
          } 
          else if (layer.type === 'mountain') {
              // Dessine un grand triangle
              ctx.beginPath();
              ctx.moveTo(drawX, layer.y + 150); // Bas gauche
              ctx.lineTo(drawX + 100, layer.y); // Sommet
              ctx.lineTo(drawX + 200, layer.y + 150); // Bas droite
              ctx.fill();
              
              // Petit sommet enneigé
              ctx.fillStyle = 'rgba(255,255,255,0.5)';
              ctx.beginPath();
              ctx.moveTo(drawX + 80, layer.y + 30);
              ctx.lineTo(drawX + 100, layer.y);
              ctx.lineTo(drawX + 120, layer.y + 30);
              ctx.fill();
              ctx.fillStyle = color; // Reset couleur
          }
      });
  }
}