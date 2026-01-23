import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaInstagram, FaArrowRight, FaArrowDown } from 'react-icons/fa'; 
import { supabase } from '../supabaseClient'; 
import MountainBg from '../assets/mountains-background.svg';
import SectionActions from '../sections/SectionActions';
import SectionPartenaires from '../sections/SectionPartenaires';
import SectionActus from '../sections/SectionActus';
import SectionNewsletter from '../sections/SectionNewsletter';
import SectionBlog from '../sections/SectionBlog';

function HomePage() {
  const [randomPostId, setRandomPostId] = useState(null);
  const [randomReelId, setRandomReelId] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [allReels, setAllReels] = useState([]);
  
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 1. Récupération des données Instagram
  useEffect(() => {
    async function fetchInstagramLinks() {
      try {
        const { data, error } = await supabase.from('instagram_posts').select('*');
        if (error) return;
        
        if (data && data.length > 0) {
          const posts = data.filter(item => item.type === 'post');
          const reels = data.filter(item => item.type === 'reel');
          setAllPosts(posts);
          setAllReels(reels);
          if (posts.length > 0) setRandomPostId(posts[Math.floor(Math.random() * posts.length)].post_id);
          if (reels.length > 0) setRandomReelId(reels[Math.floor(Math.random() * reels.length)].post_id);
        }
      } catch (err) { console.error(err); }
    }
    fetchInstagramLinks();
  }, []);

  // Rotations (inchangées)
  useEffect(() => {
    if (allPosts.length <= 1) return;
    const interval = setInterval(() => {
      setRandomPostId(allPosts[Math.floor(Math.random() * allPosts.length)].post_id);
    }, 10000);
    return () => clearInterval(interval);
  }, [allPosts]);

  useEffect(() => {
    if (allReels.length <= 1) return;
    const interval = setInterval(() => {
      setRandomReelId(allReels[Math.floor(Math.random() * allReels.length)].post_id);
    }, 30000);
    return () => clearInterval(interval);
  }, [allReels]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-hermes-dark text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      <Helmet>
        <title>Hermes by NLE</title>
        <meta name="description" content="L'association étudiante qui t'accompagne." />
        <link rel="canonical" href="https://hermes-nle.netlify.app/" />
      </Helmet>

      {/* BLOBS BACKGROUND */}
      <div 
        className="absolute top-[-5%] left-[-15%] w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 bg-blue-300/40 dark:bg-hermes-primary/30 rounded-full blur-[50px] md:blur-[90px] pointer-events-none animate-blob" 
        style={{ transform: `translateY(${offsetY * 0.2}px)` }}
      />
      <div 
        className="absolute bottom-[10%] right-[-15%] w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 bg-cyan-300/40 dark:bg-hermes-secondary/20 rounded-full blur-[50px] md:blur-[90px] pointer-events-none animate-blob animation-delay-2000" 
        style={{ transform: `translateY(${offsetY * -0.1}px)` }}
      />
      
      {/* --- HERO SECTION --- */}
      <section className="relative z-10 min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-center px-4 text-center pb-20 pt-24 md:pt-16 lg:py-0 overflow-hidden">
        
        {/* CONTENU */}
        <div 
          className="w-full max-w-[90%] sm:max-w-xl lg:max-w-2xl xl:max-w-4xl relative z-30 mb-8 sm:mb-10 lg:mb-12 mx-auto transition-all duration-300"
          style={{ transform: `translateY(${offsetY * 0.1}px)` }}
        > 
            <div data-aos="fade-down" className="mb-4 sm:mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200 shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-none backdrop-blur-sm text-[10px] sm:text-xs font-medium text-hermes-primary dark:text-hermes-secondary">
              <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hermes-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-hermes-secondary"></span>
              </span>
              Association Étudiante Officielle
            </div>

            <h1 data-aos="zoom-in" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-tight text-slate-900 dark:text-white drop-shadow-sm transition-all duration-300">
              Un relais pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-hermes-primary dark:to-hermes-secondary">tous</span>, <br className="hidden sm:block" />
              une parole pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500 dark:from-hermes-secondary dark:to-hermes-accent">chacun</span>.
            </h1>

            <p data-aos="fade-up" data-aos-delay="200" className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-sm sm:max-w-lg lg:max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium px-2">
              Hermès t'accompagne, t'informe et te défend au quotidien. 
              Le cœur battant de la vie étudiante sur le campus.
            </p>
            
            <div className="flex justify-center w-full" data-aos="fade-up" data-aos-delay="300">
                <a 
                href="https://www.instagram.com/hermes_by_nle/?igsh=MTZmaTk1amtjOTZudA%3D%3D#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full font-bold text-white text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-3 overflow-hidden shadow-lg shadow-violet-200/50 dark:shadow-none"
                >
                <div className="absolute inset-0 bg-white/20 skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                <FaInstagram className="text-lg sm:text-xl" />
                <span>Rejoins-nous sur Insta</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>

        {/* --- FOND MONTAGNE (CORRIGÉ) --- */}
        <div 
          className="absolute bottom-0 left-0 w-full z-10 pointer-events-none"
          style={{ 
            transform: `translateY(${offsetY * 0.05}px)`, // Parallaxe légère
            transition: 'transform 0.1s ease-out' 
          }}
        >
          {/* FIX: Passage de h-[25vh] à h-[45vh] sur mobile pour remonter l'image */}
          <img 
            src={MountainBg} 
            alt="Alpes Background" 
            className="w-full h-[45vh] sm:h-[50vh] md:h-auto object-cover object-bottom opacity-90 dark:opacity-40 dark:grayscale-[30%] transition-all duration-500" 
          />
          {/* Dégradé de fusion en bas */}
          <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 z-20 bg-gradient-to-t from-slate-50 dark:from-hermes-dark to-transparent"></div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 animate-bounce cursor-pointer opacity-80 hover:opacity-100">
            <a href="#actions" aria-label="Défiler vers le bas" className="text-slate-700 dark:text-white hover:text-hermes-primary transition-colors drop-shadow-md">
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