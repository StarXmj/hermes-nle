import React, { useState, useEffect } from 'react';
import { FaChartLine, FaSignOutAlt, FaHome, FaShoppingBag, FaCoins, FaCheck, FaArrowLeft, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { LOOT_BOXES, openLootBox, SKINS_REGISTRY } from '../../data/LootBoxes';
import './MainMenu.css';

// 1. AJOUT DE LA PROP 'onToggleShop'
const MainMenu = ({ player, onlinePlayers, version, onStart, onLogout, onLoadHistory, onOpenAuth, onToggleShop }) => {
    const [view, setView] = useState('menu'); 
    const [playerData, setPlayerData] = useState(player || { coins: 0, unlocked_skins: ['default'], current_skin: 'default' });
    const [openingBox, setOpeningBox] = useState(null);

    useEffect(() => {
        if(player) setPlayerData(prev => ({...prev, ...player}));
    }, [player]);

    // --- GESTION OUVERTURE / FERMETURE BOUTIQUE ---
    const openShop = () => {
        setView('shop');
        if (onToggleShop) onToggleShop(true); // Masque le leaderboard
    };

    const closeShop = () => {
        setView('menu');
        if (onToggleShop) onToggleShop(false); // Affiche le leaderboard
    };

    // --- LOGIQUE ACHAT & EQUIP ---
    const handleBuyBox = async (box) => {
        if ((playerData.coins || 0) < box.price) { alert("Pas assez de pièces !"); return; }
        setOpeningBox(box.id);
        
        // Simulation délai ouverture
        setTimeout(async () => {
            const wonSkin = openLootBox(box.id);
            const newCoins = playerData.coins - box.price;
            let newSkins = [...(playerData.unlocked_skins || ['default'])];
            
            let msg = `🎉 GAGNÉ : ${wonSkin.name}`;
            if (!newSkins.includes(wonSkin.id)) { newSkins.push(wonSkin.id); } 
            else { msg = `Doublon ! (${wonSkin.name})`; }
            
            if (player) {
                await supabase.from('arcade_players').update({ coins: newCoins, unlocked_skins: newSkins }).eq('id', player.id);
            }
            setPlayerData(prev => ({ ...prev, coins: newCoins, unlocked_skins: newSkins }));
            setOpeningBox(null);
            alert(msg);
        }, 800);
    };

    const handleEquip = async (skinId) => {
        setPlayerData(prev => ({ ...prev, current_skin: skinId }));
        if(player) {
            await supabase.from('arcade_players').update({ current_skin: skinId }).eq('id', player.id);
            // On met à jour l'objet player global pour que le jeu le prenne en compte
            player.current_skin = skinId; 
        }
    };

    // --- RENDU D'UNE CARTE SKIN ---
    // --- RENDU D'UNE CARTE SKIN (MODIFIÉ) ---
    const renderSkinCard = (skin) => {
        const isUnlocked = (playerData.unlocked_skins || ['default']).includes(skin.id);
        const isEquipped = playerData.current_skin === skin.id;
        const imagePath = `/images/skins/${skin.id}/run/1.webp`;

        // ✅ Determine si la carte doit réagir au clic
        // On peut cliquer seulement si c'est débloqué ET que ce n'est pas déjà celui qu'on porte
        const isClickable = isUnlocked && !isEquipped;

        return (
            <div 
                key={skin.id} 
                // ✅ Ajout de la classe 'clickable' pour le CSS
                // ✅ L'événement onClick est maintenant sur toute la DIV
                className={`skin-card ${!isUnlocked ? 'locked' : ''} ${isEquipped ? 'equipped' : ''} ${isClickable ? 'clickable' : ''}`}
                onClick={isClickable ? () => handleEquip(skin.id) : undefined}
                role={isClickable ? "button" : undefined} // Accessibilité
                tabIndex={isClickable ? 0 : -1} // Accessibilité
            >
                {/* Icône Status (Cadenas uniquement, le check est géré par le CSS 'equipped::after') */}
                <div className="status-icon">
                    {!isUnlocked && <FaLock color="#e74c3c"/>}
                </div>

                <img 
                    src={imagePath} alt={skin.name} className="skin-visual"
                    onError={(e) => { e.target.style.display = 'none'; }} 
                />
                <div className="skin-name">{skin.name}</div>

                {/* ❌ BOUTON SUPPRIMÉ ICI */}
            </div>
        );
    };
    // --- VUE BOUTIQUE ---
    if (view === 'shop') {
        const commons = SKINS_REGISTRY.filter(s => s.rarity === 'common');
        const rares = SKINS_REGISTRY.filter(s => s.rarity === 'rare');
        const epics = SKINS_REGISTRY.filter(s => s.rarity === 'epic');

        return (
            <div className="shop-container">
                {/* HEADER */}
                <div className="shop-header">
                    {/* UTILISATION DE closeShop() pour revenir au menu et réafficher le leaderboard */}
                    <button className="greek-btn-text" onClick={closeShop}><FaArrowLeft/> RETOUR</button>
                    <div className="wallet" style={{color:'#FFD700', fontWeight:'bold', fontSize:'1.2rem'}}>
                        {playerData.coins || 0} <FaCoins/>
                    </div>
                </div>

                {/* 1. LES COFFRES (Centrés en haut) */}
                <h3 style={{color:'#DAA520', marginBottom:'15px'}}>🎁 COFFRES MYSTÈRES</h3>
                <div className="loot-section">
    {LOOT_BOXES.map(box => (
        <div key={box.id} className="loot-card">
            <div className="loot-emoji">📦</div>
            <div className="loot-title">{box.name}</div>
            <div className="loot-price">
                {box.price} <FaCoins size={12}/>
            </div>
            <button 
                className="greek-btn-secondary" 
                disabled={openingBox !== null} 
                onClick={() => handleBuyBox(box)} 
                style={{width:'100%', fontSize:'0.7rem', padding:'6px', marginTop:'auto', border:'1px solid #555'}}
            >
                {openingBox === box.id ? '...' : 'OUVRIR'}
            </button>
        </div>
    ))}
</div>

                {/* 2. COMMUN (Vert) */}
                <div className="rarity-row rarity-common">
                    <div className="rarity-title">COMMUN</div>
                    <div className="skins-grid-centered">
                        {commons.map(renderSkinCard)}
                    </div>
                </div>

                {/* 3. RARE (Bleu) */}
                <div className="rarity-row rarity-rare">
                    <div className="rarity-title">RARE</div>
                    <div className="skins-grid-centered">
                        {rares.map(renderSkinCard)}
                    </div>
                </div>

                {/* 4. ÉPIQUE (Violet) */}
                <div className="rarity-row rarity-epic">
                    <div className="rarity-title">ÉPIQUE</div>
                    <div className="skins-grid-centered">
                        {epics.map(renderSkinCard)}
                    </div>
                </div>
            </div>
        );
    }

    // --- VUE MENU PRINCIPAL ---
    return (
        <div className="menu-left">
            <h1 className="menu-title">HERMES<br/>QUEST</h1>
            <div className="menu-buttons">
                {player ? (
                    <>
                        <div className="player-info" style={{color: '#ccc', marginBottom: '10px'}}>
                            Héros : <strong style={{color:'#DAA520'}}>{player.pseudo}</strong>
                            <div style={{fontSize:'0.9rem', color:'#FFD700', marginTop:'5px'}}>
                                <FaCoins/> {player.coins || 0}
                            </div>
                        </div>
                        <button className="greek-btn-primary" onClick={onStart}>JOUER</button>
                        
                        {/* UTILISATION DE openShop() pour masquer le leaderboard */}
                        <button className="greek-btn-secondary" onClick={openShop}>
                            <FaShoppingBag style={{marginRight:8}}/> BOUTIQUE
                        </button>

                        <button className="greek-btn-secondary" onClick={onLoadHistory}>
                            <FaChartLine style={{marginRight:8}}/> PROGRESSION
                        </button>
                        <button className="greek-btn-text" onClick={onLogout}>
                            <FaSignOutAlt style={{marginRight:5}}/> Déconnexion
                        </button>
                    </>
                ) : (
                    <>
                        <button className="greek-btn-primary" onClick={onStart}>JOUER (INVITÉ)</button>
                        <button className="greek-btn-secondary" onClick={onOpenAuth}>SAUVEGARDER MA PARTIE</button>
                    </>
                )}
                
                <div className="online-counter">
                    <div className="pulsing-dot"></div>
                    <span style={{fontWeight:'bold', color:'#fff'}}>{onlinePlayers}</span> HÉROS EN LIGNE
                </div>

                <div style={{marginTop: 'auto', display:'flex', width:'100%', justifyContent:'space-between', alignItems:'center'}}>
                    <p style={{fontSize:'0.75rem', color:'#555', margin:0}}>v{version}</p>
                    <Link to="/" className="greek-btn-text" style={{fontSize:'0.8rem'}}>
                        <FaHome style={{marginRight:5}}/> Quitter
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;