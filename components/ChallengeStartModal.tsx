
import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, Swords, Lock, TrendingUp, Skull, ChevronDown, ChevronUp, BookOpen, CheckCircle } from 'lucide-react';
import { formatNumber, getRankBonus, getChallengeCost, RANKS, ALL_QUIZZES } from '../gameData';
import { Proficiency } from '../types';

interface ChallengeStartModalProps {
  skill: Proficiency;
  currentGold: number;
  philosopherStoneCount: number;
  onConfirm: (selectedRank: string) => void;
  onConfirmWithStone: (selectedRank: string) => void;
  onCancel: () => void;
}

export const ChallengeStartModal: React.FC<ChallengeStartModalProps> = ({ 
    skill, 
    currentGold, 
    philosopherStoneCount,
    onConfirm, 
    onConfirmWithStone,
    onCancel 
}) => {
  // Determine user's rank index based on level manually to be safe
  let userRankIndex = 0;
  if (skill.level > 999) userRankIndex = 8;
  else if (skill.level > 700) userRankIndex = 7;
  else if (skill.level > 400) userRankIndex = 6;
  else if (skill.level > 200) userRankIndex = 5;
  else if (skill.level > 100) userRankIndex = 4;
  else if (skill.level > 60) userRankIndex = 3;
  else if (skill.level > 30) userRankIndex = 2;
  else if (skill.level > 10) userRankIndex = 1;
  
  const availableRanks = RANKS.slice(0, userRankIndex + 1);
  const [selectedRankIndex, setSelectedRankIndex] = useState(userRankIndex);
  const [showLibrary, setShowLibrary] = useState(false);
  
  const selectedRank = RANKS[selectedRankIndex];
  const challengeDetails = getChallengeCost(selectedRank, currentGold, skill.name);
  const bonusPerQuestion = getRankBonus(selectedRank); 
  const canAfford = currentGold >= challengeDetails.total;

  // Calculate stats for this rank
  const rankStats = useMemo(() => {
      const external = skill.externalQuestions || [];
      const totalPool = [...ALL_QUIZZES, ...external];
      const rankQuestions = totalPool.filter(q => (q.skill === skill.name || q.category === skill.category) && q.rank === selectedRank);
      
      const unlockedCount = rankQuestions.filter(q => skill.unlockedQuestionIds.includes(q.id)).length;
      const totalCount = rankQuestions.length;
      // Calculate total bonus derived ONLY from this rank's knowledge
      const currentRankTotalBonus = (unlockedCount * bonusPerQuestion).toFixed(1);

      return { unlockedCount, totalCount, currentRankTotalBonus, rankQuestions };
  }, [skill, selectedRank, bonusPerQuestion]);

  const handlePrevRank = () => {
      if (selectedRankIndex > 0) setSelectedRankIndex(prev => prev - 1);
  };

  const handleNextRank = () => {
      if (selectedRankIndex < availableRanks.length - 1) setSelectedRankIndex(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-2 sm:p-4 animate-in fade-in zoom-in-95" onClick={onCancel}>
        <div 
            className={`bg-slate-900 border-2 border-red-500 rounded-2xl w-full max-w-sm p-4 sm:p-6 relative shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col ${showLibrary ? 'h-[80vh] sm:h-[70vh]' : 'h-auto max-h-[95vh] overflow-y-auto'}`}
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={onCancel} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-500 hover:text-white z-10">
                <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            <div className="text-center mb-3 sm:mb-4 shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-red-500/50 animate-pulse">
                    <Skull className="text-red-500 sm:w-8 sm:h-8" size={24} />
                </div>
                <h2 className="text-base sm:text-lg font-rpg font-bold text-white uppercase tracking-[0.2em] text-red-500">Sudden Death</h2>
                <p className="text-slate-400 text-[10px] sm:text-xs mt-1">Challenge: {skill.name}</p>
            </div>

            {!showLibrary ? (
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                        <div className="mb-3 sm:mb-4">
                            <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-1 sm:mb-2 block text-center">Target Rank</label>
                            <div className="flex items-center justify-between bg-slate-900 rounded-lg border border-slate-600 p-1.5 sm:p-2">
                                <button onClick={handlePrevRank} disabled={selectedRankIndex === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ChevronDown className="rotate-90 sm:w-5 sm:h-5" size={18}/></button>
                                <span className="font-bold text-white text-xs sm:text-sm uppercase">{selectedRank}</span>
                                <button onClick={handleNextRank} disabled={selectedRankIndex === availableRanks.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ChevronUp className="rotate-90 sm:w-5 sm:h-5" size={18}/></button>
                            </div>
                        </div>

                        <div className="flex justify-between mb-1.5 sm:mb-2 text-xs sm:text-sm">
                            <span className="text-slate-400">Entry Fee</span>
                            <span className={`font-bold ${canAfford ? 'text-yellow-500' : 'text-red-500'}`}>{formatNumber(challengeDetails.total)} G</span>
                        </div>
                        <div className="h-px bg-slate-700 my-1.5 sm:my-2"></div>
                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                            <span className="text-emerald-400 flex items-center gap-1"><TrendingUp className="sm:w-3.5 sm:h-3.5" size={12}/> Reward Rate</span>
                            <span className="font-bold text-white">+{bonusPerQuestion}% per Knowledge</span>
                        </div>
                        
                        {/* Stats Section */}
                        <div 
                            onClick={() => setShowLibrary(true)}
                            className="bg-slate-900/50 rounded p-2 mt-2 sm:mt-3 cursor-pointer hover:bg-slate-900 transition-colors border border-slate-700 hover:border-purple-500 group"
                        >
                            <div className="flex justify-between items-center text-[10px] sm:text-xs mb-1">
                                <span className="text-slate-400">Rank Progress</span>
                                <span className="text-white font-mono">{rankStats.unlockedCount} / {rankStats.totalCount} Unlocked</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] sm:text-xs">
                                <span className="text-slate-400">Current Rank Bonus</span>
                                <span className="text-purple-400 font-bold group-hover:text-purple-300">+{rankStats.currentRankTotalBonus}% Total</span>
                            </div>
                            <div className="text-[8px] sm:text-[9px] text-center mt-1.5 sm:mt-2 text-slate-500 group-hover:text-purple-400 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
                                <BookOpen size={10}/> View Knowledge Library
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-950/30 p-2 sm:p-3 rounded-lg border border-red-900/50 text-[9px] sm:text-[10px] text-red-200 leading-relaxed">
                        <p className="font-bold mb-1 flex items-center gap-2 text-red-400"><AlertTriangle className="sm:w-3 sm:h-3" size={10}/> RULES</p>
                        <ul className="list-disc pl-3 space-y-0.5">
                            <li>Correct answer: <span className="text-emerald-400">Unlocks Knowledge</span> permanently.</li>
                            <li>Wrong answer: <span className="text-red-400">Ends Run</span> immediately.</li>
                            <li>Defeat penalty: <span className="text-red-400">Re-locks 2 known</span> questions.</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden flex flex-col mb-3 sm:mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2"><BookOpen className="sm:w-3.5 sm:h-3.5" size={12}/> {selectedRank} Archive</h3>
                        <button onClick={() => setShowLibrary(false)} className="text-[10px] sm:text-xs text-slate-400 hover:text-white underline">Back</button>
                    </div>
                    <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {rankStats.rankQuestions.length > 0 ? (
                            rankStats.rankQuestions.map(q => {
                                const isUnlocked = skill.unlockedQuestionIds.includes(q.id);
                                return (
                                    <div key={q.id} className={`p-2 rounded border text-[10px] sm:text-xs flex items-start gap-2 ${isUnlocked ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                                        {isUnlocked ? <CheckCircle className="text-emerald-500 shrink-0 mt-0.5 sm:w-3 sm:h-3" size={10}/> : <Lock className="text-slate-600 shrink-0 mt-0.5 sm:w-3 sm:h-3" size={10}/>}
                                        <span className={isUnlocked ? 'text-slate-300' : 'text-slate-600'}>{q.question}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-slate-500 text-[10px] sm:text-xs">No data available for this rank yet.</div>
                        )}
                    </div>
                </div>
            )}

            {!showLibrary && (
                <div className="flex flex-col gap-2 sm:gap-3 mt-auto shrink-0">
                    <div className="flex gap-2 sm:gap-3">
                        <button 
                            onClick={onCancel}
                            className="flex-1 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors text-[10px] sm:text-xs uppercase"
                        >
                            Retreat
                        </button>
                        <button 
                            onClick={() => onConfirm(selectedRank)}
                            disabled={!canAfford}
                            className={`flex-1 py-2.5 sm:py-3 font-bold rounded-lg transition-colors text-[10px] sm:text-xs uppercase shadow-lg flex items-center justify-center gap-2 ${canAfford ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                        >
                            <Swords className="sm:w-3.5 sm:h-3.5" size={12}/> {canAfford ? 'Proceed' : 'Too Poor'}
                        </button>
                    </div>

                    {philosopherStoneCount > 0 && (
                        <div className="flex flex-col gap-1">
                            <button 
                                onClick={() => onConfirmWithStone(selectedRank)}
                                className="w-full py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors text-[10px] sm:text-xs uppercase shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 border border-purple-400/30"
                            >
                                <TrendingUp className="sm:w-3.5 sm:h-3.5" size={12}/> Use Stone ({philosopherStoneCount})
                            </button>
                            <p className="text-[8px] sm:text-[9px] text-purple-400 text-center font-bold uppercase tracking-tighter">No Gold Cost & No Memory Loss on Defeat</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};
