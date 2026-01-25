export class SoundManager {
    constructor() {
        this.sounds = {
            jump: new Audio('/sounds/jump.mp3'),
            slide: new Audio('/sounds/slide.mp3'),
            death: new Audio('/sounds/death.mp3'),
            music: new Audio('/sounds/olympus.mp3'),
            wind: new Audio('/sounds/wind.mp3')
        };

        // --- CONFIGURATION ---
        
        // 1. Musique de fond (Boucle)
        this.sounds.music.loop = true;
        this.sounds.music.volume = 0.4; // Volume musique (40%)

        // 2. Vent (Boucle + Très léger)
        this.sounds.wind.loop = true;
        this.sounds.wind.volume = 0.1; // Volume vent très faible (10%)
        
        // 3. Effets sonores
        this.sounds.jump.volume = 0.6;
        this.sounds.slide.volume = 0.6;
        this.sounds.death.volume = 0.8;

        // Pré-chargement pour éviter les délais
        Object.values(this.sounds).forEach(sound => {
            sound.load();
        });

        this.isMuted = false;
    }

    play(soundName) {
        if (this.isMuted || !this.sounds[soundName]) return;

        // Si c'est un effet court (jump/slide), on le rembobine pour pouvoir le rejouer vite
        if (soundName === 'jump' || soundName === 'slide') {
            this.sounds[soundName].currentTime = 0;
        }

        const promise = this.sounds[soundName].play();
        if (promise !== undefined) {
            promise.catch(error => {
                // Ignore les erreurs d'autoplay (normal si pas d'interaction utilisateur)
                // console.warn(`Erreur lecture son ${soundName}:`, error);
            });
        }
    }

    startAmbience() {
        // Lance Musique + Vent
        this.play('music');
        this.play('wind');
    }

    stopAmbience() {
        this.sounds.music.pause();
        this.sounds.music.currentTime = 0;
        
        this.sounds.wind.pause();
        this.sounds.wind.currentTime = 0;
    }
    
    // Stop tout (utile au Game Over si on veut couper la musique)
    stopAll() {
        Object.values(this.sounds).forEach(s => {
            s.pause();
            s.currentTime = 0;
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        // Coupe/Active les sons en cours
        Object.values(this.sounds).forEach(s => s.muted = this.isMuted);
    }
}

// Singleton : on exporte une instance unique pour tout le jeu
export const soundManager = new SoundManager();