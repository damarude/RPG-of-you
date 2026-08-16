
import React, { useState } from 'react';
import { UserProfile, Item, ItemSlot, Proficiency, LearningSession } from '../types';
import { getRankName, getRankColor, getProfileExpRequired, formatNumber, getRarityColor, getRankImage, getPlayerBaseStats, getPatronRank, getPatronStats, PATRON_RANK_TITLES, RANKS } from '../gameData';
import { X, Shield, Star, Flame, Coins, TrendingUp, Edit2, Sword, Zap, Target, Book, Brain, Clock, Skull, Crown, ChevronDown, ChevronUp, AlertCircle, Info, Heart, Activity, Hammer, HelpCircle, Trophy, Backpack } from 'lucide-react';
import { ExpTableModal } from './ExpTableModal';

interface ProfileDetailModalProps {
  user: UserProfile;
  shopItems: Item[];
  proficiencies: Proficiency[];
  sessions: LearningSession[];
  detailedEnemies?: any[];
  consumablesData?: any[];
  onClose: () => void;
  onEditAvatar: () => void;
  onSelectTitle?: (title: string | null) => void;
  onOpenPatronModal?: () => void;
  onOpenInventory?: () => void;
  onOpenBuffList?: () => void;
}

const STAT_DESCRIPTIONS: Record<string, string> = {
    hp: "Flat health bonus from Gear and Enemy Encyclopedia milestones.",
    hpPct: "Percentile health bonus from Gear and Enemy Encyclopedia milestones.",
    dmg: "How hard you slap reality. Higher number = enemies go bye-bye faster.",
    heal: "Phoenix vibes. Determines how fast you resurrect when knocked out. (Does not regen HP while alive).",
    critRate: "Luck stat. 50% means you miss 100% of the crits you don't take.",
    critDmg: "When you actually land a crit, this makes it hurt. A lot.",
    attackSpeed: "Caffeine intake level. Attacks happen faster than your anxiety spikes.",
    block: "The art of ignoring problems until they go away. (Chance to take 0 dmg).",
    stun: "Brain freeze application. Stops enemies from roasting you for a bit.",
    barrage: "Going full anime protagonist. Chance to hit multiple times per attack.",
    undieable: "Plot armor thickness. Small chance to refuse death because you're important.",
    streakProtect: "Saves your streak when you inevitably forget to login.",
    goldBonus: "Capitalist mindset. Squeeze more money out of everything.",
    skillExp: "Nerd power multiplier. Learn faster, touch grass later.",
    challengeCostReduction: "Coupon hunting skill. Challenges cost less because you're cheap."
};

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({ user, shopItems, proficiencies, sessions, detailedEnemies, consumablesData = [], onClose, onEditAvatar, onSelectTitle, onOpenPatronModal, onOpenInventory, onOpenBuffList }) => {
  const [showExpTable, setShowExpTable] = useState(false);
  const [expandedKnowledge, setExpandedKnowledge] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState(false);
  const [showStatHelp, setShowStatHelp] = useState(false);
  const [selectedItemSlot, setSelectedItemSlot] = useState<string | null>(null);
  const [showTitleSelect, setShowTitleSelect] = useState(false);
  const [statFilter, setStatFilter] = useState<'global' | 'equipment' | 'rank' | 'hunted' | 'bless' | 'buffs'>('global');

  const rankName = getRankName(user.totalLevel);
  const rankColor = getRankColor(user.totalLevel);
  const expReq = getProfileExpRequired(user.totalLevel);
  const nextLevel = user.totalLevel + 1;
  const borderColor = rankColor.split(' ').find(c => c.startsWith('border-')) || 'border-slate-700';

  // Calculate Stats
  const equippedItems = Object.entries(user.equipped).map(([slot, id]) => {
      const item = shopItems.find(i => i.id === id);
      return { slot: slot as ItemSlot, item };
  });

  const equipmentStats = { dmg: 0, hp: 0, hpPct: 0, heal: 0, block: 0, stun: 0, barrage: 0, critRate: 0, critDmg: 0, goldBonus: 0, attackSpeed: 0, challengeCostReduction: 0, streakProtect: 0, undieable: 0, skillExp: 0 };
  equippedItems.forEach(({ item }) => {
      if (!item) return;
      equipmentStats.dmg += item.stats.dmg || 0;
      equipmentStats.hp += item.stats.hp || 0;
      equipmentStats.hpPct += item.stats.hpPct || 0;
      equipmentStats.heal += item.stats.heal || 0;
      equipmentStats.block += item.stats.block || 0;
      equipmentStats.stun += item.stats.stun || 0;
      equipmentStats.barrage += item.stats.barrage || 0;
      equipmentStats.critRate += item.stats.critRate || 0;
      equipmentStats.critDmg += item.stats.critDmg || 0;
      equipmentStats.goldBonus += item.stats.goldBonus || 0;
      equipmentStats.attackSpeed += item.stats.attackSpeed || 0;
      equipmentStats.challengeCostReduction += item.stats.challengeCostReduction || 0;
      equipmentStats.streakProtect += item.stats.streakProtectionChance || 0;
      equipmentStats.undieable += item.stats.undieableChance || 0;
      equipmentStats.skillExp += item.stats.skillExpBonus || 0;
  });

  const unlockedTitles: string[] = [];
  const huntedStats = { dmg: 0, hp: 0, hpPct: 0, heal: 0, block: 0, stun: 0, barrage: 0, critRate: 0, critDmg: 0, goldBonus: 0, attackSpeed: 0, challengeCostReduction: 0, streakProtect: 0, undieable: 0, skillExp: 0 };
  if (detailedEnemies && user.huntedEnemies) {
      detailedEnemies.forEach(enemy => {
          const killCount = user.huntedEnemies[enemy.name] || 0;
          if (enemy.milestones) {
              enemy.milestones.forEach((m: any) => {
                  if (killCount >= m.kills) {
                      if (m.title) unlockedTitles.push(m.title);
                      if (m.stat && m.val) {
                          const valStr = m.val.toString();
                          const val = parseFloat(valStr.replace('%', ''));
                          if (!isNaN(val)) {
                              switch (m.stat) {
                                  case 'MAX_HP': 
                                      if (valStr.includes('%')) huntedStats.hpPct += val;
                                      else huntedStats.hp += val; 
                                      break;
                                  case 'ATK_DMG': huntedStats.dmg += val; break;
                                  case 'ASPD': huntedStats.attackSpeed += val; break;
                                  case 'CRIT_RATE': huntedStats.critRate += val; break;
                                  case 'CRIT_DMG': huntedStats.critDmg += val; break;
                                  case 'BLOCK': huntedStats.block += val; break;
                                  case 'BARRAGE': huntedStats.barrage += val; break;
                                  case 'STUN': huntedStats.stun += val; break;
                                  case 'GOLD': huntedStats.goldBonus += val; break;
                                  case 'HEAL': huntedStats.heal += val; break;
                                  case 'CHALLENGE_COST': huntedStats.challengeCostReduction += val; break;
                              }
                          }
                      }
                  }
              });
          }
      });
  }

  const base = getPlayerBaseStats(user.totalLevel);
  const rawBaseHp = 33 + (user.totalLevel * 5);
  const baseDmg = 1 + (user.totalLevel * 0.2);
  const rankStats = { 
      dmg: baseDmg, hp: rawBaseHp, hpPct: 0, heal: base.heal, block: base.block, stun: base.stun, barrage: base.barrage, 
      critRate: base.critRate, critDmg: 0, goldBonus: 0, attackSpeed: base.attackSpeed, challengeCostReduction: 0, 
      streakProtect: 0, undieable: 0, skillExp: 0 
  };

  const patronRank = getPatronRank(user.patronExp || 0);
  
  // Add Patron Titles
  if (patronRank > 0) {
      for (let i = 0; i < patronRank; i++) {
          if (PATRON_RANK_TITLES[i]) unlockedTitles.push(PATRON_RANK_TITLES[i]);
      }
  }

  const patronStats = getPatronStats(patronRank);
  const blessStats = { 
      dmg: patronStats.dmg, hp: patronStats.hp, hpPct: patronStats.hpPct, heal: patronStats.heal, 
      block: 0, stun: patronStats.stun, barrage: patronStats.barrage, critRate: patronStats.critRate, 
      critDmg: patronStats.critDmg, goldBonus: patronStats.goldBonus, attackSpeed: patronStats.attackSpeed, 
      challengeCostReduction: patronStats.challengeCostReduction, streakProtect: patronStats.streakProtect, 
      undieable: patronStats.undieable, skillExp: patronStats.skillExp 
  };

  const buffStats = { dmg: 0, hp: 0, hpPct: 0, heal: 0, block: 0, stun: 0, barrage: 0, critRate: 0, critDmg: 0, goldBonus: 0, attackSpeed: 0, challengeCostReduction: 0, streakProtect: 0, undieable: 0, skillExp: 0 };
  if (user.activeBuffs) {
      const now = Date.now();
      Object.entries(user.activeBuffs).forEach(([itemId, expiry]) => {
          if ((expiry as number) > now || expiry === 1) {
              const newData = consumablesData?.find(c => c.id === itemId);
              if (newData) {
                  const rankIndex = RANKS.indexOf(getRankName(user.totalLevel));
                  const maxRank = RANKS.length - 1;
                  const rankFactor = Math.max(0, rankIndex) / maxRank;
                  const stacks = user.activeBuffStacks?.[itemId] || 1;
                  const lerp = (min: number, max: number) => (min + (max - min) * rankFactor) * stacks;

                  buffStats.dmg += lerp(newData.dmgMin, newData.dmgMax);
                  buffStats.hp += lerp(newData.flatHpMin, newData.flatHpMax);
                  buffStats.hpPct += lerp(newData.percentileHpMin, newData.percentileHpMax);
                  buffStats.heal += lerp(newData.healMin, newData.healMax);
                  buffStats.block += lerp(newData.blockMin, newData.blockMax);
                  buffStats.stun += lerp(newData.stunMin, newData.stunMax);
                  buffStats.barrage += lerp(newData.barrageMin, newData.barrageMax);
                  buffStats.critRate += lerp(newData.critRateMin, newData.critRateMax);
                  buffStats.critDmg += lerp(newData.critDmgMin, newData.critDmgMax);
                  buffStats.goldBonus += lerp(newData.goldMin, newData.goldMax);
                  buffStats.attackSpeed += lerp(newData.aspdMin, newData.aspdMax);
                  buffStats.challengeCostReduction += lerp(newData.cReductionMin, newData.cReductionMax);
                  buffStats.streakProtect += lerp(newData.streakSaveMin, newData.streakSaveMax);
                  buffStats.undieable += lerp(newData.undyingMin, newData.undyingMax);
                  buffStats.skillExp += lerp(newData.skillExpMin, newData.skillExpMax);
              } else {
                  const stacks = user.activeBuffStacks?.[itemId] || 1;
                  switch (itemId) {
                      case 'miso_ramen': buffStats.hpPct += 20 * stacks; break;
                      case 'shio_ramen': buffStats.attackSpeed += 15 * stacks; break;
                      case 'shoyu_ramen': buffStats.critRate += 10 * stacks; break;
                      case 'chashuu_ramen': buffStats.block += 6 * stacks; break;
                      case 'chuuka_ramen': buffStats.heal += 2 * stacks; break;
                      case 'ichiban_shibori': buffStats.undieable += 3 * stacks; break;
                      case 'sshs_soap': buffStats.barrage += 9 * stacks; break;
                  }
              }
          }
      });
  }

  const stats = {
      dmg: equipmentStats.dmg + huntedStats.dmg + rankStats.dmg + blessStats.dmg + buffStats.dmg,
      hp: equipmentStats.hp + huntedStats.hp + rankStats.hp + blessStats.hp + buffStats.hp,
      hpPct: equipmentStats.hpPct + huntedStats.hpPct + rankStats.hpPct + blessStats.hpPct + buffStats.hpPct,
      heal: equipmentStats.heal + huntedStats.heal + rankStats.heal + blessStats.heal + buffStats.heal,
      block: equipmentStats.block + huntedStats.block + rankStats.block + blessStats.block + buffStats.block,
      stun: equipmentStats.stun + huntedStats.stun + rankStats.stun + blessStats.stun + buffStats.stun,
      barrage: equipmentStats.barrage + huntedStats.barrage + rankStats.barrage + blessStats.barrage + buffStats.barrage,
      critRate: equipmentStats.critRate + huntedStats.critRate + rankStats.critRate + blessStats.critRate + buffStats.critRate,
      critDmg: equipmentStats.critDmg + huntedStats.critDmg + rankStats.critDmg + blessStats.critDmg + buffStats.critDmg,
      goldBonus: equipmentStats.goldBonus + huntedStats.goldBonus + rankStats.goldBonus + blessStats.goldBonus + buffStats.goldBonus,
      attackSpeed: equipmentStats.attackSpeed + huntedStats.attackSpeed + rankStats.attackSpeed + blessStats.attackSpeed + buffStats.attackSpeed,
      challengeCostReduction: equipmentStats.challengeCostReduction + huntedStats.challengeCostReduction + rankStats.challengeCostReduction + blessStats.challengeCostReduction + buffStats.challengeCostReduction,
      streakProtect: equipmentStats.streakProtect + huntedStats.streakProtect + rankStats.streakProtect + blessStats.streakProtect + buffStats.streakProtect,
      undieable: equipmentStats.undieable + huntedStats.undieable + rankStats.undieable + blessStats.undieable + buffStats.undieable,
      skillExp: equipmentStats.skillExp + huntedStats.skillExp + rankStats.skillExp + blessStats.skillExp + buffStats.skillExp
  };

  const filteredStats = statFilter === 'global' ? stats : 
                        statFilter === 'equipment' ? equipmentStats :
                        statFilter === 'rank' ? rankStats :
                        statFilter === 'hunted' ? huntedStats : 
                        statFilter === 'bless' ? blessStats : buffStats;

  const filteredBaseHp = statFilter === 'global' ? Math.floor(stats.hp * (1 + (stats.hpPct / 100))) : Math.floor(filteredStats.hp * (1 + (filteredStats.hpPct / 100)));
  const filteredBaseDmgDisplay = statFilter === 'global' ? (stats.dmg).toFixed(1) : (filteredStats.dmg).toFixed(1);

  // Library Calculations
  const totalUnlockedQuestions = proficiencies.reduce((acc, p) => acc + (p.unlockedQuestionIds?.length || 0), 0);
  const totalPlaytimeHours = proficiencies.reduce((acc, p) => acc + p.totalHours, 0);
  const globalExpBonus = (totalUnlockedQuestions * 0.5).toFixed(1);
  const totalSkillExpBonus = (parseFloat(globalExpBonus) + stats.skillExp).toFixed(1);

  // Sorted Skills for Rankings
  const sortedSkills = [...proficiencies].sort((a, b) => b.level - a.level);

  if (showExpTable) {
      return <ExpTableModal onClose={() => setShowExpTable(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95" onClick={onClose}>
        
        <div className={`bg-slate-900 border-4 ${borderColor} rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden`} onClick={(e) => e.stopPropagation()}>
            
            <div className="absolute top-4 right-4 z-20">
                <button onClick={onClose} className="text-slate-400 hover:text-white p-2 bg-black/40 rounded-full transition-colors backdrop-blur-sm border border-slate-700/50">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                
                {/* Avatar & Core Identity */}
                <div className="flex flex-col items-center mb-8">
                    <div className={`w-32 h-32 rounded-xl border-4 ${borderColor} bg-slate-800 shadow-xl overflow-hidden mb-4 relative group`}>
                        <img src={user.avatarUrl} className="w-full h-full object-cover pixel-art animate-idle" alt="Profile" />
                        <button onClick={onEditAvatar} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 size={24} className="text-white" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2 relative">
                        <h2 className="text-2xl font-rpg font-bold text-white text-center leading-tight">{user.name}</h2>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <img src={getRankImage(user.totalLevel)} alt={rankName} className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${rankColor}`}>
                            {rankName}
                        </div>
                    </div>

                    {/* Title Selection */}
                    <div className="mb-6 w-full flex flex-col items-center">
                        <button 
                            onClick={() => setShowTitleSelect(!showTitleSelect)}
                            className="text-sm text-purple-300 italic hover:text-purple-200 transition-colors flex items-center gap-1"
                        >
                            {user.selectedTitle ? `"${user.selectedTitle}"` : "Select a Title"}
                            <ChevronDown size={14} />
                        </button>
                        
                        {showTitleSelect && (
                            <div className="mt-2 w-full max-w-xs bg-slate-950 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                    <button 
                                        onClick={() => { onSelectTitle?.(null); setShowTitleSelect(false); }}
                                        className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${!user.selectedTitle ? 'bg-purple-900/30 text-purple-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                                    >
                                        None
                                    </button>
                                    {unlockedTitles.length === 0 ? (
                                        <div className="px-3 py-2 text-xs text-slate-500 italic text-center">No titles unlocked yet. Hunt enemies to unlock!</div>
                                    ) : (
                                        Array.from(new Set(unlockedTitles)).map((title, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => { onSelectTitle?.(title); setShowTitleSelect(false); }}
                                                className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${user.selectedTitle === title ? 'bg-purple-900/30 text-purple-300' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                                            >
                                                {title}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Patron Rank */}
                    <button 
                        onClick={onOpenPatronModal}
                        className={`mb-6 flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors cursor-pointer border ${patronRank > 0 ? 'bg-amber-900/20 border-amber-700/50 hover:bg-amber-900/40' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700'}`} 
                        title="Patron Bless: Support the game to increase this rank and gain permanent stats!"
                    >
                        <Crown size={14} className={patronRank > 0 ? "text-amber-400" : "text-slate-500"} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${patronRank > 0 ? 'text-amber-200' : 'text-slate-400'}`}>
                            {patronRank > 0 ? `Patron Rank ${patronRank}` : 'Patron Bless'}
                        </span>
                    </button>

                    {/* Quick Actions */}
                    <div className="w-full grid grid-cols-2 gap-3 mb-6">
                        {onOpenInventory && (
                            <button 
                                onClick={onOpenInventory} 
                                className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 hover:border-purple-500/50 hover:bg-purple-900/20 transition-all flex items-center justify-center gap-3 group shadow-lg shadow-black/20"
                            >
                                <div className="p-2 bg-purple-900/30 rounded-lg group-hover:bg-purple-900/50 transition-colors">
                                    <Backpack size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Inventory</span>
                            </button>
                        )}
                        {onOpenBuffList && (
                            <button 
                                onClick={onOpenBuffList} 
                                className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 hover:border-yellow-500/50 hover:bg-yellow-900/20 transition-all flex items-center justify-center gap-3 group shadow-lg shadow-black/20"
                            >
                                <div className="p-2 bg-yellow-900/30 rounded-lg group-hover:bg-yellow-900/50 transition-colors">
                                    <Zap size={18} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Buffs</span>
                            </button>
                        )}
                    </div>

                    <div className="w-full grid grid-cols-3 gap-3">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                            <Star size={16} className="text-purple-400 mb-1" />
                            <span className="text-lg font-mono text-white font-bold">{user.totalLevel}</span>
                            <span className="text-[10px] text-slate-500 uppercase">Level</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                            <Coins size={16} className="text-yellow-500 mb-1" />
                            <span className="text-lg font-mono text-white font-bold">{formatNumber(user.gold)}</span>
                            <span className="text-[10px] text-slate-500 uppercase">Gold</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                            <Flame size={16} className="text-orange-500 mb-1" />
                            <span className="text-lg font-mono text-white font-bold">{user.currentStreak}</span>
                            <span className="text-[10px] text-slate-500 uppercase">Streak</span>
                        </div>
                    </div>

                    <div className="mt-4 w-full">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">To Level {nextLevel}</span>
                            <span className="text-[10px] text-purple-400 font-mono">{Math.floor(user.totalExp % expReq)} / {expReq} EXP</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600" style={{ width: `${Math.min(((user.totalExp % expReq) / expReq) * 100, 100)}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Character Stats Sheet */}
                <div className="mb-8">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-4">
                        <h3 className="text-sm font-bold text-slate-300 uppercase flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-400" /> Stats Breakdown
                        </h3>
                        <div className="flex flex-wrap gap-1 justify-center">
                            {(['global', 'equipment', 'rank', 'hunted', 'bless', 'buffs'] as const).map(filter => (
                                <button 
                                    key={filter}
                                    onClick={() => setStatFilter(filter)}
                                    className={`px-2 py-1 text-[9px] sm:text-[10px] uppercase font-bold rounded ${statFilter === filter ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setShowStatHelp(!showStatHelp)} 
                            className={`p-1.5 rounded-full transition-colors ${showStatHelp ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700'}`}
                            title="What do these do?"
                        >
                            <HelpCircle size={14} />
                        </button>
                    </div>

                    {showStatHelp ? (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2"><Info size={16} className="text-purple-400"/> Guide</h4>
                                <button onClick={() => setShowStatHelp(false)} className="text-[10px] text-slate-500 underline hover:text-white">Close</button>
                            </div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {Object.entries(STAT_DESCRIPTIONS).map(([key, desc]) => (
                                    <div key={key} className="text-xs">
                                        <div className="font-bold text-slate-300 mb-0.5 uppercase">{key}</div>
                                        <p className="text-slate-500 italic leading-relaxed pl-2 border-l-2 border-slate-700">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="text-[10px] text-slate-400 uppercase mb-1">Max HP</div>
                                <div className="text-lg font-bold text-green-400 flex items-center gap-1"><Heart size={14} /> {formatNumber(filteredBaseHp)}</div>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="text-[10px] text-slate-400 uppercase mb-1">Damage</div>
                                <div className="text-lg font-bold text-red-400 flex items-center gap-1"><Sword size={14} /> {filteredBaseDmgDisplay}</div>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="text-[10px] text-slate-400 uppercase mb-1">Crit Rate</div>
                                <div className="text-lg font-bold text-red-500 flex items-center gap-1"><Target size={14} /> {filteredStats.critRate.toFixed(1)}%</div>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="text-[10px] text-slate-400 uppercase mb-1">Atk Speed</div>
                                <div className="text-lg font-bold text-blue-400 flex items-center gap-1"><Zap size={14} /> {filteredStats.attackSpeed.toFixed(1)}%</div>
                            </div>
                            
                            <div className="col-span-2 space-y-2 mt-2">
                                {filteredStats.hp > 0 && (
                                    <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs">
                                        <span className="text-slate-400 flex items-center gap-2">
                                            <Heart size={12} className="text-green-400"/> Flat Health Bonus
                                        </span>
                                        <span className="text-green-300 font-bold">
                                            +{formatNumber(filteredStats.hp)}
                                        </span>
                                    </div>
                                )}
                                {filteredStats.hpPct > 0 && (
                                    <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs">
                                        <span className="text-slate-400 flex items-center gap-2">
                                            <Heart size={12} className="text-pink-400"/> Health Bonus %
                                        </span>
                                        <span className="text-green-300 font-bold">
                                            +{filteredStats.hpPct.toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                                <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs">
                                   <span className="text-slate-400 flex items-center gap-2"><Activity size={12} className="text-emerald-300"/> Revive Speed</span>
                                   <span className="text-green-300 font-bold">{filteredStats.heal.toFixed(1)}% / sec</span>
                                </div>
                                {filteredStats.goldBonus > 0 && <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs"><span className="text-slate-400 flex items-center gap-2"><Coins size={12} className="text-yellow-400"/> Gold Bonus</span><span className="text-yellow-300 font-bold">+{filteredStats.goldBonus.toFixed(1)}%</span></div>}
                                {filteredStats.block > 0 && <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs"><span className="text-slate-400 flex items-center gap-2"><Shield size={12} className="text-blue-400"/> Block</span><span className="text-blue-300 font-bold">{Math.min(75, filteredStats.block).toFixed(1)}%</span></div>}
                                {filteredStats.stun > 0 && <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs"><span className="text-slate-400 flex items-center gap-2"><Zap size={12} className="text-cyan-400"/> Stun</span><span className="text-yellow-300 font-bold">{Math.min(25, filteredStats.stun).toFixed(1)}%</span></div>}
                                {filteredStats.barrage > 0 && <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs"><span className="text-slate-400 flex items-center gap-2"><Zap size={12} className="text-purple-400"/> Barrage</span><span className="text-red-300 font-bold">{Math.min(85, filteredStats.barrage).toFixed(1)}%</span></div>}
                                {filteredStats.critDmg > 0 && <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs"><span className="text-slate-400 flex items-center gap-2"><Target size={12} className="text-orange-400"/> Crit Dmg</span><span className="text-indigo-300 font-bold">+{filteredStats.critDmg.toFixed(1)}%</span></div>}
                                {filteredStats.skillExp > 0 && <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs"><span className="text-slate-400 flex items-center gap-2"><Star size={12} className="text-yellow-300"/> Skill Exp</span><span className="text-purple-300 font-bold">+{filteredStats.skillExp.toFixed(1)}%</span></div>}
                                {filteredStats.challengeCostReduction > 0 && <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs"><span className="text-slate-400 flex items-center gap-2"><Activity size={12} className="text-emerald-400"/> Cost Reduct</span><span className="text-emerald-300 font-bold">-{filteredStats.challengeCostReduction.toFixed(1)}%</span></div>}
                                {filteredStats.streakProtect > 0 && <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs"><span className="text-slate-400 flex items-center gap-2"><Shield size={12} className="text-indigo-400"/> Streak Save</span><span className="text-orange-300 font-bold">{filteredStats.streakProtect.toFixed(1)}%</span></div>}
                                {filteredStats.undieable > 0 && <div className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs"><span className="text-slate-400 flex items-center gap-2"><Shield size={12} className="text-amber-200"/> Undying</span><span className="text-pink-300 font-bold">{filteredStats.undieable.toFixed(1)}%</span></div>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Proficiency Rankings - Expandable */}
                <div className="mb-8">
                    <button onClick={() => setExpandedSkills(!expandedSkills)} className="w-full flex justify-between items-center border-b border-slate-700 pb-2 mb-4 hover:text-purple-400 transition-colors">
                        <h3 className="text-sm font-bold text-slate-300 uppercase flex items-center gap-2"><Zap size={16} className="text-blue-500" /> Proficiency Rankings</h3>
                        {expandedSkills ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {expandedSkills ? (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                            {sortedSkills.length > 0 ? sortedSkills.map((skill, idx) => (
                                <div key={skill.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs font-mono text-slate-500 w-4">{idx + 1}</div>
                                        <div><div className="text-sm font-bold text-white">{skill.name}</div><div className="text-[10px] text-slate-500 uppercase">{skill.category}</div></div>
                                    </div>
                                    <div className="text-right"><div className="text-sm font-mono font-bold text-purple-400">Lvl {skill.level}</div><div className="text-[9px] text-slate-600 uppercase">{getRankName(skill.level)}</div></div>
                                </div>
                            )) : <div className="text-center text-xs text-slate-500 italic py-4 bg-slate-800/50 rounded-lg">No skills learned yet. Go train!</div>}
                        </div>
                    ) : (
                        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex justify-between"><span>Top 3 Skills</span><span className="text-xs text-purple-400 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setExpandedSkills(true); }}>See All</span></div>
                            {sortedSkills.length > 0 ? sortedSkills.slice(0, 3).map((skill, idx) => (
                                <div key={skill.id} className="flex justify-between items-center mb-2 last:mb-0 text-sm"><div className="flex gap-2"><span className="text-slate-500 font-mono text-xs">{idx + 1}.</span><span className="text-slate-300">{skill.name}</span></div><span className="font-mono font-bold text-white">Lvl {skill.level}</span></div>
                            )) : <div className="text-center text-xs text-slate-500 italic">No skills learned yet.</div>}
                        </div>
                    )}
                </div>

                {/* Equipment Loadout */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2 border-b border-slate-700 pb-2"><Shield size={16} className="text-blue-400" /> Equipment</h3>
                    <div className="space-y-2">
                        {equippedItems.filter(e => e.slot !== ItemSlot.BACKGROUND).map(({ slot, item }) => (
                            <div key={slot} onClick={() => item && setSelectedItemSlot(selectedItemSlot === slot ? null : slot)} className={`flex flex-col bg-slate-800 rounded-lg border transition-all cursor-pointer ${item ? 'hover:bg-slate-700' : ''} ${selectedItemSlot === slot ? 'border-purple-500' : 'border-slate-700'}`}>
                                <div className="flex items-center gap-3 p-2">
                                    <div className={`w-10 h-10 rounded border flex items-center justify-center shrink-0 ${item ? 'bg-slate-900 ' + getRarityColor(item.rarity).split(' ')[0] : 'bg-slate-900/50 border-dashed border-slate-700'}`}>{item ? <span className="font-bold text-lg">{item.icon === 'ShoppingBag' ? '?' : item.name[0]}</span> : <span className="text-slate-600 text-xs">{slot[0]}</span>}</div>
                                    <div className="flex-1 min-w-0"><div className="text-[10px] text-slate-500 uppercase font-bold">{slot}</div><div className={`text-sm font-bold truncate ${item ? 'text-white' : 'text-slate-600 italic'}`}>{item ? item.name : 'Empty'}</div></div>
                                    {item && (<div className="flex items-center gap-2"><div className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${getRarityColor(item.rarity)}`}>{item.rarity}</div>{selectedItemSlot === slot ? <ChevronUp size={14} className="text-slate-400"/> : <ChevronDown size={14} className="text-slate-400"/>}</div>)}
                                </div>
                                {selectedItemSlot === slot && item && (
                                    <div className="p-3 border-t border-slate-700 bg-slate-900/50 rounded-b-lg animate-in slide-in-from-top-2">
                                        <p className="text-xs text-slate-300 italic mb-2">"{item.description}"</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                            <span className="col-span-2 text-cyan-300 font-bold mb-1">{item.mainStatDesc}</span>
                                            {Object.entries(item.stats).map(([key, value]) => {
                                                const val = value as number;
                                                if (val > 0) {
                                                    let label = key;
                                                    let isPct = false;
                                                    switch(key) {
                                                        case 'dmg': label = 'Damage'; break;
                                                        case 'hp': label = 'Flat Health'; isPct = false; break;
                                                        case 'hpPct': label = 'Health %'; isPct = true; break;
                                                        case 'heal': label = 'Revive Speed'; isPct = true; break;
                                                        case 'block': label = 'Block'; isPct = true; break;
                                                        case 'stun': label = 'Stun'; isPct = true; break;
                                                        case 'barrage': label = 'Barrage'; isPct = true; break;
                                                        case 'critRate': label = 'Crit Rate'; isPct = true; break;
                                                        case 'critDmg': label = 'Crit Dmg'; isPct = true; break;
                                                        case 'goldBonus': label = 'Gold Bonus'; isPct = true; break;
                                                        case 'attackSpeed': label = 'Atk Speed'; isPct = true; break;
                                                        case 'challengeCostReduction': label = 'Cost Reduct'; isPct = true; break;
                                                        case 'streakProtectionChance': label = 'Streak Save'; isPct = true; break;
                                                        case 'undieableChance': label = 'Undying'; isPct = true; break;
                                                        case 'skillExpBonus': label = 'Skill Exp'; isPct = true; break;
                                                        default: return null;
                                                    }
                                                    
                                                    return (
                                                        <div key={key} className="flex justify-between text-slate-400">
                                                            <span>{label}</span>
                                                            <span className="text-white">+{val.toFixed(1)}{isPct ? '%' : ''}</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Library */}
                <div className="mb-8">
                    <button onClick={() => setExpandedKnowledge(!expandedKnowledge)} className="w-full flex justify-between items-center border-b border-slate-700 pb-2 mb-4 hover:text-purple-400 transition-colors">
                        <h3 className="text-sm font-bold text-slate-300 uppercase flex items-center gap-2"><Book size={16} className="text-yellow-500" /> Knowledge Base</h3>
                        {expandedKnowledge ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center"><Brain size={20} className="mx-auto text-purple-400 mb-1" /><div className="text-2xl font-bold text-white">{totalUnlockedQuestions}</div><div className="text-[10px] text-slate-500 uppercase">Unlocked Secrets</div></div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center"><Clock size={20} className="mx-auto text-blue-400 mb-1" /><div className="text-2xl font-bold text-white">{formatNumber(totalPlaytimeHours)}</div><div className="text-[10px] text-slate-500 uppercase">Hours Trained</div></div>
                    </div>
                    {expandedKnowledge && (
                        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 mb-4 animate-in slide-in-from-top-2">
                            <h4 className="text-xs font-bold text-white uppercase mb-3 flex items-center gap-2"><Info size={14} className="text-emerald-400"/> EXP Bonus Breakdown</h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-slate-400">Library Bonus</span><span className="text-emerald-400 font-bold">+{globalExpBonus}%</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Gear Bonus</span><span className="text-purple-400 font-bold">+{stats.skillExp.toFixed(1)}%</span></div>
                                <div className="h-px bg-slate-700 my-1"></div>
                                <div className="flex justify-between text-sm"><span className="text-white font-bold">Total Multiplier</span><span className="text-yellow-400 font-bold">+{totalSkillExpBonus}%</span></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Badges / Ranks */}
                <div>
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
                        <h3 className="text-sm font-bold text-slate-300 uppercase flex items-center gap-2"><Crown size={16} className="text-orange-500" /> Rank History</h3>
                        <button onClick={() => setShowExpTable(true)} className="text-[10px] text-purple-400 hover:text-white flex items-center gap-1">Full Table <TrendingUp size={12}/></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[1, 11, 31, 61, 101, 201, 401, 701, 1000].map((lvl) => {
                            const rName = getRankName(lvl);
                            const rColor = getRankColor(lvl);
                            const isReached = user.totalLevel >= lvl;
                            return <div key={lvl} className={`px-2 py-1 rounded text-[10px] border ${isReached ? rColor : 'border-slate-800 bg-slate-900 text-slate-700 opacity-50'}`}>{rName}</div>;
                        })}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
