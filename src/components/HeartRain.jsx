import React, { useEffect, useState } from 'react';

const HeartRain = () => {
    const [hearts, setHearts] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const id = Date.now();
            // Création d'un coeur avec des propriétés aléatoires
            const style = {
                left: Math.random() * 100 + 'vw',
                animationDuration: (Math.random() * 3 + 2) + 's',
                fontSize: (Math.random() * 1 + 0.5) + 'rem'
            };
            setHearts(h => [...h, { id, style }]);

            // Nettoyage des vieux coeurs pour éviter de saturer la mémoire
            setTimeout(() => {
                setHearts(h => h.filter(heart => heart.id !== id));
            }, 5000);
        }, 300); // Un nouveau coeur toutes les 300ms

        return () => clearInterval(interval);
    }, []);

    return (
// Cherchez cette ligne dans le return :
<div className="heart-rain-container" style={{ 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    pointerEvents: 'none', 
    zIndex: 9998, /* 👈 PASSEZ-LE À 9998 (au lieu de 0) */
    overflow: 'hidden' 
}}>            {hearts.map(h => (
                <div key={h.id} className="heart-particle" style={{ position: 'absolute', top: '-10vh', animationName: 'fall', animationTimingFunction: 'linear', animationFillMode: 'forwards', ...h.style }}>
                    {['❤️', '💖', '💕', '💘'][Math.floor(Math.random() * 4)]}
                </div>
            ))}
            <style>{`
                @keyframes fall {
                    to { transform: translateY(110vh) rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default HeartRain;