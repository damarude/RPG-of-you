import React, { useState } from 'react';
import { X, Crown, Star, Shield, Zap, Target, Heart, Sword, Coins, Activity, Info, Sparkles, Feather, Lock } from 'lucide-react';
import { UserProfile } from '../types';
import { getPatronRank, getPatronStats, PATRON_EXP_CAPS, PATRON_RANK_TITLES } from '../gameData';

interface PatronBlessModalProps {
    user: UserProfile;
    onClose: () => void;
    onWatchAd: () => void;
    onSendTip: () => void;
}

export const PatronBlessModal: React.FC<PatronBlessModalProps> = ({ user, onClose, onWatchAd, onSendTip }) => {
    const currentExp = user.patronExp || 0;
    const currentRank = getPatronRank(currentExp);
    const nextRank = Math.min(currentRank + 1, 20);
    const expForNext = PATRON_EXP_CAPS[nextRank];
    const expForCurrent = PATRON_EXP_CAPS[currentRank];
    
    const progressPct = currentRank === 20 
        ? 100 
        : Math.min(100, Math.max(0, ((currentExp - expForCurrent) / (expForNext - expForCurrent)) * 100));

    const currentStats = getPatronStats(currentRank);
    const nextStats = getPatronStats(nextRank);

    const [isHovering, setIsHovering] = useState(false);

    const renderStatRow = (label: string, icon: React.ReactNode, currentVal: number, nextVal: number, isPct: boolean = true) => {
        if (nextVal === 0 && currentVal === 0) return null;
        
        const format = (v: number) => isPct ? `${v.toFixed(1)}%` : Math.floor(v).toString();
        
        return (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-950/30 to-slate-900/60 rounded-xl border border-rose-800/30 mb-2 hover:border-rose-400/50 hover:shadow-[0_0_15px_rgba(244,114,182,0.15)] transition-all group hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 text-slate-200 text-sm font-medium">
                    <div className="p-1.5 bg-slate-950 rounded-lg shadow-inner shadow-black/80 border border-rose-900/40 group-hover:scale-110 group-hover:rotate-3 group-hover:border-rose-400/50 transition-all">
                        {icon}
                    </div>
                    <span className="group-hover:text-rose-100 transition-colors">{label}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-sm font-mono">
                    <span className={currentVal > 0 ? "text-rose-300 font-bold drop-shadow-[0_0_5px_rgba(244,114,182,0.5)]" : "text-slate-600"}>
                        {currentVal > 0 ? `+${format(currentVal)}` : '-'}
                    </span>
                    {currentRank < 20 && nextVal > currentVal && (
                        <>
                            <span className="text-rose-500/50">→</span>
                            <span className="text-amber-200 font-bold drop-shadow-[0_0_5px_rgba(253,230,138,0.6)]">+{format(nextVal)}</span>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
            {/* Rose Gold celestial background rays */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center opacity-20 mix-blend-screen">
                <div className="w-[200vw] h-[200vw] sm:w-[100vw] sm:h-[100vw] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(244,114,182,0.25)_10deg,transparent_20deg,rgba(253,230,138,0.15)_30deg,transparent_40deg,rgba(244,114,182,0.25)_50deg,transparent_60deg,rgba(253,230,138,0.15)_70deg,transparent_80deg,rgba(244,114,182,0.25)_90deg,transparent_100deg,rgba(253,230,138,0.15)_110deg,transparent_120deg,rgba(244,114,182,0.25)_130deg,transparent_140deg,rgba(253,230,138,0.15)_150deg,transparent_160deg,rgba(244,114,182,0.25)_170deg,transparent_180deg,rgba(253,230,138,0.15)_190deg,transparent_200deg,rgba(244,114,182,0.25)_210deg,transparent_220deg,rgba(253,230,138,0.15)_230deg,transparent_240deg,rgba(244,114,182,0.25)_250deg,transparent_260deg,rgba(253,230,138,0.15)_270deg,transparent_280deg,rgba(244,114,182,0.25)_290deg,transparent_300deg,rgba(253,230,138,0.15)_310deg,transparent_320deg,rgba(244,114,182,0.25)_330deg,transparent_340deg,rgba(253,230,138,0.15)_350deg,transparent_360deg)]" />
            </div>

            <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-[2px] border-rose-400/40 rounded-3xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-[0_0_60px_rgba(244,114,182,0.15),inset_0_0_20px_rgba(244,114,182,0.05)] relative z-10 overflow-hidden">
                
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-rose-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden gap-4 shrink-0">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-rose-600/20 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 mb-1 sm:mb-2">
                            <div className="p-2 bg-gradient-to-br from-rose-300 via-amber-200 to-pink-500 rounded-xl shadow-[0_0_20px_rgba(244,114,182,0.4)]">
                                <Crown className="text-rose-950" size={24} fill="currentColor" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-amber-200 to-pink-300 tracking-wider drop-shadow-sm">
                                Patron Bless
                            </h2>
                        </div>
                        <p className="text-rose-200/80 text-xs sm:text-sm max-w-md italic flex items-center gap-1.5 font-medium">
                            <Sparkles size={14} className="text-amber-300 inline" /> 
                            The developers (gods) favor those who pay the server bills!
                        </p>
                    </div>
                    
                    <button onClick={onClose} className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 text-rose-400/50 hover:text-rose-300 transition-all z-10 p-2 bg-slate-900/80 rounded-full hover:bg-slate-800 border border-rose-900/30 hover:border-rose-400/50 hover:shadow-[0_0_15px_rgba(244,114,182,0.3)]">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 sm:space-y-8 relative">
                    {/* Grand Progress Section */}
                    <div 
                        className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-5 sm:p-6 border border-rose-800/40 relative overflow-hidden shadow-2xl transition-all duration-500 hover:border-rose-500/40"
                        onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                    >
                        <div className={`absolute inset-0 bg-rose-500/5 transition-opacity duration-500 ${isHovering ? 'opacity-100' : 'opacity-0'}`} />
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-5 sm:mb-6 relative z-10 gap-4 sm:gap-0">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-rose-400 blur-lg opacity-30 rounded-full" />
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-b from-rose-950 via-slate-900 to-slate-900 rounded-full border-[3px] border-rose-300 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(244,114,182,0.4)]">
                                        <span className="text-2xl sm:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-100 to-rose-300 drop-shadow-sm">{currentRank}</span>
                                    </div>
                                    {currentRank === 20 && (
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-rose-300 to-amber-300 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg transform rotate-12 border border-amber-100">
                                            MAX
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-[10px] sm:text-xs text-rose-400/80 uppercase tracking-[0.2em] font-bold mb-0.5">Divine Status</div>
                                    <div className="text-lg sm:text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 to-amber-200">
                                        {currentRank === 0 ? 'Future Benefactor' : (PATRON_RANK_TITLES[currentRank - 1] || 'Supreme Deity')}
                                    </div>
                                </div>
                            </div>
                            <div className="text-left sm:text-right w-full sm:w-auto bg-slate-950/50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-rose-900/30 sm:border-none">
                                <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Total Devotion</div>
                                <div className="text-xl sm:text-2xl font-mono font-bold text-white flex items-center sm:justify-end gap-1.5">
                                    <Sparkles size={16} className="text-rose-300" />
                                    {currentExp.toFixed(2)} <span className="text-xs sm:text-sm text-slate-500 font-sans">EXP</span>
                                </div>
                            </div>
                        </div>

                        {currentRank < 20 ? (
                            <div className="relative z-10">
                                <div className="flex justify-between text-[10px] sm:text-xs text-rose-200/60 mb-2 font-mono font-medium tracking-wide">
                                    <span>Rank {currentRank}</span>
                                    <span>{expForNext.toFixed(1)} EXP for Rank {nextRank}</span>
                                </div>
                                <div className="h-4 sm:h-5 bg-slate-950 rounded-full overflow-hidden border border-rose-900/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] relative p-0.5">
                                    <div 
                                        className="h-full rounded-full bg-gradient-to-r from-rose-700 via-pink-400 to-amber-200 transition-all duration-1000 relative shadow-[0_0_10px_rgba(244,114,182,0.5)]"
                                        style={{ width: `${Math.max(2, progressPct)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-gradient-to-r from-rose-900/20 via-pink-500/20 to-rose-900/20 border border-rose-400/50 rounded-xl text-rose-200 text-sm font-bold relative z-10 shadow-[0_0_20px_rgba(244,114,182,0.2)]">
                                <Star className="inline-block text-amber-300 mr-2" size={16} />
                                Maximum Patron Rank Reached! You practically own the heavens now.
                                <Star className="inline-block text-amber-300 ml-2" size={16} />
                            </div>
                        )}
                    </div>

                    {/* Stats Breakdown */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rose-600/50" />
                            <h3 className="text-sm font-black text-rose-200 uppercase tracking-[0.2em] flex items-center gap-2 font-serif drop-shadow-sm">
                                <Feather size={16} className="text-rose-300" /> 
                                Holy Blessings
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rose-600/50" />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                            {renderStatRow("Health Bonus", <Heart size={14} className="text-rose-400"/>, currentStats.hp, nextStats.hp, false)}
                            {renderStatRow("Gold Bonus", <Coins size={14} className="text-amber-300"/>, currentStats.goldBonus, nextStats.goldBonus)}
                            {renderStatRow("Damage", <Sword size={14} className="text-red-400"/>, currentStats.dmg, nextStats.dmg, false)}
                            {renderStatRow("Cost Reduction", <Activity size={14} className="text-emerald-300"/>, currentStats.challengeCostReduction, nextStats.challengeCostReduction)}
                            {renderStatRow("Attack Speed", <Zap size={14} className="text-blue-300"/>, currentStats.attackSpeed, nextStats.attackSpeed)}
                            {renderStatRow("Crit Damage", <Target size={14} className="text-orange-300"/>, currentStats.critDmg, nextStats.critDmg)}
                            {renderStatRow("Barrage Chance", <Zap size={14} className="text-purple-300"/>, currentStats.barrage, nextStats.barrage)}
                            {renderStatRow("Streak Save", <Shield size={14} className="text-indigo-300"/>, currentStats.streakProtect, nextStats.streakProtect)}
                            {renderStatRow("Health % Bonus", <Heart size={14} className="text-pink-300"/>, currentStats.hpPct, nextStats.hpPct)}
                            {renderStatRow("Crit Rate", <Target size={14} className="text-red-400"/>, currentStats.critRate, nextStats.critRate)}
                            {renderStatRow("Skill Exp", <Star size={14} className="text-amber-200"/>, currentStats.skillExp, nextStats.skillExp)}
                            {renderStatRow("Stun Chance", <Zap size={14} className="text-cyan-300"/>, currentStats.stun, nextStats.stun)}
                            {renderStatRow("Revive Speed", <Activity size={14} className="text-emerald-200"/>, currentStats.heal, nextStats.heal)}
                            {renderStatRow("Undying Chance", <Shield size={14} className="text-rose-200"/>, currentStats.undieable, nextStats.undieable)}
                        </div>

                        {currentRank === 0 && (
                            <div className="text-center p-6 sm:p-8 text-rose-200/60 italic text-sm bg-slate-900/60 backdrop-blur-sm rounded-xl border border-rose-900/30 mt-3 flex flex-col items-center gap-3 shadow-inner">
                                <div className="p-3 bg-slate-950 rounded-full border border-rose-900/50">
                                    <Info size={24} className="text-rose-400/50" />
                                </div>
                                <p>The heavens are silent. Reach Rank 1 to unlock your first permanent miracles!</p>
                            </div>
                        )}
                    </div>

                    {/* Divine Titles List */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rose-600/50" />
                            <h3 className="text-sm font-black text-rose-200 uppercase tracking-[0.2em] flex items-center gap-2 font-serif drop-shadow-sm">
                                <Crown size={16} className="text-rose-300" /> 
                                Divine Titles
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rose-600/50" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-2 pb-2">
                            {PATRON_RANK_TITLES.map((title, index) => {
                                const rank = index + 1;
                                const isUnlocked = currentRank >= rank;
                                return (
                                    <div 
                                        key={rank}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                            isUnlocked 
                                                ? 'bg-gradient-to-r from-rose-950/40 to-slate-900 border-rose-500/30 text-rose-100 shadow-[0_0_10px_rgba(244,114,182,0.1)]' 
                                                : 'bg-slate-900/40 border-slate-800/80 text-slate-500 opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                                                isUnlocked 
                                                    ? 'bg-gradient-to-br from-rose-400 to-amber-300 text-slate-900 border-rose-200 shadow-inner' 
                                                    : 'bg-slate-800 text-slate-600 border-slate-700'
                                            }`}>
                                                {rank}
                                            </div>
                                            <span className={`text-xs ${isUnlocked ? 'font-bold tracking-wide' : 'font-medium'}`}>
                                                {title}
                                            </span>
                                        </div>
                                        {isUnlocked ? (
                                            <Sparkles size={14} className="text-rose-300/80" />
                                        ) : (
                                            <Lock size={14} className="text-rose-900/50" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* How to earn */}
                    <div className="bg-gradient-to-b from-slate-900/80 to-slate-950 rounded-xl p-4 sm:p-5 border border-rose-900/30 relative z-10 shadow-lg shrink-0">
                        <h4 className="text-xs font-bold text-slate-300 uppercase mb-4 flex items-center gap-2 tracking-widest">
                            <Info size={14} className="text-rose-400" /> How to earn the Gods' Favor
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                            <button 
                                onClick={onSendTip}
                                className="flex items-center gap-3 sm:gap-4 bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 hover:border-blue-400/50 transition-all group active:scale-95 text-left shadow-md"
                            >
                                <div className="p-2.5 bg-slate-900 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-inner border border-slate-800">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200 group-hover:text-blue-300 transition-colors">Voluntarily Watch Ad</div>
                                    <div className="text-xs text-blue-400/70 font-mono mt-0.5">+0.01 EXP</div>
                                </div>
                            </button>
                            
                            <button 
                                onClick={onSendTip}
                                className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-rose-950/20 to-slate-950 p-3 sm:p-4 rounded-xl border border-rose-900/30 hover:border-rose-400/50 hover:shadow-[0_0_15px_rgba(244,114,182,0.15)] transition-all group active:scale-95 text-left shadow-md"
                            >
                                <div className="p-2.5 bg-gradient-to-br from-rose-900 to-slate-900 text-rose-300 rounded-lg group-hover:from-rose-500 group-hover:to-pink-600 group-hover:text-white transition-all shadow-inner border border-rose-800/50">
                                    <Coins size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200 group-hover:text-rose-200 transition-colors">Send a Tip (Support)</div>
                                    <div className="text-xs text-rose-300/80 font-mono mt-0.5">+1.00 EXP per $1</div>
                                </div>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};