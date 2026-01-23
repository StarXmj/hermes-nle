export class InputHandler {
  constructor() {
    this.keys = { up: false, down: false }; // Plus de 'power'
    
    this.handleKeyDown = (e) => this.keyMap(e, true);
    this.handleKeyUp = (e) => this.keyMap(e, false);
    this.handleTouchStart = (e) => this.touchMap(e, true);
    this.handleTouchEnd = (e) => this.touchMap(e, false);

    window.addEventListener('keydown', this.handleKeyDown, { passive: false });
    window.addEventListener('keyup', this.handleKeyUp, { passive: false });
    window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    window.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  }

  keyMap(e, isPressed) {
    // On garde uniquement les touches de mouvement
    const gameKeys = ['Space', 'ArrowUp', 'ArrowDown'];

    if (gameKeys.includes(e.code)) {
        e.preventDefault(); 
        if (e.code === 'Space' || e.code === 'ArrowUp') this.keys.up = isPressed;
        if (e.code === 'ArrowDown') this.keys.down = isPressed;
    }
  }

  touchMap(e, isPressed) {
      if(e.cancelable) e.preventDefault(); 

      if (isPressed) {
          const touch = e.touches[0];
          const w = window.innerWidth;
          const x = touch.clientX;

          // GAUCHE = SAUT, DROITE = GLISSADE (Plus de zone haut)
          if (x < w / 2) this.keys.up = true; 
          else this.keys.down = true;
      } else {
          this.keys.up = false;
          this.keys.down = false;
      }
  }

  cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('wheel', (e) => e.preventDefault());
  }
}