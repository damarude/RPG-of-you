
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Quest } from '../types';
import { Scroll, CheckCircle, Gift, ChevronDown, ChevronUp, Star, Clock, Calendar, HelpCircle, Shield, Hexagon, Zap, TrendingUp } from 'lucide-react';
import { formatNumber, getQuestRewards } from '../gameData';
import { EnemyEncyclopediaModal } from './EnemyEncyclopediaModal';

interface QuestBoardProps {
  quests: Quest[];
  onClaim: (questId: string) => void;
  onShowHelp?: () => void;
  detailedEnemies: any[];
  huntedEnemies: Record<string, number>;
  hideEncyclopediaButton?: boolean;
  userTotalLevel: number;
  installedEnemyImages?: boolean;
}

export const QuestBoard: React.FC<QuestBoardProps> = ({ quests, onClaim, onShowHelp, detailedEnemies, huntedEnemies, hideEncyclopediaButton, userTotalLevel, installedEnemyImages }) => {
  const [showCompletedMain, setShowCompletedMain] = useState(false);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);

  const mainQuests = quests.filter(q => q.category === 'MAIN');
  const dailyQuests = quests.filter(q => q.category === 'DAILY');
  const weeklyQuests = quests.filter(q => q.category === 'WEEKLY');

  const activeMain = mainQuests.filter(q => !q.isClaimed).sort((a,b) => (a.isCompleted === b.isCompleted) ? 0 : a.isCompleted ? -1 : 1);
  const completedMain = mainQuests.filter(q => q.isClaimed);

  const renderQuestCard = (quest: Quest) => {
    const isCompletable = quest.isCompleted && !quest.isClaimed;
    const rewards = getQuestRewards(quest, userTotalLevel);
    
    let borderColor = 'border-blue-500';
    if (quest.category === 'MAIN') borderColor = 'border-yellow-500';
    if (quest.category === 'WEEKLY') borderColor = 'border-purple-500';

    return (
        <div 
          key={quest.id} 
          className={`relative mb-4 group ${quest.isClaimed ? 'opacity-60 grayscale-[0.5]' : ''}`}
        >
          {/* Parchment Background */}
          <div className="absolute inset-0 bg-[#f4e4bc] shadow-md transform rotate-[-0.5deg] group-hover:rotate-0 transition-transform duration-300 rounded-sm border border-[#d4c49c]" />
          <div className="absolute inset-0 bg-[#fcf5e5] shadow-inner transform rotate-[0.5deg] group-hover:rotate-0 transition-transform duration-300 rounded-sm border border-[#e4d4ac] opacity-80" />
          
          {/* Content Container */}
          <div className="relative p-5 z-10">
            {isCompletable && (
              <div className="absolute -top-2 -right-2 bg-red-700 text-white text-[10px] font-bold px-3 py-1 uppercase shadow-lg transform rotate-3 animate-pulse border border-red-900">
                Urgent
              </div>
            )}

            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-rpg font-bold text-lg text-amber-950 ${quest.isClaimed ? 'line-through opacity-50' : ''}`}>
                {quest.title}
              </h3>
              <div className="flex gap-1">
                {quest.category === 'MAIN' && <span className="text-[9px] bg-amber-900 text-amber-100 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-tighter">Main</span>}
                {quest.category === 'WEEKLY' && <span className="text-[9px] bg-indigo-900 text-indigo-100 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-tighter">Weekly</span>}
              </div>
            </div>
            
            <p className="text-xs text-amber-900/70 mb-4 font-serif italic leading-relaxed">
              "{quest.description}"
            </p>

            <div className="space-y-3 mb-4">
              {quest.steps.map(step => (
                <div key={step.id}>
                   <div className="flex justify-between text-[10px] text-amber-900 font-bold mb-1 uppercase tracking-widest">
                      <span>Objective</span>
                      <span>{formatNumber(Math.min(step.current, step.target))} / {formatNumber(step.target)}</span>
                   </div>
                   <div className="h-2 bg-amber-900/10 rounded-full overflow-hidden border border-amber-900/20">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((step.current / step.target) * 100, 100)}%` }}
                        className={`h-full transition-all duration-1000 ${quest.category === 'MAIN' ? 'bg-amber-700' : quest.category === 'WEEKLY' ? 'bg-indigo-700' : 'bg-emerald-700'}`}
                      />
                   </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col pt-3 border-t border-amber-900/10 gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-900/50 uppercase font-bold mb-1">Rewards</span>
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center text-sm font-bold text-amber-900">
                    <Gift size={14} className="mr-1 text-amber-700" /> {formatNumber(rewards.gold)} <span className="text-[10px] ml-0.5">Gold</span>
                  </span>
                  
                  {rewards.profileExp > 0 && (
                    <span className="flex items-center text-sm font-bold text-indigo-700">
                      <TrendingUp size={14} className="mr-1" /> {formatNumber(rewards.profileExp)} <span className="text-[10px] ml-0.5">EXP</span>
                    </span>
                  )}

                  {rewards.profileExp > 0 && (
                    <span className="flex items-center text-sm font-bold text-blue-700">
                      <TrendingUp size={14} className="mr-1" /> {rewards.profileExp} <span className="text-[10px] ml-0.5">Exp</span>
                    </span>
                  )}

                  {rewards.patronExp > 0 && (
                    <span className="flex items-center text-sm font-bold text-emerald-700">
                      <Zap size={14} className="mr-1" /> {rewards.patronExp} <span className="text-[10px] ml-0.5">Patron</span>
                    </span>
                  )}

                  {(quest.category === 'MAIN' || quest.category === 'WEEKLY') && (
                    <span className="flex items-center text-sm font-bold text-purple-700">
                      <Hexagon size={14} className="mr-1" /> 1 <span className="text-[10px] ml-0.5">Stone</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                {isCompletable ? (
                  <button 
                    onClick={() => onClaim(quest.id)}
                    className="bg-amber-800 hover:bg-amber-700 text-amber-50 text-xs font-bold px-5 py-2 rounded shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-b-4 border-amber-950"
                  >
                    CLAIM REWARD
                  </button>
                ) : quest.isClaimed ? (
                    <div className="flex flex-col items-end">
                      <span className="text-emerald-700 text-xs font-bold flex items-center gap-1 uppercase tracking-widest">
                        <CheckCircle size={14} /> Completed
                      </span>
                    </div>
                ) : (
                    <span className="text-amber-900/40 text-[10px] font-bold uppercase tracking-widest italic">In Pursuit...</span>
                )}
              </div>
            </div>
          </div>

          {/* Decorative Thumbtack */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-900 rounded-full shadow-md z-20 border border-red-950" />
        </div>
    );
  };

  return (
    <div className="pb-20 animate-in fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 bg-amber-950/20 p-4 rounded-xl border border-amber-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-900 rounded-lg shadow-inner">
              <Scroll className="text-amber-100" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-rpg font-bold text-amber-100 tracking-tight">Quest Registry</h2>
              <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Official Guild Tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
              {!hideEncyclopediaButton && (
                  <button 
                      onClick={() => setShowEncyclopedia(true)} 
                      className="p-2 text-amber-400 hover:text-amber-100 transition-colors flex items-center gap-2 bg-amber-900/40 rounded-lg border border-amber-800/50 hover:bg-amber-800"
                      title="Enemy Encyclopedia"
                  >
                      <Shield size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter hidden sm:inline">Bestiary</span>
                  </button>
              )}
              {onShowHelp && (
                  <button onClick={onShowHelp} className="p-2 text-amber-400 hover:text-amber-100 transition-colors bg-amber-900/40 rounded-lg border border-amber-800/50">
                      <HelpCircle size={18} />
                  </button>
              )}
          </div>
      </div>

      <div className="space-y-10">
        <section>
          <div className="flex items-center gap-3 mb-4 border-b border-amber-900/20 pb-2">
              <Star size={18} className="text-yellow-600" /> 
              <h3 className="text-xs font-bold text-amber-200 uppercase tracking-[0.2em]">Epic Undertakings</h3>
          </div>
          <div className="grid gap-2">
            {activeMain.length > 0 ? activeMain.map(renderQuestCard) : <p className="text-xs text-amber-900/50 italic text-center py-4">The guild has no epic tasks for you at this moment.</p>}
          </div>
          
          {completedMain.length > 0 && (
              <div className="mt-6">
                  <button 
                      onClick={() => setShowCompletedMain(!showCompletedMain)}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-900/40 hover:text-amber-600 transition-colors w-full justify-center py-2 border border-dashed border-amber-900/20 rounded-lg"
                  >
                      {showCompletedMain ? 'Hide' : 'Review'} Archived Deeds ({completedMain.length})
                      {showCompletedMain ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {showCompletedMain && (
                      <div className="mt-4 space-y-2">
                          {completedMain.map(renderQuestCard)}
                      </div>
                  )}
              </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4 border-b border-amber-900/20 pb-2">
              <Calendar size={18} className="text-indigo-500" /> 
              <h3 className="text-xs font-bold text-amber-200 uppercase tracking-[0.2em]">Weekly Trials</h3>
          </div>
          <div className="grid gap-2">
            {weeklyQuests.length > 0 ? weeklyQuests.map(renderQuestCard) : <p className="text-xs text-amber-900/50 italic text-center py-4">No weekly trials active.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4 border-b border-amber-900/20 pb-2">
              <Clock size={18} className="text-emerald-500" /> 
              <h3 className="text-xs font-bold text-amber-200 uppercase tracking-[0.2em]">Daily Errands</h3>
              <span className="text-[9px] text-amber-900/40 font-bold ml-auto uppercase tracking-tighter">Refreshes at Midnight</span>
          </div>
          <div className="grid gap-2">
            {dailyQuests.length > 0 ? dailyQuests.map(renderQuestCard) : <p className="text-xs text-amber-900/50 italic text-center py-4">Check back tomorrow for new errands.</p>}
          </div>
        </section>
      </div>

      {showEncyclopedia && (
        <EnemyEncyclopediaModal 
          onClose={() => setShowEncyclopedia(false)} 
          detailedEnemies={detailedEnemies}
          huntedEnemies={huntedEnemies}
          highestRankIndex={0} // Fallback if not provided
          installedEnemyImages={installedEnemyImages}
        />
      )}
    </div>
  );
};
