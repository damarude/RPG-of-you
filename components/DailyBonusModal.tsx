
import React from 'react';
import { motion } from 'motion/react';
import { X, Calendar, CheckCircle, Coins, Zap, Shield, Gift, TrendingUp, Star, Info, ChevronRight, Hexagon } from 'lucide-react';
import { formatNumber, getRankName, getLoginExpMultiplier, getLoginGoldMultiplier, getLoginPatronExp, getBaseLoginRewards, RANKS } from '../gameData';

interface DailyBonusModalProps {
  currentStreak: number;
  userLevel: number;
  onClose: () => void;
}

export const DailyBonusModal: React.FC<DailyBonusModalProps> = ({ currentStreak, userLevel, onClose }) => {
  const days = [1, 2, 3, 4, 5, 6, 7];
  const rankName = getRankName(userLevel);
  const expMult = getLoginExpMultiplier(rankName);
  const goldMult = getLoginGoldMultiplier(rankName);
  
  const cycleDay = currentStreak === 0 ? 1 : ((currentStreak - 1) % 7) + 1;
  const isClaimedToday = currentStreak > 0;

  return (
    
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center z-[100] p-2 sm:p-4 animate-in fade-in duration-500" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-amber-500/20 rounded-[1.5rem] sm:rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden relative shadow-[0_0_100px_rgba(245,158,11,0.1)] flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
        
        {/* Left Panel: Mystical Stats */}
        <div className="md:w-72 bg-gradient-to-b from-slate-950 to-slate-900 border-b md:border-b-0 md:border-r border-amber-500/10 p-6 sm:p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] border-[1px] border-dashed border-amber-500 rounded-full animate-[spin_60s_linear_infinite]" />
            </div>

            <div className="mb-6 sm:mb-10 relative z-10">
                <div className="flex items-center gap-2 text-amber-500/60 mb-2 sm:mb-3">
                    <Star size={14} className="animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Soul Resonance</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-rpg font-bold text-white mb-1 tracking-tight">{rankName}</h2>
                <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Level {userLevel} Adept</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:space-y-6 flex-1 relative z-10">
                <div className="group">
                    <div className="flex items-center gap-2 text-emerald-400/70 mb-1 sm:mb-2 group-hover:text-emerald-400 transition-colors">
                        <Zap size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Exp Amp</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-white tracking-tighter">{(expMult * 100).toFixed(0)}%</div>
                    <div className="h-1 w-12 bg-emerald-500/20 rounded-full mt-1 sm:mt-2 group-hover:w-full transition-all duration-500" />
                </div>

                <div className="group">
                    <div className="flex items-center gap-2 text-yellow-400/70 mb-1 sm:mb-2 group-hover:text-yellow-400 transition-colors">
                        <Coins size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Wealth Manifest</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-white tracking-tighter">{goldMult}x</div>
                    <div className="h-1 w-12 bg-yellow-500/20 rounded-full mt-1 sm:mt-2 group-hover:w-full transition-all duration-500" />
                </div>
            </div>

            <div className="mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-amber-500/10 relative z-10 hidden sm:block">
                <div className="flex items-center gap-2 text-purple-400 mb-3">
                    <Hexagon size={16} className="animate-spin-slow" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Celestial Cycle</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  "The alignment of the spheres grants extra <span className="text-purple-300 font-bold">Philosopher's Stones</span> on the 3rd and 7th day of your journey."
                </p>
            </div>
        </div>

        {/* Right Panel: The Altar of Rewards */}
        <div className="flex-1 p-6 sm:p-8 relative overflow-y-auto hide-scrollbar">
            <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-500 hover:text-white transition-colors z-50 p-2 hover:bg-slate-800 rounded-full">
                <X size={24} />
            </button>

            <div className="mb-6 sm:mb-8">
                <h3 className="text-[10px] font-bold text-amber-500/60 uppercase tracking-[0.4em] mb-1 sm:mb-2">Daily Attunement</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h2 className="text-2xl sm:text-3xl font-rpg font-bold text-white tracking-tight">Consecutive Rituals</h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest">{currentStreak} Days</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {days.map((day) => {
                    const isTargetDay = day === cycleDay;
                    const isClaimed = isClaimedToday && day <= cycleDay;
                    const isBigReward = day === 7;
                    
                    const { baseExp, baseGold } = getBaseLoginRewards(day);
                    const rewardExp = Math.floor(baseExp * expMult);
                    const rewardGold = Math.floor(baseGold * goldMult);
                    const hasPhilosopherStone = day === 3 || day === 7;

                    let cardClass = "bg-slate-800/20 border-slate-800 opacity-40 grayscale";
                    let accentColor = "text-slate-500";
                    
                    if (isTargetDay) {
                        if (isClaimedToday) {
                            cardClass = "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)] scale-105 z-10 opacity-100 grayscale-0";
                            accentColor = "text-emerald-400";
                        } else {
                            cardClass = "bg-amber-500/10 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] scale-105 sm:scale-110 z-20 opacity-100 grayscale-0 ring-2 ring-amber-500/20";
                            accentColor = "text-amber-400";
                        }
                    } else if (isClaimed) {
                        cardClass = "bg-slate-900/80 border-emerald-900/40 opacity-80 grayscale-0";
                        accentColor = "text-emerald-600";
                    }

                    return (
                        <motion.div 
                            key={day} 
                            whileHover={!isClaimed && isTargetDay ? { scale: 1.05, y: -2 } : {}}
                            className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center min-h-[100px] sm:min-h-[120px] transition-all duration-500 ${cardClass} ${isBigReward ? 'col-span-2 bg-gradient-to-br from-amber-500/20 to-purple-500/20 border-amber-500/40' : ''}`}
                        >
                            <span className={`text-[8px] sm:text-[9px] font-black absolute top-2 left-3 sm:top-3 sm:left-4 uppercase tracking-widest ${isTargetDay ? 'text-amber-400' : 'text-slate-500'}`}>Day {day}</span>
                            
                            {isClaimed && (
                                <div className="absolute top-2 right-3 sm:top-3 sm:right-4 text-emerald-500">
                                    <CheckCircle size={12} className="animate-in zoom-in" />
                                </div>
                            )}

                            <div className={`flex items-center justify-center mb-2 sm:mb-3 ${isBigReward ? 'scale-110 sm:scale-125' : ''}`}>
                                {isBigReward ? (
                                  <div className="relative">
                                    <Gift size={24} className="sm:size-8 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
                                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-amber-400 rounded-full blur-xl" />
                                  </div>
                                ) : (
                                  hasPhilosopherStone ? (
                                    <Hexagon size={20} className="sm:size-6 text-purple-400 fill-purple-400/20 animate-pulse" />
                                  ) : (
                                    day % 2 !== 0 ? <Zap size={18} className={`sm:size-5 ${accentColor}`} /> : <Coins size={18} className={`sm:size-5 ${accentColor}`} />
                                  )
                                )}
                            </div>
                            
                            <div className="flex flex-col items-center gap-0.5">
                                <div className="text-[10px] sm:text-[11px] text-white font-bold">+{formatNumber(rewardExp)} <span className="text-[7px] sm:text-[8px] text-slate-500 font-medium uppercase">Exp</span></div>
                                <div className="text-[10px] sm:text-[11px] text-amber-500 font-bold">+{formatNumber(rewardGold)} <span className="text-[7px] sm:text-[8px] text-amber-900 font-medium uppercase">Gold</span></div>
                                {hasPhilosopherStone && (
                                    <div className="mt-1 px-1.5 py-0.5 bg-purple-500/20 rounded border border-purple-500/30 text-[8px] text-purple-300 font-bold uppercase tracking-tighter">
                                        +1 Stone
                                    </div>
                                )}
                            </div>
                            
                            {isTargetDay && !isClaimedToday && (
                              <div className="absolute -bottom-2 bg-amber-500 text-slate-950 text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">Current</div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch">
              <div className="w-full sm:flex-1 bg-slate-950/50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-500/10 flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-500/10 rounded-xl sm:rounded-2xl text-blue-400 shadow-inner">
                      <Info size={18} />
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed">
                      <p className="text-slate-100 font-bold mb-0.5 sm:mb-1 uppercase tracking-widest">Adept's Fortune</p>
                      Your level <span className="text-white font-bold">{userLevel}</span> standing grants a <span className="text-emerald-400 font-bold">{(expMult * 100).toFixed(0)}% Exp</span> and <span className="text-yellow-400 font-bold">{goldMult}x Gold</span> multiplier. 
                  </div>
              </div>

              {!isClaimedToday && (
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(245,158,11,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full sm:w-64 py-4 sm:py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black rounded-2xl sm:rounded-3xl shadow-xl shadow-amber-900/20 hover:from-amber-500 hover:to-amber-400 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm"
                >
                  Claim Blessings
                  <ChevronRight size={18} />
                </motion.button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};
