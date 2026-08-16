
import React from 'react';
import { Proficiency } from '../types';
import { Zap, Swords, TrendingUp, Download, Shield, Clock, BookOpen, Star, Crown, Gem, Sun, Sword, Ban } from 'lucide-react';
import { getRankName, getRankColor, getSkillExpRequired, formatNumber, ALL_QUIZZES, getRankImage } from '../gameData';

interface SkillCardProps {
  skill: Proficiency;
  downloadUrl?: string; // Optional: URL if a download is available in index
  onClick: () => void;
  onQuickStart: (e: React.MouseEvent) => void;
  onChallenge: (e: React.MouseEvent) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, downloadUrl, onClick, onQuickStart, onChallenge }) => {
  const nextLevelExp = getSkillExpRequired(skill.level);
  const progress = (skill.currentExp / nextLevelExp) * 100;
  const rankName = getRankName(skill.level);
  const rankColor = getRankColor(skill.level);
  // Extract custom hex color for border if present, else fallback
  const borderColor = rankColor.split(' ').find(c => c.startsWith('border-')) || 'border-slate-700';
  // Extract custom hex color for text
  const textColor = rankColor.split(' ').find(c => c.startsWith('text-')) || 'text-slate-400';
  
  // Calculate total available questions
  const staticCount = ALL_QUIZZES.filter(q => q.skill === skill.name || q.category === skill.category).length;
  const externalCount = skill.externalQuestions ? skill.externalQuestions.length : 0;
  const availableQuestions = staticCount + externalCount;
  
  const unlockedCount = skill.unlockedQuestionIds ? skill.unlockedQuestionIds.length : 0;
  const bonusRate = (unlockedCount * 0.5).toFixed(1);
  
  const hasDownload = !!downloadUrl;
  const canChallengeOrDownload = availableQuestions > 0 || hasDownload;

  return (
    <div 
      onClick={onClick}
      className={`relative bg-slate-900 rounded-xl p-5 border-2 ${borderColor} overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group`}
    >
      {/* Background Gradient based on rank color - using the border color hex as a tint */}
      {/* Note: borderColor is like "border-[#ABCDEF]". replacing 'border-' gives '[#ABCDEF]' which is valid for 'to-' */}
      <div className={`absolute inset-0 opacity-10 bg-gradient-to-br from-transparent to-${borderColor.replace('border-', '')} transition-opacity group-hover:opacity-20 pointer-events-none`}></div>
      
      {/* Rank Image Badge */}
      <div className={`absolute top-0 right-0 p-2 rounded-bl-xl border-l border-b ${borderColor} bg-slate-950/80 backdrop-blur flex items-center justify-center`}>
          <img 
            src={getRankImage(skill.level)} 
            alt={rankName} 
            className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"
          />
      </div>

      <div className="flex justify-between items-start mb-4 pr-12">
        <div>
          <h3 className="font-rpg font-bold text-lg text-white tracking-wide leading-tight">{skill.name}</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{skill.category}</p>
          <div className="flex items-center gap-2 mt-1">
             <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border bg-slate-950 ${rankColor}`}>
                {rankName}
             </span>
             <span className="text-xs font-mono text-slate-500 font-bold">Lvl {skill.level}</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[9px] mb-1.5 text-slate-400 font-bold uppercase tracking-wider">
          <span>EXP {formatNumber(Math.floor(skill.currentExp))} / {formatNumber(nextLevelExp)}</span>
          <span>{Math.floor(skill.totalHours)}h Played</span>
        </div>
        <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div 
            className={`h-full transition-all duration-1000 ease-out bg-${borderColor.replace('border-', '')}`}
            style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: 'currentColor' }} 
          >
             <div className={`h-full w-full ${textColor.replace('text-', 'bg-')}`}></div>
          </div>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20">
              <TrendingUp size={12} /> Bonus: +{bonusRate}%
          </div>
          <div className="text-[9px] text-slate-600 font-bold uppercase tracking-wide">
              {availableQuestions > 0 ? `${unlockedCount}/${availableQuestions} Secrets` : (hasDownload ? 'Download Ready' : 'No Data')}
          </div>
      </div>

      <div className="flex gap-2">
          <button
            onClick={onQuickStart}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-lg text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Zap size={14} className="fill-current" /> Train
          </button>
          
          <button
            onClick={onChallenge}
            disabled={!canChallengeOrDownload}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                !canChallengeOrDownload 
                ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-900 to-red-800 border border-red-700 text-red-100 hover:from-red-800 hover:to-red-700 shadow-red-900/20'
            }`}
          >
            {!canChallengeOrDownload ? (
                 <><Ban size={14} /> No Data</>
            ) : availableQuestions === 0 && hasDownload ? (
                 <><Download size={14} /> Install</>
            ) : (
                 <><Swords size={14} /> Challenge</>
            )}
          </button>
      </div>
    </div>
  );
};
