import { GAME_CONFIG } from './constants';

class ParticleManager {
  constructor() {
    this.particles = [];
  }

  // --- CRÉATION DES EFFETS ---

  // 1. Poussière (Course / Atterrissage)
  createDust(x, y) {
      for (let i = 0; i < 5; i++) {
          this.particles.push({
              type: 'dust',
              x: x,
              y: y,
              vx: (Math.random() - 0.5) * 2 - 2, // Part vers la gauche (derrière le joueur)
              vy: (Math.random() - 0.5) * 2,
              life: 1.0,
              size: Math.random() * 5 + 3,
              color: '#bdc3c7' // Gris poussière
          });
      }
  }

  // 2. Saut (Nuage sous les pieds)
  createJumpEffect(x, y) {
      for (let i = 0; i < 8; i++) {
          this.particles.push({
              type: 'jump',
              x: x + (Math.random() - 0.5) * 20,
              y: y,
              vx: (Math.random() - 0.5) * 3,
              vy: Math.random() * 2 + 1, // Tombe légèrement
              life: 1.0,
              size: Math.random() * 6 + 4,
              color: '#ecf0f1' // Blanc nuage
          });
      }
  }

  // 3. Double Saut (Explosion dorée/magique)
  createDoubleJumpEffect(x, y) {
      // Cercle qui s'agrandit
      this.particles.push({
          type: 'ring',
          x: x,
          y: y,
          size: 10,
          maxSize: 60,
          life: 1.0,
          color: '#FFD700', // Or
          lineWidth: 3
      });

      // Étoiles
      for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 3 + 2;
          this.particles.push({
              type: 'sparkle',
              x: x,
              y: y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              size: Math.random() * 4 + 2,
              color: '#FFFF00'
          });
      }
  }

  // 4. Glissade (Traînée rapide au sol)
  createSlideDust(x, y) {
      if (Math.random() > 0.3) return; // Pas à chaque frame
      this.particles.push({
          type: 'dust',
          x: x,
          y: y,
          vx: -4 - Math.random() * 2, // Vitesse rapide vers l'arrière
          vy: -1 - Math.random(), // Monte un peu
          life: 0.6,
          size: Math.random() * 4 + 2,
          color: '#95a5a6'
      });
  }

  // 5. Lignes de Vitesse (Speed Lines) - Sur les bords
  createSpeedLine(width, height) {
      this.particles.push({
          type: 'speedline',
          x: width + 50,
          y: Math.random() * height,
          vx: -25 - Math.random() * 10, // Très rapide
          vy: 0,
          life: 1.0,
          size: Math.random() * 2 + 1, // Épaisseur
          length: Math.random() * 100 + 50,
          color: 'rgba(255, 255, 255, 0.5)'
      });
  }

  // 6. Feedback Tactile (Mobile)
  createTouchRipple(x, y) {
      this.particles.push({
          type: 'ripple',
          x: x,
          y: y,
          size: 5,
          maxSize: 50,
          life: 1.0,
          color: 'rgba(255, 255, 255, 0.4)',
          lineWidth: 4
      });
  }

  // --- UPDATE & DRAW ---

  update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
          let p = this.particles[i];
          
          if (p.type === 'ring' || p.type === 'ripple') {
              // Agrandissement des cercles
              p.size += (p.maxSize - p.size) * 0.1;
              p.life -= 0.05;
          } else if (p.type === 'speedline') {
              p.x += p.vx;
              if (p.x + p.length < 0) p.life = 0;
          } else {
              // Physique standard
              p.x += p.vx;
              p.y += p.vy;
              p.size *= 0.95; // Rétrécit
              p.life -= 0.03;
          }

          if (p.life <= 0) {
              this.particles.splice(i, 1);
          }
      }
  }

  draw(ctx) {
      ctx.save();
      for (let p of this.particles) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.strokeStyle = p.color;

          if (p.type === 'dust' || p.type === 'jump' || p.type === 'sparkle') {
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
          } 
          else if (p.type === 'ring' || p.type === 'ripple') {
              ctx.lineWidth = p.lineWidth || 2;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.stroke();
          }
          else if (p.type === 'speedline') {
              ctx.lineWidth = p.size;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x + p.length, p.y);
              ctx.stroke();
          }
      }
      ctx.restore();
  }
  
  clear() {
      this.particles = [];
  }
}

export const particleManager = new ParticleManager();