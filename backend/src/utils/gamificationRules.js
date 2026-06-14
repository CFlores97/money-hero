export function caluclateLevel(totalXp) {
    return Math.floor(totalXp / 250) + 1;
}

export function calculateLeague(level) {
    if(level >= 15) return 'Maestro Financiero';
    if(level >= 10) return 'Inversor';
    if(level >= 5) return 'Ahorrador';
    return 'Aprendiz';
}

export function xpToNewLevel(totalXp) {
    const currentLevel = calculateLeague(totalXp);
    return currentLevel * 250 - totalXp;
}