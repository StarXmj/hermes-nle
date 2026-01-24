import { particleManager } from './ParticleManager'; // ✅ IMPORT

export class InputHandler {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false
    };

    // Binding des événements
    this.keydownListener = (e) => this.handleKey(e, true);
    this.keyupListener = (e) => this.handleKey(e, false);
    this.touchstartListener = (e) => this.handleTouch(e, true);
    this.touchendListener = (e) => this.handleTouch(e, false);

    window.addEventListener('keydown', this.keydownListener);
    window.addEventListener('keyup', this.keyupListener);
    
    // Support tactile
    window.addEventListener('touchstart', this.touchstartListener, { passive: false });
    window.addEventListener('touchend', this.touchendListener);
  }

  handleKey(e, state) {
    if (e.code === 'Space' || e.code === 'ArrowUp') this.keys.up = state;
    if (e.code === 'ArrowDown') this.keys.down = state;
    if (e.code === 'ArrowLeft') this.keys.left = state;
    if (e.code === 'ArrowRight') this.keys.right = state;
  }

  handleTouch(e, state) {
    if(e.cancelable) e.preventDefault();

    if (state) {
        // Pour chaque doigt qui touche l'écran
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            const touchX = t.clientX;
            const touchY = t.clientY; // On récupère Y pour l'effet visuel
            
            // ✅ VFX : Ripple à l'endroit du touch (coordonnées écran, pas canvas)
            // Comme le canvas est plein écran ou centré, on peut mapper directement ou ajuster
            // Astuce: On envoie au ParticleManager, mais il dessine dans le canvas.
            // On doit convertir les coords écran -> coords canvas si le canvas est scalé.
            // Pour simplifier ici, on suppose que le canvas prend tout l'écran ou on passe les coords brutes
            // et on ajustera dans GameEngine si besoin.
            
            // NOTE : Pour que ça s'affiche au bon endroit dans le jeu, il faut tenir compte 
            // de la transformation du canvas dans GameEngine.js.
            // On va stocker ça dans une liste temporaire "touchEvents" que le GameEngine lira.
            this.lastTouchX = touchX;
            this.lastTouchY = touchY;
            this.newTouch = true;

            const screenMiddle = window.innerWidth / 2;
            if (touchX > screenMiddle) {
                this.keys.up = true;
                this.keys.down = false;
            } else {
                this.keys.down = true;
                this.keys.up = false;
            }
        }
    } else {
        this.keys.up = false;
        this.keys.down = false;
    }
  }

  // ✅ Méthode pour récupérer et consommer le dernier touch (pour le VFX)
  popTouch() {
      if (this.newTouch) {
          this.newTouch = false;
          return { x: this.lastTouchX, y: this.lastTouchY };
      }
      return null;
  }

  cleanup() {
    window.removeEventListener('keydown', this.keydownListener);
    window.removeEventListener('keyup', this.keyupListener);
    window.removeEventListener('touchstart', this.touchstartListener);
    window.removeEventListener('touchend', this.touchendListener);
  }
}