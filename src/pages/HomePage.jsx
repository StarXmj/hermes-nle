import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaInstagram, FaArrowRight, FaArrowDown, FaGamepad, FaHandPointer } from 'react-icons/fa';
// Plus besoin de Supabase ici, c'est App.jsx qui gère !

// --- IMPORTS DES IMAGES ---
import MountainBg from '../assets/mountains-background.svg';
import ValentineBg from '../assets/valentine-background.png'; // Assurez-vous que l'extension est la bonne (.svg ou .png)

import SectionActions from '../sections/SectionActions';
import SectionPartenaires from '../sections/SectionPartenaires';
import SectionActus from '../sections/SectionActus';
import SectionNewsletter from '../sections/SectionNewsletter';
import SectionBlog from '../sections/SectionBlog';

function HomePage() {
  const [offsetY, setOffsetY] = useState(0);
  const [isValentine, setIsValentine] = useState(false);

  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ EFFET : SYNCHRONISATION AVEC APP.JSX (Observer)
  useEffect(() => {
    // On cible le conteneur principal de l'application géré par App.jsx
    const appContainer = document.querySelector('.App');

    if (!appContainer) return;

    // Fonction qui vérifie si la classe 'theme-valentine' est présente
    const checkTheme = () => {
        const hasValentineClass = appContainer.classList.contains('theme-valentine');
        setIsValentine(hasValentineClass);
    };

    // 1. Vérification immédiate
    checkTheme();

    // 2. On observe les changements de classe sur .App
    // Dès que App.jsx changera la classe (après l'impact de la flèche), ceci se déclenchera
    const observer = new MutationObserver(checkTheme);
    observer.observe(appContainer, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <main className={`min-h-screen relative overflow-hidden transition-colors duration-1000 ${isValentine ? 'text-[#880e4f]' : 'bg-slate-50 dark:bg-hermes-dark text-slate-900 dark:text-white'}`}>
      <Helmet>
        <title>Hermes by NLE | Accueil</title>
        <meta name="description" content="L'association étudiante qui t'accompagne." />
        <link rel="canonical" href="https://hermes-nle.netlify.app/" />
      </Helmet>

      {/* BLOBS BACKGROUND (Couleurs dynamiques) */}
      <div 
        className={`absolute top-[-5%] left-[-15%] w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 rounded-full blur-[50px] md:blur-[90px] pointer-events-none animate-blob transition-colors duration-1000 ${isValentine ? 'bg-pink-400/40' : 'bg-blue-300/40 dark:bg-hermes-primary/30'}`}
        style={{ transform: `translateY(${offsetY * 0.2}px)` }}
      />
      <div 
        className={`absolute bottom-[10%] right-[-15%] w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 rounded-full blur-[50px] md:blur-[90px] pointer-events-none animate-blob animation-delay-2000 transition-colors duration-1000 ${isValentine ? 'bg-red-400/40' : 'bg-cyan-300/40 dark:bg-hermes-secondary/20'}`}
        style={{ transform: `translateY(${offsetY * -0.1}px)` }}
      />
      
      {/* --- HERO SECTION --- */}
      <section className="relative z-10 min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-center px-4 text-center pb-20 pt-24 md:pt-16 lg:py-0 overflow-hidden">
        
        {/* CONTENU */}
        <div 
          className="w-full max-w-[90%] sm:max-w-xl lg:max-w-2xl xl:max-w-4xl relative z-30 mb-8 sm:mb-10 lg:mb-12 mx-auto transition-all duration-300"
          style={{ transform: `translateY(${offsetY * 0.1}px)` }}
        > 
            {/* Badge Association */}
            <div data-aos="fade-down" className={`mb-4 sm:mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-sm text-[10px] sm:text-xs font-medium transition-colors duration-1000 ${isValentine ? 'bg-white/60 border-pink-300 text-pink-700' : 'bg-white/80 border-gray-200 dark:bg-white/5 dark:border-white/10 text-hermes-primary dark:text-hermes-secondary'}`}>
              <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isValentine ? 'bg-pink-500' : 'bg-hermes-secondary'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isValentine ? 'bg-pink-600' : 'bg-hermes-secondary'}`}></span>
              </span>
              Association Étudiante Officielle
            </div>

            {/* Titre */}
            <h1 data-aos="zoom-in" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-tight drop-shadow-sm transition-all duration-300">
              Un relais pour <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isValentine ? 'from-pink-500 to-red-500' : 'from-blue-600 to-cyan-500 dark:from-hermes-primary dark:to-hermes-secondary'}`}>tous</span>, <br className="hidden sm:block" />
              une parole pour <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isValentine ? 'from-red-500 to-purple-500' : 'from-cyan-500 to-violet-500 dark:from-hermes-secondary dark:to-hermes-accent'}`}>chacun</span>.
            </h1>

            <p data-aos="fade-up" data-aos-delay="200" className={`text-sm sm:text-base md:text-lg lg:text-xl max-w-sm sm:max-w-lg lg:max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium px-2 ${isValentine ? 'text-pink-900/80' : 'text-gray-600 dark:text-gray-300'}`}>
              Hermès t'accompagne, t'informe et te défend au quotidien. 
              Le cœur battant de la vie étudiante sur le campus.
            </p>
            
            {/* --- ZONES DES BOUTONS --- */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full" data-aos="fade-up" data-aos-delay="300">
                
                {/* Bouton Instagram */}
                <a 
                href="https://www.instagram.com/hermes_by_nle/?igsh=MTZmaTk1amtjOTZudA%3D%3D#" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`group relative w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-white text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 overflow-hidden shadow-lg ${isValentine ? 'bg-gradient-to-r from-pink-500 to-rose-600 shadow-pink-200' : 'bg-gradient-to-r from-violet-600 to-purple-600 shadow-violet-200/50 dark:shadow-none'}`}
                >
                  <div className="absolute inset-0 bg-white/20 skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                  <FaInstagram className="text-lg sm:text-xl" />
                  <span>Rejoins-nous sur Insta</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </a>

                {/* Bouton Jeu */}
                <Link 
                  to="/runner"
                  className={`relative w-full sm:w-auto group flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-white rounded-full font-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 animate-bounce-slow ${isValentine ? 'bg-red-500 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]' : 'bg-hermes-secondary hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]'}`}
                >
                  <span className={`absolute -top-3 -right-2 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-md z-10 ${isValentine ? 'bg-pink-600' : 'bg-red-500'}`}>
                    RECORD À BATTRE !
                  </span>
                  
                  <div className="flex items-center gap-2 relative z-0">
                    <FaGamepad className="text-xl animate-wiggle" /> 
                    <span className="uppercase tracking-wider">Hermes Quest</span>
                    <FaHandPointer className="text-lg animate-pulse absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" /> 
                  </div>
                  
                  <div className="absolute inset-0 rounded-full border-2 border-white/50 opacity-0 group-hover:opacity-100 animate-ping-slow"></div>
                </Link>

            </div>
        </div>

        {/* --- FOND MONTAGNE / VALENTIN (Dynamique) --- */}
        <div 
          className="absolute bottom-0 left-0 w-full z-10 pointer-events-none"
          style={{ 
            transform: `translateY(${offsetY * 0.05}px)`,
            transition: 'transform 0.1s ease-out' 
          }}
        >
          {/* ✅ IMAGE DYNAMIQUE 
             La clé (key) force React à re-rendre l'image pour relancer l'effet de fondu
             quand le thème change.
          */}
          <img 
            key={isValentine ? "valentine" : "mountain"}
            src={isValentine ? ValentineBg : MountainBg} 
            alt="Background" 
            className="w-full h-[45vh] sm:h-[50vh] md:h-auto object-cover object-bottom opacity-90 dark:opacity-40 dark:grayscale-[30%] transition-opacity duration-1000 ease-in-out" 
          />
          
          <div className={`absolute bottom-0 left-0 w-full h-24 sm:h-32 z-20 bg-gradient-to-t to-transparent ${isValentine ? 'from-[#fce4ec]' : 'from-slate-50 dark:from-hermes-dark'}`}></div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 animate-bounce cursor-pointer opacity-80 hover:opacity-100">
            <a href="#actions" aria-label="Défiler vers le bas" className={`transition-colors drop-shadow-md ${isValentine ? 'text-pink-600 hover:text-red-600' : 'text-slate-700 dark:text-white hover:text-hermes-primary'}`}>
                <FaArrowDown className="w-6 h-6 sm:w-8 sm:h-8" />
            </a>
        </div>

      </section>

      {/* --- AUTRES SECTIONS --- */}
      <div className="space-y-12 sm:space-y-16 md:space-y-24 pb-16 pt-0 relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div id="actions" className="scroll-mt-20"><SectionActions /></div>
        <SectionBlog />
        <SectionPartenaires />
        <SectionActus />
        <SectionNewsletter />
      </div>
    </main>
  );
}

export default HomePage;