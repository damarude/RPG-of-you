import React, { useRef } from 'react';
import { Skull } from 'lucide-react';
import { PixiBattleScene } from './PixiBattleScene';

export interface BattleSceneProps {
  userAvatar: string;
  enemyImage: string;
  enemyName?: string;
  enemyTitle?: string;
  enemyRank?: string;
  enemyRace?: string;
  enemySize: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerHp: number;
  playerMaxHp: number;
  playerAttackGauge: number; 
  enemyAttackGauge: number; 
  isDead: boolean;
  isEnemyDead: boolean;
  isEnemySpawning: boolean;
  isUndying: boolean;
  isEnemyUndying: boolean;
  isAttacking: boolean;
  isEnemyAttacking: boolean;
  targetHit: boolean;
  hitVfx: 'crit' | 'overcrit' | 'plus-ultra' | 'revive' | 'death' | 'spawn' | null;
  slashEffect: 'slash-1' | 'slash-2' | null;
  bubbleText: string | null;
  enemyMockText: string | null;
  isEnemyStunned: boolean;
  isPlayerStunned: boolean;
  vfxLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
  floatingMockEnabled: boolean;
  installedEnemyImages?: boolean;
  devicePerformance?: 'ULTRA_STRONG' | 'ROTTEN_POTATO';
}

