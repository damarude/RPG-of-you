
import React, { forwardRef, useMemo } from 'react';
import { UserProfile, Proficiency, LearningSession, Item, ItemSlot, Achievement, AchievementTier } from '../types';
import { getRankName, getRankImage, formatNumber, getRarityColor } from '../gameData';
import { Clock, Flame, Coins, BookOpen, Zap, Shield, Trophy, Activity, Award, TrendingUp, Hexagon, Terminal, Cpu, AlertTriangle, Fingerprint, Sword, Target, Gift } from 'lucide-react';

interface ShareableProfileProps {
  user: UserProfile;
  proficiencies: Proficiency[];
  sessions: LearningSession[];
  shopItems: Item[];
}

export const ShareableProfile = forwardRef<HTMLDivElement, ShareableProfileProps>(({ user, proficiencies, sessions, shopItems }, ref) => {
  // --- Derived Data Calculations ---
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalSessions = sessions.length;
  const avgSessionLength = totalSessions > 0 ? Math.floor(totalMinutes / totalSessions) : 0;
  const longestSession = sessions.reduce((max, s) => Math.max(max, s.durationMinutes), 0);
  const totalUnlockedKnowledge = proficiencies.reduce((acc, p) => acc + (p.unlockedQuestionIds?.length || 0), 0);
  
  // Stats Calculation from Gear
  const equippedItems = Object.entries(user.equipped).map(([slot, id]) => {
      const item = shopItems.find(i => i.id === id);
      return { slot: slot as ItemSlot, item };
  });

  let combatStats = {
      dmg: 0,
      critRate: 0,
      critDmg: 0,
      goldBonus: 0,
      attackSpeed: 0,
      streakProtect: 0,
      skillExp: 0
  };

  equippedItems.forEach(({ item }) => {
      if (!item) return;
      combatStats.dmg += item.stats.dmg || 0;
      combatStats.critRate += item.stats.critRate || 0;
      combatStats.critDmg += item.stats.critDmg || 0;
      combatStats.goldBonus += item.stats.goldBonus || 0;
      combatStats.attackSpeed += item.stats.attackSpeed || 0;
      combatStats.streakProtect += item.stats.streakProtectionChance || 0;
      combatStats.skillExp += item.stats.skillExpBonus || 0;
  });

  // Sort Skills (All of them)
  const sortedSkills = [...proficiencies].sort((a, b) => b.level - a.level);

  // Achievements
  const totalAchievements = user.achievements.length;
  const unlockedAchievements = user.achievements.filter(a => a.unlocked);
  const completionRate = Math.floor((unlockedAchievements.length / totalAchievements) * 100);
  
  // Sort Unlocked Achievements
  const tierValue = { [AchievementTier.DIAMOND]: 5, [AchievementTier.PLATINUM]: 4, [AchievementTier.GOLD]: 3, [AchievementTier.SILVER]: 2, [AchievementTier.BRONZE]: 1 };
  const sortedUnlockedAchievements = unlockedAchievements.sort((a, b) => tierValue[b.tier] - tierValue[a.tier]);

  const getTierColor = (tier: AchievementTier) => {
      switch (tier) {
          case AchievementTier.DIAMOND: return 'text-pink-300 border-pink-500 bg-pink-950/50';
          case AchievementTier.PLATINUM: return 'text-cyan-300 border-cyan-500 bg-cyan-950/50';
          case AchievementTier.GOLD: return 'text-yellow-300 border-yellow-500 bg-yellow-950/50';
          case AchievementTier.SILVER: return 'text-slate-200 border-slate-400 bg-slate-800/50';
          default: return 'text-orange-300 border-orange-700 bg-orange-950/50';
      }
  };

  // --- Extensive Dev Comments Logic ---
  const devComment = useMemo(() => {
      const lvl = user.totalLevel;
      const streak = user.currentStreak;
      const gold = user.gold;
      const hours = totalHours;
      
      // 1. Check Special Conditions first (Priority)
      if (streak > 100) return "Streak levels critical. You are officially a cyborg.";
      if (streak > 50) return "Consistency detected. Are you sure you're human?";
      if (gold > 50000) return "Economic dominance achieved. Please donate to the dev.";
      if (hours > 500) return "500 Hours logged. Go outside. The sun misses you.";
      if (unlockedAchievements.length >= totalAchievements * 0.8) return "Completionist mode engaged. There is no prize, sorry.";
      if (combatStats.critRate > 50) return "Relying on RNG? Bold strategy.";
      if (combatStats.goldBonus > 50) return "Greed is good? Wall Street is calling.";
      
      // 2. Rank Based Pools
      let pool: string[] = [];

      if (lvl <= 10) { // Novice
          pool = [
              "Optimized for turning oxygen into carbon dioxide.",
              "Threat Level: Zero. Cuteness Level: High.",
              "Stats suggest a proficiency in 'Trying Your Best'.",
              "Currently evolving from single-cell organism.",
              "A mostly harmless entity. Keeps clicking buttons.",
              "Warning: User may be confused by bright lights.",
              "Potential detected. Amount: Trace.",
              "Loading greatness... 1% complete."
          ];
      } else if (lvl <= 30) { // Apprentice
          pool = [
              "Learning curve detected. Proceed with caution.",
              "Slowly evolving from 'Confused' to 'Slightly Less Confused'.",
              "You have potential. Don't waste it watching cat videos.",
              "Not terrible. Not great, but not terrible.",
              "System initializing... User has found the keyboard.",
              "Upgrade in progress. Please do not turn off.",
              "Baby steps. You're walking, at least."
          ];
      } else if (lvl <= 60) { // Professional
          pool = [
              "Who are you and what did you do with the user?",
              "Consistency found. System integrity improving.",
              "You might actually be good at this. Don't get cocky.",
              "grinding.exe is running smoothly.",
              "Respectable stats. For a human.",
              "Productivity is spiking. Suspicious.",
              "You're actually doing it. I'm impressed."
          ];
      } else if (lvl <= 100) { // Expert
          pool = [
              "Warning: Productivity levels exceeding safe parameters.",
              "You're making the rest of us look bad. Stop it.",
              "Certified Grinder. Please remember to blink.",
              "Efficiency approaching robotic levels. Beep boop.",
              "I'd ask for tips, but I'm just code.",
              "Your power level is rising. It's over 9000 soon.",
              "Serious dedication detected."
          ];
      } else if (lvl <= 200) { // Master
          pool = [
              "Do you sleep? Serious question.",
              "Your power level is... well, it's pretty high.",
              "Legend says you once went outside. Unconfirmed.",
              "Mastery achieved. Now go conquer the real world.",
              "I bow to your superior time management skills.",
              "You are the main character now.",
              "System Overload. Too much EXP."
          ];
      } else { // Grandmaster+
          pool = [
              "You have transcended the mortal plane of procrastination.",
              "Are you a wizard? You're a wizard, aren't you.",
              "The developer is scared of you now.",
              "Go touch grass. This is a threat.",
              "You have beaten the simulation.",
              "God-tier status pending approval.",
              "Achievement Unlocked: No Life."
          ];
      }
      
      // Pseudo-random selection based on EXP so it stays consistent for the snapshot
      const index = user.totalExp % pool.length;
      return pool[index];
  }, [user.totalLevel, user.totalExp, user.currentStreak, user.gold, totalHours, unlockedAchievements.length, totalAchievements, combatStats]);

  // --- Radar Chart Data Logic ---
  const radarData = useMemo(() => {
      const categoryMap: Record<string, number> = {};
      proficiencies.forEach(p => {
          categoryMap[p.category] = (categoryMap[p.category] || 0) + p.level;
      });
      const categories = Object.keys(categoryMap);
      const maxVal = Math.max(...Object.values(categoryMap), 10);
      let data = categories.map(cat => ({ label: cat, value: categoryMap[cat], fullMark: maxVal * 1.1 }));
      
      // Pad to at least 3, sort, and slice to 12
      while (data.length < 3) {
          data.push({ label: '', value: 0, fullMark: maxVal * 1.1 });
      }
      return data.sort((a,b) => a.label.localeCompare(b.label)).slice(0, 12);
  }, [proficiencies]);

  // Radar Chart Helper
  const renderRadarChart = () => {
      const size = 300;
      const center = size / 2;
      const radius = (size / 2) - 65; 
      const totalPoints = radarData.length;
      const angleSlice = (Math.PI * 2) / totalPoints;

      const getCoords = (val: number, i: number, max: number) => {
          const angle = i * angleSlice - Math.PI / 2;
          const r = (val / max) * radius;
          return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
      };

      const polyPoints = radarData.map((d, i) => {
          const c = getCoords(d.value, i, d.fullMark);
          return `${c.x},${c.y}`;
      }).join(' ');

      return (
          <div className="relative w-[300px] h-[300px] mx-auto z-10">
              <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                  {/* Grid */}
                  {[1, 0.66, 0.33].map((scale, idx) => (
                      <polygon 
                          key={idx} 
                          points={radarData.map((d, i) => {
                              const c = getCoords(d.fullMark * scale, i, d.fullMark);
                              return `${c.x},${c.y}`;
                          }).join(' ')} 
                          fill={idx === 2 ? "#1e293b" : "transparent"}
                          stroke="#334155" 
                          strokeWidth="1"
                          opacity="0.5"
                      />
                  ))}
                  {/* Axes */}
                  {radarData.map((d, i) => {
                      const end = getCoords(d.fullMark, i, d.fullMark);
                      return <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke="#334155" strokeWidth="1" opacity="0.5" />;
                  })}
                  {/* Data Shape */}
                  <polygon points={polyPoints} fill="rgba(168, 85, 247, 0.2)" stroke="#a855f7" strokeWidth="2" filter="url(#glow)" />
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Labels & Dots */}
                  {radarData.map((d, i) => {
                      if (!d.label) return null;
                      const c = getCoords(d.fullMark * 1.35, i, d.fullMark); 
                      const dotC = getCoords(d.value, i, d.fullMark);
                      
                      const textWidth = d.label.length * 7 + 20; 
                      
                      return (
                          <g key={i}>
                              <circle cx={dotC.x} cy={dotC.y} r="4" fill="#fbbf24" stroke="#0f172a" strokeWidth="2" />
                              
                              <rect 
                                x={c.x - (textWidth / 2)} 
                                y={c.y - 12} 
                                width={textWidth} 
                                height="24" 
                                rx="4" 
                                fill="#0f172a" 
                                stroke="#334155"
                                strokeWidth="1"
                                opacity="0.95" 
                              />
                              
                              <text x={c.x} y={c.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {d.label} <tspan fill="#a855f7">{d.value}</tspan>
                              </text>
                          </g>
                      );
                  })}
              </svg>
          </div>
      );
  };

  return (
    <div ref={ref} style={{ position: 'fixed', left: '-9999px', top: 0, width: '700px', backgroundColor: '#020617', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <div className="border-[14px] border-slate-900 bg-slate-950 relative flex flex-col shadow-2xl">
        
        {/* Hex Grid Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0" 
             style={{ 
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 backgroundRepeat: 'repeat'
             }}>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-transparent to-slate-900/80 pointer-events-none z-0"></div>

        {/* --- HEADER --- */}
        <div className="px-8 py-5 relative z-10 flex justify-between items-start border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center gap-6 relative z-20">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-md opacity-50"></div>
                    <div className="w-28 h-28 shrink-0 border-2 border-slate-700 rounded-2xl overflow-hidden bg-slate-900 relative z-10">
                        <img src={user.avatarUrl} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} crossOrigin="anonymous" alt="Avatar" />
                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 z-20 bg-slate-900 border border-slate-700 rounded-lg p-1 shadow-lg">
                        <img src={getRankImage(user.totalLevel)} className="w-8 h-8 object-contain" crossOrigin="anonymous" alt="Rank" />
                    </div>
                </div>
                
                <div className="flex flex-col justify-center min-h-[7rem]">
                    <h1 className="text-4xl font-extrabold text-white mb-2 uppercase tracking-wide leading-none drop-shadow-lg break-words w-full max-w-[350px] relative z-20" style={{ fontFamily: 'Cinzel, serif', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                        {user.name}
                    </h1>
                    <div className="flex items-center gap-2 relative z-20">
                        <div className="flex items-center gap-2 px-2 py-1 bg-purple-950/60 border border-purple-500/40 rounded">
                            <span className="text-purple-300 font-bold text-[10px] uppercase tracking-wider">Level</span>
                            <span className="text-white font-mono font-bold text-base leading-none">{user.totalLevel}</span>
                        </div>
                        <div className="h-6 w-px bg-slate-700"></div>
                        <span className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em]">{getRankName(user.totalLevel)} CLASS</span>
                    </div>
                </div>
            </div>
            
            <div className="text-right opacity-40 pt-2 relative z-10">
                <Fingerprint size={56} className="text-slate-600" />
            </div>
        </div>

        {/* --- VITAL STATS ROW --- */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md relative z-10">
            {[
                { label: 'Playtime', val: `${formatNumber(totalHours)}h`, icon: <Clock size={16} className="text-blue-400"/>, color: 'text-blue-200' },
                { label: 'Day Streak', val: `${user.currentStreak}`, icon: <Flame size={16} className="text-orange-400"/>, color: 'text-orange-200' },
                { label: 'Wealth', val: formatNumber(user.gold), icon: <Coins size={16} className="text-yellow-400"/>, color: 'text-yellow-200' },
                { label: 'Secrets', val: totalUnlockedKnowledge, icon: <BookOpen size={16} className="text-emerald-400"/>, color: 'text-emerald-200' }
            ].map((stat, i) => (
                <div key={i} className="py-3 flex flex-col items-center justify-center text-center border-r border-slate-800 last:border-r-0 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
                    <div className="relative z-20 flex flex-col items-center">
                        <div className="mb-1 opacity-80">{stat.icon}</div>
                        <span className={`text-xl font-bold font-mono leading-none mb-1 ${stat.color} drop-shadow-sm`}>{stat.val}</span>
                        <span className="text-[8px] text-slate-500 uppercase font-bold tracking-[0.2em]">{stat.label}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* --- MAIN CONTENT COLUMNS --- */}
        <div className="flex border-b border-slate-800 bg-slate-900/20 relative z-10">
            
            {/* Left Col: Radar Chart */}
            <div className="w-1/2 border-r border-slate-800 p-5 flex flex-col relative">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-slate-600 z-20"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-slate-600 z-20"></div>

                <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest border-b border-slate-700/50 pb-2 relative z-20">
                    <Hexagon size={12} className="text-purple-400"/> Class Tendency
                </h3>
                <div className="flex-1 flex items-center justify-center py-2 relative z-10">
                    {renderRadarChart()}
                </div>
            </div>

            {/* Right Col: Analytics & Dev Log */}
            <div className="w-1/2 p-5 flex flex-col relative">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-slate-600 z-20"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-slate-600 z-20"></div>

                <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-widest border-b border-slate-700/50 pb-2 relative z-20">
                    <Activity size={12} className="text-emerald-400"/> Performance Metrics
                </h3>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4 relative z-20">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Total Sessions</span>
                        <span className="text-white font-mono font-bold text-base">{totalSessions}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Avg Duration</span>
                        <span className="text-white font-mono font-bold text-base">{avgSessionLength}m</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Longest Grind</span>
                        <span className="text-white font-mono font-bold text-base">{longestSession}m</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Total EXP</span>
                        <span className="text-white font-mono font-bold text-base">{formatNumber(user.totalExp)}</span>
                    </div>
                </div>

                <div className="mt-auto relative z-20">
                    <div className="bg-black/40 border border-slate-700 rounded-lg p-3 relative font-mono shadow-inner">
                        <div className="absolute -top-2 left-2 bg-slate-900 px-1.5 border border-slate-700 rounded flex items-center gap-1">
                            <Terminal size={8} className="text-green-500" />
                            <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">System Log</span>
                        </div>
                        <div className="flex items-start gap-1.5 pt-1">
                            <span className="text-green-500 text-[10px] mt-0.5">{'>'}</span>
                            <p className="text-[10px] text-green-400/90 leading-relaxed italic">
                                "{devComment}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- COMBAT ATTRIBUTES --- */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/30 relative z-10">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-widest border-b border-slate-700/50 pb-2 relative z-20">
                <TrendingUp size={12} className="text-red-400"/> Combat Attributes
            </h3>
            <div className="grid grid-cols-2 gap-4 relative z-20">
                <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Base Damage</span>
                    <span className="text-sm font-mono font-bold text-red-300 flex items-center gap-1"><Sword size={10}/> +{combatStats.dmg.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Crit Chance</span>
                    <span className="text-sm font-mono font-bold text-blue-400 flex items-center gap-1"><Target size={10}/> {combatStats.critRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Attack Speed</span>
                    <span className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1"><Zap size={10}/> +{combatStats.attackSpeed.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Gold Bonus</span>
                    <span className="text-sm font-mono font-bold text-yellow-400 flex items-center gap-1"><Coins size={10}/> +{combatStats.goldBonus.toFixed(1)}%</span>
                </div>
            </div>
        </div>

        {/* --- ACTIVE LOADOUT --- */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/20 relative z-10">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-widest border-b border-slate-700/50 pb-2 relative z-20">
                <Shield size={12} className="text-blue-400"/> Active Loadout
            </h3>
            <div className="grid grid-cols-2 gap-3 relative z-20">
                {equippedItems.filter(e => e.slot !== ItemSlot.BACKGROUND).map(({ slot, item }) => (
                    <div key={slot} className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-800">
                        <div className={`w-9 h-9 rounded border flex items-center justify-center shrink-0 ${item ? 'bg-slate-800 ' + getRarityColor(item.rarity).split(' ')[0] : 'border-dashed border-slate-700 opacity-30'}`}>
                             <span className="font-bold text-xs text-slate-500">{slot[0]}</span>
                        </div>
                        <div className="min-w-0">
                            <div className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">{slot}</div>
                            <div className={`text-[10px] font-bold truncate ${item ? 'text-white' : 'text-slate-600 italic'}`}>
                                {item ? item.name : 'Empty'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- ALL SKILLS --- */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/40 relative z-10">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-2 relative z-20">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 tracking-widest">
                    <Zap size={12} className="text-white"/> Proficiencies
                </h3>
                <span className="text-[9px] font-mono text-slate-500">{sortedSkills.length} Total</span>
            </div>
            
            <div className="flex flex-col gap-2 relative z-20">
                {sortedSkills.map((skill, i) => (
                    <div key={skill.id} className="flex items-center justify-between bg-slate-800/50 p-2 rounded border border-slate-700/50 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 bg-white/5 z-0" style={{ width: `${Math.min((skill.currentExp / 100) * 100, 100)}%` }}></div>
                        
                        <div className="flex items-center gap-3 relative z-20 min-w-0">
                            <span className="text-slate-600 font-bold font-mono text-[10px] w-4 text-center">{i+1}</span>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-200 leading-none truncate">{skill.name}</div>
                                <div className="text-[8px] text-slate-500 uppercase font-bold tracking-wider mt-1">{skill.category}</div>
                            </div>
                        </div>
                        <div className="text-right pl-2 shrink-0 relative z-20">
                            <div className="text-xs font-mono font-bold text-purple-400">Lvl {skill.level}</div>
                            <div className="text-[8px] text-slate-600 uppercase tracking-wide">{getRankName(skill.level)}</div>
                        </div>
                    </div>
                ))}
                {sortedSkills.length === 0 && <p className="text-slate-500 italic text-[10px] text-center py-2">No skills recorded.</p>}
            </div>
        </div>

        {/* --- HALL OF SHAME (ALL) --- */}
        <div className="p-6 bg-slate-950 flex-1 relative z-10">
             <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2 relative z-20">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 tracking-widest">
                    <Trophy size={12} className="text-yellow-500"/> Hall of Shame
                </h3>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <span className="block text-lg font-bold text-white font-mono leading-none">{unlockedAchievements.length}</span>
                        <span className="text-[7px] text-slate-500 uppercase font-bold">Unlocked</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-lg font-bold text-purple-400 font-mono leading-none">{completionRate}%</span>
                        <span className="text-[7px] text-slate-500 uppercase font-bold">Comp.</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 relative z-20">
                {sortedUnlockedAchievements.map((ach) => (
                    <div key={ach.id} className={`flex items-center gap-2 p-2 rounded border ${getTierColor(ach.tier)}`}>
                        <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[10px] font-bold text-white truncate">{ach.name}</span>
                                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${getTierColor(ach.tier).split(' ')[0]}`}>{ach.tier}</span>
                            </div>
                            <p className="text-[8px] text-slate-300 opacity-90 truncate">{ach.description}</p>
                        </div>
                    </div>
                ))}
                {sortedUnlockedAchievements.length === 0 && (
                    <div className="text-center text-[10px] text-slate-500 py-8 border border-dashed border-slate-800 rounded">No achievements unlocked yet.</div>
                )}
            </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 bg-black border-t-4 border-slate-900 flex flex-col items-center justify-center relative overflow-hidden z-10">
            <div className="absolute inset-0 bg-slate-900/10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/30 via-slate-950/50 to-black pointer-events-none z-0"></div>
            
            <div className="relative z-20 flex items-center gap-3 mb-2">
                <img 
                    src="https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/RPGofyou%20LOGO.png" 
                    className="h-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]" 
                    crossOrigin="anonymous" 
                    alt="Logo" 
                />
                <div className="h-6 w-px bg-slate-800"></div>
                <div>
                    <h2 className="text-lg font-rpg font-bold text-white tracking-[0.15em] leading-none mb-0.5 text-shadow-sm">RPG OF YOU</h2>
                    <p className="text-[7px] text-slate-500 uppercase font-mono tracking-[0.3em]">Level Up Your Real Life</p>
                </div>
            </div>
            
            <div className="relative z-20 text-center">
                <p className="text-slate-600 text-[7px] font-mono uppercase tracking-widest mb-0.5">Generated Record</p>
                <p className="text-slate-400 text-[9px] font-bold font-mono tracking-wider">{new Date().toLocaleDateString()}</p>
            </div>
        </div>

      </div>
    </div>
  );
});
