
import React from 'react';

interface BattleSceneProps {
  userAvatar: string;
  enemyImage: string;
  enemyHp: number;
  enemyMaxHp: number;
  isAttacking: boolean;
  targetHit: boolean;
  slashEffect: 'slash-1' | 'slash-2' | null;
  bubbleText: string | null;
  enemyMockText: string | null;
}

export const BattleScene: React.FC<BattleSceneProps> = ({
  userAvatar, enemyImage, enemyHp, enemyMaxHp,
  isAttacking, targetHit, slashEffect, bubbleText, enemyMockText
}) => {
  return (
    <>
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[#050b14]">
          <div className="absolute inset-0 cyber-grid opacity-20 animate-grid-move" style={{ transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)' }}></div>
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent z-0"></div>
      </div>

      <div className="relative w-full h-full flex items-center justify-between px-8 animate-in fade-in z-10">
          <div className={`relative transition-all duration-100 ${isAttacking ? 'animate-lunge' : 'animate-breathe'}`}>
              {isAttacking && <div className="absolute -right-20 top-0 w-32 h-32 z-40 pointer-events-none"><div className="w-full h-full border-4 border-transparent border-t-white rounded-full animate-spin duration-300 opacity-80 blur-sm"></div></div>}
              {bubbleText && <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold p-3 rounded-2xl rounded-bl-none shadow-[0_0_20px_rgba(255,255,255,0.3)] z-50 animate-in zoom-in slide-in-from-bottom-2 w-max max-w-[180px] sm:max-w-[220px] text-center border-2 border-slate-200 whitespace-normal leading-tight">{bubbleText}</div>}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl border-4 border-slate-600 bg-slate-800 overflow-hidden shadow-2xl relative group">
                  <img src={userAvatar} className="w-full h-full object-cover pixel-art" alt="Hero" />
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(168,85,247,0.4)] mix-blend-overlay"></div>
              </div>
              <div className="w-full h-4 bg-black/60 rounded-[100%] mt-[-10px] blur-md translate-y-4"></div>
          </div>
          
          <div className={`relative transition-all duration-100 ${targetHit ? 'animate-shake brightness-150 saturate-0' : 'animate-idle'}`}>
              {targetHit && <div className="absolute inset-0 bg-white mix-blend-overlay rounded-full blur-xl opacity-50 animate-impact"></div>}
              {slashEffect && <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"><div className={`w-[120%] h-1 bg-white blur-sm rotate-45 ${slashEffect === 'slash-1' ? 'animate-ping' : ''}`}></div><div className={`w-[120%] h-1 bg-white blur-sm -rotate-45 ${slashEffect === 'slash-2' ? 'animate-ping' : ''}`}></div></div>}
              {enemyMockText && <div className="absolute -top-28 right-0 bg-red-950/90 text-red-100 text-[10px] font-bold p-3 rounded-2xl rounded-br-none shadow-[0_0_20px_rgba(220,38,38,0.4)] z-50 animate-in zoom-in slide-in-from-bottom-2 w-max max-w-[180px] border border-red-500/50 whitespace-normal leading-tight">{enemyMockText}</div>}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-2 bg-slate-900/80 backdrop-blur rounded-sm overflow-hidden border border-slate-700/50">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 relative" style={{ width: `${(enemyHp / enemyMaxHp) * 100}%` }}><div className="absolute right-0 top-0 bottom-0 w-px bg-white/50 shadow-[0_0_5px_white]"></div></div>
              </div>
              <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
                  <div className="w-full h-full relative flex items-center justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                       <img src={enemyImage || 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/creatures/1-removebg-preview.png'} alt="Enemy" className="w-full h-full object-contain pixel-art" />
                  </div>
              </div>
              <div className="w-full h-4 bg-black/60 rounded-[100%] mt-[-10px] blur-md translate-y-4"></div>
          </div>
      </div>
    </>
  );
};