export const BattleUltra: React.FC<BattleSceneProps> = ({
  userAvatar, enemyImage, enemyName, enemyTitle, enemyRank, enemyRace, enemySize, enemyHp, enemyMaxHp, playerHp, playerMaxHp, playerAttackGauge, enemyAttackGauge, isDead, isEnemyDead, isEnemySpawning, isUndying, isEnemyUndying, isAttacking, isEnemyAttacking, targetHit, hitVfx, slashEffect, bubbleText, enemyMockText, isEnemyStunned, isPlayerStunned, vfxLevel, floatingMockEnabled, installedEnemyImages, devicePerformance
}) => {
  // Dynamic class for enemy based on hit type
  let enemyAnimClass = targetHit ? 'brightness-200 saturate-0' : 'animate-idle';
  
  if (hitVfx === 'crit') enemyAnimClass = 'animate-shake brightness-[5] sepia saturate-200 hue-rotate-[-30deg]'; // Gold/Flash shake
  if (hitVfx === 'overcrit') enemyAnimClass = 'animate-obliterate opacity-80'; // Glitch out
  if (hitVfx === 'plus-ultra') enemyAnimClass = 'opacity-0 transition-opacity duration-300'; // Disappear into void momentarily (simulated by overlay)
  if (hitVfx === 'death') enemyAnimClass = 'opacity-0 transition-opacity duration-1000'; // Fade out UI
  if (hitVfx === 'spawn') enemyAnimClass = 'opacity-100 transition-opacity duration-1000'; // Fade in UI

  // Camera Shake applied to the wrapper
  let containerShakeClass = '';
  if (vfxLevel === 'HIGH' || vfxLevel === 'ULTRA') {
      containerShakeClass = hitVfx === 'plus-ultra' ? 'animate-intense-shake' : (hitVfx === 'overcrit' ? 'animate-shake' : '');
  } else if (vfxLevel === 'MEDIUM') {
      containerShakeClass = hitVfx === 'plus-ultra' ? 'animate-shake' : '';
  }

  const getRankStyles = (rank?: string) => {
      const r = (rank || '').toUpperCase();
      if (r === 'TRANSCENDENT') {
          return {
              container: 'animate-pulse',
              name: 'text-[14px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] tracking-widest',
              title: 'text-[10px] font-serif italic text-cyan-100 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]',
              rank: 'text-[9px] font-mono font-bold text-cyan-400 tracking-[0.2em] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]'
          };
      }
      if (r === 'MYTHIC') {
          return {
              container: '',
              name: 'text-[13px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.8)] tracking-wider',
              title: 'text-[10px] font-serif italic text-pink-200',
              rank: 'text-[8px] font-mono font-bold text-purple-400 tracking-[0.15em]'
          };
      }
      if (r === 'LEGEND' || r === 'LEGENDARY') {
          return {
              container: '',
              name: 'text-[13px] font-bold text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.8)] tracking-wider',
              title: 'text-[10px] font-serif italic text-orange-200',
              rank: 'text-[8px] font-mono font-bold text-orange-500 tracking-[0.15em]'
          };
      }
      if (r === 'GRANDMASTER') {
          return {
              container: '',
              name: 'text-[12px] font-bold text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide',
              title: 'text-[10px] font-serif italic text-yellow-200',
              rank: 'text-[8px] font-mono font-bold text-yellow-500 tracking-widest'
          };
      }
      if (r === 'MASTER') {
          return {
              container: '',
              name: 'text-[12px] font-bold text-red-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide',
              title: 'text-[9px] font-serif italic text-red-200',
              rank: 'text-[8px] font-mono font-bold text-red-500 tracking-widest'
          };
      }
      if (r === 'EXPERT') {
          return {
              container: '',
              name: 'text-[11px] font-bold text-blue-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]',
              title: 'text-[9px] font-serif italic text-blue-200',
              rank: 'text-[8px] font-mono font-bold text-blue-500 tracking-widest'
          };
      }
      // Default (Novice, Apprentice, Professional)
      return {
          container: '',
          name: 'text-[11px] font-bold text-slate-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]',
          title: 'text-[9px] font-serif italic text-slate-300',
          rank: 'text-[8px] font-mono font-bold text-slate-500 tracking-widest'
      };
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
    <div className={`relative w-full h-full overflow-hidden ${containerShakeClass}`}>
      {/* PixiJS WebGL Layer */}
      <PixiBattleScene 
        userAvatar={userAvatar}
        enemyImage={enemyImage}
        targetHit={targetHit}
        isDead={isDead}
        isAttacking={isAttacking}
        isEnemyAttacking={isEnemyAttacking}
        isEnemyDead={isEnemyDead}
        isUndying={isUndying}
        isEnemyUndying={isEnemyUndying}
        hitVfx={hitVfx}
        enemySize={enemySize}
        playerRef={playerRef}
        enemyRef={enemyRef}
        installedEnemyImages={installedEnemyImages}
      />

      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[#050b14]">
          <div className={`absolute inset-0 cyber-grid opacity-20 ${vfxLevel !== 'LOW' ? 'animate-grid-move' : ''}`} style={{ transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)' }}></div>
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent z-0"></div>
          
          {/* Plus Ultra: Reality Crack Background Effect */}
          {hitVfx === 'plus-ultra' && vfxLevel !== 'LOW' && (
              <div className="absolute inset-0 bg-white/90 z-0 animate-flash mix-blend-overlay"></div>
          )}
          
          {/* Death Atmosphere (Red Vignette, World Space) */}
          {isDead && (
              <>
                {/* Subtle vignette only, no text */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/60 via-transparent to-black/40 z-0 animate-in fade-in duration-1000"></div>
                {/* Floating Embers */}
                {vfxLevel !== 'LOW' && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(vfxLevel === 'ULTRA' ? 30 : 15)].map((_, i) => (
                            <div 
                                key={i} 
                                className="absolute bottom-0 bg-red-500 rounded-full opacity-0 animate-float-up blur-[1px]"
                                style={{
                                    width: Math.random() * 4 + 1 + 'px',
                                    height: Math.random() * 4 + 1 + 'px',
                                    left: Math.random() * 100 + '%',
                                    animationDuration: Math.random() * 3 + 2 + 's',
                                    animationDelay: Math.random() * 2 + 's'
                                }}
                            />
                        ))}
                    </div>
                )}
              </>
          )}
      </div>

      {/* Screen Space VFX Layer - ON TOP of everything */}
      {vfxLevel !== 'LOW' && (
        <div className="absolute inset-0 pointer-events-none z-[60] flex items-center justify-center overflow-hidden">
            
            {/* Standard Crit: Diagonal Flash Slash */}
            {hitVfx === 'crit' && (
                <>
                    <div className={`absolute w-[200%] h-2 bg-yellow-200 rotate-[-45deg] animate-slash-draw mix-blend-screen ${vfxLevel === 'ULTRA' ? 'shadow-[0_0_60px_#facc15]' : 'shadow-[0_0_20px_#facc15]'}`}></div>
                    {(vfxLevel === 'HIGH' || vfxLevel === 'ULTRA') && (
                        <div className="absolute w-[200%] h-6 bg-orange-500/30 rotate-[-45deg] animate-slash-draw mix-blend-color-dodge blur-sm" style={{ animationDelay: '0.05s' }}></div>
                    )}
                    {vfxLevel === 'ULTRA' && (
                        <>
                            <div className="absolute w-[200%] h-1 bg-white rotate-[-45deg] animate-slash-draw mix-blend-overlay" style={{ animationDuration: '0.1s' }}></div>
                            <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay animate-flash"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="absolute w-1 h-4 bg-yellow-300 rounded-full animate-particle-burst"
                                        style={{
                                            transform: `rotate(${Math.random() * 360}deg) translateY(${Math.random() * 100 + 20}px)`,
                                            animationDelay: `${Math.random() * 0.1}s`,
                                            boxShadow: '0 0 10px #facc15'
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Overcrit: X-Slash + Glitch Overlay */}
            {hitVfx === 'overcrit' && (
                <>
                    <div className={`absolute w-[200%] h-4 bg-red-500 rotate-45 animate-slash-draw mix-blend-lighten ${vfxLevel === 'ULTRA' ? 'shadow-[0_0_80px_#ef4444]' : 'shadow-[0_0_30px_#ef4444]'}`} style={{ animationDuration: '0.15s' }}></div>
                    <div className={`absolute w-[200%] h-4 bg-purple-500 -rotate-45 animate-slash-draw mix-blend-lighten ${vfxLevel === 'ULTRA' ? 'shadow-[0_0_80px_#a855f7]' : 'shadow-[0_0_30px_#a855f7]'}`} style={{ animationDuration: '0.2s', animationDelay: '0.05s' }}></div>
                    
                    {(vfxLevel === 'HIGH' || vfxLevel === 'ULTRA') && (
                        <>
                            <div className="absolute w-[200%] h-1 bg-white rotate-45 animate-slash-draw mix-blend-overlay" style={{ animationDuration: '0.1s' }}></div>
                            <div className="absolute w-[200%] h-1 bg-white -rotate-45 animate-slash-draw mix-blend-overlay" style={{ animationDuration: '0.15s', animationDelay: '0.05s' }}></div>
                        </>
                    )}

                    {vfxLevel === 'ULTRA' && (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-tr from-red-900/40 to-purple-900/40 mix-blend-color-burn animate-flash"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="absolute w-2 h-2 bg-red-400 rounded-full animate-particle-burst"
                                        style={{
                                            transform: `rotate(${Math.random() * 360}deg) translateY(${Math.random() * 150 + 30}px)`,
                                            animationDelay: `${Math.random() * 0.2}s`,
                                            boxShadow: '0 0 15px #ef4444'
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    
                    {(vfxLevel === 'HIGH' || vfxLevel === 'ULTRA') && <div className="absolute inset-0 bg-red-900/20 mix-blend-overlay animate-flash"></div>}
                </>
            )}

            {/* PLUS ULTRA: REALITY SLASH */}
            {hitVfx === 'plus-ultra' && (
                <>
                    {/* The Void Cut */}
                    <div className={`absolute h-[250%] w-2 bg-black rotate-[15deg] animate-void-cut z-50 ${vfxLevel === 'ULTRA' ? 'shadow-[0_0_150px_#22d3ee]' : 'shadow-[0_0_50px_#22d3ee]'}`}>
                        <div className="absolute inset-0 bg-white blur-md animate-pulse"></div>
                        {(vfxLevel === 'HIGH' || vfxLevel === 'ULTRA') && <div className="absolute inset-0 bg-cyan-300 blur-xl animate-pulse opacity-70"></div>}
                    </div>
                    {/* Secondary Void Cut for High/Ultra */}
                    {(vfxLevel === 'HIGH' || vfxLevel === 'ULTRA') && (
                        <div className="absolute h-[200%] w-1 bg-black rotate-[-75deg] animate-void-cut z-40 shadow-[0_0_100px_#a855f7]" style={{ animationDelay: '0.1s' }}>
                            <div className="absolute inset-0 bg-white blur-sm animate-pulse"></div>
                        </div>
                    )}
                    {/* Tertiary Void Cut for Ultra */}
                    {vfxLevel === 'ULTRA' && (
                        <div className="absolute h-[200%] w-1 bg-black rotate-[45deg] animate-void-cut z-40 shadow-[0_0_100px_#facc15]" style={{ animationDelay: '0.15s' }}>
                            <div className="absolute inset-0 bg-white blur-sm animate-pulse"></div>
                        </div>
                    )}
                    
                    {/* Screen Shatter Flash */}
                    <div className="absolute inset-0 bg-white animate-flash duration-500 z-40 mix-blend-overlay"></div>
                    {(vfxLevel === 'HIGH' || vfxLevel === 'ULTRA') && <div className="absolute inset-0 bg-cyan-500/30 animate-flash duration-300 z-40 mix-blend-color-dodge"></div>}
                    
                    {/* Particle Explosion */}
                    {(vfxLevel === 'HIGH' || vfxLevel === 'ULTRA') && <div className="absolute inset-0 animate-shockwave border-[50px] border-cyan-400/50 rounded-full"></div>}
                    {vfxLevel === 'ULTRA' && <div className="absolute inset-0 animate-shockwave border-[20px] border-purple-400/50 rounded-full" style={{ animationDelay: '0.1s' }}></div>}
                    
                    {(vfxLevel === 'HIGH' || vfxLevel === 'ULTRA') && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            {[...Array(vfxLevel === 'ULTRA' ? 60 : 30)].map((_, i) => (
                                <div key={i} className={`absolute ${i % 2 === 0 ? 'w-2 h-2 bg-cyan-300' : 'w-1 h-8 bg-white'} rounded-full animate-particle-burst`}
                                    style={{
                                        transform: `rotate(${Math.random() * 360}deg) translateY(${Math.random() * 300 + 50}px)`,
                                        animationDelay: `${Math.random() * 0.3}s`,
                                        boxShadow: i % 2 === 0 ? '0 0 10px #67e8f9' : '0 0 20px #ffffff'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
      )}

      <div className="relative w-full h-full flex items-center justify-between px-8 animate-in fade-in z-10 max-w-4xl mx-auto">
          
          {/* Player Logic Visuals */}
          <div className={`relative transition-all duration-150 ease-out z-20 ${isAttacking ? 'translate-x-16 scale-105 rotate-3' : (isDead ? 'scale-95 grayscale contrast-125' : '')}`}>
              
              {/* Localized YOU DIED Text - SMALLER & POSITIONED */}
              {isDead && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 text-center z-50 animate-in zoom-in duration-500 pointer-events-none">
                       <h2 className="text-xl font-serif font-bold text-red-600 tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)] animate-pulse" style={{ textShadow: '0 0 10px rgba(220, 38, 38, 0.8)' }}>
                           YOU DIED
                       </h2>
                       <div className="h-px w-full bg-gradient-to-r from-transparent via-red-600 to-transparent mt-1"></div>
                  </div>
              )}

              {/* 3D Green Magic Circle - LOWERED POSITION */}
              {(isDead || hitVfx === 'revive') && (
                  <div className="absolute -bottom-20 left-1/2 w-48 h-48 pointer-events-none z-10" 
                       style={{ transform: 'translateX(-50%) rotateX(75deg)' }}>
                      <div className="w-full h-full border-[3px] border-emerald-500/60 rounded-full animate-spin-slow shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center">
                           <div className="w-[80%] h-[80%] border-2 border-emerald-400/40 rounded-full border-dashed animate-reverse-spin"></div>
                           <div className="w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-md animate-pulse"></div>
                      </div>
                  </div>
              )}

              {/* Fantasy Healing VFX Particles (Foreground) */}
              {(isDead || hitVfx === 'revive') && (
                  <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
                      {/* Rising Light Motes */}
                      {[...Array(8)].map((_, i) => (
                          <div 
                              key={`mote-${i}`}
                              className="absolute bottom-0 left-1/2 bg-emerald-300 w-1 h-1 rounded-full animate-float-up blur-[1px]"
                              style={{
                                  marginLeft: `${(Math.random() * 60) - 30}px`,
                                  animationDuration: `${1.5 + Math.random()}s`,
                                  animationDelay: `${Math.random()}s`,
                                  opacity: 0.7
                              }}
                          />
                      ))}

                      {/* Healing Crosses */}
                      {[...Array(4)].map((_, i) => (
                          <div 
                              key={`cross-${i}`}
                              className="absolute bottom-0 left-1/2 text-emerald-400 text-xs font-bold animate-float-up"
                              style={{
                                  marginLeft: `${(Math.random() * 50) - 25}px`,
                                  animationDuration: `${2 + Math.random()}s`,
                                  animationDelay: `${Math.random() * 1.5}s`,
                                  textShadow: '0 0 5px rgba(16, 185, 129, 0.8)'
                              }}
                          >+</div>
                      ))}
                  </div>
              )}

              <div ref={playerRef} className={`w-28 h-28 sm:w-36 sm:h-36 rounded-xl border-4 ${isDead ? 'border-red-900 shadow-[0_0_50px_rgba(220,38,38,0.2)]' : 'border-slate-600'} bg-slate-800/0 overflow-hidden shadow-2xl relative group ring-2 ring-black/50 transition-all duration-500 z-20 ${isDead ? 'rotate-[-5deg] translate-y-4' : ''}`}>
                  <img src={userAvatar} className="w-full h-full object-cover pixel-art opacity-0" alt="Hero" />
                  
                  {/* Death Ghost Effect */}
                  {isDead && (
                      <div className="absolute inset-0 opacity-50 mix-blend-screen animate-pulse" style={{ backgroundImage: `url(${userAvatar})`, backgroundSize: 'cover', transform: 'translateY(-10px) scale(1.1)', filter: 'blur(4px) grayscale(100%)' }}></div>
                  )}

                  <div className={`absolute inset-0 shadow-[inset_0_0_20px_rgba(168,85,247,0.4)] mix-blend-overlay ${isDead ? 'hidden' : ''}`}></div>
                  {isDead && <div className="absolute inset-0 bg-red-900/20 mix-blend-multiply"></div>}
              </div>
              
              {/* Fantasy Revive Bar (Small, No Text Label, Percentile Only) */}
              {isDead && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-50 animate-in fade-in zoom-in duration-300">
                      <div className="relative w-16 h-1.5 bg-slate-900/80 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)] overflow-hidden">
                          <div 
                              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-white/80 animate-pulse relative"
                              style={{ width: `${(playerHp / playerMaxHp) * 100}%`, transition: 'width 0.3s ease-out' }}
                          >
                              <div className="absolute inset-0 bg-white/40 animate-shimmer"></div>
                          </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-300 mt-1 drop-shadow-md tracking-wider animate-pulse">
                          {Math.floor((playerHp / playerMaxHp) * 100)}%
                      </span>
                  </div>
              )}

              {/* Standard HP Bar (Only when alive) */}
              {!isDead && (
                 <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-32 z-50 pointer-events-none">
                     <div className="flex justify-center mb-1 h-4">
                         {isPlayerStunned && <span className="text-[9px] font-bold text-yellow-400 animate-pulse bg-black/50 px-1 rounded border border-yellow-500/50">STUNNED</span>}
                         {isUndying && <span className="text-[9px] font-bold text-yellow-400 animate-pulse bg-black/50 px-1 rounded border border-yellow-500/50 ml-1">UNDYING</span>}
                     </div>
                     <div className="h-3 bg-slate-950 rounded-full border border-emerald-900/50 relative overflow-hidden shadow-lg ring-1 ring-black/50 mb-1">
                         <div 
                             className={`h-full transition-all duration-300 ease-out relative ${playerHp < playerMaxHp * 0.3 ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500'}`} 
                             style={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                         ></div>
                         <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white/90 tracking-widest drop-shadow-md z-10">
                             {Math.floor(playerHp)} / {Math.floor(playerMaxHp)}
                         </div>
                     </div>
                     <div className="h-1.5 bg-slate-950 rounded-full border border-blue-900/50 relative overflow-hidden shadow">
                         <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(34,211,238,0.5)]" style={{ width: `${playerAttackGauge}%` }}></div>
                     </div>
                 </div>
              )}
              {/* Shadow Blob */}
              <div className="w-full h-4 bg-black/60 rounded-[100%] mt-[-10px] blur-md translate-y-4"></div>
          </div>
          
          {/* Enemy Logic Visuals */}
          <div className={`relative transition-all duration-150 ease-in-out z-20 ${enemyAnimClass} ${isEnemyAttacking ? '-translate-x-40 scale-125 rotate-[-5deg] z-30' : ''}`}>
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 z-50 pointer-events-none flex flex-col items-center">
                  <div className="flex justify-center mb-1 h-4">
                      {isEnemyStunned && <span className="text-[9px] font-bold text-yellow-400 animate-pulse bg-black/50 px-1 rounded border border-yellow-500/50">STUNNED</span>}
                      {isEnemyUndying && <span className="text-[9px] font-bold text-yellow-400 animate-pulse bg-black/50 px-1 rounded border border-yellow-500/50 ml-1">UNDYING</span>}
                  </div>
                  <div className="h-3 w-32 bg-slate-950 rounded-full border border-red-900/50 relative overflow-hidden shadow-lg shadow-red-900/20 mb-1">
                      <div className="h-full bg-gradient-to-r from-red-800 via-red-600 to-orange-600 transition-all duration-300 ease-out relative" style={{ width: `${(enemyHp / enemyMaxHp) * 100}%` }}></div>
                      <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white/90 tracking-widest drop-shadow-md z-10">
                          {formatNumber(Math.floor(enemyHp))} / {formatNumber(Math.floor(enemyMaxHp))}
                      </div>
                  </div>
                  <div className="h-1.5 w-32 bg-slate-950 rounded-full border border-red-900/30 relative overflow-hidden shadow">
                      <div className="h-full bg-gradient-to-r from-red-900 to-orange-700 transition-all duration-100 ease-linear" style={{ width: `${enemyAttackGauge}%` }}></div>
                  </div>
              </div>
              
              {/* Dynamic Attack VFX based on Race and Rank */}
              {isEnemyAttacking && (
                  <>
                      <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full scale-150 animate-ping"></div>
                      {vfxLevel !== 'LOW' && (
                          <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
                              {/* Base Attack Flash */}
                              <div className="absolute w-full h-full bg-white/30 rounded-full blur-md animate-ping"></div>
                              
                              {/* Race Specific VFX */}
                              {enemyRace === 'DRAGON' && <div className="absolute w-48 h-48 bg-orange-500/40 blur-2xl rounded-full animate-pulse mix-blend-screen"></div>}
                              {enemyRace === 'GOBLIN' && <div className="absolute w-32 h-32 bg-green-500/40 blur-xl rounded-full animate-bounce mix-blend-screen"></div>}
                              {enemyRace === 'ORC' && <div className="absolute w-40 h-40 bg-stone-500/50 blur-xl rounded-full animate-shake mix-blend-overlay"></div>}
                              {enemyRace === 'POCONG' && <div className="absolute w-36 h-48 bg-purple-500/40 blur-2xl rounded-full animate-pulse mix-blend-screen translate-y-4"></div>}
                              {enemyRace === 'SKELETON' && <div className="absolute w-32 h-32 border-4 border-white/30 rounded-full animate-ping"></div>}
                              {enemyRace === 'SLIME' && <div className="absolute w-40 h-40 bg-cyan-400/40 blur-xl rounded-full animate-pulse mix-blend-screen scale-y-75"></div>}
                              {enemyRace === 'UROBOROS' && <div className="absolute w-48 h-48 bg-indigo-600/50 blur-2xl rounded-full animate-spin mix-blend-screen"></div>}
                              
                              {/* Rank Specific Intensity (High/Ultra only) */}
                              {(vfxLevel === 'HIGH' || vfxLevel === 'ULTRA') && (
                                  <>
                                      {(enemyRank === 'MASTER' || enemyRank === 'GRANDMASTER') && (
                                          <div className="absolute w-64 h-64 border-2 border-red-500/50 rounded-full animate-ping opacity-50"></div>
                                      )}
                                      {(enemyRank === 'LEGEND' || enemyRank === 'MYTHIC' || enemyRank === 'TRANSCENDENT') && (
                                          <>
                                              <div className="absolute w-72 h-72 border-4 border-red-600/60 rounded-full animate-ping opacity-70"></div>
                                              <div className="absolute inset-0 bg-red-900/30 blur-3xl mix-blend-color-dodge animate-pulse"></div>
                                          </>
                                      )}
                                      {enemyRank === 'TRANSCENDENT' && (
                                          <div className="absolute w-96 h-96 bg-white/10 blur-3xl rounded-full animate-spin mix-blend-overlay"></div>
                                      )}
                                  </>
                              )}
                          </div>
                      )}
                  </>
              )}
              
              {/* Hit Impacts */}
              {targetHit && hitVfx === 'plus-ultra' ? null : targetHit && <div className="absolute inset-0 bg-white mix-blend-overlay rounded-full blur-xl opacity-60 animate-impact"></div>}
              
              <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center relative">
                  <div ref={enemyRef} className="w-full h-full relative flex items-center justify-center drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] rounded-xl">
                       {installedEnemyImages ? (
                           <img key={enemyImage} src={enemyImage} alt="Enemy" className="w-full h-full object-contain pixel-art relative z-10 opacity-0" style={{ transform: `scale(${enemySize / 100})` }} />
                       ) : (
                           <div className="w-full h-full flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700 relative z-10 opacity-0" style={{ transform: `scale(${enemySize / 100})` }}>
                               <Skull size={48} className="text-slate-500" />
                           </div>
                       )}
                  </div>
              </div>
              <div className="w-full h-4 bg-black/60 rounded-[100%] mt-[-10px] blur-md translate-y-4"></div>
              
              {/* Enemy Name & Title (Below Image) */}
              {(enemyName || enemyTitle) && (
                  <div className={`absolute -bottom-14 left-1/2 -translate-x-1/2 w-44 max-w-[45vw] sm:max-w-none sm:w-64 z-50 pointer-events-none flex flex-col items-center text-center ${rankStyles.container}`}>
                      {enemyName && <div className={`${rankStyles.name} leading-tight`}>{enemyName}</div>}
                      {enemyTitle && <div className={`${rankStyles.title} leading-tight mt-0.5`}>{enemyTitle}</div>}
                      {enemyRank && <div className={`${rankStyles.rank} mt-1`}>{enemyRank}</div>}
                      
                      {/* Enemy Mock Text (Dialogue) */}
                      {floatingMockEnabled && enemyMockText && (
                          <div className="mt-2 pointer-events-auto bg-slate-900/95 text-red-100 text-[10px] sm:text-[11px] font-bold p-2 sm:p-3 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-in zoom-in slide-in-from-top-2 w-full border border-red-900/80 whitespace-normal break-words leading-snug text-center relative">
                              {/* Speech bubble pointer pointing up */}
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] sm:border-l-[8px] border-l-transparent border-r-[6px] sm:border-r-[8px] border-r-transparent border-b-[8px] sm:border-b-[10px] border-b-red-900/80"></div>
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
