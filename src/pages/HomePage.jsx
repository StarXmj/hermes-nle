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

  // 1. Récupération des données
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

      {/* --- FOND DYNAMIQUE --- */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 md:w-96 md:h-96 bg-blue-300/40 dark:bg-hermes-primary/30 rounded-full blur-[80px] md:blur-[100px] pointer-events-none animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 md:w-96 md:h-96 bg-cyan-300/40 dark:bg-hermes-secondary/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none animate-blob animation-delay-2000" />
      
      {/* --- HERO SECTION --- */}
      <section className="relative z-10 min-h-[90vh] md:min-h-[95vh] flex flex-col items-center justify-center md:justify-start lg:justify-center px-4 text-center py-24 md:pt-20 lg:py-0 overflow-hidden">
        
        {/* =========================================================
            VERSION ORDI (DESKTOP)
           ========================================================= */}
       

       
        
        {/* =========================================================
            CONTENU CENTRAL (TEXTE)
           ========================================================= */}
        <div className="w-full max-w-2xl lg:max-w-md xl:max-w-2xl 2xl:max-w-4xl relative z-30 mb-8 lg:mb-12 mx-auto transition-all duration-300"> 
            
            <div data-aos="fade-down" className="mb-4 md:mb-6 inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border border-gray-200 shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-none backdrop-blur-sm text-xs md:text-sm font-medium text-hermes-primary dark:text-hermes-secondary">
              <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hermes-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-hermes-secondary"></span>
              </span>
              Association Étudiante Officielle
            </div>

            <h1 data-aos="zoom-in" className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold tracking-tight mb-4 md:mb-6 leading-tight text-slate-900 dark:text-white drop-shadow-sm transition-all duration-300">
            Un relais pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-hermes-primary dark:to-hermes-secondary">tous</span>, <br />
            une parole pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500 dark:from-hermes-secondary dark:to-hermes-accent">chacun</span>.
            </h1>

            <p data-aos="fade-up" data-aos-delay="200" className="text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl text-gray-600 dark:text-gray-300 max-w-xl lg:max-w-sm xl:max-w-xl 2xl:max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed font-medium px-2">
            Hermès t'accompagne, t'informe et te défend au quotidien. 
            Le cœur battant de la vie étudiante sur le campus.
            </p>
            
            <div className="flex justify-center w-full" data-aos="fade-up" data-aos-delay="300">
                <a 
                href="https://www.instagram.com/hermes_by_nle/?igsh=MTZmaTk1amtjOTZudA%3D%3D#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative px-6 py-3 md:px-8 md:py-4 xl:px-10 xl:py-5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full font-bold text-white text-sm md:text-base xl:text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-3 overflow-hidden shadow-violet-200 dark:shadow-none"
                >
                <div className="absolute inset-0 bg-white/20 skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                <FaInstagram className="text-lg md:text-xl xl:text-2xl" />
                <span>Rejoins-nous sur Insta</span>
                <FaArrowRight className="group-hover:translate-x-2 transition-transform hidden md:block" />
                </a>
            </div>
        </div>

        {/* =========================================================
            VERSION TABLETTE (GRID OPTIMISÉE)
           ========================================================= */}
        <div className="hidden md:grid lg:hidden w-full max-w-4xl px-8 grid-cols-2 gap-10 relative z-30 mt-8 pb-0 items-start">
            {randomPostId && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-white w-full h-[55vh]" data-aos="fade-right">
                  <iframe 
                    key={`tablet-${randomPostId}`}
                    src={`https://www.instagram.com/p/${randomPostId}/embed/captioned`}
                    // POST TABLETTE : +120px en bas
                    className="absolute top-[-50px] left-0 w-full h-[calc(100%+120px)] object-cover"
                    title="Post Tablette"
                    frameBorder="0" scrolling="no" allowtransparency="true"
                  ></iframe>
              </div>
            )}
            {randomReelId && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-black w-full h-[55vh]" data-aos="fade-left" data-aos-delay="100">
                  <iframe 
                    key={`tablet-${randomReelId}`}
                    src={`https://www.instagram.com/reel/${randomReelId}/embed/captioned`}
                    // REEL TABLETTE : +180px en bas pour être tranquille
                    className="absolute top-[-50px] left-0 w-full h-[calc(100%+180px)] object-cover"
                    title="Reel Tablette"
                    frameBorder="0" scrolling="no" allowtransparency="true"
                  ></iframe>
              </div>
            )}
        </div>


        {/* --- FOND MONTAGNE --- */}
  <div className="absolute top-0 left-0 w-full z-10 pointer-events-none translate-y-12">
   <img 
     src={MountainBg} 
     alt="Alpes Background" 
     className="w-full h-[30vh] md:h-auto object-cover object-[center_30%] opacity-90 dark:opacity-40 dark:grayscale-[30%] transition-all duration-500" 
   />
   {/* J'ai ajouté 'z-20' pour être sûr qu'il passe par dessus l'image */}
   <div className="absolute bottom-0 left-0 w-full h-24 z-20 bg-gradient-to-t from-slate-50 dark:from-hermes-dark to-transparent"></div>
</div>
        {/* --- FLÈCHE DE SCROLL --- */}
        <div className="hidden lg:block absolute bottom-6 xl:bottom-8 left-1/2 -translate-x-1/2 z-40 animate-bounce cursor-pointer">
            <a href="#actions" aria-label="Défiler vers le bas" className="text-slate-700 dark:text-white hover:text-hermes-primary transition-colors drop-shadow-lg">
                <FaArrowDown size={28} className="xl:w-8 xl:h-8" />
            </a>
        </div>

      </section>

      {/* --- AUTRES SECTIONS --- */}
      <div className="space-y-24 md:space-y-32 pb-24 pt-12 relative z-10 container mx-auto px-4">
        <div id="actions" className="scroll-mt-24 md:scroll-mt-32"><SectionActions /></div>
        <SectionBlog />
        <SectionPartenaires />
        <SectionActus />
        <SectionNewsletter />
      </div>
    </main>
  );
}

export default HomePage;