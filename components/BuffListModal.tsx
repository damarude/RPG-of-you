
import React from 'react';
import { X, Clock, Zap, Flame, Shield, Heart, Sword, Target, Coins, Activity, Sparkles, Star, Crown, HelpCircle, Footprints, TrendingUp, Package } from 'lucide-react';
import { UserProfile } from '../types';
import { CONSUMABLE_DATA, RANKS, getRankName, getConsumableImageUrl } from '../gameData';
import { motion, AnimatePresence } from 'framer-motion';

interface BuffListModalProps {
    user: UserProfile;
    activeBuffs: Record<string, number>;
    consumablesData?: any[];
    installedConsumableImages?: boolean;
    onClose: () => void;
}

export const BuffListModal: React.FC<BuffListModalProps> = ({ user, activeBuffs, consumablesData = [], installedConsumableImages = false, onClose }) => {
    const now = Date.now();
    
    const activeBuffItems = Object.entries(activeBuffs)
        .filter(([_, expiry]) => (expiry as number) > now || expiry === 1) // 1 is for special buffs like SSS Soap
        .map(([itemId, expiry]) => {
            const oldData = CONSUMABLE_DATA[itemId];
            const newData = consumablesData?.find(c => c.id === itemId);
            return {
                id: itemId,
                expiry: expiry as number,
                data: newData || oldData,
                isNew: !!newData,
                newData: newData
            };
        });

    const getRemainingTime = (expiry: number) => {
        if (expiry === 1) return "Next Session";
        const diff = expiry - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const getBuffIcon = (iconName: string) => {
        switch (iconName) {
            case 'Zap': return <Zap className="text-yellow-400" />;
            case 'Flame': return <Flame className="text-orange-500" />;
            case 'Shield': return <Shield className="text-blue-400" />;
            case 'Heart': return <Heart className="text-red-400" />;
            case 'Sword': return <Sword className="text-red-500" />;
            case 'Target': return <Target className="text-green-400" />;
            case 'Coins': return <Coins className="text-yellow-500" />;
            case 'Activity': return <Activity className="text-purple-400" />;
            default: return <Zap className="text-yellow-400" />;
        }
    };

    const renderBuffEffects = (newData: any) => {
        if (!newData) return null;
        
        const buffs = [
            { key: 'receiveStone', label: 'Philosopher Stones', icon: <Sparkles size={12}/>, min: newData.receiveStoneMin, max: newData.receiveStoneMax },
            { key: 'flatExp', label: 'Flat EXP', icon: <Star size={12}/>, min: newData.flatExpGainMin, max: newData.flatExpGainMax },
            { key: 'patronGain', label: 'Patron Gain', icon: <Crown size={12}/>, min: newData.patronGainMin, max: newData.patronGainMax },
            { key: 'dmg', label: 'Damage', icon: <Sword size={12}/>, min: newData.dmgMin, max: newData.dmgMax },
            { key: 'flatHp', label: 'Max HP', icon: <Heart size={12}/>, min: newData.flatHpMin, max: newData.flatHpMax },
            { key: 'percentileHp', label: 'Max HP %', icon: <Heart size={12}/>, min: newData.percentileHpMin, max: newData.percentileHpMax },
            { key: 'heal', label: 'Heal', icon: <Activity size={12}/>, min: newData.healMin, max: newData.healMax },
            { key: 'gold', label: 'Gold Multiplier', icon: <Coins size={12}/>, min: newData.goldMin, max: newData.goldMax },
            { key: 'block', label: 'Block Chance', icon: <Shield size={12}/>, min: newData.blockMin, max: newData.blockMax },
            { key: 'aspd', label: 'Attack Speed', icon: <Zap size={12}/>, min: newData.aspdMin, max: newData.aspdMax },
            { key: 'critRate', label: 'Crit Rate', icon: <Target size={12}/>, min: newData.critRateMin, max: newData.critRateMax },
            { key: 'critDmg', label: 'Crit Damage', icon: <Zap size={12}/>, min: newData.critDmgMin, max: newData.critDmgMax },
            { key: 'stun', label: 'Stun Chance', icon: <HelpCircle size={12}/>, min: newData.stunMin, max: newData.stunMax },
            { key: 'barrage', label: 'Barrage Chance', icon: <Footprints size={12}/>, min: newData.barrageMin, max: newData.barrageMax },
            { key: 'skillExp', label: 'Skill EXP Multiplier', icon: <TrendingUp size={12}/>, min: newData.skillExpMin, max: newData.skillExpMax },
            { key: 'cReduction', label: 'Cost Reduction', icon: <Coins size={12}/>, min: newData.cReductionMin, max: newData.cReductionMax },
            { key: 'streakSave', label: 'Streak Protection', icon: <Shield size={12}/>, min: newData.streakSaveMin, max: newData.streakSaveMax },
            { key: 'undying', label: 'Undying Chance', icon: <Heart size={12}/>, min: newData.undyingMin, max: newData.undyingMax },
        ];

        const activeBuffs = buffs.filter(b => b.min !== 0 || b.max !== 0);

        if (activeBuffs.length === 0 && !newData.freeChallenge) return null;

        const rankIndex = RANKS.indexOf(getRankName(user.totalLevel));
        const maxRank = RANKS.length - 1;
        const rankFactor = rankIndex / maxRank;
        const stacks = user.activeBuffStacks?.[newData.id] || 1;
        const lerp = (min: number, max: number) => (min + (max - min) * rankFactor) * stacks;

        return (
            <div className="flex flex-wrap gap-1.5 mt-2">
                {newData.freeChallenge && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 text-[10px] font-bold">
                        <Coins size={10} /> Free Challenge
                    </span>
                )}
                {activeBuffs.map((buff, idx) => {
                    const val = lerp(buff.min, buff.max);
                    const displayVal = val % 1 === 0 ? val : val.toFixed(1);
                    const isNegative = val < 0;
                    return (
                        <span key={idx} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold ${isNegative ? 'bg-red-900/30 border-red-800/50 text-red-400' : 'bg-slate-800/80 border-slate-700/80 text-slate-300'}`}>
                            {buff.icon}
                            {buff.label}: {isNegative ? '' : '+'}{displayVal}
                            {['percentileHp', 'gold', 'block', 'critRate', 'critDmg', 'stun', 'barrage', 'skillExp', 'cReduction', 'streakSave', 'undying'].includes(buff.key) ? '%' : ''}
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        <Zap className="text-yellow-400" size={20} />
                        <h2 className="text-lg font-bold text-white">Active Buffs</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {activeBuffItems.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 italic">
                            No active buffs. Eat some ramen!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeBuffItems.map((buff) => (
                                <div key={buff.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex gap-3 items-start">
                                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                                        {installedConsumableImages && buff.data?.name && getConsumableImageUrl(buff.data.name) ? (
                                            <img src={getConsumableImageUrl(buff.data.name)!} alt={buff.data.name} className="w-10 h-10 object-contain drop-shadow-lg" />
                                        ) : (
                                            <Package className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-white text-sm truncate">
                                                {buff.data?.name}
                                                {user.activeBuffStacks?.[buff.id] && user.activeBuffStacks[buff.id] > 1 && ` x${user.activeBuffStacks[buff.id]}`}
                                            </h3>
                                            <div className="flex items-center gap-1 text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20">
                                                <Clock size={10} />
                                                {getRemainingTime(buff.expiry)}
                                            </div>
                                        </div>
                                        {buff.isNew ? renderBuffEffects(buff.newData) : (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 text-slate-300 text-[10px] font-bold">
                                                    {getBuffIcon(buff.data?.icon || 'Zap')}
                                                    {buff.id === 'miso_ramen' && '+20% Max HP'}
                                                    {buff.id === 'shio_ramen' && '+15% Attack Speed'}
                                                    {buff.id === 'shoyu_ramen' && '+10% Crit Rate'}
                                                    {buff.id === 'chashuu_ramen' && '+6% Block Chance'}
                                                    {buff.id === 'chuuka_ramen' && '+2% Heal'}
                                                    {buff.id === 'ichiban_shibori' && '+3% Undieable Chance'}
                                                    {buff.id === 'sshs_soap' && '+9% Barrage Chance'}
                                                    {buff.id === 'frozen_flame' && 'Streak Protection'}
                                                    {buff.id === 'misery_box_1' && 'Misery Box+1'}
                                                    {buff.id === 'misery_box_2' && 'Misery Box+2'}
                                                    {buff.id === 'misery_box_3' && 'Misery Box+3'}
                                                    {buff.id === 'philosopher_stone' && 'Philosopher Stone'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-800/30 border-t border-slate-800">
                    <button 
                        onClick={onClose}
                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
