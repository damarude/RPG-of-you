import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Item, ItemSlot, UserProfile, RarityType, DarkMerchantItem, ItemStats, ConsumableItem } from '../types';
import { 
  getRarityColor, formatNumber, getMaxEnhancementLevel, 
  getEnhancementCost, getEnhancementSuccessRate, getEnhancedStats, 
  RANKS, getRankName, getPatronRank, getPatronStats, PATRON_RANK_TITLES, getBlacksmithStoneCost, getEnhancementStoneCost, getConsumableImageUrl, getEquipmentItemImageUrl, getEquipmentAuraUrl, getEquipmentWorldPlusAuraUrl 
} from '../gameData';
import { 
  Backpack, Lock, Shirt, Coffee, Eye, Sparkles, Shield, Sword, Zap, 
  Download, RefreshCw, X, Coins, HelpCircle, Heart, Hammer, Activity, 
  Footprints, Target, Star, TrendingUp, Info, ChevronRight, ArrowUpRight, Crown,
  Shirt as ShirtIcon, Gavel, Clock, Package
} from 'lucide-react';
import { TemperingModal } from './TemperingModal';

interface StoreProps {
  user: UserProfile;
  shopItems: Item[]; 
  darkMerchantStock?: {
    date: string;
    items: DarkMerchantItem[];
    refreshCount?: number;
    badHaggleChance?: number;
  };
  consumablesData?: ConsumableItem[];
  installedNpcImages?: boolean;
  installedConsumableImages?: boolean;
  onDownloadShop: () => void; 
  onPurchase: (item: Item) => void;
  onEquip: (item: Item) => void;
  onBuyDarkMerchantItem?: (item: DarkMerchantItem) => void;
  onRefreshDarkMerchant?: () => void;
  onHaggle?: (item: DarkMerchantItem) => void;
  onEnchant?: (item: Item, success: boolean, cost: number) => void;
  onShowHelp?: () => void;
  onVisit?: () => void;
  onOpenInventory?: () => void;
}

