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
    
    // ✅ DÉTECTION STRICTE DU MOBILE
    // On vérifie si l'appareil est tactile ET si c'est un appareil mobile (Android, iOS, etc.)
    // Cela évite que les PC portables tactiles soient considérés comme des téléphones.
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.isTouchDevice = isMobileUA && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    
    // Pour les marqueurs visuels (les ronds sous les doigts)
    this.touches = []; 

    // Binding des événements
    this.keydownListener = (e) => this.handleKey(e, true);
    this.keyupListener = (e) => this.handleKey(e, false);
    this.touchstartListener = (e) => this.handleTouch(e, true);
    this.touchmoveListener = (e) => this.handleTouch(e, true); 
    this.touchendListener = (e) => this.handleTouch(e, false);

    window.addEventListener('keydown', this.keydownListener);
    window.addEventListener('keyup', this.keyupListener);
    
    // Support tactile (actif même sur PC hybride pour permettre de jouer, mais le tuto sera Clavier)
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
    
    this.touches = [];
    
    if (state && e.touches.length > 0) { 
        const width = window.innerWidth;
        
        this.keys.up = false;
        this.keys.down = false;

        for (let i = 0; i < e.touches.length; i++) {
            const t = e.touches[i];
            this.touches.push({ x: t.clientX, y: t.clientY });

            // GAUCHE = GLISSER (Down), DROITE = SAUTER (Up)
            if (t.clientX > width / 2) {
                this.keys.up = true;
            } else {
                this.keys.down = true;
            }
        }
    } else {
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