
import React from 'react';
import { Award, Lock, X, Calendar } from 'lucide-react';
import { Achievement, AchievementTier } from '../types';

interface AchievementDetailModalProps {
  achievement: Achievement;
  onClose: () => void;
}

const getTierColor = (tier: AchievementTier) => {
  switch (tier) {
    case AchievementTier.BRONZE: 
        return 'border-orange-700 bg-orange-950/20 text-orange-500 shadow-sm shadow-orange-900/20';
    case AchievementTier.SILVER: 
        return 'border-slate-400 bg-slate-900/40 text-slate-200 shadow-md shadow-slate-500/20';
    case AchievementTier.GOLD: 
        return 'border-yellow-500 bg-yellow-950/30 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-pulse';
    case AchievementTier.PLATINUM: 
        return 'border-cyan-400 bg-cyan-950/30 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-breathe';
    case AchievementTier.DIAMOND: 
        return 'border-transparent bg-gradient-to-br from-red-500/20 via-blue-500/20 to-purple-500/20 text-white shadow-[0_0_25px_rgba(236,72,153,0.6)] animate-glow border-2 border-pink-400';
    default: 
        return 'border-slate-700 bg-slate-800 text-slate-500';
  }
};

export const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({ achievement, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className={`relative w-full max-w-sm rounded-2xl p-6 border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ${achievement.unlocked ? 'bg-slate-900 border-slate-700' : 'bg-slate-950 border-slate-800 grayscale'}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Diamond Special Background */}
        {achievement.unlocked && achievement.tier === AchievementTier.DIAMOND && (
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-green-500/10 to-blue-500/10 animate-pulse pointer-events-none"></div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-20">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center relative z-10">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 shadow-xl ${getTierColor(achievement.tier)}`}>
            {achievement.unlocked ? (
               <Award size={48} className={achievement.tier === AchievementTier.DIAMOND ? 'animate-bounce' : ''} />
            ) : (
               <Lock size={48} />
            )}
          </div>

          <h2 className={`text-2xl font-rpg font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-slate-500'}`}>
            {achievement.name}
          </h2>
          
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mb-6 tracking-widest border ${getTierColor(achievement.tier)}`}>
             {achievement.tier}
          </span>

          <div className="bg-slate-950/50 rounded-xl p-4 w-full mb-4 border border-slate-800">
             <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">Requirement</h3>
             <p className="text-slate-300 text-sm">{achievement.description}</p>
          </div>

          <div className="w-full mb-2">
             <p className="text-purple-400 italic font-serif text-sm">
               "{achievement.flavorText}"
             </p>
          </div>

          {achievement.unlocked && achievement.unlockedAt && (
             <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <Calendar size={12} />
                <span>Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