export const Store: React.FC<StoreProps> = ({ 
  user, shopItems, darkMerchantStock, consumablesData, installedNpcImages, installedConsumableImages, onDownloadShop, onPurchase, 
  onEquip, onBuyDarkMerchantItem, onRefreshDarkMerchant, onHaggle, onEnchant, onShowHelp, onVisit, onOpenInventory 
}) => {
  const [mainTab, setMainTab] = useState<'Blacksmith' | 'Whitesmith' | 'Dark Merchant'>('Blacksmith');
  const [subTab, setSubTab] = useState<ItemSlot>(ItemSlot.HEAD);
  const [viewingItem, setViewingItem] = useState<any | null>(null);
  const [viewingMerchantItem, setViewingMerchantItem] = useState<DarkMerchantItem | null>(null);
  const [viewingItemImage, setViewingItemImage] = useState<Item | null>(null);
  const [isEnchanting, setIsEnchanting] = useState(false);
  const [temperingItem, setTemperingItem] = useState<Item | null>(null);
  const [rarityFilter, setRarityFilter] = useState<RarityType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'RARITY' | 'PRICE' | 'NAME'>('RARITY');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      const diff = nextMidnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const moodPulse = {
    scale: [1, 1.1, 1],
    transition: {
      duration: Math.max(0.2, 1.5 - (darkMerchantStock?.badHaggleChance || 0) * 2),
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  useEffect(() => {
      if (onVisit) onVisit();
  }, []);

  const getIcon = (iconName: string, size: number = 24) => {
    const icons: Record<string, React.ReactNode> = {
      'Hood': <Eye size={size} />,
      'Glasses': <Eye size={size} />,
      'Crown': <Sparkles size={size} />,
      'Shirt': <Shirt size={size} />,
      'Shield': <Shield size={size} />,
      'Ghost': <Sparkles size={size} />,
      'Coffee': <Coffee size={size} />,
      'Sword': <Sword size={size} />,
      'Keyboard': <Sword size={size} />,
      'Footprints': <Footprints size={size} />,
      'Zap': <Zap size={size} />,
      'Hammer': <Hammer size={size} />,
      'Sparkles': <Sparkles size={size} />,
      'Coins': <Coins size={size} />,
      'Target': <Target size={size} />,
      'Activity': <Activity size={size} />,
      'Heart': <Heart size={size} />,
    };
    return icons[iconName] || <Backpack size={size} />;
  };

  const renderItemIcon = (item: any, size: number = 24) => {
    const isConsumable = item.type === 'consumable' || item.isConsumable || item.durationStr || item.quantity !== undefined || item.itemId;
    if (isConsumable) {
      if (installedConsumableImages) {
        const url = getConsumableImageUrl(item.name);
        if (url) {
          return <img src={url} alt={item.name} style={{ width: size * 1.5, height: size * 1.5 }} className="object-contain drop-shadow-lg" />;
        }
      }
      return <Package size={size} />;
    }

    const equipmentUrl = item.name && item.rarity ? getEquipmentItemImageUrl(item.name, item.rarity) : null;
    
    if (equipmentUrl) {
      return (
        <>
          <img 
            src={equipmentUrl} 
            alt={item.name} 
            style={{ width: size * 1.5, height: size * 1.5 }} 
            className="object-contain drop-shadow-lg pixel-art"
            onError={(e) => {
              const target = e.target as HTMLElement;
              target.style.display = 'none';
              if (target.nextElementSibling) {
                (target.nextElementSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
          <div style={{ display: 'none' }} className="items-center justify-center">
            {getIcon(item.icon, size)}
          </div>
        </>
      );
    }

    return getIcon(item.icon, size);
  };

  const formatStat = (val: number, label: string, isPct: boolean = false) => {
      const formatted = Math.abs(val).toFixed(1);
      const sign = val >= 0 ? '+' : '';
      const suffix = isPct ? '%' : '';
      return `${sign}${formatted}${suffix} ${label}`;
  };

  const getRarityWeight = (rarity: string) => {
    const weights: Record<string, number> = {
      [RarityType.COMMON]: 1,
      [RarityType.UNCOMMON]: 2,
      [RarityType.RARE]: 3,
      [RarityType.EPIC]: 4,
      [RarityType.LEGENDARY]: 5,
      [RarityType.GOD]: 6,
      [RarityType.WORLD]: 7,
    };
    return weights[rarity] || 0;
  };

  const sortItems = (items: any[]) => {
    return [...items].sort((a, b) => {
      if (sortBy === 'RARITY') {
        const weightA = getRarityWeight(a.rarity);
        const weightB = getRarityWeight(b.rarity);
        if (weightA !== weightB) return weightA - weightB;
        // Secondary sort by cost
        return (a.cost || 0) - (b.cost || 0);
      }
      if (sortBy === 'PRICE') {
        const priceA = a.cost || a.price || 0;
        const priceB = b.cost || b.price || 0;
        return priceA - priceB; // Default to cheapest first? Or most expensive?
      }
      return a.name.localeCompare(b.name);
    });
  };

  const filteredItems = sortItems(
    shopItems
      .filter(item => item.slot === subTab)
      .filter(item => rarityFilter === 'ALL' || item.rarity === rarityFilter)
  );

  const merchantItems = sortItems(
    (darkMerchantStock?.items || [])
      .filter(item => rarityFilter === 'ALL' || item.rarity === rarityFilter)
  );

  const rankIndex = RANKS.indexOf(getRankName(user.totalLevel));
  const refreshCost = 500 + (rankIndex * 500);
  const canRefresh = user.gold >= refreshCost && (darkMerchantStock?.refreshCount || 0) < 1;

  const getSubStatValue = (item: Item, key: keyof typeof item.stats) => {
      return (item.stats[key] || 0) - (item.mainStats[key] || 0);
  };

  const hasSubStat = (item: Item, key: keyof typeof item.stats) => {
      return getSubStatValue(item, key) > 0.01;
  };

  const renderItemStats = (item: Item, enhanceLevel: number = 0, comparisonItem?: Item | null, comparisonEnhanceLevel: number = 0) => {
      const getEnhancedMainValue = (it: Item, k: keyof ItemStats, lvl: number) => {
          const baseMain = it.mainStats[k] || 0;
          return baseMain * (1 + 0.10 * lvl);
      };

      const getEnhancedSubValue = (it: Item, k: keyof ItemStats, lvl: number) => {
          const baseTotal = it.stats[k] || 0;
          const baseMain = it.mainStats[k] || 0;
          const baseSub = baseTotal - baseMain;
          return baseSub * (1 + 0.08 * lvl);
      };

      const getDynamicMainStatDesc = () => {
          const statLabels: Record<string, string> = {
              dmg: 'DMG',
              hp: 'HP',
              hpPct: 'HP%',
              critRate: 'Crit',
              goldBonus: 'Gold',
              attackSpeed: 'Spd',
              heal: 'Heal',
              block: 'Blk',
              stun: 'Stn',
              barrage: 'Brg',
              critDmg: 'CDmg',
              challengeCostReduction: 'Cost',
              undieableChance: 'Udy',
              streakProtectionChance: 'Strk',
              skillExpBonus: 'SExp'
          };

          for (const key in item.mainStats) {
              const baseMainVal = item.mainStats[key as keyof ItemStats];
              if (baseMainVal > 0) {
                  const val = getEnhancedMainValue(item, key as keyof ItemStats, enhanceLevel);
                  const label = statLabels[key] || key.toUpperCase();
                  const isPct = key.includes('Pct') || ['critRate', 'critDmg', 'goldBonus', 'attackSpeed', 'heal', 'block', 'stun', 'barrage', 'challengeCostReduction', 'undieableChance', 'streakProtectionChance', 'skillExpBonus'].includes(key);
                  const sign = val >= 0 ? '+' : '';
                  const suffix = isPct ? '%' : '';
                  return `${label} ${sign}${val.toFixed(1)}${suffix}`;
              }
          }
          return item.mainStatDesc;
      };

      const renderStatWithDiff = (key: keyof typeof item.stats, label: string, icon: React.ReactNode, isPct: boolean = false, colorClass: string, isNegativeGood: boolean = false) => {
          if (!hasSubStat(item, key)) return null;
          
          const val = getEnhancedSubValue(item, key, enhanceLevel);
          const compVal = comparisonItem ? getEnhancedSubValue(comparisonItem, key, comparisonEnhanceLevel) : 0;
          const diff = val - compVal;
          
          let diffColor = 'text-slate-500';
          if (diff > 0.01) diffColor = isNegativeGood ? 'text-red-400' : 'text-emerald-400';
          else if (diff < -0.01) diffColor = isNegativeGood ? 'text-emerald-400' : 'text-red-400';

          const showDiff = comparisonItem && Math.abs(diff) > 0.01;

          const getColorClasses = (color: string) => {
              const colors: Record<string, string> = {
                  'red': 'bg-red-500/10 border-red-500/20 text-red-400',
                  'green': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                  'pink': 'bg-pink-500/10 border-pink-500/20 text-pink-400',
                  'yellow': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
                  'blue': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                  'emerald': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                  'cyan': 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
                  'purple': 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                  'orange': 'bg-orange-500/10 border-orange-500/20 text-orange-400',
                  'amber': 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                  'indigo': 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
              };
              return colors[color] || 'bg-slate-500/10 border-slate-500/20 text-slate-400';
          };

          return (
              <div className={`${getColorClasses(colorClass)} p-1.5 rounded-lg border text-[9px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all hover:bg-opacity-20`}>
                  <div className="flex items-center gap-1">
                      {icon} {formatStat(val, label, isPct)}
                  </div>
                  {showDiff && (
                      <div className={`text-[8px] font-mono ${diffColor}`}>
                          {diff > 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}{isPct ? '%' : ''}
                      </div>
                  )}
              </div>
          );
      };

      return (
          <div className="space-y-2 mb-4">
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-0.5">Primary Attribute</p>
                  <div className="text-base font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                      {getDynamicMainStatDesc()}
                  </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                  {renderStatWithDiff('dmg', 'DMG', <Sword size={8}/>, false, 'red')}
                  {renderStatWithDiff('hp', 'HP', <Heart size={8}/>, false, 'green')}
                  {renderStatWithDiff('hpPct', 'HP%', <Heart size={8}/>, true, 'pink')}
                  {renderStatWithDiff('critRate', 'Crit', <Target size={8}/>, true, 'red')}
                  {renderStatWithDiff('goldBonus', 'Gold', <Coins size={8}/>, true, 'yellow')}
                  {renderStatWithDiff('attackSpeed', 'Spd', <Zap size={8}/>, true, 'blue')}
                  {renderStatWithDiff('heal', 'Heal', <Activity size={8}/>, true, 'emerald')}
                  {renderStatWithDiff('block', 'Blk', <Shield size={8}/>, true, 'blue')}
                  {renderStatWithDiff('stun', 'Stn', <Zap size={8}/>, true, 'cyan')}
                  {renderStatWithDiff('barrage', 'Brg', <Zap size={8}/>, true, 'purple')}
                  {renderStatWithDiff('critDmg', 'CDmg', <Target size={8}/>, true, 'orange')}
                  {renderStatWithDiff('challengeCostReduction', 'Cost', <Activity size={8}/>, true, 'emerald', true)}
                  {renderStatWithDiff('undieableChance', 'Udy', <Shield size={8}/>, true, 'amber')}
                  {renderStatWithDiff('streakProtectionChance', 'Strk', <Shield size={8}/>, true, 'indigo')}
                  {renderStatWithDiff('skillExpBonus', 'SExp', <Star size={8}/>, true, 'yellow')}
              </div>
          </div>
      );
  };

  const renderNpcBackground = () => {
    if (!installedNpcImages) return null;

    const backgrounds = {
      'Blacksmith': {
        url: 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/NPCimages/BlackSmith.png',
        animation: { y: [0, -3, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
        objectPosition: 'object-[70%_top]'
      },
      'Whitesmith': {
        url: 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/NPCimages/WhiteSmith.png',
        animation: { scale: [1, 1.01, 1], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" } },
        objectPosition: 'object-right'
      },
      'Dark Merchant': {
        url: 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/NPCimages/DarkMerchant.png',
        animation: { opacity: [0.85, 1, 0.85], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
        objectPosition: 'object-right'
      }
    };

    const currentBg = backgrounds[mainTab];

    return (
      <div className="absolute -inset-x-0 -top-2 bottom-0 z-0 pointer-events-none overflow-hidden rounded-b-3xl border-b border-slate-800/50 shadow-2xl">
        <motion.img 
          src={currentBg.url} 
          alt={`${mainTab} NPC`}
          className={`absolute top-0 right-0 w-full h-full object-cover ${currentBg.objectPosition} opacity-100`}
          style={{ transformOrigin: 'right center' }}
          animate={currentBg.animation as any}
          referrerPolicy="no-referrer"
        />
        {/* 10% overall dark overlay */}
        <div className="absolute inset-0 bg-slate-950/10 z-10"></div>
        {/* Gradient only on the far left for the title readability */}
        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-slate-950/80 via-slate-950/20 to-transparent z-10"></div>
        {/* Gradient only at the very bottom for the tabs readability */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent z-10"></div>
      </div>
    );
  };

  const renderConsumableDetailModal = (item: DarkMerchantItem) => {
      const isActive = user.activeBuffs && user.activeBuffs[item.itemId] > Date.now();
      const canAfford = user.gold >= item.price;
      const rarityColor = getRarityColor(item.rarity as any);
      const borderColor = rarityColor.split(' ').find(c => c.startsWith('border-')) || 'border-slate-700';
      const newData = consumablesData?.find(c => c.id === item.itemId);

      const renderBuffDetails = () => {
          if (!newData) return null;
          
          const buffs = [
              { key: 'receiveStone', label: 'Philosopher Stones', icon: <Sparkles size={14}/>, min: newData.receiveStoneMin, max: newData.receiveStoneMax },
              { key: 'flatExp', label: 'Flat EXP', icon: <Star size={14}/>, min: newData.flatExpGainMin, max: newData.flatExpGainMax },
              { key: 'patronGain', label: 'Patron Gain', icon: <Crown size={14}/>, min: newData.patronGainMin, max: newData.patronGainMax },
              { key: 'dmg', label: 'Damage', icon: <Sword size={14}/>, min: newData.dmgMin, max: newData.dmgMax },
              { key: 'flatHp', label: 'Max HP', icon: <Heart size={14}/>, min: newData.flatHpMin, max: newData.flatHpMax },
              { key: 'percentileHp', label: 'Max HP %', icon: <Heart size={14}/>, min: newData.percentileHpMin, max: newData.percentileHpMax },
              { key: 'heal', label: 'Heal', icon: <Activity size={14}/>, min: newData.healMin, max: newData.healMax },
              { key: 'gold', label: 'Gold Multiplier', icon: <Coins size={14}/>, min: newData.goldMin, max: newData.goldMax },
              { key: 'block', label: 'Block Chance', icon: <Shield size={14}/>, min: newData.blockMin, max: newData.blockMax },
              { key: 'aspd', label: 'Attack Speed', icon: <Zap size={14}/>, min: newData.aspdMin, max: newData.aspdMax },
              { key: 'critRate', label: 'Crit Rate', icon: <Target size={14}/>, min: newData.critRateMin, max: newData.critRateMax },
              { key: 'critDmg', label: 'Crit Damage', icon: <Zap size={14}/>, min: newData.critDmgMin, max: newData.critDmgMax },
              { key: 'stun', label: 'Stun Chance', icon: <HelpCircle size={14}/>, min: newData.stunMin, max: newData.stunMax },
              { key: 'barrage', label: 'Barrage Chance', icon: <Footprints size={14}/>, min: newData.barrageMin, max: newData.barrageMax },
              { key: 'skillExp', label: 'Skill EXP Multiplier', icon: <TrendingUp size={14}/>, min: newData.skillExpMin, max: newData.skillExpMax },
              { key: 'cReduction', label: 'Cost Reduction', icon: <Coins size={14}/>, min: newData.cReductionMin, max: newData.cReductionMax },
              { key: 'streakSave', label: 'Streak Protection', icon: <Shield size={14}/>, min: newData.streakSaveMin, max: newData.streakSaveMax },
              { key: 'undying', label: 'Undying Chance', icon: <Heart size={14}/>, min: newData.undyingMin, max: newData.undyingMax },
          ];

          const activeBuffs = buffs.filter(b => b.min !== 0 || b.max !== 0);

          if (activeBuffs.length === 0 && !newData.freeChallenge) return null;

          const rankIndex = RANKS.indexOf(getRankName(user.totalLevel));
          const maxRank = RANKS.length - 1;
          const rankFactor = rankIndex / maxRank;
          const lerp = (min: number, max: number) => min + (max - min) * rankFactor;

          return (
              <div className="w-full mb-6">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 text-left">Buff Effects</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {newData.freeChallenge && (
                          <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-3 flex items-center gap-3">
                              <div className="p-2 bg-emerald-900/50 rounded-lg text-emerald-400">
                                  <Coins size={16} />
                              </div>
                              <div className="text-left">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Free Challenge</p>
                                  <p className="text-emerald-400 font-black text-sm">Active</p>
                              </div>
                          </div>
                      )}
                      {activeBuffs.map((buff, idx) => {
                          const isActive = user.activeBuffs && user.activeBuffs[newData.id] > Date.now();
                          const stacks = isActive ? (user.activeBuffStacks?.[newData.id] || 1) : 1;
                          const baseVal = lerp(buff.min, buff.max);
                          const val = baseVal * stacks;
                          const displayVal = val % 1 === 0 ? val : val.toFixed(1);
                          const isNegative = val < 0;
                          return (
                              <div key={idx} className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3 ${isNegative ? 'border-red-900/50 bg-red-900/10' : ''}`}>
                                  <div className={`p-2 rounded-lg ${isNegative ? 'bg-red-900/50 text-red-400' : 'bg-slate-900/50 text-slate-300'}`}>
                                      {buff.icon}
                                  </div>
                                  <div className="text-left">
                                      <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[100px]" title={buff.label}>{buff.label}</p>
                                      <p className={`font-black text-sm ${isNegative ? 'text-red-400' : 'text-white'}`}>
                                          {isNegative ? '' : '+'}{displayVal}
                                          {['percentileHp', 'gold', 'block', 'critRate', 'critDmg', 'stun', 'barrage', 'skillExp', 'cReduction', 'streakSave', 'undying'].includes(buff.key) ? '%' : ''}
                                      </p>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          );
      };

      return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4" 
            onClick={() => setViewingMerchantItem(null)}
          >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`bg-slate-900 border-2 ${borderColor} rounded-3xl w-full max-w-xl relative shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden max-h-[90vh]`}
                onClick={(e) => e.stopPropagation()}
              >
                  <button 
                    onClick={() => setViewingMerchantItem(null)}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all z-50"
                  >
                      <X size={18} />
                  </button>

                  <div className="p-8 text-center overflow-y-auto custom-scrollbar">
                      <div className="relative inline-block mb-6 shrink-0">
                          <div className={`absolute inset-0 blur-3xl opacity-20 bg-${rarityColor.split('-')[1]}-500 animate-pulse`}></div>
                          <div className={`w-24 h-24 mx-auto rounded-3xl border-2 ${borderColor} bg-slate-800/50 flex items-center justify-center shadow-2xl text-white relative z-10`}>
                              {renderItemIcon(item, 48)}
                          </div>
                      </div>

                      <div className="space-y-2 mb-8">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${rarityColor}`}>
                              {item.rarity} • Consumable
                          </span>
                          <h2 className="text-2xl font-black text-white leading-tight tracking-tighter uppercase italic">{item.name}</h2>
                          {isActive && (
                            <div className="flex justify-center">
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 uppercase tracking-widest">
                                <Activity size={10} className="animate-pulse" /> Currently Active
                              </span>
                            </div>
                          )}
                      </div>

                      <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50 text-xs text-slate-400 italic leading-relaxed mb-8">
                          "{item.description}"
                      </div>

                      {renderBuffDetails()}

                      <button
                          onClick={() => { onBuyDarkMerchantItem && onBuyDarkMerchantItem(item); setViewingMerchantItem(null); }}
                          disabled={!canAfford || item.quantity <= 0}
                          className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shrink-0 ${canAfford && item.quantity > 0 ? 'bg-red-800 hover:bg-red-700 text-white shadow-red-900/40' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                      >
                          {item.quantity <= 0 ? (
                              <>
                                <Lock size={16} />
                                Sold Out
                              </>
                          ) : canAfford ? (
                              <>
                                <Coins size={16} />
                                Purchase for {formatNumber(item.price)} G
                              </>
                          ) : (
                              <>
                                <Lock size={16} />
                                {formatNumber(item.price)} G (Locked)
                              </>
                          )}
                      </button>
                  </div>
              </motion.div>
          </motion.div>
      );
  };

  const renderDetailModal = (item: Item) => {
      const isOwned = user.inventory.includes(item.id);
      const isEquipped = user.equipped[item.slot] === item.id;
      const stoneCost = getBlacksmithStoneCost(item.rarity);
      const canAffordGold = user.gold >= item.cost;
      const canAffordStones = (user.currencies?.philosopherStones || 0) >= stoneCost;
      const canAfford = canAffordGold && canAffordStones;
      const rarityColor = getRarityColor(item.rarity);
      const borderColor = rarityColor.split(' ').find(c => c.startsWith('border-')) || 'border-slate-700';

      const currentlyEquippedId = user.equipped[item.slot];
      const currentlyEquipped = currentlyEquippedId ? shopItems.find(i => i.id === currentlyEquippedId) : null;

      return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4" 
            onClick={() => setViewingItem(null)}
          >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`bg-slate-900 border-2 ${borderColor} rounded-3xl w-full max-w-2xl relative shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
              >
                  <div className={`h-1 w-full bg-gradient-to-r from-transparent via-${borderColor.split('-')[1]}-500 to-transparent opacity-50`}></div>

                  <button 
                    onClick={() => setViewingItem(null)}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all z-50"
                  >
                      <X size={18} />
                  </button>

                  <div className="flex flex-col md:flex-row h-full overflow-y-auto no-scrollbar">
                      <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-800/50 flex flex-col">
                          <div className="text-center mb-4">
                              <div className="relative inline-block mb-4">
                                  <div className={`absolute inset-0 blur-2xl opacity-20 bg-${rarityColor.split('-')[1]}-500 animate-pulse`}></div>
                                  <div 
                                      onClick={() => setViewingItemImage(item)}
                                      className={`w-20 h-20 mx-auto rounded-2xl border-2 ${borderColor} bg-slate-800/50 flex items-center justify-center shadow-2xl text-white relative z-10 cursor-pointer group`}
                                  >
                                      {renderItemIcon(item, 40)}
                                      {isOwned && (user.equipmentEnhancements?.[item.id] || 0) > 0 && (
                                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg border-2 border-slate-900 shadow-xl">
                                              +{(user.equipmentEnhancements?.[item.id] || 0)}
                                          </div>
                                      )}
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity duration-300">
                                          <Eye size={24} className="text-white drop-shadow-md" />
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="space-y-1">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${rarityColor}`}>
                                    {item.rarity} • {item.slot}
                                </span>
                                <h2 className="text-xl font-black text-white leading-tight tracking-tighter uppercase italic">{item.name}</h2>
                                {isEquipped && (
                                  <div className="flex justify-center">
                                    <span className="text-[9px] font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 flex items-center gap-1 uppercase tracking-widest">
                                      <Star size={8} fill="currentColor" /> Equipped
                                    </span>
                                  </div>
                                )}
                              </div>
                          </div>
                          
                          {renderItemStats(item, isOwned ? (user.equipmentEnhancements?.[item.id] || 0) : 0, currentlyEquipped, currentlyEquipped ? (user.equipmentEnhancements?.[currentlyEquipped.id] || 0) : 0)}
                          
                          <div className="mt-auto space-y-4">
                            <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50 text-[10px] text-slate-400 italic leading-relaxed relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-slate-700"></div>
                                "{item.description}"
                            </div>
                            
                            {isOwned ? (
                                <button 
                                    onClick={() => { onEquip(item); setViewingItem(null); }}
                                    disabled={isEquipped}
                                    className={`w-full py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all flex items-center justify-center gap-2 ${isEquipped ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40 hover:scale-[1.02] active:scale-95'}`}
                                >
                                    {isEquipped ? <Lock size={12} /> : <ArrowUpRight size={12} />}
                                    {isEquipped ? 'Equipped' : 'Equip Gear'}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => { onPurchase(item); setViewingItem(null); }}
                                    disabled={!canAfford}
                                    className={`w-full py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-95 ${canAfford ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-yellow-900/40' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {canAfford ? (
                                            <>
                                              <Coins size={14} />
                                              Purchase for {formatNumber(item.cost)} G
                                            </>
                                        ) : (
                                            <>
                                              <Lock size={14} />
                                              {formatNumber(item.cost)} G (Locked)
                                            </>
                                        )}
                                    </div>
                                    {stoneCost > 0 && (
                                        <div className={`flex items-center gap-1 text-[8px] font-bold ${canAffordStones ? 'text-purple-600' : 'text-red-600'}`}>
                                            <Sparkles size={10} /> + {stoneCost} Philosopher Stones
                                        </div>
                                    )}
                                </button>
                            )}
                          </div>
                      </div>

                      {currentlyEquipped && !isEquipped && (
                          <div className="flex-1 p-6 bg-slate-950/30 flex flex-col">
                              <div className="text-center mb-4">
                                  <h3 className="text-slate-600 font-black uppercase text-[9px] tracking-[0.3em] mb-4">Current Gear</h3>
                                  <div className={`w-16 h-16 mx-auto rounded-2xl border ${getRarityColor(currentlyEquipped.rarity).split(' ').find(c => c.startsWith('border-')) || 'border-slate-800'} bg-slate-900/50 flex items-center justify-center mb-3 text-slate-500 relative opacity-60`}>
                                      {renderItemIcon(currentlyEquipped, 32)}
                                      {(user.equipmentEnhancements?.[currentlyEquipped.id] || 0) > 0 && (
                                          <div className="absolute -top-1.5 -right-1.5 bg-slate-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md border border-slate-900">
                                              +{(user.equipmentEnhancements?.[currentlyEquipped.id] || 0)}
                                          </div>
                                      )}
                                  </div>
                                  <h2 className="text-base font-black text-slate-400 leading-tight tracking-tight uppercase italic">{currentlyEquipped.name}</h2>
                              </div>
                              
                              <div className="opacity-50 grayscale hover:grayscale-0 transition-all">
                                  {renderItemStats(currentlyEquipped, user.equipmentEnhancements?.[currentlyEquipped.id] || 0)}
                              </div>

                              <div className="mt-auto pt-4 border-t border-slate-800/50 text-center">
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Equipped in {item.slot}</p>
                              </div>
                          </div>
                      )}
                  </div>
              </motion.div>
          </motion.div>
      );
  };

  const renderEquipmentImageModal = (item: Item) => {
    const rarityColor = getRarityColor(item.rarity);
    const borderColor = rarityColor.split(' ').find(c => c.startsWith('border-')) || 'border-slate-700';
    const bgColor = rarityColor.split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-800';
    
    const itemImageUrl = getEquipmentItemImageUrl(item.name, item.rarity);
    const auraUrl = getEquipmentAuraUrl(item.rarity);
    const worldPlusAuraUrl = item.rarity === RarityType.WORLD ? getEquipmentWorldPlusAuraUrl() : null;

    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[120] p-4" 
          onClick={() => setViewingItemImage(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`border-4 ${borderColor} ${bgColor} rounded-3xl p-8 relative flex flex-col items-center justify-center max-w-2xl w-full aspect-square shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setViewingItemImage(null)}
              className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-white/20 rounded-full text-slate-200 hover:text-white transition-colors z-50 backdrop-blur-sm"
            >
              <X size={24} />
            </button>

            {/* Aura Backgrounds */}
            {auraUrl && (
              <img src={auraUrl} alt="Aura" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen scale-150 animate-pulse" />
            )}
            {worldPlusAuraUrl && (
              <img src={worldPlusAuraUrl} alt="World Aura" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen scale-125" style={{ animation: 'spin 20s linear infinite' }} />
            )}

            {/* Item Image */}
            <div className="relative z-10 w-3/4 h-3/4 flex items-center justify-center drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]">
              <img 
                src={itemImageUrl} 
                alt={item.name} 
                className="w-full h-full object-contain hover:scale-110 transition-transform duration-500 pixel-art"
                onError={(e) => {
                  // Fallback to icon if image fails
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div class="flex items-center justify-center w-full h-full text-white opacity-50"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>`;
                }}
              />
            </div>
            
            <div className="absolute font-black bottom-8 left-0 right-0 text-center z-20">
              <h2 className="text-3xl text-white tracking-tighter uppercase italic drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] px-4">{item.name}</h2>
              <span className={`inline-block mt-2 px-4 py-1 rounded-full text-xs uppercase tracking-widest border border-current bg-black/50 backdrop-blur-md ${rarityColor}`}>
                {item.rarity}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (shopItems.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border-2 border-slate-800 shadow-2xl relative"
              >
                  <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full"></div>
                  <Backpack size={48} className="text-slate-700 relative z-10" />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase italic">Merchant is Away</h2>
              <p className="text-slate-500 max-w-xs mb-8 leading-relaxed text-xs font-medium">
                  The grand archives are currently being updated. Please wait while we retrieve the latest artifacts.
              </p>
              <button 
                onClick={onDownloadShop}
                className="group relative bg-purple-600 hover:bg-purple-500 text-white font-black py-3 px-8 rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.3)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95 overflow-hidden"
              >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Download size={18} /> 
                  <span className="uppercase tracking-[0.2em] text-[10px]">Download Catalog</span>
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -mx-2 px-2 -mt-2 pt-2 bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30 overflow-hidden">
      <AnimatePresence mode="wait">
        {viewingItem && renderDetailModal(viewingItem)}
        {viewingItemImage && renderEquipmentImageModal(viewingItemImage)}
        {viewingMerchantItem && renderConsumableDetailModal(viewingMerchantItem)}
        {temperingItem && (
          <TemperingModal 
            item={temperingItem} 
            user={user} 
            onClose={() => setTemperingItem(null)} 
            onEnhance={(item, success, cost) => {
              if (onEnchant) onEnchant(item, success, cost);
            }} 
          />
        )}
      </AnimatePresence>

      {/* Main Shop Header */}
      <div className="flex-none z-20 mb-2 relative pt-24 sm:pt-32">
        {renderNpcBackground()}
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex-shrink-0"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-lg ${
                  mainTab === 'Blacksmith' ? 'bg-purple-500 shadow-purple-500/50' : 
                  mainTab === 'Whitesmith' ? 'bg-orange-500 shadow-orange-500/50' : 
                  'bg-red-500 shadow-red-500/50'
                }`}></div>
                <h2 className="text-lg font-black tracking-tighter uppercase italic text-white flex items-center gap-1.5">
                  {mainTab === 'Blacksmith' && <Hammer size={16} className="text-purple-400" />}
                  {mainTab === 'Whitesmith' && <Sparkles size={16} className="text-orange-400" />}
                  {mainTab === 'Dark Merchant' && <Lock size={16} className="text-red-500" />}
                  <span className="hidden sm:inline">{mainTab}</span>
                  <span className="sm:hidden">{mainTab.split(' ')[0]}</span>
                </h2>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-1.5 overflow-hidden"
            >
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/50 px-2 py-1 rounded-lg flex items-center gap-2 shadow-xl">
                   <div className="flex items-center gap-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]"></div>
                     <span className="font-mono font-black text-yellow-500 text-xs leading-none">{formatNumber(user.gold)}</span>
                   </div>
                   <div className="w-px h-4 bg-slate-800"></div>
                   <div className="flex items-center gap-1">
                     <Sparkles size={10} className="text-purple-400" />
                     <span className="font-mono font-black text-purple-400 text-xs leading-none">{user.currencies?.philosopherStones || 0}</span>
                   </div>
                </div>
                
                <button 
                  onClick={onOpenInventory}
                  className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-90 shadow-xl group"
                  title="Inventory"
                >
                  <Backpack size={16} className="group-hover:scale-110 transition-transform" />
                </button>
            </motion.div>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex gap-1 p-0.5 bg-slate-900/40 backdrop-blur-sm rounded-lg border border-slate-800/50 mb-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'Blacksmith', icon: <Sword size={12} />, color: 'purple' },
              { id: 'Whitesmith', icon: <Hammer size={12} />, color: 'orange' },
              { id: 'Dark Merchant', icon: <Lock size={12} />, color: 'red' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id as any)}
                className={`flex-1 min-w-[80px] py-1.5 px-2 rounded-md font-black text-[9px] uppercase tracking-tighter transition-all flex items-center justify-center gap-1.5 relative overflow-hidden group ${
                  mainTab === tab.id 
                    ? `bg-${tab.color === 'red' ? 'red-900' : tab.color + '-600'} text-white shadow-lg shadow-${tab.color}-900/40` 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {mainTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab.icon} <span className="truncate">{tab.id}</span>
              </button>
            ))}
          </div>

          {/* Rarity Filter & Sorting */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              {['ALL', ...Object.values(RarityType)].map(rarity => (
                <button
                  key={rarity}
                  onClick={() => setRarityFilter(rarity as any)}
                  className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter transition-all border whitespace-nowrap flex items-center gap-1 ${
                    rarityFilter === rarity 
                      ? 'bg-slate-200 text-slate-950 border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                      : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {rarity !== 'ALL' && <div className={`w-1 h-1 rounded-full ${getRarityColor(rarity as any).split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-500'}`}></div>}
                  {rarity}
                </button>
              ))}
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${showSortMenu ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <ArrowUpRight size={14} className={sortBy === 'PRICE' ? 'rotate-45' : ''} />
                <span className="text-[9px] font-black uppercase tracking-tighter hidden xs:inline">{sortBy}</span>
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-1 overflow-hidden"
                  >
                    {[
                      { id: 'RARITY', label: 'By Rarity', icon: <Star size={10} /> },
                      { id: 'PRICE', label: 'By Price', icon: <Coins size={10} /> },
                      { id: 'NAME', label: 'By Name', icon: <Info size={10} /> }
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => { setSortBy(option.id as any); setShowSortMenu(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                          sortBy === option.id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {option.icon} {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sub Tabs for Blacksmith */}
          <AnimatePresence mode="wait">
            {mainTab === 'Blacksmith' && (
              <motion.div 
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -5, opacity: 0 }}
                className="flex gap-1 overflow-x-auto pb-1 no-scrollbar border-t border-slate-900 pt-2"
              >
                {Object.values(ItemSlot).filter(s => s !== ItemSlot.BACKGROUND).map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSubTab(slot)}
                    className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter transition-all border whitespace-nowrap ${
                      subTab === slot 
                        ? 'bg-white text-slate-950 border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                        : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 relative z-10">
        {/* BLACKSMITH VIEW */}
        {mainTab === 'Blacksmith' && (
          <motion.div 
            key={subTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"
          >
            {filteredItems.map(item => {
              const isOwned = user.inventory.includes(item.id);
              const isEquipped = user.equipped[item.slot] === item.id;
              const stoneCost = getBlacksmithStoneCost(item.rarity);
              const canAffordGold = user.gold >= item.cost;
              const canAffordStones = (user.currencies?.philosopherStones || 0) >= stoneCost;
              const canAfford = canAffordGold && canAffordStones;
              const rarityColor = getRarityColor(item.rarity);
              const rarityBaseColor = rarityColor.split('-')[1];

              return (
                <motion.div 
                  key={item.id} 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewingItem(item)}
                  className={`group relative backdrop-blur-md border-2 rounded-2xl overflow-hidden transition-all cursor-pointer shadow-lg ${
                    isEquipped 
                      ? 'border-yellow-500 bg-yellow-500/10 ring-4 ring-yellow-500/10' 
                      : 'border-slate-800/80 hover:border-slate-600 bg-slate-900/60'
                  }`}
                >
                  {/* Enhanced Rarity Background Glow */}
                  <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none bg-gradient-to-br ${
                    item.rarity === RarityType.COMMON ? 'from-slate-500 via-slate-800 to-transparent' :
                    item.rarity === RarityType.UNCOMMON ? 'from-emerald-500 via-emerald-900 to-transparent' :
                    item.rarity === RarityType.RARE ? 'from-blue-500 via-blue-900 to-transparent' :
                    item.rarity === RarityType.EPIC ? 'from-purple-500 via-purple-900 to-transparent' :
                    item.rarity === RarityType.LEGENDARY ? 'from-orange-500 via-orange-900 to-transparent' :
                    item.rarity === RarityType.GOD ? 'from-red-600 via-red-950 to-transparent' :
                    'from-cyan-400 via-white/20 via-purple-600 to-indigo-900'
                  }`}></div>
                  
                  {/* Animated Shine Effect for High Rarities */}
                  {(item.rarity === RarityType.LEGENDARY || item.rarity === RarityType.GOD || item.rarity === RarityType.WORLD) && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <motion.div 
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear', delay: Math.random() * 2 }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                      />
                    </div>
                  )}

                  <div className={`absolute -inset-12 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none blur-2xl bg-${rarityBaseColor}-500`}></div>
                  
                  <div className="p-3 relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all group-hover:scale-110 group-hover:rotate-3 ${
                        isOwned ? `bg-slate-800 border-${rarityBaseColor}-500/50 text-white shadow-[0_0_15px_rgba(0,0,0,0.3)]` : 'bg-slate-950 border-slate-900 text-slate-700'
                      }`}>
                        {renderItemIcon(item, 20)}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[7px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border shadow-sm ${rarityColor}`}>
                          {item.rarity}
                        </span>
                        {isEquipped && (
                          <span className="text-[6px] font-black uppercase tracking-widest bg-yellow-500 text-slate-950 px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-900/40">
                            <Star size={6} fill="currentColor" /> Equipped
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-black text-white text-[11px] mb-1 group-hover:text-purple-300 transition-colors tracking-tighter uppercase italic truncate drop-shadow-sm">{item.name}</h3>
                    
                    <div className="space-y-1.5 mb-3">
                      <div className="text-[8px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20 flex justify-between items-center group-hover:bg-cyan-500/20 transition-all">
                        <span className="uppercase opacity-60 tracking-widest text-[6px]">Primary</span>
                        <span className="tracking-tighter font-mono">{item.mainStatDesc}</span>
                      </div>
                    </div>

                    <div className="flex flex-col pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]"></div>
                          <span className="font-mono font-black text-yellow-500 text-[10px] tracking-tight">{formatNumber(item.cost)}</span>
                        </div>
                        
                        {isOwned ? (
                          <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded-full">Owned</div>
                        ) : (
                          <div className={`text-[7px] font-black uppercase tracking-widest flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors ${canAfford ? 'bg-purple-500/20 text-purple-400' : 'bg-rose-500/10 text-rose-500'}`}>
                            {canAfford ? <ChevronRight size={8} /> : <Lock size={8} />}
                            {canAfford ? 'Buy' : 'Locked'}
                          </div>
                        )}
                      </div>
                      {stoneCost > 0 && !isOwned && (
                        <div className={`flex items-center gap-1 text-[8px] font-bold ${canAffordStones ? 'text-purple-400' : 'text-red-400'}`}>
                          <Sparkles size={10} /> + {stoneCost} Stones
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* WHITESMITH VIEW */}
        {mainTab === 'Whitesmith' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="relative overflow-hidden bg-orange-950/10 border border-orange-500/20 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[40px] rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                  <Hammer size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase italic text-orange-100 tracking-tighter">Mystic Forge</h3>
                  <p className="text-[8px] text-slate-500 max-w-[180px] font-medium leading-tight">Infuse gear with Philosopher Stones for power.</p>
                </div>
              </div>

              <div className="relative z-10 flex gap-1.5">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-lg text-center min-w-[70px] shadow-xl">
                  <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Status</p>
                  <p className="text-[10px] font-mono font-black text-emerald-500 uppercase">Optimal</p>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-lg text-center min-w-[70px] shadow-xl">
                  <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Purity</p>
                  <p className="text-[10px] font-mono font-black text-purple-400">99%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(user.equipped).map(([slot, id]) => {
                const itemId = id as string;
                if (!itemId) return null;
                const item = shopItems.find(i => i.id === itemId);
                if (!item) return null;
                
                const currentEnhancement = user.equipmentEnhancements?.[itemId] || 0;
                const maxEnhancement = getMaxEnhancementLevel(item.rarity);
                const isMaxed = currentEnhancement >= maxEnhancement;
                const cost = getEnhancementCost(item.cost, currentEnhancement);
                const successRate = getEnhancementSuccessRate(currentEnhancement, maxEnhancement);
                const stoneCost = getEnhancementStoneCost(item.rarity);
                const canAffordGold = user.gold >= cost;
                const hasStone = (user.currencies?.philosopherStones || 0) >= stoneCost;
                const canEnhance = canAffordGold && hasStone && !isMaxed;
                
                return (
                  <motion.div 
                    key={itemId} 
                    whileHover={{ scale: 1.005 }}
                    onClick={() => setViewingItem(item)}
                    className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-xl p-3 flex flex-col group hover:border-orange-500/30 transition-all shadow-xl cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-orange-400 transition-colors shadow-inner">
                          {renderItemIcon(item, 20)}
                        </div>
                        <div>
                          <h4 className="font-black text-white text-xs leading-none tracking-tighter uppercase italic mb-1">{item.name}</h4>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[7px] font-black uppercase text-slate-600 tracking-tighter">{slot}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: maxEnhancement }).map((_, i) => (
                                <div key={i} className={`w-1 h-1 rounded-full transition-all duration-500 ${i < currentEnhancement ? 'bg-orange-500 shadow-[0_0_6px_#f97316]' : 'bg-slate-800'}`}></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[6px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Rank</p>
                        <p className="text-xl font-mono font-black text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.3)]">+{currentEnhancement}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      <div className="bg-slate-950/80 border border-slate-800/50 p-2 rounded-xl shadow-inner">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[6px] font-black text-slate-600 uppercase tracking-widest">Gold Cost</p>
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_4px_#eab308]"></div>
                        </div>
                        <span className={`font-mono font-black text-sm ${canAffordGold ? 'text-yellow-500' : 'text-rose-500'}`}>{formatNumber(cost)}</span>
                      </div>
                      
                      <div className="bg-slate-950/80 border border-slate-800/50 p-2.5 rounded-xl shadow-inner space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Success Rate</p>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-1.5 h-3 rounded-full transition-all duration-500 ${i < Math.ceil(successRate * 5) ? (successRate > 0.7 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : successRate > 0.4 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]') : 'bg-slate-800'}`}></div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp size={12} className={successRate > 0.7 ? 'text-emerald-500' : successRate > 0.4 ? 'text-yellow-500' : 'text-rose-500'} />
                            <span className={`font-mono font-black text-base ${successRate > 0.7 ? 'text-emerald-500' : successRate > 0.4 ? 'text-yellow-500' : 'text-rose-500'}`}>{(successRate * 100).toFixed(0)}%</span>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-tighter ${successRate > 0.7 ? 'text-emerald-500' : successRate > 0.4 ? 'text-yellow-500' : 'text-rose-500'}`}>
                            {successRate > 0.7 ? 'High' : successRate > 0.4 ? 'Moderate' : 'Risky'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${successRate * 100}%` }}
                            className={`h-full transition-all duration-1000 ${successRate > 0.7 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : successRate > 0.4 ? 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Main Stat Upgrade Preview */}
                    {!isMaxed && (
                      <div className="bg-slate-950/40 border border-slate-800/30 rounded-xl p-2 mb-3">
                        <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Upgrade Preview</p>
                        <div className="space-y-1">
                          {Object.entries(item.mainStats).map(([key, val]) => {
                            if ((val as number) <= 0) return null;
                            const currentVal = Math.floor(getEnhancedStats(item.stats, item.mainStats, currentEnhancement)[key as keyof typeof item.stats]);
                            const nextVal = Math.floor(getEnhancedStats(item.stats, item.mainStats, currentEnhancement + 1)[key as keyof typeof item.stats]);
                            const diff = nextVal - currentVal;
                            return (
                              <div key={key} className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-400 capitalize">{key}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-300 font-bold">{currentVal}</span>
                                  <ChevronRight size={8} className="text-slate-600" />
                                  <span className="text-orange-400 font-bold">{nextVal}</span>
                                  <span className="text-[8px] text-emerald-500 font-black">+{diff}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto">
                      {isMaxed ? (
                        <div className="w-full py-2 rounded-lg bg-slate-800/30 text-slate-600 text-[8px] font-black uppercase tracking-widest text-center border border-slate-800/50">
                          Max Power
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                              e.stopPropagation();
                              setTemperingItem(item);
                          }}
                          disabled={!canEnhance || isEnchanting}
                          className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 transition-all active:scale-95 relative overflow-hidden ${
                            canEnhance && !isEnchanting 
                              ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/40' 
                              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          {isEnchanting ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <>
                              <Hammer size={12} />
                              Forge
                              <div className="flex items-center gap-1 opacity-60 ml-1 bg-black/20 px-1 py-0.5 rounded-md">
                                <Sparkles size={8}/> {stoneCost} Stone{stoneCost !== 1 ? 's' : ''}
                              </div>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {Object.values(user.equipped).every(id => !id) && (
                <div className="col-span-full py-12 bg-slate-900/20 border-2 border-dashed border-slate-800/50 rounded-2xl flex flex-col items-center justify-center text-slate-600">
                  <Shirt size={32} className="mb-2 opacity-10" />
                  <p className="font-black uppercase tracking-widest text-[10px]">Arsenal Empty</p>
                  <p className="text-[8px] mt-0.5 font-medium">Equip artifacts to begin.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* DARK MERCHANT VIEW */}
        {mainTab === 'Dark Merchant' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="relative overflow-hidden bg-red-950/20 border border-red-900/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[50px] rounded-full -mr-16 -mt-16"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-950/40 border-2 border-red-800/50 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)] animate-pulse">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic text-red-100 tracking-tighter mb-0.5">Shadow Market</h3>
                  <p className="text-[8px] text-red-400/60 max-w-[200px] font-bold italic leading-tight">"Forbidden power is eternal. Shall we trade?"</p>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-end gap-2">
                <div className="bg-black/60 backdrop-blur-xl border border-red-900/30 p-2 rounded-xl text-center min-w-[100px] shadow-2xl">
                  <p className="text-[6px] font-black text-red-500 uppercase tracking-widest mb-0.5">Mood</p>
                  <div className="flex items-center justify-center gap-1.5">
                    <motion.div 
                      animate={moodPulse as any}
                      className="text-red-500"
                    >
                      <Heart size={10} fill="currentColor" />
                    </motion.div>
                    <p className="text-[10px] font-mono font-black text-red-100 tracking-widest uppercase">
                      { (darkMerchantStock?.badHaggleChance || 0) > 0.5 ? 'Irritated' : (darkMerchantStock?.badHaggleChance || 0) > 0.2 ? 'Wary' : 'Calm' }
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[6px] text-red-400/60 font-bold uppercase tracking-tighter">
                    <Clock size={6} />
                    <span>Reset in: {timeLeft}</span>
                  </div>
                </div>
                
                <button
                  onClick={onRefreshDarkMerchant}
                  disabled={!canRefresh}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                    canRefresh 
                      ? 'bg-red-900/40 border-red-500/50 text-red-100 hover:bg-red-800/60' 
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw size={12} className={canRefresh ? "" : "opacity-50"} />
                  <span>Refresh ({formatNumber(refreshCost)} G)</span>
                  <span className="opacity-50">[{1 - (darkMerchantStock?.refreshCount || 0)}/1]</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {merchantItems.map(item => {
                    const canAfford = user.gold >= item.price;
                    const isSoldOut = item.quantity <= 0;
                    const rarityColor = getRarityColor(item.rarity as any);
                    
                    return (
                        <motion.div 
                          key={item.id} 
                          whileHover={{ y: -3 }}
                          onClick={() => {
                            const baseItem = shopItems.find(i => i.id === item.itemId);
                            if (baseItem) {
                              setViewingItem(baseItem);
                            } else {
                              setViewingMerchantItem(item);
                            }
                          }}
                          className="group relative bg-slate-900/60 backdrop-blur-sm border border-red-900/20 rounded-xl p-3 transition-all hover:border-red-500/40 hover:bg-red-950/5 shadow-xl cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-xl bg-red-950/20 border border-red-900/30 flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform shadow-inner">
                                    {renderItemIcon(item, 20)}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-[6px] font-black uppercase tracking-tighter px-1 py-0.5 rounded border ${rarityColor}`}>
                                      {item.rarity}
                                    </span>
                                    <div className="flex items-center gap-1 text-slate-600 bg-black/20 px-1 py-0.5 rounded">
                                      <span className="text-[6px] font-black uppercase tracking-tighter">Stock: {item.quantity}</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-[11px] font-black text-red-50 mb-1 group-hover:text-red-400 transition-colors tracking-tighter uppercase italic truncate">{item.name}</h3>
                            
                            {/* HAGGLE SECTION */}
                            {consumablesData?.some(c => c.id === item.itemId) && (
                              <div className="mb-2 flex items-center justify-between gap-1">
                                <div className="flex flex-col">
                                  <span className="text-[6px] text-slate-500 uppercase font-black tracking-tighter">Haggles: {item.haggledCount || 0}/{1 + rankIndex}</span>
                                  {item.originalPrice && item.originalPrice !== item.price && (
                                    <span className="text-[6px] text-red-500/60 line-through font-bold">{formatNumber(item.originalPrice)} G</span>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onHaggle) onHaggle(item);
                                  }}
                                  disabled={(item.haggledCount || 0) >= (1 + rankIndex)}
                                  className={`px-2 py-1 rounded border text-[6px] font-black uppercase tracking-widest flex items-center gap-1 transition-all ${
                                    (item.haggledCount || 0) >= (1 + rankIndex)
                                      ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed'
                                      : 'bg-red-950/40 border-red-500/30 text-red-400 hover:bg-red-900/60 hover:border-red-500/60'
                                  }`}
                                >
                                  <Gavel size={8} />
                                  Haggle
                                </button>
                              </div>
                            )}

                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const baseItem = shopItems.find(i => i.id === item.itemId);
                                  if (baseItem) {
                                    setViewingItem(baseItem);
                                  } else {
                                    setViewingMerchantItem(item);
                                  }
                                }}
                                className={`w-full py-2 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xl ${
                                  isSoldOut 
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                                    : 'bg-slate-900/80 hover:bg-red-900/20 text-red-400 border border-red-900/30'
                                }`}
                            >
                                {isSoldOut ? (
                                  <>
                                    <X size={10} />
                                    Sold Out
                                  </>
                                ) : (
                                  <>
                                    <Eye size={10} />
                                    Details • {formatNumber(item.price)} G
                                  </>
                                )}
                            </button>
                        </motion.div>
                    );
                })}
                {merchantItems.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-slate-900/20 border-2 border-dashed border-red-900/10 rounded-2xl">
                        <div className="w-12 h-12 mx-auto bg-slate-900 rounded-full flex items-center justify-center mb-3 border border-slate-800 shadow-2xl">
                          <Lock size={20} className="text-slate-800" />
                        </div>
                        <p className="font-black text-slate-700 uppercase tracking-widest text-[9px]">Market Depleted</p>
                    </div>
                )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
