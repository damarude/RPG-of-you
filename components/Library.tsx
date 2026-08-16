
import React, { useState, useMemo } from 'react';
import { AppState, QuizQuestion, Proficiency } from '../types';
import { ALL_QUIZZES } from '../gameData';
import { Lock, CheckCircle, ArrowLeft, BookOpen, ChevronRight, Folder, TrendingUp, Globe, Database, ArrowDownUp, HelpCircle, X } from 'lucide-react';

interface LibraryProps {
  state: AppState;
  onClose: () => void;
  onShowHelp?: () => void;
}

export const Library: React.FC<LibraryProps> = ({ state, onClose, onShowHelp }) => {
  // Navigation State
  const [viewLevel, setViewLevel] = useState<'categories' | 'skills' | 'ranks' | 'questions'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [selectedRank, setSelectedRank] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'az' | 'count'>('az');
  const [showBonusDetails, setShowBonusDetails] = useState(false);

  // --- MERGE DATA ---
  // Combine static game data with any downloaded questions in the user's state
  const totalPool = useMemo(() => {
      const external = state.proficiencies.flatMap(p => p.externalQuestions || []);
      return [...ALL_QUIZZES, ...external];
  }, [state.proficiencies]);

  // Helpers to get unique lists from the COMBINED pool
  const categories = Array.from(new Set(totalPool.map(q => q.category)));
  
  const skillsInCategory = useMemo(() => {
    let skills = Array.from(new Set(totalPool.filter(q => q.category === selectedCategory).map(q => q.skill)));
    if (sortOrder === 'az') {
        skills.sort((a, b) => (a as string).localeCompare(b as string));
    } else {
        // Sort by question count
        skills.sort((a, b) => {
            const countA = totalPool.filter(q => q.skill === a).length;
            const countB = totalPool.filter(q => q.skill === b).length;
            return countB - countA;
        });
    }
    return skills;
  }, [totalPool, selectedCategory, sortOrder]);
  
  // Custom sort for ranks (Novice -> Transcendent) instead of alphabetical
  const rankOrder = ['Novice', 'Apprentice', 'Professional', 'Expert', 'Master', 'Grandmaster', 'Legend', 'Mythic', 'Transcendent'];
  const ranksInSkill = Array.from(new Set(totalPool.filter(q => q.skill === selectedSkill).map(q => q.rank)))
    .sort((a, b) => {
        const idxA = rankOrder.indexOf(a as string);
        const idxB = rankOrder.indexOf(b as string);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  
  // Final filtered list
  const filteredQuestions = totalPool.filter(q => q.skill === selectedSkill && q.rank === selectedRank);

  // Aggregate all unlocked IDs from all proficiencies
  const unlockedIds = new Set<string>();
  state.proficiencies.forEach(p => {
      if (p.unlockedQuestionIds) {
          p.unlockedQuestionIds.forEach(id => unlockedIds.add(id));
      }
  });

  const totalBonusRate = (unlockedIds.size * 0.5).toFixed(1);

  const handleBack = () => {
      if (viewLevel === 'questions') setViewLevel('ranks');
      else if (viewLevel === 'ranks') setViewLevel('skills');
      else if (viewLevel === 'skills') setViewLevel('categories');
      else onClose();
  };

  const getBreadcrumb = () => {
      if (viewLevel === 'categories') return 'Categories';
      if (viewLevel === 'skills') return selectedCategory;
      if (viewLevel === 'ranks') return selectedSkill;
      return selectedRank;
  };

  const renderBonusDetails = () => {
      const activeProficiencies = state.proficiencies.filter(p => (p.unlockedQuestionIds?.length || 0) > 0);
      
      return (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[130] p-4 animate-in fade-in zoom-in-95" onClick={() => setShowBonusDetails(false)}>
              <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setShowBonusDetails(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                  >
                      <X size={20}/>
                  </button>
                  
                  <div className="p-5 border-b border-slate-800">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <TrendingUp className="text-emerald-400" size={20}/> Knowledge Power
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                          Bonus EXP applied when training specific skills.
                      </p>
                  </div>

                  <div className="overflow-y-auto p-4 custom-scrollbar space-y-2">
                      {activeProficiencies.length > 0 ? (
                          activeProficiencies.map(p => {
                              const count = p.unlockedQuestionIds?.length || 0;
                              const bonus = (count * 0.5).toFixed(1);
                              return (
                                  <div key={p.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                      <div>
                                          <span className="text-sm font-bold text-white block">{p.name}</span>
                                          <span className="text-[10px] text-slate-500 uppercase font-bold">{count} Secrets Unlocked</span>
                                      </div>
                                      <div className="text-right">
                                          <span className="text-lg font-mono font-bold text-emerald-400">+{bonus}%</span>
                                          <span className="text-[9px] text-emerald-600 block uppercase">EXP Bonus</span>
                                      </div>
                                  </div>
                              );
                          })
                      ) : (
                          <div className="text-center py-8 text-slate-500 text-sm italic">
                              No knowledge unlocked yet.<br/>Complete challenges to earn bonuses.
                          </div>
                      )}
                  </div>

                  <div className="p-4 border-t border-slate-800 bg-slate-950/30 rounded-b-2xl">
                      <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 uppercase font-bold">Total Knowledge Sum</span>
                          <span className="text-emerald-500 font-bold font-mono">+{totalBonusRate}%</span>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="pb-20 animate-in fade-in">
        {showBonusDetails && renderBonusDetails()}

        <div className="flex items-center gap-4 mb-6">
            <button onClick={handleBack} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
                <h2 className="text-2xl font-rpg font-bold text-white flex items-center gap-2">
                    <BookOpen className="text-purple-400" /> Great Library
                </h2>
                <p className="text-xs text-slate-400 font-mono text-purple-300/80 uppercase tracking-widest">{getBreadcrumb()}</p>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowBonusDetails(true)}
                    className="bg-emerald-900/30 border border-emerald-500/30 px-3 py-2 rounded-xl flex flex-col items-center min-w-[80px] hover:bg-emerald-900/50 transition-colors cursor-pointer group"
                >
                    <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm group-hover:scale-110 transition-transform">
                        <TrendingUp size={14} /> Info
                    </div>
                    <span className="text-[9px] text-emerald-600 uppercase font-bold tracking-wider group-hover:text-emerald-400">Bonus Rates</span>
                </button>
                {onShowHelp && (
                    <button onClick={onShowHelp} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <HelpCircle size={20} />
                    </button>
                )}
            </div>
        </div>

        {/* Level 1: Categories */}
        {viewLevel === 'categories' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setViewLevel('skills'); }}
                        className="bg-slate-800 border border-slate-700 hover:border-purple-500 hover:bg-slate-700 p-6 rounded-xl text-left transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Database size={48} />
                        </div>
                        <span className="text-lg font-bold text-white group-hover:text-purple-400">{cat}</span>
                        <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                            <span>{totalPool.filter(q => q.category === cat).length} Entries</span>
                            <ChevronRight size={16} />
                        </div>
                    </button>
                ))}
            </div>
        )}

        {/* Level 2: Skills */}
        {viewLevel === 'skills' && (
            <div>
                <div className="flex justify-end mb-2">
                     <button 
                        onClick={() => setSortOrder(prev => prev === 'az' ? 'count' : 'az')}
                        className="text-xs text-slate-400 flex items-center gap-1 hover:text-white"
                     >
                         <ArrowDownUp size={12} /> {sortOrder === 'az' ? 'A-Z' : 'Count'}
                     </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {skillsInCategory.map(skill => (
                        <button 
                            key={skill}
                            onClick={() => { setSelectedSkill(skill); setViewLevel('ranks'); }}
                            className="bg-slate-800 border border-slate-700 hover:border-purple-500 hover:bg-slate-700 p-4 rounded-xl text-left transition-all flex justify-between items-center group"
                        >
                            <span className="font-bold text-white group-hover:text-purple-400">{skill}</span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="mr-2">{totalPool.filter(q => q.skill === skill).length} Qs</span>
                                <Folder size={14} />
                                <ChevronRight size={16} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Level 3: Ranks */}
        {viewLevel === 'ranks' && (
            <div className="grid grid-cols-1 gap-3">
                {ranksInSkill.map(rank => (
                    <button 
                        key={rank}
                        onClick={() => { setSelectedRank(rank); setViewLevel('questions'); }}
                        className="bg-slate-800 border border-slate-700 hover:border-purple-500 hover:bg-slate-700 p-4 rounded-xl text-left transition-all flex justify-between items-center group"
                    >
                        <span className="font-bold text-white uppercase tracking-widest group-hover:text-purple-400">{rank}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            {/* Calculate unlocked count */}
                            {totalPool.filter(q => q.skill === selectedSkill && q.rank === rank && unlockedIds.has(q.id)).length} / 
                            {totalPool.filter(q => q.skill === selectedSkill && q.rank === rank).length} Unlocked
                            <ChevronRight size={16} />
                        </div>
                    </button>
                ))}
            </div>
        )}

        {/* Level 4: Questions List */}
        {viewLevel === 'questions' && (
            <div className="grid grid-cols-1 gap-4">
                {filteredQuestions.length > 0 ? (
                    filteredQuestions.map(q => {
                        const isUnlocked = unlockedIds.has(q.id);
                        const isExternal = q.id.startsWith('ext_'); // Check ID prefix

                        return (
                            <div key={q.id} className={`p-4 rounded-xl border-2 transition-all ${isUnlocked ? 'bg-slate-900 border-purple-900/50' : 'bg-slate-950 border-slate-800 opacity-60'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-2">
                                        <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded border ${isUnlocked ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-slate-800 text-slate-600 border-slate-700'}`}>
                                            {q.rank}
                                        </span>
                                        {isExternal && (
                                            <span className="text-[9px] font-bold uppercase px-2 py-1 rounded border bg-blue-900/30 text-blue-400 border-blue-800 flex items-center gap-1">
                                                <Globe size={10} /> Ext
                                            </span>
                                        )}
                                    </div>
                                    {isUnlocked ? <CheckCircle size={16} className="text-emerald-500" /> : <Lock size={16} className="text-slate-700" />}
                                </div>
                                
                                {isUnlocked ? (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <p className="text-white font-bold text-sm mb-3 leading-relaxed">{q.question}</p>
                                        <div className="space-y-2">
                                            {q.options.map((opt, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={`p-2.5 rounded-lg text-xs border flex items-center gap-2 ${idx === q.correctAnswerIndex ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                                                >
                                                    {idx === q.correctAnswerIndex && <CheckCircle size={12}/>} {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-slate-700">
                                        <p className="text-4xl font-rpg font-bold mb-2 opacity-20">???</p>
                                        <p className="text-[10px] uppercase tracking-widest font-bold">Knowledge Locked</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center p-8 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                        No scrolls found in this section.
                    </div>
                )}
            </div>
        )}
    </div>
  );
};
