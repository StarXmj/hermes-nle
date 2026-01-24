import { particleManager } from './ParticleManager'; 

export class InputHandler {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false
    };
    
    // ✅ DÉTECTION IMMÉDIATE DU MOBILE (Sans attendre le touch)
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    // Pour les marqueurs visuels (les ronds sous les doigts)
    this.touches = []; 

    // Binding des événements
    this.keydownListener = (e) => this.handleKey(e, true);
    this.keyupListener = (e) => this.handleKey(e, false);
    this.touchstartListener = (e) => this.handleTouch(e, true);
    this.touchmoveListener = (e) => this.handleTouch(e, true); // Ajout du move
    this.touchendListener = (e) => this.handleTouch(e, false);

    window.addEventListener('keydown', this.keydownListener);
    window.addEventListener('keyup', this.keyupListener);
    
    // Support tactile
    window.addEventListener('touchstart', this.touchstartListener, { passive: false });
    window.addEventListener('touchmove', this.touchmoveListener, { passive: false });
    window.addEventListener('touchend', this.touchendListener);
    window.addEventListener('touchcancel', this.touchendListener);
  }

  handleKey(e, state) {
    if (e.code === 'Space' || e.code === 'ArrowUp') this.keys.up = state;
    if (e.code === 'ArrowDown') this.keys.down = state;
    if (e.code === 'ArrowLeft') this.keys.left = state;
    if (e.code === 'ArrowRight') this.keys.right = state;
  }

  handleTouch(e, state) {
    if(e.cancelable) e.preventDefault();
    
    // On met à jour la liste des touches actives pour le rendu visuel
    this.touches = [];
    
    // Si state est true (start ou move), on analyse les touches actives
    if (state && e.touches.length > 0) { // Utiliser e.touches pour l'état actuel global
        const width = window.innerWidth;
        
        // Reset des clés avant de vérifier
        this.keys.up = false;
        this.keys.down = false;

        for (let i = 0; i < e.touches.length; i++) {
            const t = e.touches[i];
            
            // Stockage pour le GameEngine (dessin des ronds)
            this.touches.push({ x: t.clientX, y: t.clientY });

            // Logique Gauche (Slide) / Droite (Saut)
            if (t.clientX > width / 2) {
                this.keys.up = true;
            } else {
                this.keys.down = true;
            }
        }
    } else {
        // Si plus aucun doigt (touchend avec 0 touches restantes)
        if (e.touches.length === 0) {
            this.keys.up = false;
            this.keys.down = false;
        }
    }
  }

  cleanup() {
    window.removeEventListener('keydown', this.keydownListener);
    window.removeEventListener('keyup', this.keyupListener);
    window.removeEventListener('touchstart', this.touchstartListener);
    window.removeEventListener('touchmove', this.touchmoveListener);
    window.removeEventListener('touchend', this.touchendListener);
    window.removeEventListener('touchcancel', this.touchendListener);
  }
}