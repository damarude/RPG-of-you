import React, { useState } from 'react';
import { X, Shield, Heart, Coins, Swords, Info, Star, Zap, Wind, Flame, Hammer, Target, BookOpen, Skull, ScrollText, Eye, BookMarked } from 'lucide-react';
import { RANKS, getEnemyBaseHp, getRankImage, getEnemyImageUrl } from '../gameData';

interface EnemyEncyclopediaModalProps {
    onClose: () => void;
    detailedEnemies: any[];
    huntedEnemies: Record<string, number>;
    highestRankIndex: number;
    installedEnemyImages?: boolean;
}

export const EnemyEncyclopediaModal: React.FC<EnemyEncyclopediaModalProps> = ({ onClose, detailedEnemies, huntedEnemies, highestRankIndex, installedEnemyImages }) => {
    const [selectedEnemy, setSelectedEnemy] = useState<any>(null);

    // Determine which enemies appear at which rank
    const getEnemiesForRank = (rankIndex: number) => {
        if (detailedEnemies && detailedEnemies.length > 0) {
            const rankName = RANKS[rankIndex].toUpperCase();
            return detailedEnemies.filter(e => e.rank === rankName);
        }

        const lvl = rankIndex === 0 ? 10 : rankIndex === 1 ? 30 : rankIndex === 2 ? 60 : rankIndex === 3 ? 100 : rankIndex === 4 ? 200 : rankIndex === 5 ? 400 : rankIndex === 6 ? 700 : 999;
        
        let maxEnemyId = 2; 
        if (lvl <= 10) maxEnemyId = 2;           
        else if (lvl <= 30) maxEnemyId = 4;      
        else if (lvl <= 60) maxEnemyId = 6;      
        else if (lvl <= 100) maxEnemyId = 8;     
        else if (lvl <= 200) maxEnemyId = 9;     
        else if (lvl <= 400) maxEnemyId = 10;    
        else if (lvl <= 700) maxEnemyId = 12;    
        else maxEnemyId = 13;
        
        // Show newly introduced enemies for each rank
        let prevMax = 0;
        if (rankIndex > 0) {
            const prevLvl = rankIndex === 1 ? 10 : rankIndex === 2 ? 30 : rankIndex === 3 ? 60 : rankIndex === 4 ? 100 : rankIndex === 5 ? 200 : rankIndex === 6 ? 400 : 700;
            if (prevLvl <= 10) prevMax = 2;           
            else if (prevLvl <= 30) prevMax = 4;      
            else if (prevLvl <= 60) prevMax = 6;      
            else if (prevLvl <= 100) prevMax = 8;     
            else if (prevLvl <= 200) prevMax = 9;     
            else if (prevLvl <= 400) prevMax = 10;    
            else if (prevLvl <= 700) prevMax = 12;    
            else prevMax = 13;
        }
        
        const enemies = [];
        for (let i = prevMax + 1; i <= maxEnemyId; i++) {
            enemies.push(i);
        }
        return enemies;
    };

    const getLevelForRank = (idx: number) => {
        if (idx === 0) return 1;
        if (idx === 1) return 11;
        if (idx === 2) return 31;
        if (idx === 3) return 61;
        if (idx === 4) return 101;
        if (idx === 5) return 201;
        if (idx === 6) return 401;
        if (idx === 7) return 701;
        return 1000;
    };

    const getGrade = (modifier: number, rankIndex: number) => {
        // Base modifier is usually around 0.5 to 2.5. Rank index goes from 0 to 8.
        // We calculate a total power score to show the immense difference between ranks.
        const score = modifier + (rankIndex * 1.2);
        
        if (score <= 0.8) return { letter: 'F', color: 'text-slate-500', bg: 'bg-slate-900', border: 'border-slate-700', shadow: '' };
        if (score <= 1.5) return { letter: 'E', color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-600', shadow: '' };
        if (score <= 2.2) return { letter: 'D', color: 'text-green-400', bg: 'bg-green-950/30', border: 'border-green-900/50', shadow: 'drop-shadow-[0_0_2px_rgba(74,222,128,0.3)]' };
        if (score <= 3.0) return { letter: 'C', color: 'text-blue-400', bg: 'bg-blue-950/30', border: 'border-blue-900/50', shadow: 'drop-shadow-[0_0_3px_rgba(96,165,250,0.4)]' };
        if (score <= 4.0) return { letter: 'B', color: 'text-purple-400', bg: 'bg-purple-950/30', border: 'border-purple-900/50', shadow: 'drop-shadow-[0_0_4px_rgba(192,132,252,0.5)]' };
        if (score <= 5.0) return { letter: 'A', color: 'text-pink-400', bg: 'bg-pink-950/30', border: 'border-pink-900/50', shadow: 'drop-shadow-[0_0_5px_rgba(244,114,182,0.6)]' };
        if (score <= 6.0) return { letter: 'S', color: 'text-yellow-400', bg: 'bg-yellow-950/30', border: 'border-yellow-900/50', shadow: 'drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' };
        if (score <= 7.0) return { letter: 'SS', color: 'text-orange-500', bg: 'bg-orange-950/30', border: 'border-orange-900/50', shadow: 'drop-shadow-[0_0_10px_rgba(249,115,22,0.9)]' };
        if (score <= 8.0) return { letter: 'SSS', color: 'text-red-500', bg: 'bg-red-950/30', border: 'border-red-900/50', shadow: 'drop-shadow-[0_0_15px_rgba(239,68,68,1)]' };
        if (score <= 9.0) return { letter: 'SR', color: 'text-cyan-400', bg: 'bg-cyan-950/30', border: 'border-cyan-400/50', shadow: 'drop-shadow-[0_0_20px_rgba(34,211,238,1)]' };
        if (score <= 10.0) return { letter: 'SSR', color: 'text-indigo-400', bg: 'bg-indigo-950/30', border: 'border-indigo-400/50', shadow: 'drop-shadow-[0_0_25px_rgba(129,140,248,1)]' };
        if (score <= 11.0) return { letter: 'UR', color: 'text-fuchsia-400', bg: 'bg-fuchsia-950/30', border: 'border-fuchsia-400/50', shadow: 'drop-shadow-[0_0_30px_rgba(232,121,249,1)]' };
        return { letter: 'EX', color: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-500 to-purple-600', bg: 'bg-slate-950', border: 'border-yellow-500', shadow: 'drop-shadow-[0_0_40px_rgba(234,179,8,1)]' };
    };

    const renderGrade = (modifier: number, rankIndex: number, isDiscovered: boolean, sizeClass: string = "text-sm") => {
        if (!isDiscovered) {
            return (
                <div className={`flex items-center justify-center font-mono font-bold text-slate-700 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 ${sizeClass}`}>
                    ?
                </div>
            );
        }
        const grade = getGrade(modifier, rankIndex);
        return (
            <div className={`flex items-center justify-center font-mono font-black ${grade.color} ${grade.bg} ${grade.border} border rounded px-2 py-0.5 ${grade.shadow} ${sizeClass}`}>
                {grade.letter}
            </div>
        );
    };

    const renderEnemyDetails = () => {
        if (!selectedEnemy) return null;

        const isDetailed = typeof selectedEnemy === 'object';
        const enemyId = isDetailed ? selectedEnemy.id : selectedEnemy;
        const realName = isDetailed ? selectedEnemy.name : `Subject #${enemyId}`;
        const killCount = huntedEnemies[realName] || 0;
        const isDiscovered = killCount > 0;

        const enemyName = isDiscovered ? realName : "???";
        const enemyImage = getEnemyImageUrl(isDetailed ? selectedEnemy.image : undefined, (enemyId as number) - 1);

        const statMods = isDetailed && selectedEnemy.statModifiers ? selectedEnemy.statModifiers : { hp: 1, dmg: 1, crit: 1, aspd: 1, block: 1, critDmg: 1, stun: 1, barrage: 1 };
        const statLabels = [
            { key: 'hp', label: 'HP', icon: Heart, color: 'text-red-400' },
            { key: 'dmg', label: 'DMG', icon: Swords, color: 'text-orange-400' },
            { key: 'crit', label: 'CRIT', icon: Zap, color: 'text-yellow-400' },
            { key: 'aspd', label: 'ASPD', icon: Wind, color: 'text-emerald-400' },
            { key: 'block', label: 'BLOCK', icon: Shield, color: 'text-blue-400' },
            { key: 'critDmg', label: 'C.DMG', icon: Flame, color: 'text-rose-400' },
            { key: 'stun', label: 'STUN', icon: Hammer, color: 'text-stone-400' },
            { key: 'barrage', label: 'BARRAGE', icon: Target, color: 'text-indigo-400' },
        ];

        return (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center sm:p-4 animate-in fade-in zoom-in-95" onClick={() => setSelectedEnemy(null)}>
                <div className="bg-slate-900 sm:border-2 border-purple-500/30 sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[90vh] max-w-lg overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col relative" onClick={e => e.stopPropagation()}>
                    <div className="relative h-64 sm:h-72 bg-slate-950 flex items-center justify-center p-6 border-b border-slate-800 overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2)_0%,transparent_70%)] z-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+Cjwvc3ZnPg==')] opacity-30 z-10 pointer-events-none mix-blend-overlay"></div>
                        {installedEnemyImages ? (
                            <img 
                                src={enemyImage} 
                                alt={enemyName}
                                className={`max-w-full max-h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative z-20 animate-pulse-slow ${!isDiscovered ? 'brightness-0 opacity-40 contrast-200' : ''}`}
                                style={{
                                    ...(isDetailed && selectedEnemy.size ? { transform: `scale(${selectedEnemy.size / 100})` } : {}),
                                    ...((enemyName.toLowerCase() === 'vyxos' || enemyName.toLowerCase() === 'vyxoz') ? { transform: `translateX(20px) ${isDetailed && selectedEnemy.size ? `scale(${selectedEnemy.size / 100})` : ''}` } : {})
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center relative z-20">
                                <Skull size={64} className={`text-slate-500 ${!isDiscovered ? 'opacity-40' : ''}`} />
                            </div>
                        )}
                        <button onClick={() => setSelectedEnemy(null)} className="absolute top-4 right-4 z-30 text-slate-400 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all border border-white/10 hover:border-white/30 backdrop-blur-md">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-slate-900 to-slate-950">
                        <div className="flex justify-between items-start mb-6 gap-4">
                            <div className="flex-1 min-w-0">
                                <h2 className={`text-3xl font-rpg font-bold tracking-wide truncate ${isDiscovered ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300' : 'text-slate-500'}`}>{enemyName}</h2>
                                {isDetailed && isDiscovered && (
                                    <div className="mt-2 flex items-start sm:items-center gap-3 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] w-fit max-w-full">
                                        <div className="relative shrink-0 mt-0.5 sm:mt-0">
                                            <img src={getRankImage(getLevelForRank(RANKS.findIndex(r => r.toUpperCase() === selectedEnemy.rank)))} alt={selectedEnemy.rank} className={`h-6 object-contain transition-all duration-500 ${RANKS.findIndex(r => r.toUpperCase() === selectedEnemy.rank) > highestRankIndex ? 'brightness-0 opacity-50 drop-shadow-none' : 'drop-shadow-md'}`} title={`${selectedEnemy.rank} Tier`} />
                                            {RANKS.findIndex(r => r.toUpperCase() === selectedEnemy.rank) > highestRankIndex && (
                                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-xs">?</div>
                                            )}
                                        </div>
                                        {selectedEnemy.title && (
                                            <>
                                                <div className="w-px h-4 bg-slate-600 shrink-0 mt-1.5 sm:mt-0"></div>
                                                <span className="text-sm text-purple-300 italic font-medium tracking-wide leading-snug">{selectedEnemy.title}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 flex flex-col items-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] shrink-0">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Hunted</span>
                                <span className={`text-xl font-bold flex items-center gap-1.5 ${isDiscovered ? 'text-white' : 'text-slate-600'}`}>
                                    <Swords size={16} className={isDiscovered ? "text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" : "text-slate-600"} /> {killCount}
                                </span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                                    <Target size={14} className="text-red-400" /> Combat Assessment
                                </h3>
                                {isDetailed && isDiscovered && (
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        DATA EXTRACTION: {Math.min(100, Math.floor((killCount / (selectedEnemy.milestones ? Math.max(...selectedEnemy.milestones.map((m: any) => m.kills)) : 10)) * 100))}%
                                    </span>
                                )}
                            </div>
                            
                            {isDetailed && isDiscovered && (
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (killCount / (selectedEnemy.milestones ? Math.max(...selectedEnemy.milestones.map((m: any) => m.kills)) : 10)) * 100)}%` }}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {statLabels.map((stat, idx) => (
                                    <div key={idx} className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-700/50 flex items-center justify-between shadow-sm hover:bg-slate-800/50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg shadow-inner transition-colors ${isDiscovered ? `bg-slate-900 ${stat.color} group-hover:bg-slate-800` : 'bg-slate-900 text-slate-600'}`}>
                                                <stat.icon size={16} />
                                            </div>
                                            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">{stat.label}</div>
                                        </div>
                                        <div>
                                            {renderGrade(statMods[stat.key as keyof typeof statMods], isDetailed ? RANKS.findIndex(r => r.toUpperCase() === selectedEnemy.rank) : 0, isDiscovered, "text-sm min-w-[32px]")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!isDiscovered && (
                            <div className="text-center p-8 bg-slate-950/50 rounded-xl border border-slate-800 text-slate-500 italic shadow-inner">
                                Defeat this enemy to reveal its secrets.
                            </div>
                        )}

                        {isDetailed && isDiscovered && selectedEnemy.lores && selectedEnemy.lores.length > 0 && (
                            <div className="mb-6 space-y-3">
                                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                    <Info size={14} className="text-blue-400" /> Lore
                                </h3>
                                {selectedEnemy.lores.map((lore: string, idx: number) => {
                                    let isUnlocked = false;
                                    if (idx === 0 && killCount >= 1) isUnlocked = true;
                                    else if (selectedEnemy.milestones) {
                                        const milestone = selectedEnemy.milestones.find((m: any) => m.loreUnlock === idx + 1);
                                        if (milestone && killCount >= milestone.kills) isUnlocked = true;
                                    }
                                    
                                    return (
                                        <div key={idx} className={`text-sm leading-relaxed p-4 rounded-xl border italic transition-all duration-300 ${isUnlocked ? 'bg-slate-800/80 border-slate-600 text-slate-300 shadow-md' : 'bg-slate-950/50 border-slate-800 text-transparent select-none blur-sm'}`}>
                                            "{lore}"
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {isDetailed && isDiscovered && selectedEnemy.milestones && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                    <Shield size={14} className="text-emerald-400" /> Milestones
                                </h3>
                                <div className="space-y-2">
                                    {selectedEnemy.milestones.map((m: any, idx: number) => {
                                        const isUnlocked = killCount >= m.kills;
                                        return (
                                            <div key={idx} className={`p-3 rounded-lg border text-sm flex flex-col gap-1 transition-colors ${isUnlocked ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-200 shadow-sm' : 'bg-slate-950/50 border-slate-800 text-slate-600'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className={`flex items-center gap-2 font-bold ${isUnlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                        <Swords size={14} />
                                                        <span>{m.kills} Kills</span>
                                                    </div>
                                                    {m.stat && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isUnlocked ? 'bg-emerald-800/50 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                                                            +{m.val} {m.stat.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                                {m.title && (
                                                    <div className={`text-xs italic mt-1 ${isUnlocked ? 'text-purple-300' : 'text-slate-600'}`}>
                                                        Title: {isUnlocked ? m.title : '???'}
                                                    </div>
                                                )}
                                                {m.loreUnlock && (
                                                    <div className={`text-xs mt-0.5 ${isUnlocked ? 'text-blue-300' : 'text-slate-600'}`}>
                                                        Unlocks Lore Part {m.loreUnlock}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-start sm:p-4 animate-in fade-in">
            {/* Mobile-only spacer for system UI */}
            
            <div className="bg-slate-900 sm:border border-slate-700/50 sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[85vh] max-w-5xl flex flex-col shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600"></div>
                <div className="h-12 border-slate-800/80 flex justify-between items-center bg-slate-950/80 relative overflow-hidden shrink-0" />
                <div className="p-4 sm:p-6 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/80 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.15)_0%,transparent_50%)]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
                    <h2 className="text-xl sm:text-3xl font-rpg font-black flex items-center gap-3 sm:gap-4 relative z-10 tracking-widest uppercase">
                        <div className="flex items-center justify-center relative w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-xl border border-slate-700 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] shrink-0">
                            <ScrollText className="text-fuchsia-500 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)] w-5 h-5 sm:w-7 sm:h-7" />
                            <Eye className="text-rose-500 absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="text-[8px] sm:text-[10px] text-fuchsia-400 tracking-[0.3em] font-bold mb-0.5">KNOWLEDGE BASE</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-none">Enemy Encyclopedia</span>
                        </div>
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-full p-2.5 transition-all relative z-10 border border-slate-700/50 hover:border-slate-500 backdrop-blur-sm">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar bg-gradient-to-b from-slate-900 to-slate-950 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                    {RANKS.map((rank, idx) => {
                        const enemies = getEnemiesForRank(idx);
                        if (enemies.length === 0) return null;
                        
                        return (
                            <div key={rank} className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden relative z-10 backdrop-blur-sm">
                                <div className="bg-slate-900/80 p-3 sm:p-4 border-b border-slate-700/50 flex items-center gap-3 shadow-sm">
                                    <div className="relative">
                                        <img src={getRankImage(getLevelForRank(idx))} alt={rank} className={`w-8 h-8 sm:w-10 sm:h-10 object-contain transition-all duration-500 ${idx > highestRankIndex ? 'brightness-0 opacity-50 drop-shadow-none' : 'drop-shadow-md'}`} />
                                        {idx > highestRankIndex && (
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-xl">?</div>
                                        )}
                                    </div>
                                    <h3 className={`font-bold text-lg sm:text-xl tracking-wide ${idx > highestRankIndex ? 'text-slate-500' : 'text-slate-200'}`}>
                                        {idx > highestRankIndex ? '??? Tier' : `${rank} Tier`}
                                    </h3>
                                </div>
                                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                    {enemies.map((enemy, eIdx) => {
                                        const isDetailed = typeof enemy === 'object';
                                        const id = isDetailed ? enemy.id : enemy;
                                        const realName = isDetailed ? enemy.name : `Subject #${id}`;
                                        const killCount = huntedEnemies[realName] || 0;
                                        const isDiscovered = killCount > 0;
                                        
                                        const name = isDiscovered ? realName : "???";
                                        const image = getEnemyImageUrl(isDetailed ? enemy.image : undefined, id - 1);
                                        const stats = isDetailed ? { hp: enemy.hp, baseGold: enemy.gold } : getEnemyBaseHp(id);
                                        
                                        return (
                                            <div 
                                                key={isDetailed ? enemy.name : id} 
                                                onClick={() => setSelectedEnemy(enemy)}
                                                className={`bg-slate-900/80 rounded-xl p-3 sm:p-4 border flex items-center gap-4 transition-all duration-300 group cursor-pointer relative overflow-hidden ${isDiscovered ? 'border-slate-700/80 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:bg-slate-800/80' : 'border-slate-800/50 opacity-70 hover:opacity-100'}`}
                                            >
                                                {isDiscovered && <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                <div className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl flex items-center justify-center p-1.5 border transition-all relative overflow-hidden ${isDiscovered ? 'bg-slate-950 border-slate-700 group-hover:border-purple-500/50 shadow-inner' : 'bg-slate-950 border-slate-800'}`}>
                                                    {installedEnemyImages ? (
                                                        <img 
                                                            src={image} 
                                                            alt={name}
                                                            className={`max-w-full max-h-full object-contain drop-shadow-lg transition-transform duration-500 relative z-10 ${isDiscovered ? 'group-hover:scale-110' : 'brightness-0 opacity-40 contrast-200'}`}
                                                            style={isDetailed && enemy.size ? { transform: `scale(${enemy.size / 100})` } : {}}
                                                        />
                                                    ) : (
                                                        <Skull size={32} className={`text-slate-500 ${!isDiscovered ? 'opacity-40' : ''}`} />
                                                    )}
                                                    {!isDiscovered && (
                                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)] z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 relative z-10">
                                                    <h4 className={`font-bold text-base sm:text-lg mb-1.5 truncate tracking-wide ${isDiscovered ? 'text-slate-200 group-hover:text-purple-200 transition-colors' : 'text-slate-500'}`} title={name}>{name}</h4>
                                                    <div className="flex gap-2 mb-2">
                                                        <div className="flex items-center gap-1.5 bg-slate-950/50 border border-slate-800 rounded px-2 py-1">
                                                            <span className={`text-[10px] font-bold ${isDiscovered ? 'text-red-400' : 'text-slate-600'}`} title="Vitality Class">
                                                                VIT
                                                            </span>
                                                            {renderGrade(isDetailed && enemy.statModifiers ? enemy.statModifiers.hp : 1, idx, isDiscovered, "text-[10px] min-w-[20px]")}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-slate-950/50 border border-slate-800 rounded px-2 py-1">
                                                            <span className={`text-[10px] font-bold ${isDiscovered ? 'text-orange-400' : 'text-slate-600'}`} title="Lethality Class">
                                                                PWR
                                                            </span>
                                                            {renderGrade(isDetailed && enemy.statModifiers ? enemy.statModifiers.dmg : 1, idx, isDiscovered, "text-[10px] min-w-[20px]")}
                                                        </div>
                                                    </div>
                                                    <div className={`text-[10px] sm:text-xs flex items-center gap-1.5 font-medium ${isDiscovered ? 'text-slate-400' : 'text-slate-600'}`}>
                                                        <Target size={12} /> {killCount} Hunted
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {renderEnemyDetails()}
        </div>
    );
};
