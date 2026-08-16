
// ... imports remain the same
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, Square, Clock, Timer as TimerIcon, Edit3, ArrowLeft, Sword, Shield, AlertCircle, CheckCircle2, TrendingUp, Zap, MessageSquare, Volume2, VolumeX, MonitorOff, ChevronUp, ChevronDown, Award, Gift, Hourglass, FastForward, BookOpen, Flame, Heart, Skull, ScrollText, X, Coins, Sparkles, EyeOff, Star, Crown, Activity, Target, HelpCircle, Footprints, Package } from 'lucide-react';
import { Proficiency, PhrasePack } from '../types';
import { getEnemyBaseHp, SARCASTIC_QUOTES, TRAINING_QUOTES, ENEMY_MOCKS, PAUSE_QUOTES, formatNumber, RANKS, getRankName, FALLBACK_ENEMY_IMAGES, getEnemyImageUrl, CONSUMABLE_DATA, getConsumableImageUrl } from '../gameData';
import { audio } from '../services/audioService';
import { SupportModal } from './SupportModal';
import { MissionReportModal } from './MissionReportModal';
import { MusicPlayerWidget } from './MusicPlayerWidget';
import { MusicControlModal } from './MusicControlModal';
import { PixiBattleScene } from './PixiBattleScene';

// ... (Other interfaces remain unchanged) ...
interface TimerProps {
  proficiency: Proficiency;
  autoStart: boolean;
  initialMode?: 'STOPWATCH' | 'TIMER' | 'MANUAL';
  lockMode?: boolean; 
  userAvatar: string;
  onComplete: (durationMinutes: number, notes: string, lootGold: number, wasEarly: boolean, defeatedEnemies: Record<string, number>) => void;
  onCancel: () => void;
  onUnlockAchievement?: (id: string) => void;
  userLevel: number;
  playerMaxHp: number;
  bonusDmg: number;
  bonusHeal: number;
  bonusBlock: number;
  bonusStun: number;
  bonusBarrage: number;
  bonusCrit: number;
  critDmgMultiplier: number; 
  attackSpeed: number; 
  bonusGoldPct: number;
  streakMultiplier?: number;
  gearMultiplier?: number;
  libraryMultiplier?: number;
  speedMultiplier?: number; 
  globalExpMultiplier?: number;
  extraPhrases?: PhrasePack;
  undieableChance?: number;
  detailedEnemies?: any[];
  installedEnemyImages?: boolean;
  installedConsumableImages?: boolean;
  
  // Audio Props
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onSkipMusic: () => void;
  vfxLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
  onToggleVfx: () => void;
  addNotification?: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  floatingMockEnabled: boolean;
  devicePerformance: 'ULTRA_STRONG' | 'ROTTEN_POTATO';
  activeBuffs?: Record<string, number>;
  activeBuffStacks?: Record<string, number>;
  consumablesData?: any[];
}

type TimerMode = 'STOPWATCH' | 'TIMER' | 'MANUAL';

// ... (LocalBattleScene and DamageNumber interfaces remain unchanged) ...
interface DamageNumber {
  id: string | number;
  value: string | number;
  type: 'normal' | 'crit' | 'overcrit' | 'plus-ultra' | 'glance' | 'enemy' | 'block' | 'heal' | 'stun' | 'mock';
  x: number;
  y: number;
}

interface GoldDrop {
  id: string | number;
  value: number;
  x: number;
  y: number;
}

interface BattleLogEntry {
  id: string;
  message: string;
  type: 'player' | 'enemy' | 'system' | 'loot';
  timestamp: string;
}

// Helper: Get Enemy Scaling Factors based on Skill Rank
const getEnemyScaling = (level: number) => {
  if (level <= 10) return { scale: 0, undie: 0 }; // Novice
  if (level <= 30) return { scale: 0.025, undie: 0 }; // Apprentice
  if (level <= 60) return { scale: 0.05, undie: 0 }; // Professional
  if (level <= 100) return { scale: 0.10, undie: 2 }; // Expert
  if (level <= 200) return { scale: 0.15, undie: 4 }; // Master
  if (level <= 400) return { scale: 0.20, undie: 6 }; // Grandmaster
  if (level <= 700) return { scale: 0.25, undie: 9 }; // Legend
  if (level <= 999) return { scale: 0.30, undie: 15 }; // Mythic
  return { scale: 0.40, undie: 30 }; // Transcendent
};

import { BattleUltra } from './BattleUltra';
import { BattlePotato } from './BattlePotato';

