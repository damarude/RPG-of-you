
import React, { useEffect, useMemo } from 'react';
import { Trophy, Star, Sparkles, ArrowUp, Zap, Crown, Flame, Award } from 'lucide-react';
import { getRankName } from '../gameData';

interface LevelUpModalProps {
  type: 'USER' | 'SKILL';
  name: string;
  newLevel: number;
  onClose: () => void;
}

const USER_QUOTES = [
  "You are slightly less useless now!",
  "Number go up. Dopamine go brrr.",
  "Level Up! Your parents might actually be proud someday.",
  "Evolution Complete. You still look the same though.",
  "Power Level increasing... It's mostly ego.",
  "One step closer to world domination.",
  "Look at you, growing up so fast.",
  "Productivity spiked. Take a screenshot, it won't last.",
  "You did the thing! Good job doing the thing.",
  "Main Character Energy intensifying."
];

const SKILL_QUOTES = [
  "You now know 1% more about this.",
  "Skill Issue? Not anymore (mostly).",
  "Proficiency increased. Nerd cred +10.",
  "You pressed the buttons good.",
  "Knowledge absorbed. Head feels heavier.",
  "You're becoming dangerous with this.",
  "Mastery loading... 99% remaining.",
  "Don't get cocky, kid.",
  "UNLIMITED POWER!! (Terms and conditions apply).",
  "New neural pathways constructed."
];

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ type, name, newLevel, onClose }) => {
  const quote = useMemo(() => {
    const list = type === 'USER' ? USER_QUOTES : SKILL_QUOTES;
    return list[Math.floor(Math.random() * list.length)];
  }, [type]);

  const rankName = getRankName(newLevel);
  const isMilestone = newLevel % 10 === 0 || newLevel === 1;

  // Generate random particles for background effect
  const particles = useMemo(() => {
      return Array.from({ length: 12 }).map((_, i) => ({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          delay: `${Math.random() * 2}s`,
          duration: `${2 + Math.random() * 3}s`,
          size: Math.random() > 0.5 ? 'w-1 h-1' : 'w-2 h-2'
      }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm group">
        
        {/* Glow Behind */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${type === 'USER' ? 'from-yellow-600 via-orange-500 to-yellow-600' : 'from-purple-600 via-blue-500 to-purple-600'} rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow`}></div>
        
        <div className="relative bg-slate-900 border border-slate-700/50 rounded-3xl p-8 text-center shadow-2xl overflow-hidden">
            
            {/* Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map(p => (
                    <div 
                        key={p.id}
                        className={`absolute rounded-full ${type === 'USER' ? 'bg-yellow-500/20' : 'bg-purple-500/20'} ${p.size} animate-float-up`}
                        style={{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.duration }}
                    ></div>
                ))}
                {/* Rotating Rays */}
                <div className={`absolute -top-[50%] -left-[50%] w-[200%] h-[200%] ${type === 'USER' ? 'bg-gradient-to-tr from-transparent via-yellow-500/5 to-transparent' : 'bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent'} animate-spin-slow opacity-50`}></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                
                {/* Header Icon */}
                <div className="mb-6 relative">
                    <div className={`absolute inset-0 ${type === 'USER' ? 'bg-yellow-500' : 'bg-purple-500'} blur-2xl opacity-20 rounded-full animate-pulse`}></div>
                    <div className={`w-24 h-24 rounded-full border-4 ${type === 'USER' ? 'border-yellow-500 bg-yellow-950/30' : 'border-purple-500 bg-purple-950/30'} flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-in zoom-in duration-500`}>
                        {type === 'USER' ? (
                            <Crown className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-bounce" size={48} />
                        ) : (
                            <Zap className="text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)] animate-pulse" size={48} fill="currentColor" />
                        )}
                    </div>
                    {/* Floating Sparkles */}
                    <Sparkles className="absolute -top-4 -right-4 text-white animate-spin-slow" size={32} />
                    <Star className="absolute bottom-0 -left-6 text-yellow-200 animate-pulse" size={24} />
                </div>

                {/* Text Content */}
                <div className="animate-in slide-in-from-bottom-4 duration-700 delay-100">
                    <h2 className={`text-sm font-bold tracking-[0.3em] uppercase mb-2 ${type === 'USER' ? 'text-yellow-500' : 'text-purple-400'}`}>
                        {type === 'USER' ? 'Profile Upgrade' : 'Skill Proficiency'}
                    </h2>
                    
                    <h1 className="text-3xl font-rpg font-bold text-white mb-2 leading-none text-shadow-lg break-words">
                        {name}
                    </h1>

                    {type === 'USER' && (
                        <div className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                            Rank: <span className="text-white">{rankName}</span>
                        </div>
                    )}
                    
                    {/* Level Transition */}
                    <div className="flex items-center justify-center gap-4 bg-black/30 p-3 rounded-2xl border border-white/5 mb-6 backdrop-blur-sm">
                        <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase font-bold">Was</div>
                            <div className="text-2xl font-mono text-slate-400">{newLevel - 1}</div>
                        </div>
                        <ArrowUp className={`${type === 'USER' ? 'text-yellow-500' : 'text-purple-500'} animate-bounce`} size={24} />
                        <div className="text-left">
                            <div className={`text-xs uppercase font-bold ${type === 'USER' ? 'text-yellow-600' : 'text-purple-600'}`}>Now</div>
                            <div className={`text-4xl font-mono font-bold ${type === 'USER' ? 'text-yellow-400' : 'text-purple-400'} drop-shadow-md`}>{newLevel}</div>
                        </div>
                    </div>

                    {/* Flavor Text */}
                    <div className="relative mb-8">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-2 text-slate-600">
                            <MessageSquareIcon />
                        </div>
                        <p className="text-slate-300 text-sm italic border-t border-b border-slate-800 py-3 px-2 leading-relaxed">
                            "{quote}"
                        </p>
                    </div>

                    {/* Button */}
                    <button 
                        onClick={onClose}
                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                            type === 'USER' 
                            ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black shadow-yellow-900/20' 
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/20'
                        }`}
                    >
                        <Award size={18} /> Continue {type === 'USER' ? 'The Grind' : 'Learning'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Simple icon helper for the quote box
const MessageSquareIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-slate-700">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);
