// src/data/LootBoxes.js

// --- REGISTRE DES SKINS ---
export const SKINS_REGISTRY = [
    // 🟩 COMMON
    { id: 'default', name: 'Hermès', rarity: 'common', color: '#012F87' }, // Bleu messager
    { id: 'ares', name: 'Arès', rarity: 'common', color: '#8B0000' },      // Rouge sang
    { id: 'dionysos', name: 'Dionysos', rarity: 'common', color: '#5B1A8E' }, // Violet vin

    // 🟦 RARE
    { id: 'athena', name: 'Athéna', rarity: 'rare', color: '#2E7D32' },    // Vert stratégie
    { id: 'apollon', name: 'Apollon', rarity: 'rare', color: '#F9A825' },  // Or solaire
    { id: 'hades', name: 'Hadès', rarity: 'rare', color: '#1B1F3A' },      // Bleu nuit

    // 🟪 EPIC
    { id: 'zeus', name: 'Zeus', rarity: 'epic', color: '#00A3FF' },        // Éclair électrique
    { id: 'odin', name: 'Odin', rarity: 'epic', color: '#3A2F1B' },        // Brun runique
    { id: 'ra', name: 'Ra', rarity: 'epic', color: '#FFB300' }             // Or intense
];

// --- CONFIGURATION DES COFFRES ---
export const LOOT_BOXES = [
    {
        id: 'box_wood',
        name: 'Coffre en Bois',
        price: 100,
        // Surtout du commun, petite chance de rare
        dropRates: { common: 80, rare: 19, epic: 1, legendary: 0 }
    },
    {
        id: 'box_silver',
        name: 'Coffre en Argent',
        price: 500,
        // Chance équilibrée
        dropRates: { common: 40, rare: 50, epic: 10, legendary: 0 }
    },
    {
        id: 'box_gold',
        name: 'Coffre en Or',
        price: 1500,
        // Forte chance d'Epic
        dropRates: { common: 10, rare: 40, epic: 50, legendary: 0 }
    }
];

// --- LOGIQUE DE TIRAGE ---
export const openLootBox = (boxId) => {
    const box = LOOT_BOXES.find(b => b.id === boxId);
    if (!box) return null;

    const rand = Math.random() * 100;
    let selectedRarity = 'common';
    let cumulative = 0;

    // Détermination de la rareté
    if (rand < (cumulative += box.dropRates.common)) selectedRarity = 'common';
    else if (rand < (cumulative += box.dropRates.rare)) selectedRarity = 'rare';
    else if (rand < (cumulative += box.dropRates.epic)) selectedRarity = 'epic';
    else selectedRarity = 'epic'; // Fallback (pas de légendaire pour l'instant)

    // Filtrage des skins disponibles pour cette rareté (sauf 'default' qu'on a déjà)
    let pool = SKINS_REGISTRY.filter(s => s.rarity === selectedRarity && s.id !== 'default');
    
    // Si pas de skin dispo dans cette rareté, on donne du commun (autre que default)
    if (pool.length === 0) {
        pool = SKINS_REGISTRY.filter(s => s.rarity === 'common' && s.id !== 'default');
    }
    
    // Si vraiment rien, fallback sur default (ne devrait pas arriver)
    if (pool.length === 0) return SKINS_REGISTRY.find(s => s.id === 'default');

    // Tirage aléatoire dans la pool
    const wonSkin = pool[Math.floor(Math.random() * pool.length)];
    
    return wonSkin;
};