export const Timer: React.FC<TimerProps> = ({ 
    proficiency, autoStart, initialMode = 'STOPWATCH', lockMode = false, userAvatar, onComplete, onCancel, onUnlockAchievement,
    userLevel, playerMaxHp, bonusDmg, bonusHeal, bonusBlock, bonusStun, bonusBarrage, bonusCrit, critDmgMultiplier, attackSpeed = 0, bonusGoldPct = 0, 
    streakMultiplier = 0, gearMultiplier = 0, libraryMultiplier = 0, speedMultiplier = 1, globalExpMultiplier = 1, extraPhrases, undieableChance = 0,
    detailedEnemies, musicEnabled, onToggleMusic, onSkipMusic, vfxLevel, onToggleVfx, addNotification, floatingMockEnabled, devicePerformance, activeBuffs = {}, activeBuffStacks = {}, consumablesData = [],
    installedEnemyImages, installedConsumableImages
}) => {
  const [setupMode, setSetupMode] = useState<TimerMode>(initialMode);
  const [isSetup, setIsSetup] = useState(!autoStart);
  const [elapsedSeconds, setElapsedSeconds] = useState(0); 
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60); 
  const [timerDuration, setTimerDuration] = useState(25); 
  const [isActive, setIsActive] = useState(autoStart);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreensaver, setIsScreensaver] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<string>('');
  const [pauseQuote, setPauseQuote] = useState<string>('');
  const [showSupport, setShowSupport] = useState(false);
  const [wasEarlyFinish, setWasEarlyFinish] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  
  // ... (Other state variables) ...
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [showBattleLog, setShowBattleLog] = useState(false);
  const [showBuffs, setShowBuffs] = useState(false);
  const [enemyId, setEnemyId] = useState<number | string>(1);
  const [enemyName, setEnemyName] = useState<string>('');
  const [enemyTitle, setEnemyTitle] = useState<string>('');
  const [enemyRank, setEnemyRank] = useState<string>('');
  const [enemyRace, setEnemyRace] = useState<string>('');
  const [enemyImage, setEnemyImage] = useState<string>('');
  const [enemyMaxHp, setEnemyMaxHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [enemyTierGold, setEnemyTierGold] = useState(1);
  const [playerHp, setPlayerHp] = useState(playerMaxHp);
  const [playerAttackGauge, setPlayerAttackGauge] = useState(0);
  const [enemyAttackGauge, setEnemyAttackGauge] = useState(0);
  const [isDead, setIsDead] = useState(false);
  const [isEnemyDead, setIsEnemyDead] = useState(false);
  const [isEnemySpawning, setIsEnemySpawning] = useState(false);
  const [isUndying, setIsUndying] = useState(false);
  const [isEnemyUndying, setIsEnemyUndying] = useState(false); // NEW STATE
  const [hasEnemyUsedUndying, setHasEnemyUsedUndying] = useState(false);
  const [isPlayerStunned, setIsPlayerStunned] = useState(false);
  const [isEnemyStunned, setIsEnemyStunned] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [goldDrops, setGoldDrops] = useState<GoldDrop[]>([]);
  const [kills, setKills] = useState(0);
  const [sessionGold, setSessionGold] = useState(0);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [enemyMockText, setEnemyMockText] = useState<string | null>(null);
  const [enemyStatMods, setEnemyStatMods] = useState({ hp: 1, dmg: 1, crit: 1, aspd: 1, block: 1, critDmg: 1, stun: 1, barrage: 1 });
  
  const effectiveEnemyStatMods = useMemo(() => {
      if (!isEnemyUndying) return enemyStatMods;
      return {
          ...enemyStatMods,
          aspd: enemyStatMods.aspd * 2.0,
          crit: enemyStatMods.crit + 0.25,
          barrage: enemyStatMods.barrage + 0.15,
          block: Math.max(0, enemyStatMods.block * 0.70),
          dmg: enemyStatMods.dmg * 1.5
      };
  }, [enemyStatMods, isEnemyUndying]);

  const [enemySize, setEnemySize] = useState(100);
  const [showConfirm, setShowConfirm] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('30');
  const [isAttacking, setIsAttacking] = useState(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false); 
  const [targetHit, setTargetHit] = useState(false);
  const [slashEffect, setSlashEffect] = useState<'slash-1' | 'slash-2' | null>(null);
  const [hitVfx, setHitVfx] = useState<'crit' | 'overcrit' | 'plus-ultra' | 'revive' | 'death' | 'spawn' | null>(null);
  const [defeatedEnemies, setDefeatedEnemies] = useState<Record<string, number>>({});
  const [battleStats, setBattleStats] = useState({
    damageTaken: 0,
    damageOutput: 0,
    hitsDealt: 0,
    tickleHits: 0,
    normalHits: 0,
    critHits: 0,
    overcritHits: 0,
    plusUltraHits: 0,
    barrageHits: 0,
    blocks: 0,
    stuns: 0,
    timesRevived: 0,
  });
  const enemySpawnTimeRef = useRef<number>(Date.now());

  const playerHpRef = useRef(playerHp);
  const enemyHpRef = useRef(enemyHp);
  const isDeadRef = useRef(isDead);
  const isUndyingRef = useRef(isUndying);
  const isEnemyUndyingRef = useRef(isEnemyUndying);
  const hasEnemyUsedUndyingRef = useRef(hasEnemyUsedUndying);
  const remainingSecondsRef = useRef(remainingSeconds);

  useEffect(() => { playerHpRef.current = playerHp; }, [playerHp]);
  useEffect(() => { enemyHpRef.current = enemyHp; }, [enemyHp]);
  useEffect(() => { isDeadRef.current = isDead; }, [isDead]);
  useEffect(() => { isUndyingRef.current = isUndying; }, [isUndying]);
  useEffect(() => { isEnemyUndyingRef.current = isEnemyUndying; }, [isEnemyUndying]);
  useEffect(() => { hasEnemyUsedUndyingRef.current = hasEnemyUsedUndying; }, [hasEnemyUsedUndying]);
  useEffect(() => { remainingSecondsRef.current = remainingSeconds; }, [remainingSeconds]);

  const getRandomQuote = useCallback(() => {
      if (extraPhrases?.screensaver && extraPhrases.screensaver.length > 0) {
          return extraPhrases.screensaver[Math.floor(Math.random() * extraPhrases.screensaver.length)];
      }
      return '';
  }, [extraPhrases]);

  const addLog = useCallback((message: string, type: BattleLogEntry['type']) => {
      const entry: BattleLogEntry = {
          id: crypto.randomUUID(),
          message,
          type,
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
      };
      setBattleLog(prev => [entry, ...prev].slice(0, 50));
  }, []);

  // ... (Audio Context Switching) ...
  useEffect(() => {
      // Play random battle track when timer starts
      audio.setPlaylistAndPlay('BATTLE', true);
      return () => {
          // Return to menu playlist (first track usually Level Up My Heart) when leaving
          audio.setPlaylistAndPlay('MENU', false);
      };
  }, []);

  // ... (Init Player HP) ...
  useEffect(() => {
      setPlayerHp(playerMaxHp);
      playerHpRef.current = playerMaxHp;
  }, [playerMaxHp]);

  // Auto-pause on background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        setIsActive(false);
        setPauseQuote("Session auto-paused. Focus lost.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive]);

  // ... (Spawn Enemy logic) ...
  const spawnEnemy = () => {
    const lvl = proficiency.level;
    
    let selectedEnemy: any = null;
    
    if (detailedEnemies && detailedEnemies.length > 0) {
        const currentRankIndex = Math.max(0, RANKS.indexOf(getRankName(lvl)));
        
        let targetRankIndex = 0;
        const roll = Math.random();
        
        if (currentRankIndex === 0) {
            targetRankIndex = 0;
        } else {
            if (roll < 0.35) {
                targetRankIndex = currentRankIndex;
            } else {
                targetRankIndex = Math.floor(Math.random() * currentRankIndex);
            }
        }
        
        const targetRankName = RANKS[targetRankIndex].toUpperCase();
        let availableEnemies = detailedEnemies.filter(e => e.rank === targetRankName || (targetRankName === 'LEGEND' && e.rank === 'LEGENDARY'));
        
        if (availableEnemies.length === 0) {
            availableEnemies = detailedEnemies;
        }

        if (availableEnemies.length > 0) {
            const totalWeight = availableEnemies.reduce((sum, e) => sum + (e.appearance || 1), 0);
            let randomWeight = Math.random() * totalWeight;
            for (const enemy of availableEnemies) {
                randomWeight -= (enemy.appearance || 1);
                if (randomWeight <= 0) {
                    selectedEnemy = enemy;
                    break;
                }
            }
            if (!selectedEnemy) selectedEnemy = availableEnemies[0];
        }
    }

    let randomId: string | number = 1;
    let stats = { hp: 100, baseGold: 1 };
    let statMods = { hp: 1, dmg: 1, crit: 1, aspd: 1, block: 1, critDmg: 1, stun: 1, barrage: 1 };
    let size = 100;
    
    if (selectedEnemy) {
        randomId = selectedEnemy.id;
        setEnemyId(selectedEnemy.id);
        setEnemyName(selectedEnemy.name);
        setEnemyTitle(selectedEnemy.title || '');
        setEnemyRank(selectedEnemy.rank || '');
        setEnemyRace(selectedEnemy.race || '');
        setEnemyImage(selectedEnemy.image);
        stats = { hp: selectedEnemy.hp, baseGold: selectedEnemy.gold };
        if (selectedEnemy.statModifiers) statMods = selectedEnemy.statModifiers;
        if (selectedEnemy.size) size = selectedEnemy.size;
    } else {
        let maxEnemyId = 2; 
        if (lvl <= 10) maxEnemyId = 2;           
        else if (lvl <= 30) maxEnemyId = 4;      
        else if (lvl <= 60) maxEnemyId = 6;      
        else if (lvl <= 100) maxEnemyId = 8;     
        else if (lvl <= 200) maxEnemyId = 9;     
        else if (lvl <= 400) maxEnemyId = 10;    
        else if (lvl <= 700) maxEnemyId = 12;    
        else maxEnemyId = 13;                    

        randomId = Math.floor(Math.random() * maxEnemyId) + 1;
        setEnemyId(randomId);
        setEnemyName(`Subject #${randomId}`);
        setEnemyTitle('');
        setEnemyRank('');
        setEnemyRace('');
        setEnemyImage(getEnemyImageUrl(undefined, randomId - 1));
        stats = getEnemyBaseHp(randomId);
    }

    setEnemyStatMods(statMods);
    setEnemySize(size);

    const { scale } = getEnemyScaling(lvl);
    
    const hpFromPlayer = Math.floor(playerMaxHp * scale);

    const baseEnemyHp = (stats.hp + (Math.pow(lvl, 1.2) * 5) + (userLevel * 0.5)) * statMods.hp;
    const exponentialHp = Math.floor(baseEnemyHp) + hpFromPlayer; 
    const scaledGold = Math.floor(stats.baseGold + (lvl * 0.5) + (lvl > 50 ? lvl * 0.1 : 0));

    setEnemyMaxHp(exponentialHp);
    setEnemyHp(exponentialHp);
    enemyHpRef.current = exponentialHp;
    setEnemyTierGold(scaledGold);
    setIsEnemyStunned(false);
    setIsEnemyUndying(false); // Reset undying status on spawn
    setHasEnemyUsedUndying(false);
    setPlayerAttackGauge(0);
    setEnemyAttackGauge(0);
    enemySpawnTimeRef.current = Date.now(); 
  };

  useEffect(() => {
    spawnEnemy();
    const defaultQuotes = TRAINING_QUOTES[proficiency.category] || TRAINING_QUOTES["General"];
    const phrases = extraPhrases?.screensaver && extraPhrases.screensaver.length > 0 
        ? extraPhrases.screensaver 
        : defaultQuotes;

    setCurrentQuote(phrases[Math.floor(Math.random() * phrases.length)]);
    const quoteInterval = setInterval(() => {
        const q = phrases[Math.floor(Math.random() * phrases.length)];
        setCurrentQuote(q);
    }, 30000); 
    return () => clearInterval(quoteInterval);
  }, [proficiency.category, proficiency.level, extraPhrases]);

  // Enemy Dialogue System
  useEffect(() => {
      if (!isActive) return;

      let timeoutId: NodeJS.Timeout;
      
      const triggerDialogue = () => {
          const rankMultiplier = enemyRank === 'S' ? 5 : enemyRank === 'A' ? 4 : enemyRank === 'B' ? 3 : enemyRank === 'C' ? 2 : enemyRank === 'D' ? 1 : 0;
          
          if (isDead) {
              // Dead/Reviving Dialogue
              let phrases = extraPhrases?.enemyReviveToxic || [];
              if (phrases.length === 0) {
                  phrases = ["Is that all you've got?", "I expected more of a challenge.", "Pathetic.", "You're wasting my time.", "Just stay down.", "Why do you even try?"];
              }
              
              const phrase = phrases[Math.floor(Math.random() * phrases.length)];
              setEnemyMockText(phrase);
              addLog(`Enemy: "${phrase}"`, 'enemy');
              
              // Comical floating text
              const floatingTexts = ["Loooooser!", "Pathetic!", "Weak!", "Scrub!", "Trash!", "Noob!", "Clown!", "Snooze!"];
              const count = Math.min(12, 2 + rankMultiplier);
              for (let i = 0; i < count; i++) {
                  setTimeout(() => {
                      const text = floatingTexts[Math.floor(Math.random() * floatingTexts.length)];
                      
                      // Calculate position in a circle around the PLAYER
                      const angle = Math.random() * Math.PI * 2;
                      const radiusX = 10 + Math.random() * 10; // 10-20% width
                      const radiusY = 15 + Math.random() * 10; // 15-25% height
                      let customX = 25 + Math.cos(angle) * radiusX; // Player center is roughly 25%
                      let customY = 45 + Math.sin(angle) * radiusY; // Player center is roughly 45%
                      
                      // Constrain to prevent going off-screen on mobile
                      customX = Math.max(5, Math.min(45, customX));
                      
                      spawnVisualText(text, "mock", false, customX, customY); 
                  }, Math.random() * 3000);
              }
              
              // Duration: 3s to 1.5s based on rank
              const displayDuration = 3000 - (rankMultiplier * 300);
              setTimeout(() => setEnemyMockText(null), displayDuration);
              
              // Delay: 2s to 0s based on rank
              const delay = Math.max(0, 2000 - (rankMultiplier * 400));
              timeoutId = setTimeout(triggerDialogue, displayDuration + delay);
          } else {
              // Alive Dialogue
              const phrases = extraPhrases?.enemies || [];
              if (phrases.length > 0) {
                  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
                  setEnemyMockText(phrase);
                  addLog(`Enemy: "${phrase}"`, 'enemy');
                  
                  const duration = 6000 + Math.random() * 2000; // 6-8s
                  setTimeout(() => setEnemyMockText(null), duration);
                  
                  // Delay: 4 to 2s based on rank
                  const delay = Math.max(2000, 4000 - (rankMultiplier * 400));
                  timeoutId = setTimeout(triggerDialogue, duration + delay);
              } else {
                  timeoutId = setTimeout(triggerDialogue, 5000);
              }
          }
      };

      // Start the loop
      timeoutId = setTimeout(triggerDialogue, 2000);

      return () => {
          clearTimeout(timeoutId);
          setEnemyMockText(null);
      };
  }, [isActive, isDead, enemyRank, extraPhrases, addLog]);

  // ... (Toggle Mute, Spawn Visual Text) ...
  const toggleMute = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      audio.setMasterMute(newState); 
  };

  const spawnVisualText = (value: string | number, type: DamageNumber['type'], isPlayerTarget: boolean, customX?: number, customY?: number) => {
      let finalValue = value;
      let finalType = type;

      if (typeof value === 'number') {
          const targetMaxHp = isPlayerTarget ? playerMaxHp : enemyMaxHp;
          const isTickle = value < 10 || (value / targetMaxHp) < 0.02;

          if (isTickle && (type === 'normal' || type === 'crit' || type === 'enemy' || type === 'overcrit' || type === 'plus-ultra')) {
              if (value < 1) {
                  finalValue = "Tickle";
                  finalType = "glance";
              } else {
                  finalValue = `${isPlayerTarget ? '-' : ''}${Math.floor(value)} (Tickle)`;
                  finalType = "glance";
              }
          } else {
              if (isPlayerTarget && (type === 'normal' || type === 'crit' || type === 'enemy' || type === 'overcrit' || type === 'plus-ultra')) {
                  finalValue = `-${Math.floor(value)}`;
              } else {
                  finalValue = Math.floor(value);
              }
          }
      }

      const centerX = isPlayerTarget ? 25 : 75; 
      const variation = (Math.random() * 20) - 10;
      const x = customX !== undefined ? customX : Math.max(10, Math.min(90, centerX + variation));
      const y = customY !== undefined ? customY : 45 + (Math.random() * 10 - 5);
      const dmgId = crypto.randomUUID();
      setDamageNumbers(prev => [...prev, { id: dmgId, value: finalValue, type: finalType, x: x, y: y }]);
      setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== dmgId)), 1200 / speedMultiplier);
  };

  const totalGlobalMultiplier = useMemo(() => {
      const base = 1;
      return base + streakMultiplier + gearMultiplier + libraryMultiplier;
  }, [streakMultiplier, gearMultiplier, libraryMultiplier]);

  const currentSessionExp = useMemo(() => {
      const minutes = setupMode === 'STOPWATCH' ? elapsedSeconds / 60 : (timerDuration * 60 - remainingSeconds) / 60;
      return Math.floor(minutes * totalGlobalMultiplier);
  }, [elapsedSeconds, remainingSeconds, timerDuration, setupMode, totalGlobalMultiplier]);

  // Game Loop: Timer & Revive
  useEffect(() => {
    let interval: any = null;
    const tickRate = 1000 / speedMultiplier; 
    if (isActive && !showConfirm) {
      interval = setInterval(() => {
        if (setupMode === 'STOPWATCH') setElapsedSeconds(s => s + 1);
        else if (setupMode === 'TIMER') {
          const currentS = remainingSecondsRef.current;
          if (currentS <= 1) {
              clearInterval(interval); setIsActive(false); setPauseQuote(getRandomQuote()); setShowConfirm(true); setIsScreensaver(false); setWasEarlyFinish(false); audio.playSuccess();
              setRemainingSeconds(0);
          } else {
              setRemainingSeconds(currentS - 1);
          }
        }
        if (isDead && !isUndying) {
            const revivePct = (bonusHeal || 1) / 100;
            const reviveAmount = Math.max(1, Math.floor(playerMaxHp * revivePct));
            const prev = playerHpRef.current;
            const nextHp = Math.min(playerMaxHp, prev + reviveAmount);
            
            if (nextHp >= playerMaxHp && prev < playerMaxHp) { 
                setIsDead(false); 
                spawnVisualText("REVIVED!", "heal", true); 
                addLog("System rebooted. Soul re-attached.", 'system'); 
                setBattleStats(s => ({...s, timesRevived: s.timesRevived + 1}));
                
                // Trigger Revive VFX (Local Pillar)
                setHitVfx('revive');
                setTimeout(() => setHitVfx(null), 1500);
            } else if (prev < playerMaxHp) {
                spawnVisualText(reviveAmount, "heal", true);
            }
            setPlayerHp(nextHp);
            playerHpRef.current = nextHp;
        }
      }, tickRate);
    }
    return () => clearInterval(interval);
  }, [isActive, setupMode, showConfirm, speedMultiplier, isDead, playerMaxHp, bonusHeal, isUndying, addLog]);

  // ... (Combat Callbacks same as before) ...
  const handlePlayerAttack = useCallback(() => {
      if (isDead || isPlayerStunned || isEnemyUndying || isEnemyDead || isEnemySpawning || enemyHpRef.current <= 0) return;
      setIsAttacking(true);
      const { scale, undie } = getEnemyScaling(proficiency.level);
      const finalBarrage = Math.min(85, bonusBarrage);
      const finalStun = Math.min(25, bonusStun);
      const enemyBlockChance = (bonusBlock * scale) * enemyStatMods.block;
      const effectiveEnemyBlockChance = isUndying ? enemyBlockChance * 0.5 : enemyBlockChance;

      setTimeout(() => {
          if (Math.random() * 100 < effectiveEnemyBlockChance) {
              spawnVisualText("BLOCKED", "block", false); addLog("Enemy blocked your attack!", 'enemy');
              setBattleStats(s => ({...s, blocks: s.blocks + 1}));
              setTimeout(() => { setIsAttacking(false); }, Math.max(150, 300 / speedMultiplier)); return;
          }
          const missingHpPct = 1 - (playerHp / playerMaxHp);
          const barrageMultiplier = Math.floor(2 + (2 * missingHpPct));
          const isBarrage = Math.random() * 100 < finalBarrage;
          const hitCount = isBarrage ? barrageMultiplier : 1;
          
          if (isBarrage) { 
              spawnVisualText(`BARRAGE x${hitCount}!`, "crit", false); 
              setBattleStats(s => ({...s, barrageHits: s.barrageHits + 1}));
          }

          let totalDmgDealt = 0;
          let highestHitType = 'normal';

          for (let i = 0; i < hitCount; i++) {
              const baseDmg = 1 + (userLevel * 0.2) + bonusDmg;
              let finalDmg = baseDmg;
              let dmgType: DamageNumber['type'] = 'normal';
              
              const cappedCrit = Math.min(400, Math.max(0, bonusCrit));
              const staticTickleChance = 0.6 + (cappedCrit / 400) * (6 - 0.6);
              const staticNormalChance = 0.4 + (cappedCrit / 400) * (4 - 0.4);
              const staticCritChance = (cappedCrit / 400) * 5;
              const staticOverCritChance = bonusCrit >= 100 ? ((Math.min(400, bonusCrit) - 100) / 300) * 5 : 0;

              const staticRoll = Math.random() * 100;
              let usedStatic = false;

              if (staticRoll < staticTickleChance) {
                  usedStatic = true;
                  dmgType = 'normal';
                  finalDmg = Math.max(1, Math.floor(Math.min(finalDmg * 0.9, enemyMaxHp * 0.01)));
                  setBattleStats(s => ({...s, tickleHits: s.tickleHits + 1}));
              } else if (staticRoll < staticTickleChance + staticNormalChance) {
                  usedStatic = true;
                  dmgType = 'normal';
                  setBattleStats(s => ({...s, normalHits: s.normalHits + 1}));
              } else if (staticRoll < staticTickleChance + staticNormalChance + staticCritChance) {
                  usedStatic = true;
                  dmgType = 'crit';
                  finalDmg *= critDmgMultiplier;
                  setHitVfx('crit');
                  setBattleStats(s => ({...s, critHits: s.critHits + 1}));
              } else if (staticRoll < staticTickleChance + staticNormalChance + staticCritChance + staticOverCritChance) {
                  usedStatic = true;
                  dmgType = 'overcrit';
                  finalDmg *= (critDmgMultiplier * 2);
                  setHitVfx('overcrit');
                  setBattleStats(s => ({...s, overcritHits: s.overcritHits + 1}));
              }

              if (!usedStatic) {
                  const roll = Math.random() * 100;
                  if (bonusCrit > 200 && roll < (bonusCrit - 200)) { finalDmg *= (critDmgMultiplier * 3); dmgType = 'plus-ultra'; setHitVfx('plus-ultra'); setBattleStats(s => ({...s, plusUltraHits: s.plusUltraHits + 1})); } 
                  else if (bonusCrit > 100 && roll < (bonusCrit - 100)) { finalDmg *= (critDmgMultiplier * 2); dmgType = 'overcrit'; setHitVfx('overcrit'); setBattleStats(s => ({...s, overcritHits: s.overcritHits + 1})); }
                  else if (roll < bonusCrit) { finalDmg *= critDmgMultiplier; dmgType = 'crit'; setHitVfx('crit'); setBattleStats(s => ({...s, critHits: s.critHits + 1})); }
                  else { setBattleStats(s => ({...s, normalHits: s.normalHits + 1})); }
              }
              
              // Determine highest tier hit for simplified logging priority
              if (dmgType === 'plus-ultra') highestHitType = 'plus-ultra';
              else if (dmgType === 'overcrit' && highestHitType !== 'plus-ultra') highestHitType = 'overcrit';
              else if (dmgType === 'crit' && highestHitType !== 'plus-ultra' && highestHitType !== 'overcrit') highestHitType = 'crit';

              setTimeout(() => setHitVfx(null), 500);
              totalDmgDealt += finalDmg;
              setBattleStats(s => ({...s, damageOutput: s.damageOutput + finalDmg, hitsDealt: s.hitsDealt + 1}));

              setTimeout(() => {
                  setTargetHit(true); setSlashEffect(Math.random() > 0.5 ? 'slash-1' : 'slash-2');
                  spawnVisualText(Math.floor(finalDmg), dmgType, false);
                  if (speedMultiplier <= 2) audio.playCombatHit();
                  setEnemyAttackGauge(prev => Math.min(100, prev + 20));
              }, i * 100); 
          }

          // Consolidated Logging
          if (isBarrage) {
              addLog(`BARRAGE x${hitCount}! Total: ${Math.floor(totalDmgDealt)} dmg.`, 'player');
          } else {
              if (highestHitType === 'plus-ultra') addLog(`PLUS ULTRA! Reality severed. ${Math.floor(totalDmgDealt)} dmg.`, 'player');
              else if (highestHitType === 'overcrit') addLog(`OVERCRIT! System Error. ${Math.floor(totalDmgDealt)} dmg.`, 'player');
              else if (highestHitType === 'crit') addLog(`CRITICAL HIT! ${Math.floor(totalDmgDealt)} dmg.`, 'player');
          }

          if (Math.random() * 100 < finalStun && !isEnemyStunned) {
              setIsEnemyStunned(true); spawnVisualText("STUNNED", "stun", false); addLog("Enemy stunned.", 'player');
              setBattleStats(s => ({...s, stuns: s.stuns + 1}));
              setTimeout(() => setIsEnemyStunned(false), 2000 / speedMultiplier);
          }
          const prevEnemyHp = enemyHpRef.current;
          const newHp = Math.max(0, prevEnemyHp - totalDmgDealt);
          
          if (newHp === 0 && prevEnemyHp > 0) {
              if (isEnemyUndyingRef.current) {
                  setEnemyHp(1);
                  enemyHpRef.current = 1;
              } else if (!hasEnemyUsedUndyingRef.current && Math.random() * 100 < undie) { 
                  spawnVisualText("UNDYING", "plus-ultra", false); 
                  addLog("Enemy UNDYING state active!", "enemy"); 
                  setIsEnemyUndying(true);
                  setHasEnemyUsedUndying(true);
                  const rankIndex = Math.max(0, RANKS.indexOf(getRankName(proficiency.level)));
                  const undyingDuration = 4000 + (rankIndex / (RANKS.length - 1)) * 4000;
                  setTimeout(() => setIsEnemyUndying(false), undyingDuration);
                  setEnemyHp(1);
                  enemyHpRef.current = 1;
              } else {
                  const killTime = Date.now() - enemySpawnTimeRef.current;
                  if (killTime <= 1500 && onUnlockAchievement) onUnlockAchievement('a53');
                  setKills(k => k + 1);
                  setDefeatedEnemies(prev => {
                      const newCounts = { ...prev };
                      newCounts[enemyName] = (newCounts[enemyName] || 0) + 1;
                      return newCounts;
                  });
                  const baseGoldDrop = enemyTierGold;
                  const totalGoldDrop = Math.max(1, Math.floor(baseGoldDrop + (baseGoldDrop * (bonusGoldPct / 100))));
                  setSessionGold(g => g + totalGoldDrop);
                  addLog(`Enemy defeated. Loot: ${totalGoldDrop} G.`, 'loot');
                  const goldId = crypto.randomUUID();
                  setGoldDrops(prev => [...prev, { id: goldId, value: totalGoldDrop, x: 50, y: 40 }]);
                  setTimeout(() => setGoldDrops(prev => prev.filter(d => d.id !== goldId)), 1500 / speedMultiplier);
                  
                  setEnemyHp(0);
                  enemyHpRef.current = 0;
                  setIsEnemyDead(true);
                  setHitVfx('death');
                  
                  setTimeout(() => {
                      setHitVfx(null);
                      spawnEnemy();
                      setIsEnemyDead(false);
                      setIsEnemySpawning(true);
                      setHitVfx('spawn');
                      
                      setTimeout(() => {
                          setIsEnemySpawning(false);
                          setHitVfx(null);
                      }, 1500 / speedMultiplier);
                  }, 2000 / speedMultiplier);
              }
          } else {
              setEnemyHp(newHp);
              enemyHpRef.current = newHp;
          }
          setTimeout(() => { setIsAttacking(false); setTargetHit(false); setSlashEffect(null); }, Math.max(150, (300 + (hitCount * 100)) / speedMultiplier));
      }, 100 / speedMultiplier); 
  }, [bonusBarrage, bonusStun, playerHp, playerMaxHp, userLevel, bonusDmg, bonusCrit, critDmgMultiplier, onUnlockAchievement, isEnemyStunned, speedMultiplier, enemyTierGold, bonusGoldPct, isDead, isPlayerStunned, bonusBlock, addLog, effectiveEnemyStatMods, proficiency.level, isUndying, isEnemyDead, isEnemySpawning]);

  const handleEnemyAttack = useCallback(() => {
      if (isDead || isEnemyStunned || isUndying || isEnemyDead || isEnemySpawning) return;
      const finalBlock = Math.min(75, bonusBlock);
      const effectivePlayerBlockChance = isEnemyUndying ? finalBlock * 0.5 : finalBlock;
      const { scale } = getEnemyScaling(proficiency.level);
      const playerTotalDmg = 1 + (userLevel * 0.2) + bonusDmg;
      const rankIndex = Math.max(0, RANKS.indexOf(getRankName(proficiency.level)));
      
      const enemyCritChance = (5 + (rankIndex * 2)) * effectiveEnemyStatMods.crit;
      const enemyCritDmg = 1.5 * effectiveEnemyStatMods.critDmg;
      const enemyStunChance = (2 + rankIndex) * effectiveEnemyStatMods.stun;
      const enemyBarrageChance = (1 + rankIndex) * effectiveEnemyStatMods.barrage;

      setIsEnemyAttacking(true); setTimeout(() => setIsEnemyAttacking(false), Math.max(150, 300 / speedMultiplier));

      setTimeout(() => {
          const ignoreBlock = Math.random() * 100 < 25;
          if (!ignoreBlock && Math.random() * 100 < effectivePlayerBlockChance) { 
              spawnVisualText("BLOCKED", "block", true); 
              addLog("Blocked!", 'player'); 
              setBattleStats(s => ({...s, blocks: s.blocks + 1})); 
              return; 
          }
          if (ignoreBlock && Math.random() * 100 < effectivePlayerBlockChance) {
              addLog("Enemy ignored your block!", 'enemy');
          }
          const rawDmg = proficiency.level + (playerMaxHp * (0.006 + (rankIndex * 0.0075)));
          const baseEnemyDmg = (rawDmg + (playerTotalDmg * scale)) * effectiveEnemyStatMods.dmg;
          
          const isBarrage = Math.random() * 100 < enemyBarrageChance;
          const hitCount = isBarrage ? 2 : 1;
          
          if (isBarrage) { spawnVisualText(`BARRAGE x${hitCount}!`, "enemy", true); }
          
          let totalDmgDealt = 0;
          for (let i = 0; i < hitCount; i++) {
              let finalDmg = baseEnemyDmg;
              let isCrit = false;
              if (Math.random() * 100 < enemyCritChance) {
                  finalDmg *= enemyCritDmg;
                  isCrit = true;
              }
              totalDmgDealt += Math.floor(finalDmg);
              setBattleStats(s => ({...s, damageTaken: s.damageTaken + Math.floor(finalDmg)}));
              
              setTimeout(() => {
                  spawnVisualText(Math.floor(finalDmg), isCrit ? "crit" : "enemy", true);
              }, i * 100);
          }
          
          if (Math.random() * 100 < enemyStunChance && !isPlayerStunned) {
              setIsPlayerStunned(true); spawnVisualText("STUNNED", "stun", true); addLog("You were stunned.", 'enemy');
              setTimeout(() => setIsPlayerStunned(false), 2000 / speedMultiplier);
          }

          const prevPlayerHp = playerHpRef.current;
          if (isUndyingRef.current) { 
              spawnVisualText("IMMORTAL", "block", true); 
              setPlayerHp(1);
              playerHpRef.current = 1;
              return; 
          }
          const nextHp = Math.max(0, Math.floor(prevPlayerHp - totalDmgDealt));
          
          if (nextHp === 0 && !isDeadRef.current) {
              if (undieableChance > 0 && Math.random() * 100 < undieableChance) {
                  setIsUndying(true); spawnVisualText("UNDYING!", "overcrit", true); addLog("Undying activated!", 'system'); audio.playSuccess();
                  setTimeout(() => { setIsUndying(false); setIsDead(true); spawnVisualText("DEFEATED", "overcrit", true); addLog("You died.", 'system'); audio.playError(); }, 4000);
                  setPlayerHp(1);
                  playerHpRef.current = 1;
              } else {
                  setIsDead(true); spawnVisualText("DEFEATED", "overcrit", true); addLog("You died.", 'enemy'); audio.playError();
                  setPlayerHp(0);
                  playerHpRef.current = 0;
              }
          } else {
              setPlayerHp(nextHp);
              playerHpRef.current = nextHp;
          }
      }, 150 / speedMultiplier);
  }, [isDead, isEnemyStunned, bonusBlock, speedMultiplier, proficiency.level, playerMaxHp, isPlayerStunned, isUndying, undieableChance, bonusDmg, bonusCrit, bonusStun, bonusBarrage, userLevel, addLog, enemyStatMods, isEnemyDead, isEnemySpawning]);

  // ... (Tick System, UI Functions, Render Screensaver, Render Confirm Modal, Render Setup) ...
  // (Assuming code is preserved as per previous file content, updating only necessary parts)
  
  useEffect(() => {
    let loop: any = null;
    const TICK_RATE = 100; 
    if (isActive && !showConfirm && (setupMode === 'STOPWATCH' || setupMode === 'TIMER')) {
        loop = setInterval(() => {
            if (!isDead && !isPlayerStunned && !isEnemyDead && !isEnemySpawning) {
                // Player: 2 attacks per 7s = 3500ms per attack
                const baseInterval = 3500 / (1 + (attackSpeed / 100) * 1.25);
                setPlayerAttackGauge(prev => Math.min(100, prev + ((100 / baseInterval) * TICK_RATE * speedMultiplier)));
            }
            if (!isDead && !isEnemyStunned && !isEnemyDead && !isEnemySpawning) {
                // Enemy: 1 attack per 3s = 3000ms per attack
                const baseEnemySpeed = 3000 / (1 + (effectiveEnemyStatMods.aspd - 1) * 1.25);
                setEnemyAttackGauge(prev => Math.min(100, prev + ((100 / baseEnemySpeed) * TICK_RATE * speedMultiplier)));
            }
        }, TICK_RATE);
    }
    return () => clearInterval(loop);
  }, [isActive, showConfirm, setupMode, isDead, isPlayerStunned, isEnemyStunned, attackSpeed, speedMultiplier, enemyId, effectiveEnemyStatMods, isEnemyDead, isEnemySpawning]);

  useEffect(() => { if (playerAttackGauge >= 100) { handlePlayerAttack(); setPlayerAttackGauge(0); } }, [playerAttackGauge, handlePlayerAttack]);
  useEffect(() => { if (enemyAttackGauge >= 100) { handleEnemyAttack(); setEnemyAttackGauge(0); } }, [enemyAttackGauge, handleEnemyAttack]);

  const toggle = () => { if (!isActive) audio.playClick(); setIsActive(!isActive); };
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };
  const startTimer = () => { 
    audio.playStart(); 
    if (setupMode === 'TIMER') { setRemainingSeconds(timerDuration * 60); } 
    setIsSetup(false); 
    setIsActive(true); 
    setBattleStats({
      damageTaken: 0, damageOutput: 0, hitsDealt: 0, tickleHits: 0, normalHits: 0, barrageHits: 0,
      critHits: 0, overcritHits: 0, plusUltraHits: 0, blocks: 0, stuns: 0, timesRevived: 0
    });
  };
  const handleStopRequest = () => { setIsActive(false); if (setupMode === 'TIMER' && remainingSeconds > 0) setWasEarlyFinish(true); else setWasEarlyFinish(false); setPauseQuote(getRandomQuote()); setShowConfirm(true); audio.playClick(); };
  const handleResume = () => { setShowConfirm(false); setIsActive(true); audio.playClick(); };
  const getDurationInMinutes = () => { if (setupMode === 'STOPWATCH') return elapsedSeconds / 60; if (setupMode === 'TIMER') return (timerDuration * 60 - remainingSeconds) / 60; return parseFloat(manualMinutes) || 0; };
  const submitSession = () => { onComplete(getDurationInMinutes(), '', sessionGold, wasEarlyFinish, defeatedEnemies); };

  // ... (Rendering Screensaver, Confirm, Setup are same as previous input) ...
  
  if (isScreensaver && isActive) {
      return (
          <div onClick={() => setIsScreensaver(false)} className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-1000">
              <div className="absolute inset-0 cyber-grid opacity-10 animate-grid-move"></div>
              <div className="text-slate-500 text-xs mb-4 uppercase tracking-widest animate-pulse relative z-10">System Status: Training</div>
              <div className="text-8xl font-mono text-purple-500 font-bold select-none drop-shadow-[0_0_25px_rgba(168,85,247,0.5)] relative z-10">{setupMode === 'STOPWATCH' ? formatTime(elapsedSeconds) : formatTime(remainingSeconds)}</div>
              <div className="mt-8 text-slate-400 text-sm font-mono max-w-md text-center px-4 animate-in fade-in duration-1000 relative z-10 italic">{currentQuote && `"${currentQuote}"`}</div>
              <div className="absolute bottom-10 text-slate-600 text-xs animate-bounce">Tap to engage</div>
          </div>
      )
  }

  if (showConfirm || (setupMode === 'MANUAL' && !isSetup)) {
    const duration = setupMode === 'MANUAL' ? (parseFloat(manualMinutes) || 0) : getDurationInMinutes();
    const effectiveMinutes = Math.floor(duration);
    const baseExp = effectiveMinutes * 1; 
    const streakBonusAmount = Math.floor(baseExp * streakMultiplier);
    const gearBonusAmount = Math.floor(baseExp * gearMultiplier);
    const libraryBonusAmount = Math.floor(baseExp * libraryMultiplier);
    const baseWithGlobal = baseExp + streakBonusAmount + gearBonusAmount + libraryBonusAmount;
    
    let bonusPct = 0; let minReq = 10;
    if (effectiveMinutes >= 120) { bonusPct = 40; minReq = 999; }
    else if (effectiveMinutes >= 60) { bonusPct = 30; minReq = 120; }
    else if (effectiveMinutes >= 30) { bonusPct = 20; minReq = 60; }
    else if (effectiveMinutes >= 10) { bonusPct = 10; minReq = 30; }
    
    const timeBonusAmount = Math.floor(baseWithGlobal * (bonusPct / 100));
    const totalExp = baseWithGlobal + timeBonusAmount;

    return (
      <MissionReportModal
        setupMode={setupMode}
        wasEarlyFinish={wasEarlyFinish}
        pauseQuote={pauseQuote}
        duration={duration}
        baseExp={baseExp}
        gearBonusAmount={gearBonusAmount}
        streakBonusAmount={streakBonusAmount}
        timeBonusAmount={timeBonusAmount}
        totalExp={totalExp}
        sessionGold={sessionGold}
        battleStats={battleStats}
        onResume={handleResume}
        onSubmit={submitSession}
      />
    );
  }

  if (isSetup) {
     return (
      <div className="h-full flex flex-col p-6 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-4 mb-8"><button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><ArrowLeft size={24} /></button><h2 className="text-xl font-bold text-white">{lockMode ? (setupMode === 'TIMER' ? 'Timer Setup' : 'Session Setup') : 'Session Setup'}</h2></div>
        {!lockMode && <div className="bg-slate-800 rounded-xl p-2 flex gap-1 mb-8"><button onClick={() => { audio.playSelect(); setSetupMode('STOPWATCH'); }} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${setupMode === 'STOPWATCH' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700'}`}><Clock size={16} /> Focus</button><button onClick={() => { audio.playSelect(); setSetupMode('TIMER'); }} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${setupMode === 'TIMER' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700'}`}><TimerIcon size={16} /> Timer</button><button onClick={() => { audio.playSelect(); setSetupMode('MANUAL'); }} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${setupMode === 'MANUAL' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700'}`}><Edit3 size={16} /> Log</button></div>}
        <div className="flex-1 flex flex-col justify-center">
            {setupMode === 'STOPWATCH' && <div className="text-center"><div className="w-32 h-32 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-purple-500/30 relative"><div className="absolute inset-0 rounded-full border-t-4 border-purple-400 animate-spin-slow opacity-50"></div><Play size={48} className="text-purple-400 ml-2" /></div><h3 className="text-xl font-bold mb-2 text-white">Free Flow Mode</h3><p className="text-slate-400 mb-8 px-4">Track your time as you go. Earn bonus EXP for longer sessions.</p><button onClick={startTimer} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/50 transform transition hover:translate-y-[-2px]">Start Focusing</button></div>}
            {setupMode === 'TIMER' && <div className="text-center animate-in fade-in slide-in-from-bottom-2"><div className="mb-8"><div className="w-56 h-56 mx-auto rounded-full bg-slate-900 border-[6px] border-slate-800 flex items-center justify-center relative mb-6 shadow-[0_0_50px_rgba(168,85,247,0.15)] group"><div className="absolute inset-0 rounded-full border-[2px] border-purple-500/30 border-dashed animate-spin-slow"></div><div className="absolute inset-2 rounded-full border-[1px] border-cyan-500/20 animate-reverse-spin"></div><div className="flex flex-col items-center z-10"><span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Target</span><div className="text-6xl font-mono font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{timerDuration}</div><span className="text-sm font-bold text-purple-400">MINS</span></div><button onClick={() => setTimerDuration(d => Math.max(5, d - 5))} className="absolute left-[-10px] top-1/2 -translate-y-1/2 p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white border-2 border-slate-700 hover:border-purple-500 transition-colors shadow-lg"><ChevronDown className="rotate-90" size={24}/></button><button onClick={() => setTimerDuration(d => Math.min(180, d + 5))} className="absolute right-[-10px] top-1/2 -translate-y-1/2 p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white border-2 border-slate-700 hover:border-purple-500 transition-colors shadow-lg"><ChevronUp className="rotate-90" size={24}/></button></div></div><div className="grid grid-cols-3 gap-4 mb-8">{[25, 45, 60].map(m => (<button key={m} onClick={() => { audio.playClick(); setTimerDuration(m); }} className={`h-14 rounded-xl font-bold text-sm uppercase tracking-wider transition-all relative overflow-hidden group border-2 ${timerDuration === m ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}><span className="relative z-10">{m} Mins</span>{timerDuration === m && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>}</button>))}</div><div className="mb-8 px-4"><input type="range" min="5" max="120" step="5" value={timerDuration} onChange={(e) => setTimerDuration(parseInt(e.target.value))} className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer" /></div><button onClick={startTimer} className="w-full py-5 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] transform transition hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-purple-400/30"><Zap size={24} className="fill-current animate-pulse"/> <span className="text-lg">Initialize</span></button></div>}
            {setupMode === 'MANUAL' && <div><div className="mb-6"><label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Duration (Minutes)</label><input type="number" value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-lg font-bold text-white focus:border-purple-500 outline-none" /></div><button onClick={() => { audio.playClick(); setSetupMode('MANUAL'); }} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/50 transform transition hover:translate-y-[-2px]">Log Session</button></div>}
        </div>
      </div>
    );
  }

  const renderBuffEffects = (newData: any, stacks: number) => {
    if (!newData) return null;
    
    const buffs = [
        { key: 'receiveStone', label: 'Philosopher Stones', icon: <Sparkles size={12}/>, min: newData.receiveStoneMin, max: newData.receiveStoneMax },
        { key: 'flatExp', label: 'Flat EXP', icon: <Star size={12}/>, min: newData.flatExpGainMin, max: newData.flatExpGainMax },
        { key: 'patronGain', label: 'Patron Gain', icon: <Crown size={12}/>, min: newData.patronGainMin, max: newData.patronGainMax },
        { key: 'dmg', label: 'Damage', icon: <Sword size={12}/>, min: newData.dmgMin, max: newData.dmgMax },
        { key: 'flatHp', label: 'Max HP', icon: <Heart size={12}/>, min: newData.flatHpMin, max: newData.flatHpMax },
        { key: 'percentileHp', label: 'Max HP %', icon: <Heart size={12}/>, min: newData.percentileHpMin, max: newData.percentileHpMax },
        { key: 'heal', label: 'Heal', icon: <Activity size={12}/>, min: newData.healMin, max: newData.healMax },
        { key: 'gold', label: 'Gold Multiplier', icon: <Coins size={12}/>, min: newData.goldMin, max: newData.goldMax },
        { key: 'block', label: 'Block Chance', icon: <Shield size={12}/>, min: newData.blockMin, max: newData.blockMax },
        { key: 'aspd', label: 'Attack Speed', icon: <Zap size={12}/>, min: newData.aspdMin, max: newData.aspdMax },
        { key: 'critRate', label: 'Crit Rate', icon: <Target size={12}/>, min: newData.critRateMin, max: newData.critRateMax },
        { key: 'critDmg', label: 'Crit Damage', icon: <Zap size={12}/>, min: newData.critDmgMin, max: newData.critDmgMax },
        { key: 'stun', label: 'Stun Chance', icon: <HelpCircle size={12}/>, min: newData.stunMin, max: newData.stunMax },
        { key: 'barrage', label: 'Barrage Chance', icon: <Footprints size={12}/>, min: newData.barrageMin, max: newData.barrageMax },
        { key: 'skillExp', label: 'Skill EXP Multiplier', icon: <TrendingUp size={12}/>, min: newData.skillExpMin, max: newData.skillExpMax },
        { key: 'cReduction', label: 'Cost Reduction', icon: <Coins size={12}/>, min: newData.cReductionMin, max: newData.cReductionMax },
        { key: 'streakSave', label: 'Streak Protection', icon: <Shield size={12}/>, min: newData.streakSaveMin, max: newData.streakSaveMax },
        { key: 'undying', label: 'Undying Chance', icon: <Heart size={12}/>, min: newData.undyingMin, max: newData.undyingMax },
    ];

    const activeBuffsList = buffs.filter(b => b.min !== 0 || b.max !== 0);

    if (activeBuffsList.length === 0 && !newData.freeChallenge) return null;

    const rankIndex = RANKS.indexOf(getRankName(userLevel));
    const maxRank = RANKS.length - 1;
    const rankFactor = rankIndex / maxRank;
    const lerp = (min: number, max: number) => (min + (max - min) * rankFactor) * stacks;

    return (
        <div className="flex flex-wrap gap-1.5 mt-2">
            {newData.freeChallenge && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 text-[10px] font-bold">
                    <Coins size={10} /> Free Challenge
                </span>
            )}
            {activeBuffsList.map((buff, idx) => {
                const val = lerp(buff.min, buff.max);
                const displayVal = val % 1 === 0 ? val : val.toFixed(1);
                const isNegative = val < 0;
                return (
                    <span key={idx} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold ${isNegative ? 'bg-red-900/30 border-red-800/50 text-red-400' : 'bg-slate-800/80 border-slate-700/80 text-slate-300'}`}>
                        {buff.icon}
                        {buff.label}: {isNegative ? '' : '+'}{displayVal}
                        {['percentileHp', 'gold', 'block', 'critRate', 'critDmg', 'stun', 'barrage', 'skillExp', 'cReduction', 'streakSave', 'undying'].includes(buff.key) ? '%' : ''}
                    </span>
                );
            })}
        </div>
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] relative overflow-hidden bg-slate-950">
      {/* Music Control Modal */}
      {showMusicModal && (
          <MusicControlModal 
              onClose={() => setShowMusicModal(false)}
              isPlaying={musicEnabled}
              onToggle={onToggleMusic}
              onSkip={onSkipMusic}
          />
      )}

      {/* Top Info Bar */}
      <div className="absolute top-0 left-0 right-0 pt-14 pb-6 px-6 z-20 flex justify-between items-start bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent pointer-events-none">
         <div className="flex items-center gap-2 pointer-events-auto">
             <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-lg">
                <Sword size={14} className="text-yellow-500" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Battle Mode</span>
             </div>
             {/* Music Player Widget with new handler */}
             <MusicPlayerWidget 
                isPlaying={musicEnabled}
                onToggle={onToggleMusic}
                onSkip={onSkipMusic}
                onOpenControl={() => setShowMusicModal(true)}
             />
         </div>
         
         <div className="text-right">
             <h3 className="font-rpg font-bold text-lg text-white leading-none shadow-black drop-shadow-md">{proficiency.name}</h3>
             <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Rank: Lvl {proficiency.level}</span>
         </div>
      </div>

      {/* Battle Scene Container */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
         {/* Live Stats HUD */}
         <div className="absolute bottom-6 left-6 z-50 pointer-events-none bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-lg flex flex-col gap-2 animate-in slide-in-from-left-4 fade-in">
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 border-b border-white/10 pb-1">Current Gains</div>
             <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-yellow-900/50 flex items-center justify-center border border-yellow-500/50"><Coins size={12} className="text-yellow-400"/></div><span className="text-sm font-mono font-bold text-yellow-100">+{formatNumber(sessionGold)}</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-purple-900/50 flex items-center justify-center border border-purple-500/50"><TrendingUp size={12} className="text-purple-400"/></div><span className="text-sm font-mono font-bold text-purple-100">+{formatNumber(currentSessionExp)}</span></div>
             </div>
         </div>

         {/* Battle Log */}
         {showBattleLog && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm h-64 bg-slate-900/90 backdrop-blur-md border-2 border-slate-700 rounded-xl z-[60] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95"><div className="bg-slate-800 p-2 flex justify-between items-center border-b border-slate-700"><span className="text-xs font-bold text-white flex items-center gap-2"><ScrollText size={14}/> Combat Log</span><button onClick={() => setShowBattleLog(false)}><X size={16} className="text-slate-400 hover:text-white"/></button></div><div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">{battleLog.length === 0 && <div className="text-[10px] text-slate-500 italic text-center mt-4">No events recorded yet.</div>}{battleLog.map(entry => (<div key={entry.id} className="text-[10px] font-mono leading-tight"><span className="text-slate-600">[{entry.timestamp}]</span>{' '}<span className={entry.type === 'player' ? 'text-emerald-400' : entry.type === 'enemy' ? 'text-red-400' : entry.type === 'loot' ? 'text-yellow-400 font-bold' : 'text-purple-400'}>{entry.message}</span></div>))}</div></div>}

          {/* Active Buffs/Debuffs */}
          {showBuffs && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm h-64 bg-slate-900/90 backdrop-blur-md border-2 border-yellow-700/50 rounded-xl z-[60] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
              <div className="bg-yellow-900/30 p-2 flex justify-between items-center border-b border-yellow-700/30">
                <span className="text-xs font-bold text-yellow-100 flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400 fill-yellow-400/20"/> Active Effects
                </span>
                <button onClick={() => setShowBuffs(false)}>
                  <X size={16} className="text-slate-400 hover:text-white"/>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {(!activeBuffs || Object.keys(activeBuffs).length === 0) ? (
                  <div className="text-[10px] text-slate-500 italic text-center mt-4">No active buffs or debuffs.</div>
                ) : (
                  Object.entries(activeBuffs).map(([buffId, expiry]) => {
                    const newData = consumablesData?.find(c => c.id === buffId);
                    const oldData = CONSUMABLE_DATA[buffId];
                    
                    let name = buffId;
                    let desc = 'Active effect';
                    let icon: React.ReactNode = <Package size={16}/>;

                    if (installedConsumableImages && (newData?.name || oldData?.name)) {
                        const imgName = newData?.name || oldData?.name;
                        const url = getConsumableImageUrl(imgName!);
                        if (url) {
                            icon = <img src={url} alt={imgName} className="w-8 h-8 object-contain drop-shadow-lg" />;
                        } else {
                            if (newData) {
                                name = newData.name;
                                desc = newData.description || 'A mysterious buff.';
                                icon = <Package size={16}/>;
                            } else if (oldData) {
                                name = oldData.name;
                                desc = oldData.description;
                                icon = <Package size={16}/>;
                            } else if (buffId === 'sss_soap') {
                                name = 'SSS-Rank Soap';
                                desc = 'Increases all gains by 100%';
                                icon = <Sparkles size={16}/>;
                            }
                        }
                    } else {
                        if (newData) {
                            name = newData.name;
                            desc = newData.description || 'A mysterious buff.';
                            icon = <Package size={16}/>;
                        } else if (oldData) {
                            name = oldData.name;
                            desc = oldData.description;
                            icon = <Package size={16}/>;
                        } else if (buffId === 'sss_soap') {
                            name = 'SSS-Rank Soap';
                            desc = 'Increases all gains by 100%';
                            icon = <Sparkles size={16}/>;
                        }
                    }

                    if (newData) {
                        name = newData.name;
                        desc = newData.description || 'A mysterious buff.';
                    } else if (oldData) {
                        name = oldData.name;
                        desc = oldData.description;
                    } else if (buffId === 'sss_soap') {
                        name = 'SSS-Rank Soap';
                        desc = 'Increases all gains by 100%';
                    }
                    
                    const stacks = activeBuffStacks[buffId] || 1;
                    
                    return (
                      <div key={buffId} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-500/20">
                            {icon}
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] font-bold text-white uppercase tracking-wider">{name} {stacks > 1 ? `x${stacks}` : ''}</div>
                            <div className="text-[9px] text-slate-400 leading-tight">{desc}</div>
                          </div>
                          <div className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20">
                            ACTIVE
                          </div>
                        </div>
                        {renderBuffEffects(newData, stacks)}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

         {/* Content Render */}
         {devicePerformance === 'ULTRA_STRONG' ? (
           <BattleUltra 
              devicePerformance={devicePerformance}
              userAvatar={userAvatar}
              enemyImage={getEnemyImageUrl(enemyImage)}
              enemyName={enemyName}
              enemyTitle={enemyTitle}
              enemyRank={enemyRank}
              enemyRace={enemyRace}
              enemySize={enemySize}
              enemyHp={enemyHp}
              enemyMaxHp={enemyMaxHp}
              playerHp={playerHp}
              playerMaxHp={playerMaxHp}
              playerAttackGauge={playerAttackGauge}
              enemyAttackGauge={enemyAttackGauge}
              isDead={isDead}
              isEnemyDead={isEnemyDead}
              isEnemySpawning={isEnemySpawning}
              isUndying={isUndying}
              isEnemyUndying={isEnemyUndying}
              isAttacking={isAttacking}
              isEnemyAttacking={isEnemyAttacking}
              targetHit={targetHit}
              hitVfx={hitVfx}
              slashEffect={slashEffect}
              bubbleText={bubbleText}
              enemyMockText={enemyMockText}
              isEnemyStunned={isEnemyStunned}
              isPlayerStunned={isPlayerStunned}
              vfxLevel={vfxLevel}
              floatingMockEnabled={floatingMockEnabled}
              installedEnemyImages={installedEnemyImages}
           />
         ) : (
           <BattlePotato 
              devicePerformance={devicePerformance}
              userAvatar={userAvatar}
              enemyImage={getEnemyImageUrl(enemyImage)}
              enemyName={enemyName}
              enemyTitle={enemyTitle}
              enemyRank={enemyRank}
              enemyRace={enemyRace}
              enemySize={enemySize}
              enemyHp={enemyHp}
              enemyMaxHp={enemyMaxHp}
              playerHp={playerHp}
              playerMaxHp={playerMaxHp}
              playerAttackGauge={playerAttackGauge}
              enemyAttackGauge={enemyAttackGauge}
              isDead={isDead}
              isEnemyDead={isEnemyDead}
              isEnemySpawning={isEnemySpawning}
              isUndying={isUndying}
              isEnemyUndying={isEnemyUndying}
              isAttacking={isAttacking}
              isEnemyAttacking={isEnemyAttacking}
              targetHit={targetHit}
              hitVfx={hitVfx}
              slashEffect={slashEffect}
              bubbleText={bubbleText}
              enemyMockText={enemyMockText}
              isEnemyStunned={isEnemyStunned}
              isPlayerStunned={isPlayerStunned}
              vfxLevel={vfxLevel}
              floatingMockEnabled={floatingMockEnabled}
              installedEnemyImages={installedEnemyImages}
           />
         )}

         {/* Shared Overlays */}
         {damageNumbers.map(d => {
            if (d.type === 'mock' && floatingMockEnabled) {
                return (
                    <div key={d.id} className="absolute z-50 pointer-events-none select-none" style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className="animate-bounce -rotate-[6deg]">
                            <div 
                                className="relative z-10 font-rpg font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-700 text-2xl sm:text-4xl" 
                                style={{ 
                                    WebkitTextStroke: '1.5px #b91c1c', 
                                    filter: 'drop-shadow(1px 1px 0px #000) drop-shadow(-1px -1px 0px #000) drop-shadow(1px -1px 0px #000) drop-shadow(-1px 1px 0px #000) drop-shadow(0px 3px 0px #000)' 
                                }}
                            >
                                {d.value}
                            </div>
                        </div>
                    </div>
                );
            }

            if (d.type === 'mock') return null; // Skip if disabled

            return (
                <div key={d.id} className={`absolute z-50 font-rpg font-bold pointer-events-none whitespace-nowrap select-none ${d.type === 'plus-ultra' ? 'text-cyan-400 text-5xl drop-shadow-[0_0_30px_rgba(34,211,238,1)] tracking-tighter animate-crit-pop text-shadow-md' : d.type === 'overcrit' ? 'text-purple-300 text-4xl drop-shadow-[0_0_25px_rgba(168,85,247,1)] tracking-tighter animate-crit-pop text-shadow-md' : d.type === 'crit' ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-600 text-4xl drop-shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-crit-pop text-shadow-md' : d.type === 'glance' ? 'text-slate-500 text-sm italic animate-damage-float text-shadow-md' : d.type === 'enemy' ? 'text-red-500 text-2xl drop-shadow-md animate-damage-float text-shadow-md' : d.type === 'block' ? 'text-blue-400 text-xl border border-blue-500 px-2 rounded bg-blue-900/80 animate-damage-float text-shadow-md' : d.type === 'stun' ? 'text-yellow-400 text-2xl animate-shake text-shadow-md' : d.type === 'heal' ? 'text-emerald-400 text-lg animate-float-up text-shadow-md' : 'text-white text-2xl drop-shadow-lg text-stroke animate-damage-float text-shadow-md'}`} style={{ left: `${d.x}%`, top: `${d.y}%` }}>
                    {d.type === 'plus-ultra' && <span className="block text-sm text-cyan-200 font-sans tracking-widest mb-[-5px] animate-pulse text-center text-shadow-md">PLUS ULTRA</span>}
                    {d.type === 'overcrit' && <span className="block text-sm text-purple-200 font-sans tracking-widest mb-[-5px] animate-pulse text-shadow-md">OVERCRIT</span>}
                    {d.type === 'heal' && "+"}
                    {d.value}
                </div>
            );
         })}
         {goldDrops.map(d => (
            <div key={d.id} className="absolute z-40 font-rpg font-bold text-yellow-300 text-xl pointer-events-none animate-float-up drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" style={{ left: `${d.x}%`, top: `${d.y}%` }}>+{formatNumber(d.value)} G</div>
         ))}
      </div>

      {/* Timer Controls Area */}
      <div className="bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 p-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto relative">
            <div className="absolute -top-12 right-0 flex gap-2">
                {speedMultiplier > 1 && (
                    <div className="px-3 py-2 bg-purple-600/90 rounded-full text-white text-xs font-bold border border-purple-400 shadow-lg animate-pulse flex items-center gap-1 backdrop-blur"><FastForward size={12} fill="currentColor"/> {speedMultiplier}x Speed</div>
                )}
                <div className="relative">
                    <button 
                        onClick={() => setShowBuffs(!showBuffs)} 
                        className={`p-2 rounded-full border backdrop-blur transition-all duration-300 ${
                            showBuffs 
                                ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                                : (activeBuffs && Object.keys(activeBuffs).length > 0)
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 animate-pulse'
                                    : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700'
                        }`} 
                        title="Active Effects"
                    >
                        <Zap size={16} fill={showBuffs || (activeBuffs && Object.keys(activeBuffs).length > 0) ? "currentColor" : "none"} />
                    </button>
                    {activeBuffs && Object.keys(activeBuffs).length > 0 && !showBuffs && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-slate-900 animate-bounce"></div>
                    )}
                </div>
                <button 
                    onClick={() => setShowBattleLog(!showBattleLog)} 
                    className={`p-2 rounded-full border backdrop-blur transition-all duration-300 ${
                        showBattleLog 
                            ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                            : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700'
                    }`} 
                    title="Battle Log"
                >
                    <ScrollText size={16} />
                </button>
                <button 
                    onClick={() => {
                        onToggleVfx();
                        if (addNotification) {
                            addNotification("VFX Quality Changed", "If it's still laggy, consider changing to the newest visually optimized battle scene in settings.", "info");
                        }
                    }} 
                    className={`p-2 rounded-full border backdrop-blur transition-all duration-300 ${
                        vfxLevel === 'ULTRA' ? 'bg-gradient-to-r from-yellow-500 to-cyan-500 text-white border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-pulse' : 
                        vfxLevel === 'HIGH' ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 
                        vfxLevel === 'MEDIUM' ? 'bg-blue-600/80 text-white border-blue-500' : 
                        'bg-slate-800/80 text-slate-500 hover:text-slate-300 border-slate-700'
                    }`} 
                    title={`VFX Quality: ${vfxLevel}`}
                >
                    {vfxLevel === 'LOW' ? <EyeOff size={16} /> : <Sparkles size={16} className={vfxLevel === 'ULTRA' ? 'animate-spin-slow' : ''} />}
                </button>
                <button onClick={() => setIsScreensaver(true)} className="p-2 bg-slate-800/80 rounded-full text-slate-400 hover:text-white border border-slate-700 backdrop-blur" title="Screensaver Mode"><MonitorOff size={16} /></button>
                <button onClick={toggleMute} className={`p-2 rounded-full border backdrop-blur transition-colors ${isMuted ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700'}`} title={isMuted ? "Unmute" : "Mute"}>{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
            </div>
            <div className="text-center mb-6">
                <div className="text-6xl font-mono font-bold text-white tracking-wider tabular-nums shadow-purple-500/10 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{setupMode === 'STOPWATCH' ? formatTime(elapsedSeconds) : formatTime(remainingSeconds)}</div>
                <div className="text-xs text-slate-500 uppercase tracking-[0.3em] mt-1 font-bold">{isActive ? <span className="text-emerald-500 animate-pulse">● Session Active</span> : <span className="text-yellow-500">● Paused</span>}</div>
            </div>
            <div className="flex items-center gap-4 justify-center">
                <button onClick={toggle} className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${isActive ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}>{isActive ? <Pause size={28} fill="currentColor" strokeWidth={2.5} /> : <Play size={28} fill="currentColor" className="ml-1" strokeWidth={2.5} />}</button>
                <button onClick={handleStopRequest} className="h-16 px-8 rounded-2xl bg-slate-800 border-2 border-slate-700 text-slate-300 font-bold uppercase tracking-wide hover:bg-slate-700 hover:border-slate-600 hover:text-white transition-all flex items-center gap-2 active:scale-95"><Square size={16} fill="currentColor" /> Finish</button>
            </div>
        </div>
      </div>
    </div>
  );
};
