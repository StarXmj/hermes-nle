import React from 'react';
import { FaPause, FaCoins } from 'react-icons/fa';
import './GameHUD.css';

const GameHUD = ({ score, coins, biome, onPause }) => {
    return (
        <div className="greek-hud-score">
            {/* Nom du biome (ex: HADES) */}
            <div className="biome-simple">
                {biome}
            </div>

            {/* Compteur de Pièces */}
            <div className="coin-simple">
                <FaCoins /> {coins || 0}
            </div>

            {/* Score Principal */}
            <div className="score-simple">
                {Math.floor(score)}
            </div>

            {/* Bouton Pause */}
            <button 
                className="pause-btn" 
                onClick={onPause}
                // Important pour le tactile : empêche le "tap" de traverser vers le jeu
                onTouchStart={(e) => e.stopPropagation()} 
            >
                <FaPause />
            </button>
        </div>
    );
};

export default GameHUD;