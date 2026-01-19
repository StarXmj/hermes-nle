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
  
  // État pour gérer la position du scroll pour la parallaxe
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

  // 2. Rotation Posts (10s)
  useEffect(() => {
    if (allPosts.length <= 1) return;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * allPosts.length);
      setRandomPostId(allPosts[randomIndex].post_id);
    }, 10000);
    return () => clearInterval(interval);
  }, [allPosts]);

  // 3. Rotation Reels (30s)
  useEffect(() => {
    if (allReels.length <= 1) return;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * allReels.length);
      setRandomReelId(allReels[randomIndex].post_id);
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

      {/* --- FOND DYNAMIQUE (PARALLAXE SUR LES BLOBS) --- */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-56 h-56 md:w-80 md:h-80 bg-blue-300/40 dark:bg-hermes-primary/30 rounded-full blur-[70px] md:blur-[90px] pointer-events-none animate-blob" 
        style={{ transform: `translateY(${offsetY * 0.2}px)` }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-56 h-56 md:w-80 md:h-80 bg-cyan-300/40 dark:bg-hermes-secondary/20 rounded-full blur-[70px] md:blur-[90px] pointer-events-none animate-blob animation-delay-2000" 
        style={{ transform: `translateY(${offsetY * -0.1}px)` }}
      />
      
      {/* --- HERO SECTION --- */}
      <section className="relative z-10 min-h-[80vh] md:min-h-[85vh] flex flex-col items-center justify-center px-4 text-center py-16 md:pt-16 lg:py-0 overflow-hidden">
        
        {/* CONTENU CENTRAL (Légère parallaxe inverse pour la profondeur) */}
        <div 
          className="w-full max-w-xl lg:max-w-md xl:max-w-xl 2xl:max-w-3xl relative z-30 mb-6 lg:mb-8 mx-auto transition-all duration-300"
          style={{ transform: `translateY(${offsetY * 0.1}px)` }}
        > 
            
            <div data-aos="fade-down" className="mb-3 md:mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-none backdrop-blur-sm text-[10px] md:text-xs font-medium text-hermes-primary dark:text-hermes-secondary">
              <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hermes-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-hermes-secondary"></span>
              </span>
              Association Étudiante Officielle
            </div>

            <h1 data-aos="zoom-in" className="text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold tracking-tight mb-3 md:mb-4 leading-tight text-slate-900 dark:text-white drop-shadow-sm transition-all duration-300">
              Un relais pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-hermes-primary dark:to-hermes-secondary">tous</span>, <br />
              une parole pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500 dark:from-hermes-secondary dark:to-hermes-accent">chacun</span>.
            </h1>

            <p data-aos="fade-up" data-aos-delay="200" className="text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-lg text-gray-600 dark:text-gray-300 max-w-lg lg:max-w-xs xl:max-w-lg 2xl:max-w-xl mx-auto mb-6 md:mb-8 leading-relaxed font-medium px-2">
              Hermès t'accompagne, t'informe et te défend au quotidien. 
              Le cœur battant de la vie étudiante sur le campus.
            </p>
            
            <div className="flex justify-center w-full" data-aos="fade-up" data-aos-delay="300">
                <a 
                href="https://www.instagram.com/hermes_by_nle/?igsh=MTZmaTk1amtjOTZudA%3D%3D#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative px-5 py-2.5 md:px-6 md:py-3.5 xl:px-8 xl:py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full font-bold text-white text-xs md:text-sm xl:text-base transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2 overflow-hidden shadow-violet-200 dark:shadow-none"
                >
                <div className="absolute inset-0 bg-white/20 skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                <FaInstagram className="text-base md:text-lg xl:text-xl" />
                <span>Rejoins-nous sur Insta</span>
                <FaArrowRight className="group-hover:translate-x-2 transition-transform hidden md:block" />
                </a>
            </div>
        </div>

        {/* --- FOND MONTAGNE (EFFET PARALLAXE ACCENTUÉ) --- */}
        <div 
          className="absolute top-0 left-0 w-full z-10 pointer-events-none"
          style={{ 
            transform: `translateY(${8 + offsetY * 0.4}px)`,
            transition: 'transform 0.1s ease-out' 
          }}
        >
          <img 
            src={MountainBg} 
            alt="Alpes Background" 
            className="w-full h-[25vh] md:h-auto object-cover object-[center_30%] opacity-90 dark:opacity-40 dark:grayscale-[30%] transition-all duration-500" 
          />
          <div className="absolute bottom-0 left-0 w-full h-16 z-20 bg-gradient-to-t from-slate-50 dark:from-hermes-dark to-transparent"></div>
        </div>

        {/* --- FLÈCHE DE SCROLL --- */}
        <div className="hidden lg:block absolute bottom-4 xl:bottom-6 left-1/2 -translate-x-1/2 z-40 animate-bounce cursor-pointer">
            <a href="#actions" aria-label="Défiler vers le bas" className="text-slate-700 dark:text-white hover:text-hermes-primary transition-colors drop-shadow-lg">
                <FaArrowDown size={24} className="xl:w-7 xl:h-7" />
            </a>
        </div>

      </section>

      {/* --- AUTRES SECTIONS --- */}
      <div className="space-y-16 md:space-y-24 pb-16 pt-8 relative z-10 container mx-auto px-4">
        <div id="actions" className="scroll-mt-20 md:scroll-mt-24"><SectionActions /></div>
        <SectionBlog />
        <SectionPartenaires />
        <SectionActus />
        <SectionNewsletter />
      </div>
    </main>
  );
}

export default HomePage;