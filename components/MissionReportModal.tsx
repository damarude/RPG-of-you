import React, { useState } from 'react';
import { Clock, Gift, Flame, Hourglass, CheckCircle2, Heart, Sword, Shield, Zap, Target, Skull, Activity, BarChart2, ChevronDown, ChevronUp, TrendingUp, Plus } from 'lucide-react';
import { formatNumber } from '../gameData';
import { SupportModal } from './SupportModal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface MissionReportModalProps {
  setupMode: string;
  wasEarlyFinish: boolean;
  pauseQuote: string;
  duration: number; // in minutes
  baseExp: number;
  gearBonusAmount: number;
  streakBonusAmount: number;
  timeBonusAmount: number;
  totalExp: number;
  sessionGold: number;
  battleStats: {
    damageTaken: number;
    damageOutput: number;
    hitsDealt: number;
    tickleHits: number;
    normalHits: number;
    critHits: number;
    overcritHits: number;
    plusUltraHits: number;
    barrageHits: number;
    blocks: number;
    stuns: number;
    timesRevived: number;
  };
  onResume: () => void;
  onSubmit: () => void;
}

export const MissionReportModal: React.FC<MissionReportModalProps> = ({
  setupMode,
  wasEarlyFinish,
  pauseQuote,
  duration,
  baseExp,
  gearBonusAmount,
  streakBonusAmount,
  timeBonusAmount,
  totalExp,
  sessionGold,
  battleStats,
  onResume,
  onSubmit
}) => {
  const [showSupport, setShowSupport] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate next exp bonus time
  const effectiveMinutes = Math.floor(duration);
  let nextBonusMin = 10;
  let currentBonusPct = 0;
  let nextBonusPct = 10;

  if (effectiveMinutes >= 120) { currentBonusPct = 40; nextBonusMin = 999; nextBonusPct = 40; }
  else if (effectiveMinutes >= 60) { currentBonusPct = 30; nextBonusMin = 120; nextBonusPct = 40; }
  else if (effectiveMinutes >= 30) { currentBonusPct = 20; nextBonusMin = 60; nextBonusPct = 30; }
  else if (effectiveMinutes >= 10) { currentBonusPct = 10; nextBonusMin = 30; nextBonusPct = 20; }

  const minsToNextBonus = nextBonusMin === 999 ? 0 : nextBonusMin - effectiveMinutes;
  const progressToNext = nextBonusMin === 999 ? 100 : (effectiveMinutes / nextBonusMin) * 100;

  const hitData = [
    { name: 'Tickle', value: battleStats.tickleHits, color: '#64748b' },
    { name: 'Normal', value: battleStats.normalHits, color: '#94a3b8' },
    { name: 'Crit', value: battleStats.critHits, color: '#facc15' },
    { name: 'Overcrit', value: battleStats.overcritHits, color: '#a855f7' },
    { name: 'Plus Ultra', value: battleStats.plusUltraHits, color: '#22d3ee' },
    { name: 'Barrage', value: battleStats.barrageHits, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const avgDmg = battleStats.hitsDealt > 0 ? Math.floor(battleStats.damageOutput / battleStats.hitsDealt) : 0;

  return (
    <div className="flex flex-col h-full justify-center items-center p-4 sm:p-6 bg-slate-900/95 backdrop-blur-md fixed inset-0 z-50 overflow-y-auto">
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
        className="w-full max-w-md bg-slate-900 rounded-2xl border-2 border-slate-700 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden my-auto"
      >
        <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        
        <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="text-center mb-6">
               <motion.h2 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2 tracking-widest uppercase drop-shadow-sm"
               >
                 {setupMode === 'MANUAL' ? 'SESSION LOG' : 'MISSION REPORT'}
               </motion.h2>
               {wasEarlyFinish && <span className="inline-block px-2 py-0.5 rounded bg-red-900/50 text-red-400 text-[10px] font-bold uppercase mb-2 border border-red-800 animate-pulse">Early Termination</span>}
               
               {pauseQuote && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.4 }}
                   className="mt-4"
                 >
                   <p className="text-slate-300 text-sm italic py-2 px-6 leading-relaxed">
                     "{pauseQuote}"
                   </p>
                 </motion.div>
               )}
            </div>

            {/* EXP Progress to Next Tier */}
            {nextBonusMin !== 999 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6 bg-slate-950/50 rounded-xl p-4 border border-slate-800 relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-purple-900/20 to-transparent pointer-events-none"></div>
                <div className="flex justify-between items-end mb-2 relative z-10">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                      <TrendingUp size={14} className="text-purple-400"/> Next Time Bonus
                    </span>
                    <span className="text-purple-400 font-mono font-bold text-lg">{nextBonusPct}% EXP</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-mono font-bold text-xl">{minsToNextBonus}</span>
                    <span className="text-slate-500 text-xs ml-1">mins left</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative z-10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 mb-6 space-y-2"
            >
               <div className="flex justify-between items-center text-sm mb-2"><span className="text-slate-500 flex items-center gap-2"><Clock size={14}/> Time Elapsed</span><span className="text-white font-mono font-bold">{formatNumber(duration)}m</span></div>
               <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Base EXP</span><span className="text-white font-mono font-bold">{baseExp}</span></div>
               {gearBonusAmount > 0 && <div className="flex justify-between items-center text-xs"><span className="text-slate-500 flex items-center gap-1 pl-2"><Gift size={12} className="text-emerald-400"/> Gear Bonus</span><span className="text-emerald-400 font-mono flex items-center"><Plus size={10} className="mr-0.5"/>{Math.floor(gearBonusAmount)}</span></div>}
               {streakBonusAmount > 0 && <div className="flex justify-between items-center text-xs"><span className="text-slate-500 flex items-center gap-1 pl-2"><Flame size={12} className="text-orange-400"/> Streak Bonus</span><span className="text-orange-400 font-mono flex items-center"><Plus size={10} className="mr-0.5"/>{Math.floor(streakBonusAmount)}</span></div>}
               {timeBonusAmount > 0 && <div className="flex justify-between items-center text-sm"><span className="text-slate-500 flex items-center gap-1"><Hourglass size={14} className="text-purple-400"/> Time Bonus ({currentBonusPct}%)</span><span className="text-purple-400 font-mono font-bold flex items-center"><Plus size={12} className="mr-0.5"/>{timeBonusAmount}</span></div>}
               
               <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/50 mt-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-yellow-500 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                      <Zap size={14} className="animate-pulse" /> Total Reward
                    </span>
                    <span className="text-3xl text-yellow-400 font-rpg font-bold drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] flex items-center"><Plus size={24} className="mr-1"/>{totalExp} XP</span>
                  </div>
                  {sessionGold > 0 && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800/50 relative z-10">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Loot Recovered</span>
                      <span className="text-yellow-600 font-mono font-bold text-sm">+{formatNumber(sessionGold)} G</span>
                    </div>
                  )}
               </div>
            </motion.div>

            {/* Battle Details Toggle */}
            {setupMode !== 'MANUAL' && (
              <div className="mb-6">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <BarChart2 size={14} className="text-cyan-400" />
                    Combat Analytics
                  </span>
                  {showDetails ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-4">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Sword size={10}/> Dmg Dealt</div>
                            <div className="text-lg font-mono font-bold text-emerald-400">{formatNumber(battleStats.damageOutput)}</div>
                          </div>
                          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Shield size={10}/> Dmg Taken</div>
                            <div className="text-lg font-mono font-bold text-red-400">{formatNumber(battleStats.damageTaken)}</div>
                          </div>
                          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Target size={10}/> Avg Hit</div>
                            <div className="text-lg font-mono font-bold text-blue-400">{formatNumber(avgDmg)}</div>
                          </div>
                          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Activity size={10}/> Blocks/Stuns</div>
                            <div className="text-lg font-mono font-bold text-yellow-400">{battleStats.blocks} / {battleStats.stuns}</div>
                          </div>
                        </div>

                        {/* Hit Distribution Chart */}
                        {hitData.length > 0 && (
                          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-4 text-center">Hit Distribution</div>
                            <div className="h-32 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hitData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                  <XAxis type="number" hide />
                                  <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                  <Tooltip 
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#cbd5e1' }}
                                  />
                                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                                    {hitData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        {/* Revives */}
                        {battleStats.timesRevived > 0 && (
                          <div className="flex items-center justify-between bg-red-950/30 border border-red-900/50 p-3 rounded-lg">
                            <span className="text-xs font-bold text-red-400 flex items-center gap-2"><Skull size={14} /> Times Revived</span>
                            <span className="font-mono font-bold text-red-300">{battleStats.timesRevived}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-3"
            >
                <div className="flex gap-3">
                  {setupMode !== 'MANUAL' && (
                    <button 
                      onClick={onResume} 
                      className="flex-1 py-3.5 text-slate-300 font-bold bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 hover:border-slate-500 text-xs uppercase tracking-wider"
                    >
                      Resume
                    </button>
                  )}
                  <button 
                    onClick={onSubmit} 
                    className="flex-1 py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transform transition hover:scale-105 active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16}/> Claim Reward
                  </button>
                </div>
                <button 
                  onClick={() => setShowSupport(true)} 
                  className="w-full py-2.5 bg-pink-900/20 hover:bg-pink-900/40 border border-pink-500/30 hover:border-pink-500/50 text-pink-400 font-bold rounded-xl transition-all text-[10px] uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Heart size={12} className="fill-pink-400" /> Tip The Dev
                </button>
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
