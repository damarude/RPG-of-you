import React, { useState } from 'react';
import { UserProfile, Item, ItemSlot, RarityType, ItemStats } from '../types';
import { X, Shirt, Eye, Sparkles, Shield, Coffee, Sword, Footprints, Zap, Backpack, Coins, Heart, Target, Activity, Star, Filter, ArrowDownUp, Package, Info, Hammer, Crown, HelpCircle, TrendingUp } from 'lucide-react';
import { getRarityColor, getEnhancedStats, CONSUMABLE_DATA, formatNumber, RANKS, getRankName, getConsumableImageUrl, getEquipmentItemImageUrl, getEquipmentAuraUrl, getEquipmentWorldPlusAuraUrl } from '../gameData';
import { motion, AnimatePresence } from 'motion/react';

import { TemperingModal } from './TemperingModal';

interface InventoryModalProps {
  user: UserProfile;
  shopItems: Item[];
  consumablesData?: any[];
  installedConsumableImages?: boolean;
  onEquip: (item: Item) => void;
  onUseConsumable: (itemId: string) => void;
  onEnhance: (item: Item, success: boolean, cost: number) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ user, shopItems, consumablesData = [], installedConsumableImages = false, onEquip, onUseConsumable, onEnhance, onClose }) => {
  const [inventoryTab, setInventoryTab] = useState<'EQUIPMENT' | 'CONSUMABLES'>('EQUIPMENT');
  const [activeSlot, setActiveSlot] = useState<ItemSlot | 'ALL'>('ALL');
  const [rarityFilter, setRarityFilter] = useState<RarityType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'RARITY' | 'NAME' | 'SLOT'>('RARITY');
  const [viewingItem, setViewingItem] = useState<Item | null>(null);
  const [viewingConsumableId, setViewingConsumableId] = useState<string | null>(null);
  const [viewingItemImage, setViewingItemImage] = useState<Item | null>(null);
  const [temperingItem, setTemperingItem] = useState<Item | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);

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
    };
    return icons[iconName] || <Backpack size={size} />;
  };

  const renderItemIcon = (item: any, size: number = 24) => {
    const isConsumable = item.type === 'consumable' || item.isConsumable || item.durationStr || item.quantity !== undefined || CONSUMABLE_DATA[item.id];
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

  const sortItems = (items: Item[]) => {
    return [...items].sort((a, b) => {
      if (sortBy === 'RARITY') {
        const weightA = getRarityWeight(a.rarity);
        const weightB = getRarityWeight(b.rarity);
        if (weightA !== weightB) return weightB - weightA;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'SLOT') {
        if (a.slot !== b.slot) return a.slot.localeCompare(b.slot);
        return a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
  };

  const inventoryItems = sortItems(
    user.inventory
      .map(id => shopItems.find(i => i.id === id))
      .filter((i): i is Item => !!i)
      .filter(item => activeSlot === 'ALL' || item.slot === activeSlot)
      .filter(item => rarityFilter === 'ALL' || item.rarity === rarityFilter)
  );

  const consumables = Object.entries(user.consumables || {})
    .map(([id, quantity]) => ({ id, quantity: quantity as number }))
    .filter(c => c.quantity > 0);

  const formatStat = (val: number, label: string, isPct: boolean = false) => {
    const formatted = Math.abs(val).toFixed(1);
    const sign = val >= 0 ? '+' : '';
    const suffix = isPct ? '%' : '';
    return `${sign}${formatted}${suffix} ${label}`;
  };

  const getSubStatValue = (item: Item, key: keyof typeof item.stats) => {
    return (item.stats[key] || 0) - (item.mainStats[key] || 0);
  };

  const hasSubStat = (item: Item, key: keyof typeof item.stats) => {
    return getSubStatValue(item, key) > 0.01;
  };

  const renderItemStats = (item: Item, isEquipped: boolean, comparisonItem?: Item | null) => {
    const enhanceLevel = user.equipmentEnhancements?.[item.id] || 0;
    const compEnhanceLevel = comparisonItem ? (user.equipmentEnhancements?.[comparisonItem.id] || 0) : 0;

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
        const compVal = comparisonItem ? getEnhancedSubValue(comparisonItem, key, compEnhanceLevel) : 0;
        const diff = val - compVal;
        
        let diffColor = 'text-slate-500';
        if (diff > 0.01) diffColor = isNegativeGood ? 'text-red-400' : 'text-green-400';
        else if (diff < -0.01) diffColor = isNegativeGood ? 'text-green-400' : 'text-red-400';

        const showDiff = comparisonItem && Math.abs(diff) > 0.01;

        const getColorClasses = (color: string) => {
            switch(color) {
                case 'red': return 'bg-red-900/20 border-red-900/50 text-red-400';
                case 'green': return 'bg-green-900/20 border-green-900/50 text-green-400';
                case 'pink': return 'bg-pink-900/20 border-pink-900/50 text-pink-400';
                case 'yellow': return 'bg-yellow-900/20 border-yellow-900/50 text-yellow-400';
                case 'blue': return 'bg-blue-900/20 border-blue-900/50 text-blue-400';
                case 'emerald': return 'bg-emerald-900/20 border-emerald-900/50 text-emerald-400';
                case 'cyan': return 'bg-cyan-900/20 border-cyan-900/50 text-cyan-400';
                case 'purple': return 'bg-purple-900/20 border-purple-900/50 text-purple-400';
                case 'orange': return 'bg-orange-900/20 border-orange-900/50 text-orange-400';
                case 'amber': return 'bg-amber-900/20 border-amber-900/50 text-amber-400';
                case 'indigo': return 'bg-indigo-900/20 border-indigo-900/50 text-indigo-400';
                default: return 'bg-slate-900/20 border-slate-900/50 text-slate-400';
            }
        };

        return (
            <div className={`${getColorClasses(colorClass)} border p-1.5 rounded text-[10px] font-bold text-center flex flex-col items-center justify-center gap-0.5`}>
                <div className="flex items-center gap-1">
                    {icon} {formatStat(val, label, isPct)}
                </div>
                {showDiff && (
                    <div className={`text-[9px] ${diffColor}`}>
                        ({diff > 0 ? '+' : ''}{diff.toFixed(1)}{isPct ? '%' : ''})
                    </div>
                )}
            </div>
        );
    };

    return (
      <div className="space-y-2">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Primary Attribute</p>
            <div className="text-sm font-bold text-cyan-300">
                {getDynamicMainStatDesc()}
            </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
            {renderStatWithDiff('dmg', 'DMG', <Sword size={10}/>, false, 'red')}
            {renderStatWithDiff('hp', 'HP', <Heart size={10}/>, false, 'green')}
            {renderStatWithDiff('hpPct', 'HP%', <Heart size={10}/>, true, 'pink')}
            {renderStatWithDiff('critRate', 'Crit Rate', <Target size={10}/>, true, 'red')}
            {renderStatWithDiff('goldBonus', 'Gold', <Coins size={10}/>, true, 'yellow')}
            {renderStatWithDiff('attackSpeed', 'Speed', <Zap size={10}/>, true, 'blue')}
            {renderStatWithDiff('heal', 'Heal', <Activity size={10}/>, true, 'emerald')}
            {renderStatWithDiff('block', 'Block', <Shield size={10}/>, true, 'blue')}
            {renderStatWithDiff('stun', 'Stun', <Zap size={10}/>, true, 'cyan')}
            {renderStatWithDiff('barrage', 'Barrage', <Zap size={10}/>, true, 'purple')}
            {renderStatWithDiff('critDmg', 'Crit Dmg', <Target size={10}/>, true, 'orange')}
            {renderStatWithDiff('challengeCostReduction', 'Cost', <Activity size={10}/>, true, 'emerald', true)}
            {renderStatWithDiff('undieableChance', 'Undying', <Shield size={10}/>, true, 'amber')}
            {renderStatWithDiff('streakProtectionChance', 'Streak Save', <Shield size={10}/>, true, 'indigo')}
            {renderStatWithDiff('skillExpBonus', 'Skill Exp', <Star size={10}/>, true, 'yellow')}
        </div>
      </div>
    );
  };

  const renderConsumableDetailModal = (itemId: string) => {
    const oldData = CONSUMABLE_DATA[itemId];
    const newData = consumablesData?.find(c => c.id === itemId);
    const data = newData || oldData;
    
    if (!data) return null;

    const isActive = user.activeBuffs && user.activeBuffs[itemId] > Date.now();
    const rarityColor = getRarityColor((data.rank || data.rarity) as any);
    const borderColor = rarityColor.split(' ').find(c => c.startsWith('border-')) || 'border-slate-700';
    const bgColor = rarityColor.split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-800';
    const shadowColor = rarityColor.split(' ').find(c => c.startsWith('shadow-')) || '';
    const animateClass = rarityColor.includes('animate-pulse') ? 'animate-pulse' : '';
    const quantity = user.consumables?.[itemId] || 0;

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
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[110] p-4" 
          onClick={() => setViewingConsumableId(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`bg-slate-900 border-2 ${borderColor} rounded-3xl w-full max-w-xl relative shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden max-h-[90vh]`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setViewingConsumableId(null)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all z-50"
            >
              <X size={20} />
            </button>

            <div className="p-8 flex flex-col items-center text-center overflow-y-auto custom-scrollbar">
              <div className={`w-24 h-24 rounded-2xl border-4 ${borderColor} ${bgColor} flex items-center justify-center shadow-2xl mb-6 relative group shrink-0 ${shadowColor} ${animateClass}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {renderItemIcon(data, 48)}
                <div className="absolute -bottom-3 -right-3 bg-slate-950 text-white text-xs font-black px-3 py-1 rounded-full border-2 border-slate-800 shadow-lg">
                  x{quantity}
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border mb-4 ${rarityColor}`}>
                {data.rank || data.rarity} Consumable
              </span>

              <h2 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase italic">{data.name}</h2>
              
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 mb-6 w-full">
                <p className="text-slate-400 text-sm leading-relaxed italic">
                  "{newData ? (newData.description || 'A mysterious consumable.') : (data as any).description}"
                </p>
              </div>

              {isActive && (
                <div className="w-full mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Effect Currently Active</span>
                </div>
              )}

              {renderBuffDetails()}

              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Duration</p>
                  <p className="text-white font-bold">{newData ? newData.durationStr.replace(/_/g, ' ') : '1 Hour'}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Stack Limit</p>
                  <p className="text-white font-bold">{newData ? newData.stackable : ((data as any).dailyLimit || (data as any).weeklyLimit || 1)}</p>
                </div>
              </div>

              <button 
                onClick={() => { onUseConsumable(itemId); setViewingConsumableId(null); }}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-purple-900/40 transition-all active:scale-95 flex items-center justify-center gap-3 group shrink-0"
              >
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                Use Item Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderDetailModal = (item: Item) => {
    const isEquipped = user.equipped[item.slot] === item.id;
    const rarityColor = getRarityColor(item.rarity);
    const borderColor = rarityColor.split(' ').find(c => c.startsWith('border-')) || 'border-slate-700';
    const bgColor = rarityColor.split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-800';
    const shadowColor = rarityColor.split(' ').find(c => c.startsWith('shadow-')) || '';
    const animateClass = rarityColor.includes('animate-pulse') ? 'animate-pulse' : '';
    const enhanceLevel = user.equipmentEnhancements?.[item.id] || 0;
    
    const currentlyEquippedId = user.equipped[item.slot];
    const currentlyEquipped = currentlyEquippedId ? shopItems.find(i => i.id === currentlyEquippedId) : null;

    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[110] p-4" 
          onClick={() => setViewingItem(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`bg-slate-900 border-4 ${borderColor} rounded-2xl w-full max-w-2xl relative shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setViewingItem(null)}
              className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-white/20 rounded-full text-slate-200 hover:text-white transition-colors z-50 backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row h-full overflow-y-auto custom-scrollbar">
              {/* Selected Item */}
              <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-800">
                <div className="text-center mb-4">
                  <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">Selected Item</h3>
                  <div 
                    onClick={() => setViewingItemImage(item)}
                    className={`w-24 h-24 mx-auto rounded-xl border-4 ${borderColor} ${bgColor} flex items-center justify-center shadow-lg mb-4 text-white relative cursor-pointer group ${shadowColor} ${animateClass}`}>
                    {renderItemIcon(item, 48)}
                    {enhanceLevel > 0 && (
                      <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-lg">
                        +{enhanceLevel}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity duration-300">
                      <Eye size={24} className="text-white drop-shadow-md" />
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-2 ${rarityColor}`}>
                    {item.rarity} {item.slot}
                  </span>
                  <h2 className="text-xl font-rpg font-bold text-white leading-tight mb-1">{item.name}</h2>
                  {isEquipped && <span className="text-[10px] font-bold text-yellow-500 bg-yellow-900/20 px-2 py-0.5 rounded border border-yellow-500/30">Currently Equipped</span>}
                </div>
                
                {renderItemStats(item, isEquipped, currentlyEquipped)}
                
                <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 italic leading-relaxed">
                  "{item.description}"
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button 
                    onClick={() => { onEquip(item); setViewingItem(null); }}
                    disabled={isEquipped}
                    className={`py-3 rounded-xl font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${isEquipped ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20 hover:scale-[1.02]'}`}
                  >
                    <Shirt size={16} />
                    {isEquipped ? 'Equipped' : 'Equip'}
                  </button>

                  <button 
                    onClick={() => { setTemperingItem(item); setViewingItem(null); }}
                    className="py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-orange-900/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Hammer size={16} />
                    Forge
                  </button>
                </div>
              </div>

              {/* Comparison Item */}
              {currentlyEquipped && !isEquipped && (
                <div className="flex-1 p-6 bg-slate-900/50">
                  <div className="text-center mb-4">
                    <h3 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-4">Currently Equipped</h3>
                    <div className={`w-20 h-20 mx-auto rounded-xl border-2 ${getRarityColor(currentlyEquipped.rarity).split(' ').find(c => c.startsWith('border-')) || 'border-slate-700'} ${getRarityColor(currentlyEquipped.rarity).split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-800/50'} flex items-center justify-center mb-4 text-slate-400 relative opacity-80 ${getRarityColor(currentlyEquipped.rarity).split(' ').find(c => c.startsWith('shadow-')) || ''} ${getRarityColor(currentlyEquipped.rarity).includes('animate-pulse') ? 'animate-pulse' : ''}`}>
                      {renderItemIcon(currentlyEquipped, 40)}
                      {(user.equipmentEnhancements?.[currentlyEquipped.id] || 0) > 0 && (
                        <div className="absolute -top-2 -right-2 bg-orange-500/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-900">
                          +{(user.equipmentEnhancements?.[currentlyEquipped.id] || 0)}
                        </div>
                      )}
                    </div>
                    <h2 className="text-lg font-rpg font-bold text-slate-300 leading-tight mb-1">{currentlyEquipped.name}</h2>
                  </div>
                  
                  <div className="opacity-80">
                    {renderItemStats(currentlyEquipped, true)}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4 animate-in fade-in">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-purple-900/30 rounded-xl text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
                Inventory
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Vault of Artifacts & Supplies</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all active:scale-90 border border-slate-700/50">
            <X size={20} />
          </button>
        </div>

        {/* Sub-Tabs: Equipment vs Consumables */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 gap-1.5 mt-2 flex-shrink-0">
          <button
            onClick={() => setInventoryTab('EQUIPMENT')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl border ${inventoryTab === 'EQUIPMENT' ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}
          >
            <Shield size={14} /> Equipment
          </button>
          <button
            onClick={() => setInventoryTab('CONSUMABLES')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl border ${inventoryTab === 'CONSUMABLES' ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}
          >
            <Package size={14} /> Consumables
          </button>
        </div>

        {/* Currencies & Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-slate-800 bg-slate-900/80 flex-shrink-0">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="p-2 bg-yellow-900/30 text-yellow-400 rounded-md"><Coins size={16} /></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Gold</p>
              <p className="text-sm font-bold text-white">{formatNumber(user.gold)}</p>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="p-2 bg-orange-900/30 text-orange-400 rounded-md"><Sparkles size={16} /></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Phil. Stones</p>
              <p className="text-sm font-bold text-white">{user.currencies?.philosopherStones || 0}</p>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 text-blue-400 rounded-md"><Shield size={16} /></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Items</p>
              <p className="text-sm font-bold text-white">{user.inventory.length}</p>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
            <div className="p-2 bg-purple-900/30 text-purple-400 rounded-md"><Sword size={16} /></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Equipped</p>
              <p className="text-sm font-bold text-white">{Object.values(user.equipped).filter(Boolean).length}</p>
            </div>
          </div>
        </div>

        {inventoryTab === 'EQUIPMENT' && (
          <>
            {/* Filters & Sorting */}
            <div className="p-3 bg-slate-950/50 border-b border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    onClick={() => setActiveSlot('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter whitespace-nowrap transition-all border ${activeSlot === 'ALL' ? 'bg-white text-slate-950 border-white shadow-lg' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-600'}`}
                  >
                    All Slots
                  </button>
                  {Object.values(ItemSlot).filter(s => s !== ItemSlot.BACKGROUND).map(slot => (
                    <button
                      key={slot}
                      onClick={() => setActiveSlot(slot)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter whitespace-nowrap transition-all border ${activeSlot === slot ? 'bg-white text-slate-950 border-white shadow-lg' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-600'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${showSortMenu ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    <ArrowDownUp size={14} />
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
                          { id: 'SLOT', label: 'By Slot', icon: <Shield size={10} /> },
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

              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setRarityFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter whitespace-nowrap transition-all border ${rarityFilter === 'ALL' ? 'bg-slate-200 text-slate-950 border-white' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-600'}`}
                >
                  All Rarity
                </button>
                {Object.values(RarityType).map(rarity => (
                  <button
                    key={rarity}
                    onClick={() => setRarityFilter(rarity)}
                    className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter whitespace-nowrap transition-all border flex items-center gap-1 ${rarityFilter === rarity ? 'bg-slate-200 text-slate-950 border-white' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-600'}`}
                  >
                    <div className={`w-1 h-1 rounded-full ${getRarityColor(rarity).split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-500'}`}></div>
                    {rarity}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Grid */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 custom-scrollbar">
              {inventoryItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                  <Backpack size={48} className="mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-sm">No items found</p>
                  <p className="text-xs mt-1">Try changing your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                  {inventoryItems.map((item, idx) => {
                    const isEquipped = user.equipped[item.slot] === item.id;
                    const rarityColor = getRarityColor(item.rarity);
                    const borderColor = rarityColor.split(' ').find(c => c.startsWith('border-')) || 'border-slate-700';
                    const bgColor = rarityColor.split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-900';
                    const shadowColor = rarityColor.split(' ').find(c => c.startsWith('shadow-')) || '';
                    const animateClass = rarityColor.includes('animate-pulse') ? 'animate-pulse' : '';
                    const enhanceLevel = user.equipmentEnhancements?.[item.id] || 0;

                    return (
                      <motion.div
                        key={`${item.id}-${idx}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => setViewingItem(item)}
                        className={`group relative ${bgColor} border-2 ${borderColor} ${shadowColor} ${animateClass} rounded-xl p-2 sm:p-3 cursor-pointer hover:scale-[1.02] transition-all hover:shadow-[0_0_15px_rgba(0,0,0,0.3)] flex flex-col items-center text-center ${isEquipped ? 'ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-slate-950' : ''}`}
                      >
                        <div className="text-white mb-2 relative">
                          {renderItemIcon(item, 32)}
                          {enhanceLevel > 0 && (
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full border border-slate-900">
                              +{enhanceLevel}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-white truncate w-full mb-1">{item.name}</p>
                        <div className="flex items-center gap-1 mt-auto">
                          <span className={`text-[8px] font-bold uppercase tracking-tighter px-1 rounded border ${rarityColor}`}>
                            {item.rarity}
                          </span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase">{item.slot}</span>
                        </div>
                        {isEquipped && (
                          <div className="absolute top-1 right-1">
                            <Star size={10} className="text-yellow-500 fill-yellow-500" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {inventoryTab === 'CONSUMABLES' && (
          <div className="flex-1 overflow-y-auto p-4 bg-slate-950 custom-scrollbar">
            {consumables.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                <Package size={48} className="mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-sm">No consumables</p>
                <p className="text-xs mt-1">Visit the Dark Merchant to find some</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                {consumables.map((c, idx) => {
                  const oldData = CONSUMABLE_DATA[c.id];
                  const newData = consumablesData?.find(cd => cd.id === c.id);
                  const data = newData || oldData;
                  const rarityColor = data ? getRarityColor((data.rank || data.rarity) as any) : 'text-slate-400 border-slate-600 bg-slate-800';
                  const borderColor = rarityColor.split(' ').find(col => col.startsWith('border-')) || 'border-slate-700';
                  const bgColor = rarityColor.split(' ').find(col => col.startsWith('bg-')) || 'bg-slate-900';
                  const shadowColor = rarityColor.split(' ').find(col => col.startsWith('shadow-')) || '';
                  const animateClass = rarityColor.includes('animate-pulse') ? 'animate-pulse' : '';

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => setViewingConsumableId(c.id)}
                      className={`${bgColor} border-2 ${borderColor} ${shadowColor} ${animateClass} rounded-xl p-2 sm:p-4 h-32 flex flex-col items-center text-center relative group overflow-hidden cursor-pointer hover:scale-[1.02] transition-all`}
                    >
                      <div className="text-white mb-2 relative z-10">
                        {data ? renderItemIcon(data, 32) : <Package size={32} />}
                      </div>
                      <p className="text-[10px] font-black text-white mb-1 uppercase tracking-tighter truncate w-full relative z-10">
                        {data?.name || c.id.replace(/-/g, ' ')}
                      </p>
                      <div className="flex items-center gap-1 mt-auto relative z-10">
                        <span className={`text-[8px] font-bold uppercase tracking-tighter px-1 rounded border ${rarityColor}`}>
                          {data?.rank || data?.rarity || 'Unknown'}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 bg-slate-950/80 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-800 z-20">
                        x{c.quantity}
                      </div>

                      {/* Hover Info */}
                      <div className="absolute inset-0 bg-slate-950/95 p-2 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                        <p className="text-[8px] text-slate-300 leading-tight">
                          {data?.description || "A mysterious consumable item."}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="p-3 bg-slate-800/50 border-t border-slate-800 flex justify-between items-center flex-shrink-0">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {inventoryTab === 'EQUIPMENT' ? `${inventoryItems.length} Equipment Found` : `${consumables.length} Consumables Found`}
          </p>
          <div className="flex items-center gap-2">
            <ArrowDownUp size={12} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">Sorted by Rarity</span>
          </div>
        </div>
      </motion.div>

      {viewingItem && renderDetailModal(viewingItem)}
      {viewingItemImage && renderEquipmentImageModal(viewingItemImage)}
      {viewingConsumableId && renderConsumableDetailModal(viewingConsumableId)}
      {temperingItem && (
        <TemperingModal 
          item={temperingItem} 
          user={user} 
          onClose={() => setTemperingItem(null)} 
          onEnhance={onEnhance} 
        />
      )}
    </div>
  );
};
