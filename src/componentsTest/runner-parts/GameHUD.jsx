import React from 'react';
import { FaPause, FaPlay } from 'react-icons/fa';
import './GameHUD.css';

const BIOME_COLORS = {
    'NORMAL': { color: '#FFD700', label: 'OLYMPE' },
    'HADES': { color: '#FF4444', label: 'ENFERS' },
    /* ... autres couleurs ... */
};

const GameHUD = ({ score, biome, isPaused, onPause }) => {
    const biomeData = BIOME_COLORS[biome] || BIOME_COLORS['NORMAL'];
    return (
        <div className="greek-hud-score">
            <span className="score-simple">{Math.floor(score)}</span>
            <span className="biome-simple" style={{ color: biomeData.color }}>{biomeData.label}</span>
            <button className="pause-btn" onClick={onPause} onTouchEnd={(e)=>{e.preventDefault(); onPause();}}>
                {isPaused ? <FaPlay /> : <FaPause />}
            </button>
        </div>
    );
};
export default GameHUD;