
import React, { useState, useMemo } from 'react';
import { UserProfile, LearningSession, Achievement, AchievementTier, Proficiency, Item } from '../types';
import { Award, Lock, Flame, Clock, Calendar, BarChart2, Coins, Skull, Zap, ShoppingBag, PieChart, Activity, Crosshair, TrendingUp, BookOpen, LayoutGrid, LayoutList, GalleryVerticalEnd, Brain } from 'lucide-react';
import { formatNumber, getRankColor } from '../gameData';
import { AchievementDetailModal } from './AchievementDetailModal';
import { TendencyRadar } from './TendencyRadar';

interface StatsPageProps {
  user: UserProfile;
  sessions: LearningSession[];
  proficiencies: Proficiency[];
  shopItems: Item[];
}

type SortType = 'rank' | 'name' | 'date';
type ViewType = 'grid' | 'list' | 'showcase';

export const StatsPage: React.FC<StatsPageProps> = ({ user, sessions, proficiencies, shopItems }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Achievement Controls
  const [sortType, setSortType] = useState<SortType>('rank');
  const [viewMode, setViewMode] = useState<ViewType>('grid');

  // --- Derived Stats ---
  const totalPlaytimeMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalPlaytimeHours = Math.floor(totalPlaytimeMinutes / 60);
  const totalSessions = sessions.length;
  const avgSessionLength = totalSessions > 0 ? Math.floor(totalPlaytimeMinutes / totalSessions) : 0;
  
  // Calculate specific stats
  const longestSession = sessions.reduce((max, s) => Math.max(max, s.durationMinutes), 0);
  const totalExpGained = user.totalExp;
  
  // Achievement Progress
  const totalAchievements = user.achievements.length;
  const unlockedAchievements = user.achievements.filter(a => a.unlocked).length;
  const completionRate = Math.floor((unlockedAchievements / totalAchievements) * 100);

  // Knowledge Stats
  const totalUnlockedKnowledge = proficiencies.reduce((acc, p) => acc + (p.unlockedQuestionIds?.length || 0), 0);

  // --- Sorting Logic ---
  const sortedAchievements = useMemo(() => {
      const list = [...user.achievements];
      const tierWeight = {
          [AchievementTier.BRONZE]: 1,
          [AchievementTier.SILVER]: 2,
          [AchievementTier.GOLD]: 3,
          [AchievementTier.PLATINUM]: 4,
          [AchievementTier.DIAMOND]: 5
      };

      return list.sort((a, b) => {
          if (sortType === 'rank') {
              // Primary: Tier weight (Low to High - Bronze first)
              const weightDiff = tierWeight[a.tier] - tierWeight[b.tier];
              if (weightDiff !== 0) return weightDiff;
              // Secondary: Unlocked status (Unlocked first)
              if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
              return 0;
          }
          if (sortType === 'name') {
              return a.name.localeCompare(b.name);
          }
          if (sortType === 'date') {
              // Unlocked first
              if (a.unlocked && !b.unlocked) return -1;
              if (!a.unlocked && b.unlocked) return 1;
              // If both unlocked, recent first
              if (a.unlocked && b.unlocked) {
                  return (b.unlockedAt || 0) - (a.unlockedAt || 0);
              }
              return 0;
          }
          return 0;
      });
  }, [user.achievements, sortType]);

  const getTierColor = (tier: AchievementTier, isUnlocked: boolean) => {
    if (!isUnlocked) return 'border-slate-800 bg-slate-900/50 text-slate-600 grayscale';

    switch (tier) {
        case AchievementTier.BRONZE: 
            return 'border-orange-700 bg-orange-950/20 text-orange-500 shadow-sm shadow-orange-900/20';
        case AchievementTier.SILVER: 
            return 'border-slate-400 bg-slate-900/40 text-slate-200 shadow-md shadow-slate-500/20';
        case AchievementTier.GOLD: 
            return 'border-yellow-500 bg-yellow-950/30 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]';
        case AchievementTier.PLATINUM: 
            return 'border-cyan-400 bg-cyan-950/30 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.5)]';
        case AchievementTier.DIAMOND: 
            return 'border-pink-400 bg-gradient-to-br from-red-500/20 via-blue-500/20 to-purple-500/20 text-white shadow-[0_0_25px_rgba(236,72,153,0.6)] animate-pulse';
        default: 
            return 'border-slate-700 bg-slate-800 text-slate-500';
    }
  };

  const getIcon = (iconName: string) => {
      // Map string icons to Lucide components
      switch(iconName) {
          case 'Zap': return <Zap size={20} />;
          case 'User': return <Activity size={20} />;
          case 'Coins': return <Coins size={20} />;
          case 'Sun': return <Brain size={20} />;
          case 'Flame': return <Flame size={20} />;
          case 'Eye': return <Activity size={20} />;
          case 'XCircle': return <Skull size={20} />;
          case 'Archive': return <ShoppingBag size={20} />;
          case 'Clock': return <Clock size={20} />;
          case 'MousePointer': return <Crosshair size={20} />;
          case 'Moon': return <Clock size={20} />;
          case 'Layers': return <Brain size={20} />;
          case 'LogOut': return <Activity size={20} />;
          case 'Search': return <Activity size={20} />;
          case 'UserCheck': return <Activity size={20} />;
          case 'Calendar': return <Calendar size={20} />;
          case 'Activity': return <Activity size={20} />;
          case 'ShoppingBag': return <ShoppingBag size={20} />;
          case 'BookOpen': return <Brain size={20} />;
          case 'Target': return <Crosshair size={20} />;
          case 'TrendingDown': return <BarChart2 size={20} />;
          case 'Award': return <Award size={20} />;
          case 'CheckSquare': return <Activity size={20} />;
          case 'Droplet': return <Activity size={20} />;
          case 'DollarSign': return <Coins size={20} />;
          case 'TrendingUp': return <BarChart2 size={20} />;
          case 'Home': return <Activity size={20} />;
          case 'Crown': return <Award size={20} />;
          case 'CreditCard': return <Coins size={20} />;
          case 'Book': return <Brain size={20} />;
          case 'CheckCircle': return <Award size={20} />;
          case 'Skull': return <Skull size={20} />;
          case 'Wifi': return <Activity size={20} />;
          case 'Repeat': return <Activity size={20} />;
          case 'Briefcase': return <Coins size={20} />;
          case 'Hexagon': return <Activity size={20} />;
          case 'LifeBuoy': return <Activity size={20} />;
          case 'Sword': return <Crosshair size={20} />;
          case 'Cpu': return <Brain size={20} />;
          case 'Star': return <Award size={20} />;
          case 'Watch': return <Clock size={20} />;
          case 'Package': return <ShoppingBag size={20} />;
          case 'Database': return <Brain size={20} />;
          case 'Globe': return <Activity size={20} />;
          case 'Shield': return <Activity size={20} />;
          case 'Terminal': return <Brain size={20} />;
          case 'RefreshCw': return <Activity size={20} />;
          case 'Mouse': return <Crosshair size={20} />;
          case 'AlertTriangle': return <Skull size={20} />;
          case 'Heart': return <Activity size={20} />;
          case 'FastForward': return <Activity size={20} />;
          case 'Flag': return <Activity size={20} />;
          case 'Box': return <ShoppingBag size={20} />;
          case 'X': return <Skull size={20} />;
          default: return <Award size={20} />;
      }
  };

  return (
    <div className="pb-20 animate-in fade-in">
        {selectedAchievement && <AchievementDetailModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />}

        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-rpg font-bold text-white uppercase tracking-wider">Career Record</h2>
            <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                <button 
                    onClick={() => setActiveTab('stats')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeTab === 'stats' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Stats
                </button>
                <button 
                    onClick={() => setActiveTab('achievements')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeTab === 'achievements' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Hall of Shame
                </button>
            </div>
        </div>

        {activeTab === 'stats' && (
            <div className="space-y-4">
                {/* Header Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
                        <Activity className="text-emerald-400 mb-2" size={24} />
                        <span className="text-2xl font-bold text-white">{totalSessions}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Total Sessions</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
                        <Clock className="text-blue-400 mb-2" size={24} />
                        <span className="text-2xl font-bold text-white">{formatNumber(totalPlaytimeHours)}h</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Total Time</span>
                    </div>
                </div>

                {/* --- New Tendency Graph --- */}
                <TendencyRadar proficiencies={proficiencies} />

                {/* Detail List */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 border-b border-slate-800 pb-2">Detailed Analytics</h3>
                    
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 flex items-center gap-2"><Flame size={14}/> Highest Streak</span>
                        <span className="text-white font-mono font-bold">{user.highestStreak} Days</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 flex items-center gap-2"><Zap size={14}/> Avg Session</span>
                        <span className="text-white font-mono font-bold">{avgSessionLength} min</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 flex items-center gap-2"><TrendingUp size={14}/> Total EXP</span>
                        <span className="text-white font-mono font-bold">{formatNumber(totalExpGained)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 flex items-center gap-2"><Skull size={14}/> Longest Grind</span>
                        <span className="text-white font-mono font-bold">{longestSession} min</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 flex items-center gap-2"><ShoppingBag size={14}/> Inventory</span>
                        <span className="text-white font-mono font-bold">{user.inventory.length} Items</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 flex items-center gap-2"><BookOpen size={14}/> Knowledge Unlocked</span>
                        <span className="text-white font-mono font-bold">{totalUnlockedKnowledge} Secrets</span>
                    </div>
                </div>

                {/* Pie Chart / Distribution Mock */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-950 relative">
                        <PieChart className="text-purple-500" size={32} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Completion Rate</h4>
                        <p className="text-xs text-slate-500">Hall of Shame</p>
                        <div className="mt-2 w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${completionRate}%` }}></div>
                        </div>
                        <span className="text-[10px] text-purple-400 font-bold mt-1 block">{unlockedAchievements} / {totalAchievements}</span>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'achievements' && (
            <div className="space-y-4">
                
                {/* Control Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <div className="flex gap-1 bg-slate-950 p-1 rounded-lg">
                        <button onClick={() => setSortType('rank')} className={`flex-1 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${sortType === 'rank' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Rank</button>
                        <button onClick={() => setSortType('name')} className={`flex-1 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${sortType === 'name' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>A-Z</button>
                        <button onClick={() => setSortType('date')} className={`flex-1 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${sortType === 'date' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Date</button>
                    </div>
                    <div className="flex gap-1 justify-end">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}><LayoutGrid size={16} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}><LayoutList size={16} /></button>
                        <button onClick={() => setViewMode('showcase')} className={`p-2 rounded-lg transition-colors ${viewMode === 'showcase' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}><GalleryVerticalEnd size={16} /></button>
                    </div>
                </div>

                {/* GRID VIEW */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-2">
                        {sortedAchievements.map((ach) => (
                            <button
                                key={ach.id}
                                onClick={() => setSelectedAchievement(ach)}
                                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-1 transition-all relative group overflow-hidden ${getTierColor(ach.tier, ach.unlocked)}`}
                            >
                                {ach.unlocked ? getIcon(ach.icon) : <Lock size={20} />}
                                {ach.unlocked && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>}
                                {/* Rainbow overlay for Diamond */}
                                {ach.unlocked && ach.tier === AchievementTier.DIAMOND && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-green-500/20 to-blue-500/20 mix-blend-overlay pointer-events-none rounded-xl"></div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* LIST VIEW */}
                {viewMode === 'list' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                        {sortedAchievements.map((ach) => (
                            <div 
                                key={ach.id} 
                                onClick={() => setSelectedAchievement(ach)}
                                className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer hover:scale-[1.01] transition-transform ${ach.unlocked ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-slate-900/50 border-slate-800 opacity-60'}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 ${getTierColor(ach.tier, ach.unlocked)}`}>
                                    {ach.unlocked ? getIcon(ach.icon) : <Lock size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-sm truncate ${ach.unlocked ? 'text-white' : 'text-slate-500'}`}>{ach.name}</h4>
                                    <p className="text-[10px] text-slate-400 truncate">{ach.description}</p>
                                </div>
                                {ach.unlocked && (
                                    <div className="text-right shrink-0">
                                        <div className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border mb-1 inline-block ${getTierColor(ach.tier, true)}`}>{ach.tier}</div>
                                        {ach.unlockedAt && <div className="text-[9px] text-slate-500">{new Date(ach.unlockedAt).toLocaleDateString()}</div>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* SHOWCASE VIEW */}
                {viewMode === 'showcase' && (
                    <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4">
                        {sortedAchievements.map((ach) => {
                            if (!ach.unlocked) return null; // Only show unlocked in showcase for better visuals? Or show locked as mystery. Let's show all but styled.
                            return (
                                <div 
                                    key={ach.id}
                                    onClick={() => setSelectedAchievement(ach)}
                                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] overflow-hidden group ${getTierColor(ach.tier, ach.unlocked)}`}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        {getIcon(ach.icon)} {/* Large BG Icon */}
                                    </div>
                                    
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-lg ${ach.unlocked ? 'bg-slate-900 border-white/10' : 'bg-slate-950 border-slate-800'}`}>
                                            {ach.unlocked ? React.cloneElement(getIcon(ach.icon) as React.ReactElement<any>, { size: 32 }) : <Lock size={32}/>}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-black/20 backdrop-blur`}>
                                            {ach.tier}
                                        </span>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className={`text-xl font-rpg font-bold mb-1 ${ach.unlocked ? 'text-white' : 'text-slate-500'}`}>{ach.name}</h3>
                                        <p className="text-xs text-slate-300 mb-3">{ach.description}</p>
                                        {ach.unlocked && (
                                            <div className="bg-black/20 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                                                <p className="text-xs italic text-white/80 font-serif">"{ach.flavorText}"</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {ach.unlockedAt && (
                                        <div className="absolute bottom-4 right-4 text-[9px] font-mono text-white/40 flex items-center gap-1">
                                            <Calendar size={10} /> {new Date(ach.unlockedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {/* Show locked items differently in showcase or filter them out? Let's show locked as small strips at bottom */}
                        <div className="grid grid-cols-2 gap-2 mt-4 opacity-50">
                             {sortedAchievements.filter(a => !a.unlocked).map(ach => (
                                 <div key={ach.id} className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex items-center gap-2 text-xs text-slate-500">
                                     <Lock size={12}/> <span>{ach.name}</span>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
