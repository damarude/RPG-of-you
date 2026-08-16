
import React from 'react';
import { Proficiency, LearningSession, UserProfile, Item, ItemSlot } from '../types';
import { X, Zap, Clock, Swords, RefreshCw, Trophy, Calendar, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';
import { getRankName, getRankColor, getSkillExpRequired, formatNumber, getChallengeCost, getRankImage } from '../gameData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SkillDetailModalProps {
  skill: Proficiency;
  user: UserProfile;
  shopItems: Item[];
  sessions: LearningSession[];
  onClose: () => void;
  onStartFocus: () => void;
  onStartTimer: () => void;
  onStartChallenge: () => void;
  onStartRechallenge: () => void;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ 
    skill, user, shopItems, sessions, onClose, 
    onStartFocus, onStartTimer, onStartChallenge, onStartRechallenge 
}) => {
  const rankName = getRankName(skill.level);
  const rankColor = getRankColor(skill.level);
  const nextLevelExp = getSkillExpRequired(skill.level);
  const progress = (skill.currentExp / nextLevelExp) * 100;
  
  const skillSessions = sessions.filter(s => s.proficiencyId === skill.id);
  const lastSession = skillSessions.length > 0 ? skillSessions[0] : null;
  
  const lastTrainedDate = lastSession 
    ? new Date(lastSession.timestamp).toLocaleDateString() 
    : 'Never';

  const chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toDateString();
      const mins = skillSessions
        .filter(s => new Date(s.timestamp).toDateString() === dateStr)
        .reduce((acc, s) => acc + s.durationMinutes, 0);
      return {
          day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
          minutes: mins
      };
  });

  const unlockedCount = skill.unlockedQuestionIds.length;
  const totalQuestions = (skill.externalQuestions || []).length;
  const mastery = totalQuestions > 0 ? Math.floor((unlockedCount / totalQuestions) * 100) : 0;

  const equippedItems = Object.values(user.equipped)
      .map(id => shopItems.find(i => i.id === id))
      .filter((i): i is Item => !!i);
  
  const gearSkillExpBonus = equippedItems.reduce((acc, item) => acc + (item.stats.skillExpBonus || 0), 0);
  const libraryBonus = unlockedCount * 0.5;
  const totalBonus = (gearSkillExpBonus + libraryBonus).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95" onClick={onClose}>
      <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="relative h-32 bg-slate-900 overflow-hidden border-b border-slate-800 shrink-0">
            <div className={`absolute inset-0 opacity-20 ${rankColor.replace('text-', 'bg-')}`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
            
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors z-10">
                <X size={24} />
            </button>

            <div className="absolute bottom-4 left-6 flex items-end justify-between w-[calc(100%-3rem)]">
                <div>
                    <h2 className="text-3xl font-rpg font-bold text-white mb-1 shadow-black text-shadow-lg">{skill.name}</h2>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${rankColor} bg-black/50`}>{rankName}</span>
                        <span className="text-xs text-slate-400 font-mono">Lvl {skill.level}</span>
                    </div>
                </div>
                <img 
                    src={getRankImage(skill.level)} 
                    alt={rankName} 
                    className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] absolute right-0 bottom-0"
                />
            </div>
        </div>

        <div className="p-6 space-y-6">
            
            {/* Main Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={onStartFocus}
                    className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 border-2 border-purple-500/30 hover:border-purple-500 rounded-xl transition-all group"
                >
                    <div className="w-10 h-10 rounded-full bg-purple-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Zap className="text-purple-400" size={20} />
                    </div>
                    <span className="font-bold text-white text-sm">Focus</span>
                    <span className="text-[10px] text-slate-500 uppercase">Stopwatch</span>
                </button>

                <button 
                    onClick={onStartTimer}
                    className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 border-2 border-blue-500/30 hover:border-blue-500 rounded-xl transition-all group"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Clock className="text-blue-400" size={20} />
                    </div>
                    <span className="font-bold text-white text-sm">Timer</span>
                    <span className="text-[10px] text-slate-500 uppercase">Fixed Duration</span>
                </button>

                <button 
                    onClick={onStartChallenge}
                    className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 border-2 border-red-500/30 hover:border-red-500 rounded-xl transition-all group relative overflow-hidden"
                >
                    <div className="w-10 h-10 rounded-full bg-red-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Swords className="text-red-400" size={20} />
                    </div>
                    <span className="font-bold text-white text-sm">Challenge</span>
                    <span className="text-[10px] text-slate-500 uppercase">Select Target</span>
                </button>

                <button 
                    onClick={onStartRechallenge}
                    disabled={unlockedCount === 0}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all group ${unlockedCount === 0 ? 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 border-emerald-500/30 hover:border-emerald-500'}`}
                >
                    <div className="w-10 h-10 rounded-full bg-emerald-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <RefreshCw className="text-emerald-400" size={20} />
                    </div>
                    <span className="font-bold text-white text-sm">Rechallenge</span>
                    <span className="text-[10px] text-slate-500 uppercase">Review Archive</span>
                </button>
            </div>

            {/* Progress & Stats */}
            <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Trophy size={14}/> EXP Progress</span>
                        <span className="text-xs font-mono text-white">{formatNumber(skill.currentExp)} / {formatNumber(nextLevelExp)}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Exp Bonus</div>
                        <div className="text-xl font-bold text-white flex items-center gap-1">
                            <TrendingUp size={16} className="text-emerald-400" /> +{totalBonus}%
                        </div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Knowledge Mastery</div>
                        <div className="text-xl font-bold text-white flex items-center gap-1">
                            <BookOpen size={16} className="text-blue-400" /> {mastery}%
                        </div>
                    </div>
                </div>

                {/* Graph */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase">Training Activity (7 Days)</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar size={10}/> Last: {lastTrainedDate}</span>
                    </div>
                    <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px', color: '#fff' }}
                                />
                                <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.minutes > 0 ? '#8b5cf6' : '#334155'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
