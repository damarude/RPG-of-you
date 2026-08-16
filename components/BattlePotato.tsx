import React, { useRef } from 'react';
import { Skull } from 'lucide-react';
import { BattleSceneProps } from './BattleUltra';

export const BattlePotato: React.FC<BattleSceneProps> = ({
  userAvatar, enemyImage, enemyName, enemyTitle, enemyRank, enemyRace, enemySize, enemyHp, enemyMaxHp, playerHp, playerMaxHp, playerAttackGauge, enemyAttackGauge, isDead, isEnemyDead, isEnemySpawning, isUndying, isEnemyUndying, isAttacking, isEnemyAttacking, targetHit, hitVfx, slashEffect, bubbleText, enemyMockText, isEnemyStunned, isPlayerStunned, vfxLevel, floatingMockEnabled, installedEnemyImages, devicePerformance
}) => {
  // Simplified dynamic class for enemy based on hit type
  let enemyAnimClass = targetHit ? 'brightness-150' : '';
  
  if (hitVfx === 'crit') enemyAnimClass = 'animate-shake brightness-150 sepia'; 
  if (hitVfx === 'overcrit') enemyAnimClass = 'animate-shake opacity-80'; 
  if (hitVfx === 'plus-ultra') enemyAnimClass = 'opacity-0 transition-opacity duration-300'; 
  if (hitVfx === 'death') enemyAnimClass = 'animate-death';
  if (hitVfx === 'spawn') enemyAnimClass = 'animate-spawn';

  const getRankStyles = (rank?: string) => {
      const r = (rank || '').toUpperCase();
      if (r === 'TRANSCENDENT') return { container: '', name: 'text-[14px] font-black text-cyan-300', title: 'text-[10px] text-cyan-100', rank: 'text-[9px] font-bold text-cyan-400' };
      if (r === 'MYTHIC') return { container: '', name: 'text-[13px] font-bold text-purple-400', title: 'text-[10px] text-pink-200', rank: 'text-[8px] font-bold text-purple-400' };
      if (r === 'LEGEND' || r === 'LEGENDARY') return { container: '', name: 'text-[13px] font-bold text-orange-400', title: 'text-[10px] text-orange-200', rank: 'text-[8px] font-bold text-orange-500' };
      if (r === 'GRANDMASTER') return { container: '', name: 'text-[12px] font-bold text-yellow-400', title: 'text-[10px] text-yellow-200', rank: 'text-[8px] font-bold text-yellow-500' };
      if (r === 'MASTER') return { container: '', name: 'text-[12px] font-bold text-red-400', title: 'text-[9px] text-red-200', rank: 'text-[8px] font-bold text-red-500' };
      if (r === 'EXPERT') return { container: '', name: 'text-[11px] font-bold text-blue-400', title: 'text-[9px] text-blue-200', rank: 'text-[8px] font-bold text-blue-500' };
      return { container: '', name: 'text-[11px] font-bold text-slate-200', title: 'text-[9px] text-slate-300', rank: 'text-[8px] font-bold text-slate-500' };
  };

  const rankStyles = getRankStyles(enemyRank);
  const playerRef = useRef<HTMLDivElement>(null);
  const enemyRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050b14]">
      {/* Simplified Background */}
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent z-0"></div>
      
      {/* Basic Death Atmosphere */}
      {isDead && (
          <div className="absolute inset-0 bg-red-950/40 z-0"></div>
      )}

      {/* Screen Space VFX Layer - Simplified */}
      {vfxLevel !== 'LOW' && (
        <div className="absolute inset-0 pointer-events-none z-[60] flex items-center justify-center overflow-hidden">
            {hitVfx === 'crit' && <div className="absolute w-full h-2 bg-yellow-200 rotate-[-45deg] animate-slash-draw"></div>}
            {hitVfx === 'overcrit' && (
                <>
                    <div className="absolute w-full h-4 bg-red-500 rotate-45 animate-slash-draw" style={{ animationDuration: '0.15s' }}></div>
                    <div className="absolute w-full h-4 bg-purple-500 -rotate-45 animate-slash-draw" style={{ animationDuration: '0.2s', animationDelay: '0.05s' }}></div>
                </>
            )}
            {hitVfx === 'plus-ultra' && (
                <>
                    <div className="absolute h-[200%] w-2 bg-black rotate-[15deg] animate-void-cut z-50"></div>
                    <div className="absolute inset-0 bg-white animate-flash duration-500 z-40 opacity-50"></div>
                </>
            )}
        </div>
      )}

      <div className="relative w-full h-full flex items-center justify-between px-8 z-10 max-w-4xl mx-auto">
          
          {/* Player Logic Visuals */}
          <div className={`relative transition-transform duration-300 ease-out z-20 ${isAttacking ? 'translate-x-16 scale-105' : (isDead ? 'scale-95 grayscale' : '')}`}>
              
              {isDead && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 text-center z-50 pointer-events-none">
                       <h2 className="text-lg font-bold text-red-600">YOU DIED</h2>
                  </div>
              )}

              <div ref={playerRef} className={`w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-2 ${isDead ? 'border-red-900' : 'border-slate-600'} bg-slate-800 relative z-20`}>
                  <img src={userAvatar} className={`w-full h-full object-cover pixel-art ${isUndying ? 'drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : ''}`} alt="Hero" />
                  {isDead && <div className="absolute inset-0 bg-red-900/40"></div>}
              </div>
              
              {/* Standard HP Bar */}
              {!isDead && (
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 z-50 pointer-events-none">
                     <div className="flex justify-center mb-1 h-3">
                         {isPlayerStunned && <span className="text-[8px] font-bold text-yellow-400 bg-black/50 px-1 rounded">STUNNED</span>}
                         {isUndying && <span className="text-[8px] font-bold text-yellow-400 bg-black/50 px-1 rounded ml-1">UNDYING</span>}
                     </div>
                     <div className="h-2.5 bg-slate-900 rounded-full border border-slate-700 relative overflow-hidden mb-1">
                         <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(playerHp / playerMaxHp) * 100}%` }}></div>
                         <div className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-white">
                             {Math.floor(playerHp)} / {Math.floor(playerMaxHp)}
                         </div>
                     </div>
                     <div className="h-1 bg-slate-900 rounded-full border border-slate-700 relative overflow-hidden">
                         <div className="h-full bg-blue-500 transition-all duration-100" style={{ width: `${playerAttackGauge}%` }}></div>
                     </div>
                 </div>
              )}
          </div>
          
          {/* Enemy Logic Visuals */}
          <div className={`relative transition-transform duration-150 ease-in-out z-20 ${enemyAnimClass} ${isEnemyAttacking ? '-translate-x-16 scale-110' : ''}`}>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 z-50 pointer-events-none flex flex-col items-center">
                  <div className="flex justify-center mb-1 h-3">
                      {isEnemyStunned && <span className="text-[8px] font-bold text-yellow-400 bg-black/50 px-1 rounded">STUNNED</span>}
                      {isEnemyUndying && <span className="text-[8px] font-bold text-yellow-400 bg-black/50 px-1 rounded ml-1">UNDYING</span>}
                  </div>
                  <div className="h-2.5 w-28 bg-slate-900 rounded-full border border-slate-700 relative overflow-hidden mb-1">
                      <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(enemyHp / enemyMaxHp) * 100}%` }}></div>
                      <div className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-white">
                          {formatNumber(Math.floor(enemyHp))} / {formatNumber(Math.floor(enemyMaxHp))}
                      </div>
                  </div>
                  <div className="h-1 w-28 bg-slate-900 rounded-full border border-slate-700 relative overflow-hidden">
                      <div className="h-full bg-orange-600 transition-all duration-100" style={{ width: `${enemyAttackGauge}%` }}></div>
                  </div>
              </div>
              
              {/* Simplified Attack VFX */}
              {isEnemyAttacking && (
                  <div className="absolute inset-0 bg-red-500/30 rounded-full scale-125"></div>
              )}
              
              {/* Simplified Hit Impact */}
              {targetHit && hitVfx !== 'plus-ultra' && <div className="absolute inset-0 bg-white/40 rounded-full"></div>}
              
              <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center relative">
                  <div ref={enemyRef} className="w-full h-full relative flex items-center justify-center rounded-xl">
                       {installedEnemyImages ? (
                           <img key={enemyImage} src={enemyImage} alt="Enemy" className={`w-full h-full object-contain pixel-art relative z-10 ${isEnemyUndying ? 'drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : ''}`} style={{ transform: `scale(${enemySize / 100})` }} />
                       ) : (
                           <div className={`w-full h-full flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700 relative z-10 ${isEnemyUndying ? 'shadow-[0_0_15px_rgba(250,204,21,0.5)]' : ''}`} style={{ transform: `scale(${enemySize / 100})` }}>
                               <Skull size={32} className="text-slate-500" />
                           </div>
                       )}
                  </div>
              </div>
              
              {/* Enemy Name & Title */}
              {(enemyName || enemyTitle) && (
                  <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 z-50 pointer-events-none flex flex-col items-center text-center ${rankStyles.container}`}>
                      {enemyName && <div className={`${rankStyles.name} leading-tight`}>{enemyName}</div>}
                      {enemyTitle && <div className={`${rankStyles.title} leading-tight`}>{enemyTitle}</div>}
                      {enemyRank && <div className={`${rankStyles.rank}`}>{enemyRank}</div>}
                      
                      {/* Enemy Mock Text */}
                      {floatingMockEnabled && enemyMockText && (
                          <div className="mt-1 bg-slate-900 text-red-100 text-[9px] p-1.5 rounded border border-red-900 w-full text-center">
                              {enemyMockText}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
