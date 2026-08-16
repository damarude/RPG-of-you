import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Hammer, Sparkles, AlertTriangle, Coins, Zap, Shield, Sword, Heart, Target, Activity, Star, ChevronDown, ChevronUp, Shirt, Footprints, Backpack, Eye, Coffee } from 'lucide-react';
import { Item, UserProfile } from '../types';
import { getRarityColor, getEnhancementCost, getEnhancementSuccessRate, getMaxEnhancementLevel, getEnhancedStats, getEnhancementStoneCost, getEquipmentItemImageUrl } from '../gameData';

interface TemperingModalProps {
  item: Item;
  user: UserProfile;
  onClose: () => void;
  onEnhance: (item: Item, success: boolean, cost: number) => void;
}

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export const TemperingModal: React.FC<TemperingModalProps> = ({ item, user, onClose, onEnhance }) => {
  const [isForging, setIsForging] = useState(false);
  const isForgingRef = React.useRef(false);
  const [forgeResult, setForgeResult] = useState<'SUCCESS' | 'FAILURE' | null>(null);
  const [forgeStep, setForgeStep] = useState(0);
  const [showAllStats, setShowAllStats] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  
  const currentLevel = user.equipmentEnhancements?.[item.id] || 0;
  const maxLevel = getMaxEnhancementLevel(item.rarity);
  const cost = getEnhancementCost(item.cost, currentLevel);
  const stoneCost = getEnhancementStoneCost(item.rarity);
  const successRate = getEnhancementSuccessRate(currentLevel, maxLevel);
  const hasStone = (user.currencies?.philosopherStones || 0) >= stoneCost;
  const canAfford = user.gold >= cost && hasStone;
  const isMaxLevel = currentLevel >= maxLevel;

  const rarityColor = getRarityColor(item.rarity);
  const borderColor = rarityColor.split(' ').find(c => c.startsWith('border-')) || 'border-slate-700';

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

  const renderItemIcon = (iconItem: any, size: number = 24) => {
    const equipmentUrl = iconItem.name && iconItem.rarity ? getEquipmentItemImageUrl(iconItem.name, iconItem.rarity) : null;
    
    if (equipmentUrl) {
      return (
        <>
          <img 
            src={equipmentUrl} 
            alt={iconItem.name} 
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
            {getIcon(iconItem.icon, size)}
          </div>
        </>
      );
    }
    
    return getIcon(iconItem.icon, size);
  };

  const handleForge = async () => {
    if (!canAfford || isMaxLevel || isForging || isForgingRef.current) return;

    isForgingRef.current = true;
    setIsForging(true);
    setForgeResult(null);
    setForgeStep(0);

    // Animation sequence
    // Step 1: Preparation (0.5s)
    await new Promise(resolve => setTimeout(resolve, 800));
    setForgeStep(1);
    
    // Step 2: Heating (1s)
    await new Promise(resolve => setTimeout(resolve, 1200));
    setForgeStep(2);
    
    // Step 3: Hammering (1.5s - multiple hits)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setForgeStep(3);

    // Final result
    const roll = Math.random();
    const success = roll < successRate;
    
    setForgeResult(success ? 'SUCCESS' : 'FAILURE');
    onEnhance(item, success, cost);
    setIsForging(false);
    isForgingRef.current = false;
  };

  const renderSuccessRateVisual = () => {
    // Visual representation of success rate without numbers
    // Using a glowing bar that changes color and intensity
    const percentage = successRate * 100;
    const colorClass = percentage > 70 ? 'bg-emerald-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-rose-500';
    const glowClass = percentage > 70 ? 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' : percentage > 40 ? 'shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'shadow-[0_0_15px_rgba(244,63,94,0.5)]';

    return (
      <div className="w-full space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Success Probability</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-3 rounded-full transition-all duration-500 ${i < Math.ceil(successRate * 5) ? colorClass + ' ' + glowClass : 'bg-slate-800'}`}
              />
            ))}
          </div>
        </div>
        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full ${colorClass} ${glowClass} relative`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </motion.div>
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
        className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center z-[150] p-4"
        onClick={!isForging ? onClose : undefined}
      >
          <motion.div 
            initial={{ scale: 0.8, rotateY: 45, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0.8, rotateY: -45, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`bg-slate-900 border-2 ${borderColor} rounded-[1.5rem] sm:rounded-[2.5rem] w-[98%] sm:w-full max-w-3xl relative shadow-[0_0_150px_rgba(0,0,0,1)] flex flex-col max-h-[95vh] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-8 pb-2 sm:pb-4 flex justify-between items-start flex-none">
              <div>
                <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] border mb-1 sm:mb-2 inline-block ${rarityColor}`}>
                  {item.rarity} {item.slot}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">The Great Forge</h2>
              </div>
              {!isForging && (
                <button 
                  onClick={onClose}
                  className="p-1.5 sm:p-3 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl text-slate-400 hover:text-white transition-all"
                >
                  <X size={18} className="sm:w-6 sm:h-6" />
                </button>
              )}
            </div>

            <div className="px-3 sm:px-8 pb-4 sm:pb-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
              {/* Forge Visualizer */}
              <div className={`w-full relative mb-2 sm:mb-8 flex items-center justify-center flex-none ${!forgeResult ? 'aspect-square max-w-[250px] sm:max-w-[500px]' : 'min-h-[250px] sm:min-h-[550px]'}`}>
                {/* Background Glow */}
                <div className={`absolute inset-0 rounded-full blur-[50px] sm:blur-[100px] opacity-30 transition-colors duration-1000 ${
                  forgeResult === 'SUCCESS' ? 'bg-emerald-500' : 
                  forgeResult === 'FAILURE' ? 'bg-rose-500' : 
                  isForging ? 'bg-orange-500' : 'bg-purple-500'
                }`} />

                {/* Anvil/Hammer Animation Area */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {!isForging && !forgeResult && (
                      <motion.div 
                        key="idle"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="flex flex-col items-center"
                      >
                        <button 
                          onClick={() => setShowDescription(!showDescription)}
                          className={`w-40 h-40 sm:w-64 sm:h-64 rounded-[2.5rem] sm:rounded-[4rem] border-4 ${borderColor} bg-slate-800 flex items-center justify-center shadow-2xl relative group transition-transform active:scale-95 overflow-hidden`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                          <div className="relative z-10 text-white flex items-center justify-center">
                            {renderItemIcon(item, 120)}
                          </div>
                          {currentLevel > 0 && (
                            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-orange-500 text-white text-sm sm:text-xl font-black px-3 py-0.5 sm:px-5 sm:py-1.5 rounded-full border-2 sm:border-4 border-slate-900 shadow-xl z-20">
                              +{currentLevel}
                            </div>
                          )}
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-full px-3 py-1 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                            Click for Info
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {showDescription && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute top-full mt-4 bg-slate-950/90 backdrop-blur-xl border border-slate-800 p-3 rounded-2xl z-50 w-64 text-center shadow-2xl"
                            >
                              <h4 className="text-xs font-black text-white uppercase italic mb-1">{item.name}</h4>
                              <p className="text-[9px] text-slate-400 leading-relaxed">{item.description}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <p className="mt-4 sm:mt-6 text-slate-400 font-black uppercase tracking-[0.3em] text-[8px] sm:text-xs">Ready for Tempering</p>
                      </motion.div>
                    )}

                  {isForging && (
                    <motion.div 
                      key="forging"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative w-full h-full flex items-center justify-center"
                    >
                      {/* Forge Steps Visuals */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {forgeStep >= 1 && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute w-64 h-64 rounded-full border-8 border-orange-500/30 blur-xl"
                          />
                        )}
                        {forgeStep >= 2 && (
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className="absolute w-80 h-80 border-t-8 border-orange-500 rounded-full opacity-60"
                          />
                        )}
                      </div>

                      <div className="relative flex items-center justify-center">
                        {/* Item being forged */}
                        <motion.div
                          animate={{ 
                            scale: forgeStep === 3 ? [1, 0.9, 1.1, 1] : [1, 1.05, 1],
                            filter: forgeStep >= 2 ? ["brightness(1) saturate(1)", "brightness(2) saturate(2)", "brightness(1) saturate(1)"] : "none",
                            rotate: forgeStep === 3 ? [0, -2, 2, 0] : 0
                          }}
                          transition={{ repeat: Infinity, duration: forgeStep === 3 ? 0.2 : 1 }}
                          className={`w-40 h-40 sm:w-64 sm:h-64 rounded-[2.5rem] sm:rounded-[4rem] border-4 ${borderColor} bg-slate-800 flex items-center justify-center shadow-2xl relative overflow-hidden`}
                        >
                          <div className="absolute inset-0 bg-orange-500/30 animate-pulse"></div>
                          <div className="relative z-10 text-white flex items-center justify-center">
                            {renderItemIcon(item, 120)}
                          </div>
                        </motion.div>
                      </div>

                      {/* Sparks during hammering */}
                      {forgeStep === 3 && (
                        <div className="absolute">
                          {[...Array(12)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                              animate={{ 
                                x: (Math.random() - 0.5) * 200, 
                                y: (Math.random() - 0.5) * 200,
                                opacity: 0,
                                scale: 0
                              }}
                              transition={{ repeat: Infinity, duration: 0.5, delay: Math.random() * 0.5 }}
                              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {forgeResult === 'SUCCESS' && (
                    <motion.div 
                      key="success"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div 
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-40 h-40 sm:w-72 sm:h-72 rounded-[2.5rem] sm:rounded-[4rem] bg-emerald-500 flex items-center justify-center shadow-[0_0_120px_rgba(16,185,129,0.8)] border-4 border-white/40 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                        <div className="relative z-10 text-white flex items-center justify-center">
                          {renderItemIcon(item, 140)}
                        </div>
                        <div className="absolute top-4 right-4">
                          <Sparkles size={48} className="text-white animate-bounce" />
                        </div>
                      </motion.div>
                      <h3 className="mt-4 sm:mt-8 text-2xl sm:text-4xl font-black text-emerald-400 italic tracking-tighter uppercase animate-pulse">Success!</h3>
                      <p className="text-emerald-500/60 font-bold text-[10px] sm:text-sm mt-1 sm:mt-2">The item has been reinforced</p>
                    </motion.div>
                  )}

                  {forgeResult === 'FAILURE' && (
                    <motion.div 
                      key="failure"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div 
                        animate={{ x: [-10, 10, -10, 10, 0], rotate: [-2, 2, -2, 2, 0] }}
                        transition={{ duration: 0.5 }}
                        className="w-40 h-40 sm:w-72 sm:h-72 rounded-[2.5rem] sm:rounded-[4rem] bg-rose-500 flex items-center justify-center shadow-[0_0_120px_rgba(244,63,94,0.8)] border-4 border-white/40 relative overflow-hidden grayscale"
                      >
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="relative z-10 text-white/40 flex items-center justify-center">
                          {renderItemIcon(item, 140)}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <AlertTriangle size={80} className="text-white opacity-90" />
                        </div>
                      </motion.div>
                      <h3 className="mt-4 sm:mt-8 text-2xl sm:text-4xl font-black text-rose-400 italic tracking-tighter uppercase">Failed</h3>
                      <p className="text-rose-500/60 font-bold text-[10px] sm:text-sm mt-1 sm:mt-2">The tempering was unsuccessful</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Stats Comparison */}
            <AnimatePresence>
              {!isForging && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <div className="w-full mb-4 sm:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="bg-slate-950/50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-800/50">
                        <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 sm:mb-3">Current Stats</p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-400">Enhance</span>
                            <span className="text-white font-bold">+{currentLevel}</span>
                          </div>
                          {/* Show stats */}
                          {(() => {
                            const hasAnyMainStats = Object.values(item.mainStats).some(v => (v as number) > 0);
                            return Object.entries(item.stats).map(([key, val]) => {
                              const baseMain = (item.mainStats as any)[key] || 0;
                              const baseTotal = val as number;
                              const baseSub = baseTotal - baseMain;
                              
                              const elements = [];
                              
                              if (baseMain > 0) {
                                  const currentMain = baseMain * (1 + 0.10 * currentLevel);
                                  elements.push(
                                      <div key={`${key}-main`} className="flex justify-between text-xs sm:text-sm">
                                          <span className="text-slate-400 capitalize">{key}</span>
                                          <span className="text-white font-bold">{currentMain.toFixed(2)}</span>
                                      </div>
                                  );
                              }
                              
                              if (baseSub > 0.01 && (showAllStats || !hasAnyMainStats)) {
                                  const currentSub = baseSub * (1 + 0.08 * currentLevel);
                                  elements.push(
                                      <div key={`${key}-sub`} className="flex justify-between text-xs sm:text-sm italic opacity-80">
                                          <span className="text-slate-500 capitalize">{key} (Sub)</span>
                                          <span className="text-slate-300 font-bold">{currentSub.toFixed(2)}</span>
                                      </div>
                                  );
                              }
                              
                              return elements;
                            });
                          })()}
                        </div>
                      </div>

                      <div className={`bg-slate-950/50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-800/50 relative overflow-hidden transition-all duration-500 ${showAllStats ? 'opacity-100 scale-100' : 'opacity-40 scale-95 grayscale'}`}>
                        <div className="absolute top-0 right-0 p-1.5 sm:p-2">
                          <Zap size={10} className="text-orange-500" />
                        </div>
                        <p className="text-[8px] sm:text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 sm:mb-3">Next Level</p>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-400">Enhance</span>
                            <span className="text-orange-400 font-bold">+{currentLevel + 1}</span>
                          </div>
                          {/* Show stats */}
                          {(() => {
                            const hasAnyMainStats = Object.values(item.mainStats).some(v => (v as number) > 0);
                            return Object.entries(item.stats).map(([key, val]) => {
                              const baseMain = (item.mainStats as any)[key] || 0;
                              const baseTotal = val as number;
                              const baseSub = baseTotal - baseMain;
                              
                              const elements = [];
                              
                              if (baseMain > 0) {
                                  const currentMain = baseMain * (1 + 0.10 * currentLevel);
                                  const nextMain = baseMain * (1 + 0.10 * (currentLevel + 1));
                                  const diff = nextMain - currentMain;
                                  elements.push(
                                      <div key={`${key}-main`} className="flex justify-between text-xs sm:text-sm">
                                          <span className="text-slate-400 capitalize">{key}</span>
                                          <div className="flex items-center gap-1.5">
                                              <span className="text-orange-400 font-bold">{nextMain.toFixed(2)}</span>
                                              {diff > 0 && <span className="text-[8px] sm:text-[10px] text-emerald-500 font-black">+{diff.toFixed(2)}</span>}
                                          </div>
                                      </div>
                                  );
                              }
                              
                              if (baseSub > 0.01 && (showAllStats || !hasAnyMainStats)) {
                                  const currentSub = baseSub * (1 + 0.08 * currentLevel);
                                  const nextSub = baseSub * (1 + 0.08 * (currentLevel + 1));
                                  const diff = nextSub - currentSub;
                                  elements.push(
                                      <div key={`${key}-sub`} className="flex justify-between text-xs sm:text-sm italic opacity-80">
                                          <span className="text-slate-500 capitalize">{key} (Sub)</span>
                                          <div className="flex items-center gap-1.5">
                                              <span className="text-orange-400 font-bold">{nextSub.toFixed(2)}</span>
                                              {diff > 0 && <span className="text-[8px] sm:text-[10px] text-emerald-500 font-black">+{diff.toFixed(2)}</span>}
                                          </div>
                                      </div>
                                  );
                              }
                              
                              return elements;
                            });
                          })()}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllStats(!showAllStats);
                      }}
                      className={`w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all rounded-2xl border-2 ${
                        showAllStats 
                          ? 'bg-slate-800 text-white border-slate-700 shadow-inner' 
                          : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {showAllStats ? (
                        <>
                          <ChevronUp size={14} />
                          <span>Minimize Stats</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          <span>Show Full Potential</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Success Rate Visual */}
                  {!isMaxLevel && !forgeResult && renderSuccessRateVisual()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <div className="w-full mt-8">
              {isMaxLevel ? (
                <div className="w-full py-5 bg-slate-800 text-slate-500 font-black uppercase tracking-[0.3em] rounded-3xl text-center border-2 border-slate-700">
                  Maximum Level Reached
                </div>
              ) : forgeResult ? (
                <button 
                  onClick={() => { setForgeResult(null); setForgeStep(0); }}
                  className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-[0.3em] rounded-3xl transition-all active:scale-95"
                >
                  Try Again
                </button>
              ) : (
                <button 
                  onClick={handleForge}
                  disabled={!canAfford || isForging}
                  className={`w-full py-4 sm:py-5 rounded-3xl font-black uppercase tracking-[0.1em] sm:tracking-[0.3em] transition-all flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 relative overflow-hidden group ${
                    !canAfford ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_10px_40px_rgba(234,88,12,0.3)] active:scale-95'
                  }`}
                >
                  {isForging ? (
                    <span className="animate-pulse">Forging...</span>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Hammer size={18} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-xs sm:text-base">Forge Item</span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-1 bg-black/20 rounded-full text-[10px] sm:text-xs">
                        <div className="flex items-center gap-1">
                          <Coins size={10} className="text-yellow-500" />
                          <span className={user.gold < cost ? 'text-rose-400' : 'text-yellow-400'}>{formatNumber(cost)}</span>
                        </div>
                        <div className="w-px h-3 bg-white/10"></div>
                        <div className="flex items-center gap-1">
                          <Zap size={10} className="text-purple-400" />
                          <span className={!hasStone ? 'text-rose-400' : 'text-purple-400'}>{stoneCost} Stone{stoneCost !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
