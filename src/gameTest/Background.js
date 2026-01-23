import { spriteManager } from './SpriteManager';

export class Background {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    
    // ✅ SUPPRESSION DES NUAGES (Comme demandé "cloud a elever")
    // Le tableau layers est vide ou contient juste des éléments décoratifs très subtils si besoin
    this.layers = []; 
  }

  update(speed) {
    // Plus de layers à mettre à jour pour l'instant
  }

  draw(ctx) {
    // ✅ FOND LUMINEUX (Comme au ciel)
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#4facfe'); // Bleu ciel lumineux haut
    grad.addColorStop(1, '#00f2fe'); // Cyan très clair bas
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // On ne dessine plus les nuages
  }
}