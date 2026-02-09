import React, { useEffect, useState } from 'react';
import { FaSun, FaMoon, FaHeart } from 'react-icons/fa';

// Ajout de la prop 'id' ici 👇
export default function ThemeToggle({ activeTheme, id }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isValentine = activeTheme === 'valentine';

  return (
    <button
      id={id} // ✅ On utilise l'ID passé en prop (ex: "toggle-mobile" ou "toggle-desktop")
      onClick={toggleTheme}
      className={`
        p-2 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center
        ${isValentine 
            ? 'bg-pink-600 text-white animate-pulse border-2 border-white shadow-[0_0_15px_rgba(233,30,99,0.8)]' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-white/10 dark:text-yellow-300 dark:hover:bg-white/20'
        }
      `}
      aria-label="Changer de thème"
    >
      {isValentine ? (
        <FaHeart size={18} className="animate-ping-slow" /> 
      ) : (
        theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />
      )}
    </button>
  );
}