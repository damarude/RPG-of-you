
import React, { useState, useMemo } from 'react';
import { X, BookOpen, RefreshCw, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { RANKS, ALL_QUIZZES } from '../gameData';
import { Proficiency } from '../types';

interface RechallengeStartModalProps {
  skill: Proficiency;
  onConfirm: (selectedRank: string) => void;
  onCancel: () => void;
}

export const RechallengeStartModal: React.FC<RechallengeStartModalProps> = ({ skill, onConfirm, onCancel }) => {
  // Determine user's highest possible rank index based on level
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
  
  const selectedRank = RANKS[selectedRankIndex];

  // Calculate stats for this rank (Unlocked / Total)
  const rankStats = useMemo(() => {
      const external = skill.externalQuestions || [];
      const totalPool = [...ALL_QUIZZES, ...external];
      // Filter for specific rank
      const rankQuestions = totalPool.filter(q => (q.skill === skill.name || q.category === skill.category) && q.rank === selectedRank);
      
      const unlockedCount = rankQuestions.filter(q => skill.unlockedQuestionIds.includes(q.id)).length;
      const totalCount = rankQuestions.length;

      return { unlockedCount, totalCount, rankQuestions };
  }, [skill, selectedRank]);

  const handlePrevRank = () => {
      if (selectedRankIndex > 0) setSelectedRankIndex(prev => prev - 1);
  };

  const handleNextRank = () => {
      if (selectedRankIndex < availableRanks.length - 1) setSelectedRankIndex(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in zoom-in-95">
        <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl w-full max-w-sm p-6 relative shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col">
            <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10">
                <X size={24} />
            </button>

            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-900/10 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-emerald-500/50">
                    <RefreshCw className="text-emerald-500" size={32} />
                </div>
                <h2 className="text-lg font-rpg font-bold text-white uppercase tracking-[0.2em] text-emerald-500">Rechallenge</h2>
                <p className="text-slate-400 text-xs mt-1">Review: {skill.name}</p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
                <div className="mb-4">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block text-center">Select Rank Archive</label>
                    <div className="flex items-center justify-between bg-slate-900 rounded-lg border border-slate-600 p-2">
                        <button onClick={handlePrevRank} disabled={selectedRankIndex === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ChevronDown className="rotate-90" size={20}/></button>
                        <span className="font-bold text-white uppercase">{selectedRank}</span>
                        <button onClick={handleNextRank} disabled={selectedRankIndex === availableRanks.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ChevronUp className="rotate-90" size={20}/></button>
                    </div>
                </div>

                <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-400">Knowledge Unlocked</span>
                    <span className="font-mono font-bold text-white">{rankStats.unlockedCount} / {rankStats.totalCount}</span>
                </div>
                
                {rankStats.unlockedCount === 0 && (
                    <div className="text-center text-[10px] text-red-400 bg-red-950/20 p-2 rounded border border-red-900/30 mt-2">
                        You haven't unlocked any questions for this rank yet. Complete Challenges to unlock them.
                    </div>
                )}
            </div>

            <div className="flex gap-3 mt-auto">
                <button 
                    onClick={onCancel}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors text-xs uppercase"
                >
                    Back
                </button>
                <button 
                    onClick={() => onConfirm(selectedRank)}
                    disabled={rankStats.unlockedCount === 0}
                    className={`flex-1 py-3 font-bold rounded-lg transition-colors text-xs uppercase shadow-lg flex items-center justify-center gap-2 ${rankStats.unlockedCount > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                >
                    <BookOpen size={14}/> Start Review
                </button>
            </div>
        </div>
    </div>
  );
};
