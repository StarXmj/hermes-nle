// Détection mobile pour limiter les particules
const IS_MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

class ParticleManager {

    
  constructor() {
    this.particles = [];
    // ✅ POOL : Un réservoir de particules recyclables
    this.pool = []; 
  }

  // Récupère une particule depuis le pool ou en crée une nouvelle si vide
  getParticle() {
      if (this.pool.length > 0) {
          return this.pool.pop();
      }
      return { 
          x: 0, y: 0, vx: 0, vy: 0, 
          life: 0, maxLife: 0, 
          size: 0, color: '', type: 'dust' 
      };
  }

  createDust(x, y) {
    if (IS_MOBILE && Math.random() > 0.2) return; 
    if (!IS_MOBILE && Math.random() > 0.5) return; // Sur PC, 50%
    const p = this.getParticle();
    
    p.x = x;
    p.y = y;
    p.vx = (Math.random() - 0.5) * 2;
    p.vy = -Math.random() * 2;
    p.life = 1.0;
    p.maxLife = 1.0;
    p.size = Math.random() * 3 + 1;
    p.color = 'rgba(200, 200, 200,';
    p.type = 'dust';
    
    this.particles.push(p);
  }

  createSlideDust(x, y) {
      // Optimisation : une seule particule au lieu de plusieurs
      if (IS_MOBILE && Math.random() > 0.3) return;
      
      const p = this.getParticle();
      p.x = x;
      p.y = y;
      p.vx = -2 - Math.random() * 2;
      p.vy = -Math.random();
      p.life = 1.0;
      p.maxLife = 1.0;
      p.size = Math.random() * 4 + 2;
      p.color = 'rgba(150, 150, 150,';
      p.type = 'dust';
      this.particles.push(p);
  }

  createJumpEffect(x, y) {
    const count = IS_MOBILE ? 2 : 5;
    
    for(let i=0; i < count; i++) {
        const p = this.getParticle();
        p.x = x;
        p.y = y;
        p.vx = (Math.random() - 0.5) * 4;
        p.vy = 1 + Math.random() * 2;
        p.life = 1.0;
        p.maxLife = 1.0;
        p.size = Math.random() * 4 + 2;
        p.color = 'rgba(255, 255, 255,';
        p.type = 'dust';
        this.particles.push(p);
    }
  }

  createDoubleJumpEffect(x, y) {
      const count = IS_MOBILE ? 3 : 8;
      
      for(let i=0; i < count; i++) {
          const p = this.getParticle();
          p.x = x;
          p.y = y;
          p.vx = (Math.random() - 0.5) * 6;
          p.vy = (Math.random() - 0.5) * 6;
          p.life = 1.0;
          p.maxLife = 1.0;
          p.size = Math.random() * 5 + 2;
          p.color = 'rgba(255, 215, 0,'; // Or
          p.type = 'spark';
          this.particles.push(p);
      }
  }

  createSpeedLine(w, h) {
      // Moins fréquent
      const p = this.getParticle();
      p.x = w;
      p.y = Math.random() * h;
      p.vx = -15 - Math.random() * 10;
      p.vy = 0;
      p.life = 1.0;
      p.maxLife = 1.0;
      p.size = Math.random() * 2 + 1; // Épaisseur
      p.length = Math.random() * 50 + 20; // Longueur
      p.color = 'rgba(255, 255, 255,';
      p.type = 'line';
      this.particles.push(p);
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= 0.03; 
      p.x += p.vx;
      p.y += p.vy;

      if (p.life <= 0) {
        // ✅ RECYCLAGE : On remet l'objet dans le pool
        this.pool.push(p);
        // On le retire de la liste active (swap and pop est plus rapide que splice, mais splice est ok ici)
        this.particles.splice(i, 1);
      }
    }
  }

  clear() {
      // Tout le monde dans le pool
      this.particles.forEach(p => this.pool.push(p));
      this.particles = [];
  }

  draw(ctx) {
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      
      // On arrondit les positions avec (valeur | 0)
      const px = p.x | 0;
      const py = p.y | 0;
      
      if (p.type === 'line') {
          // ...
          ctx.beginPath();
          ctx.moveTo(px, py); // Utiliser px, py
          ctx.lineTo(px + p.length, py);
          ctx.stroke();
      } else {
          ctx.fillStyle = p.color + p.life + ')';
          ctx.beginPath();
          // Pour les cercles, Math.floor est mieux
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
      }
    });
    ctx.globalAlpha = 1.0;
  }
}

export const particleManager = new ParticleManager();