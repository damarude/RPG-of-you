
// ... existing imports
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { 
  User, Book, Trophy, BarChart2, Plus, 
  Settings, Flame, Award, Shield, Layout, ShoppingBag, Scroll, Calendar, Clock, Edit2, Volume2, AlertTriangle, X, TrendingUp, Terminal, Bell, HelpCircle, Code2, BookOpen, Target, ArrowDownUp, CheckCircle, Lock, Coins, Zap, Gift, ChevronRight, Activity, Sword, Crown, Star, Gem, Sun, FastForward, Database, Filter, Heart, Music, Sparkles
} from 'lucide-react';
import { 
  AppState, Proficiency, UserProfile, 
  LearningSession, RarityType, Achievement, 
  Quest, Item, ItemSlot, AchievementTier, LevelUpEvent, QuizQuestion, ItemStats, PhrasePack, DarkMerchantItem, ConsumableItem
} from './types';
import { SkillCard } from './components/SkillCard';
import { Timer } from './components/Timer';
import { IdentityRegistrationModal } from './components/IdentityRegistrationModal';
import { AvatarSelectionModal } from './components/AvatarSelectionModal';
import { Store } from './components/Store';
import { InventoryModal } from './components/InventoryModal';
import { BoardMenu } from './components/BoardMenu';
import { LevelUpModal } from './components/LevelUpModal';
import { CalendarHeatmap } from './components/CalendarHeatmap';
import { ExpTableModal } from './components/ExpTableModal';
import { AchievementDetailModal } from './components/AchievementDetailModal';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { TutorialModal } from './components/TutorialModal';
import { HelpModal } from './components/HelpModal';
import { DailyBonusModal } from './components/DailyBonusModal';
import { BuffListModal } from './components/BuffListModal';
import { DevProfileModal } from './components/DevProfileModal';
import { ContentManagerModal } from './components/ContentManagerModal';
import { Library } from './components/Library';
import { ChallengeModal } from './components/ChallengeModal';
import { ChallengeStartModal } from './components/ChallengeStartModal';
import { RechallengeStartModal } from './components/RechallengeStartModal';
import { ChallengeDownloadModal } from './components/ChallengeDownloadModal';
import { SkillDetailModal } from './components/SkillDetailModal';
import { StatsPage } from './components/StatsPage';
import { SupportModal } from './components/SupportModal';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { Logo } from './components/Logo';
import { MusicPlayerWidget } from './components/MusicPlayerWidget';
import { MusicControlModal } from './components/MusicControlModal';
import { PatronBlessModal } from './components/PatronBlessModal';
import { PhilosopherStoneModal } from './components/PhilosopherStoneModal';
import { DevCheatModal } from './components/DevCheatModal';
import { ACHIEVEMENTS_LIST, MAIN_QUESTS, getRandomDailyQuests, getRandomWeeklyQuests, getSkillExpRequired, getProfileExpRequired, getProfileLevelFromExp, getSkillLevelFromExp, formatNumber, getRankColor, getRankName, SKILL_PRESETS, ALL_QUIZZES, getChallengeCost, getRankBonus, MASTER_CHALLENGE_URL, EQUIPMENT_DATA_URL, CONSUMABLES_DATA_URL, RANKS, getRankImage, getPlayerBaseStats, getPatronRank, getPatronStats, getLoginExpMultiplier, getLoginGoldMultiplier, getLoginPatronExp, getBaseLoginRewards, getQuestRewards, generateDarkMerchantStock, getEnhancedStats, CONSUMABLE_DATA, getMaxEnhancementLevel, getBlacksmithStoneCost, getEnhancementStoneCost } from './gameData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { audio } from './services/audioService';
import { fetchChallengeData, fetchMasterChallengeIndex } from './services/challengeService';
import { fetchEquipmentData, fetchConsumablesData } from './services/itemService';
import { MUSIC_URLS } from './services/contentService';

// ... (Interface NotificationToast and DEFAULT_USER remain same) ...
interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

const DEFAULT_USER: UserProfile = {
  name: 'Damar',
  avatarUrl: 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/damar.png',
  totalLevel: 1,
  totalExp: 0,
  currentStreak: 0,
  highestStreak: 0,
  lastDailyCheck: Date.now(),
  dailyQuestResetDate: '',
  weeklyQuestResetDate: '',
  gold: 0,
  settings: {
    dailyGoalMinutes: 30,
    soundEnabled: true,
    musicEnabled: true,
    stayAwakeEnabled: true,
    theme: 'dark',
    vfxLevel: 'HIGH',
    floatingMockEnabled: true,
    devicePerformance: 'ULTRA_STRONG'
  },
  achievements: ACHIEVEMENTS_LIST,
  inventory: [],
  equipped: {
    [ItemSlot.HEAD]: null,
    [ItemSlot.BODY]: null,
    [ItemSlot.RIGHT_HAND]: null,
    [ItemSlot.LEFT_HAND]: null,
    [ItemSlot.FEET]: null,
    [ItemSlot.ACCESSORY]: null,
    [ItemSlot.BACKGROUND]: null,
  },
  stats: {
    totalStarted: 0,
    startedToday: 0,
    startedThisWeek: 0,
    questsCompleted: 0,
    itemsBought: 0,
    shopVisitsWithoutBuy: 0,
    challengesFailed: 0,
    totalDonated: 0,
    timersCancelledEarly: 0
  },
  huntedEnemies: {},
  selectedTitle: null,
  equipmentEnhancements: {},
  activeBuffs: {}
};

const parseSavedState = (saved: string | any): AppState => {
  try {
    const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved;
    if (!parsed) throw new Error("No data");
    
    // Ensure base properties exist
    if (!parsed.quests) parsed.quests = [];
    if (!parsed.shopItems) parsed.shopItems = []; 
    if (!parsed.extraPhrases) parsed.extraPhrases = { screensaver: [], enemies: [], character: [], enemyReviveToxic: [] };
    if (!parsed.extraPhrases.enemyReviveToxic) parsed.extraPhrases.enemyReviveToxic = [];
    if (!parsed.challengeIndex) parsed.challengeIndex = []; 
    if (!parsed.challengeIndexLastUpdated) parsed.challengeIndexLastUpdated = 0;
    if (!parsed.detailedEnemies) parsed.detailedEnemies = [];
    if (!parsed.installedMusicPacks) parsed.installedMusicPacks = ['base'];
    if (parsed.installedEnemyImages === undefined) parsed.installedEnemyImages = false;
    if (parsed.installedNpcImages === undefined) parsed.installedNpcImages = false;
    if (parsed.installedConsumableImages === undefined) parsed.installedConsumableImages = false;

    // Ensure user exists
    if (!parsed.user) {
      parsed.user = { ...DEFAULT_USER };
    } else {
      // Ensure nested user properties exist
      if (!parsed.user.stats) parsed.user.stats = { ...DEFAULT_USER.stats };
      if (!parsed.user.settings) parsed.user.settings = { ...DEFAULT_USER.settings };
      if (!parsed.user.equipped) parsed.user.equipped = { ...DEFAULT_USER.equipped };
      if (!parsed.user.achievements) parsed.user.achievements = [...DEFAULT_USER.achievements];
      if (!parsed.user.inventory) parsed.user.inventory = [];
      if (!parsed.user.huntedEnemies) parsed.user.huntedEnemies = {};
      if (!parsed.user.equipmentEnhancements) parsed.user.equipmentEnhancements = {};
      if (!parsed.user.activeBuffs) parsed.user.activeBuffs = {};
    }

    if (!parsed.user.dailyQuestResetDate) parsed.user.dailyQuestResetDate = '';
    if (!parsed.user.weeklyQuestResetDate) parsed.user.weeklyQuestResetDate = '';
    
    if (parsed.user.stats.questsCompleted === undefined) parsed.user.stats.questsCompleted = 0;
    if (parsed.user.stats.itemsBought === undefined) parsed.user.stats.itemsBought = 0;
    if (parsed.user.stats.shopVisitsWithoutBuy === undefined) parsed.user.stats.shopVisitsWithoutBuy = 0;
    if (parsed.user.stats.challengesFailed === undefined) parsed.user.stats.challengesFailed = 0;
    if (parsed.user.stats.totalDonated === undefined) parsed.user.stats.totalDonated = 0;
    if (parsed.user.stats.timersCancelledEarly === undefined) parsed.user.stats.timersCancelledEarly = 0;

    if (!parsed.user.equipped[ItemSlot.RIGHT_HAND]) parsed.user.equipped[ItemSlot.RIGHT_HAND] = null;
    if (!parsed.user.equipped[ItemSlot.LEFT_HAND]) parsed.user.equipped[ItemSlot.LEFT_HAND] = null;
    if (!parsed.user.equipped[ItemSlot.FEET]) parsed.user.equipped[ItemSlot.FEET] = null;
    
    if (parsed.user.settings.musicEnabled === undefined) parsed.user.settings.musicEnabled = true;
    if (parsed.user.settings.stayAwakeEnabled === undefined) parsed.user.settings.stayAwakeEnabled = true;
    if (!parsed.user.settings.vfxLevel) parsed.user.settings.vfxLevel = 'HIGH';
    if (!parsed.user.settings.devicePerformance) parsed.user.settings.devicePerformance = 'ULTRA_STRONG';
    if (parsed.user.selectedTitle === undefined) parsed.user.selectedTitle = null;

    if (!parsed.downloadedChallenges) {
        parsed.downloadedChallenges = {};
        if (parsed.proficiencies) {
            parsed.proficiencies.forEach((p: Proficiency) => {
                if (p.externalQuestions && p.externalQuestions.length > 0) {
                    parsed.downloadedChallenges[p.name] = p.externalQuestions;
                }
            });
        }
    }
    
    if ('nationality' in parsed.user) delete parsed.user.nationality;
    if ('bio' in parsed.user) delete parsed.user.bio;

    if (parsed.proficiencies) {
        parsed.proficiencies = parsed.proficiencies.map((p: any) => ({
            ...p,
            unlockedQuestionIds: p.unlockedQuestionIds || [],
            externalQuestions: p.externalQuestions || []
        }));
    }
    
    const currentAchIds = new Set(parsed.user.achievements.map((a: Achievement) => a.id));
    ACHIEVEMENTS_LIST.forEach(ach => {
        if (!currentAchIds.has(ach.id)) {
            parsed.user.achievements.push(ach);
        } else {
            const existing = parsed.user.achievements.find((a: Achievement) => a.id === ach.id);
            if (existing) {
                existing.description = ach.description;
                existing.flavorText = ach.flavorText;
                existing.icon = ach.icon;
                existing.conditionType = ach.conditionType;
                existing.conditionValue = ach.conditionValue;
            }
        }
    });

    if (!parsed.user.lastDailyCheck) parsed.user.lastDailyCheck = parsed.lastLogin || Date.now();
    return parsed;
  } catch (e) {
    console.error("Failed to parse state", e);
    return {
      user: DEFAULT_USER,
      proficiencies: [],
      sessions: [],
      quests: [],
      dailyQuestPool: [],
      shopItems: [], 
      consumablesData: [],
      extraPhrases: { screensaver: [], enemies: [], character: [], enemyReviveToxic: [] },
      challengeIndex: [],
      challengeIndexLastUpdated: 0,
      lastLogin: Date.now(),
      downloadedChallenges: {},
      installedMusicPacks: ['base'],
      installedNpcImages: false,
      installedEnemyImages: false,
      installedConsumableImages: false,
      detailedEnemies: []
    };
  }
};

const App: React.FC = () => {
  // ... (State declarations remain same)
  const [view, setView] = useState<'dashboard' | 'skills' | 'stats' | 'session' | 'quests' | 'store' | 'settings' | 'library' | 'profile_stats'>('dashboard');
  const [timerAutoStart, setTimerAutoStart] = useState(false);
  const [timerInitialMode, setTimerInitialMode] = useState<'STOPWATCH' | 'TIMER' | 'MANUAL'>('STOPWATCH');
  const [timerLockMode, setTimerLockMode] = useState(false);
  const [levelUpQueue, setLevelUpQueue] = useState<LevelUpEvent[]>([]);
  const [showExpTable, setShowExpTable] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBuffList, setShowBuffList] = useState(false);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false); 
  const [activeHelpFeature, setActiveHelpFeature] = useState<string | null>(null);
  const [showDailyBonusModal, setShowDailyBonusModal] = useState(false);
  const [showDevProfile, setShowDevProfile] = useState(false);
  const [showContentManager, setShowContentManager] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showPhilosopherStoneModal, setShowPhilosopherStoneModal] = useState(false);
  const [philosopherStoneReason, setPhilosopherStoneReason] = useState('');
  const [philosopherStoneAmount, setPhilosopherStoneAmount] = useState(1);
  const [showPatronModal, setShowPatronModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showDevCheatModal, setShowDevCheatModal] = useState(false);

  // Profile Edit
  const [showProfileEditAvatar, setShowProfileEditAvatar] = useState(false); 
  const [showRenameModal, setShowRenameModal] = useState(false);

  // Skill Detail State
  const [selectedSkillForDetail, setSelectedSkillForDetail] = useState<Proficiency | null>(null);

  // Challenge Mode State
  const [isPhilosopherStoneChallenge, setIsPhilosopherStoneChallenge] = useState(false);
  const [showChallengeStart, setShowChallengeStart] = useState(false);
  const [showRechallengeStart, setShowRechallengeStart] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [activeChallengeSkill, setActiveChallengeSkill] = useState<Proficiency | null>(null);
  const [challengeSessionQuestions, setChallengeSessionQuestions] = useState<QuizQuestion[] | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [challengeCostDetails, setChallengeCostDetails] = useState({ total: 0 });
  const [challengeCostPaid, setChallengeCostPaid] = useState(0);

  // Sorting & Filtering
  const [skillSort, setSkillSort] = useState<'level-desc' | 'level-asc' | 'name-asc'>('level-desc');
  const [skillFilterCategory, setSkillFilterCategory] = useState<string>('All');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // Dev Mode
  const [devInput, setDevInput] = useState('');
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const [selectedDevSkillId, setSelectedDevSkillId] = useState<string>('');
  const [selectedDevRank, setSelectedDevRank] = useState<string>('');
  const [selectedDevProfileRank, setSelectedDevProfileRank] = useState<string>('');
  const [timerSpeedMultiplier, setTimerSpeedMultiplier] = useState(1);
  const [devGoldInput, setDevGoldInput] = useState('');

  // ... (State initialization logic remains same) ...
  const [state, setState] = useState<AppState | null>(null);
  const [isStateLoading, setIsStateLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        let saved = await localforage.getItem<any>('rpg_tracker_state');
        if (!saved) {
          // Fallback to localStorage for migration
          const localSaved = localStorage.getItem('rpg_tracker_state');
          if (localSaved) {
            saved = JSON.parse(localSaved);
            // Save to localforage for future
            await localforage.setItem('rpg_tracker_state', saved);
          }
        }
        setState(parseSavedState(saved));
      } catch (e) {
        console.error("Failed to load state from localforage", e);
        setState(parseSavedState(null));
      } finally {
        setIsStateLoading(false);
      }
    };
    loadState();
  }, []);

  const [activeSkill, setActiveSkill] = useState<Proficiency | null>(null);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(Object.keys(SKILL_PRESETS)[0]);
  const [customSkillName, setCustomSkillName] = useState('');
  const [consequenceMessage, setConsequenceMessage] = useState<string | null>(null);

  // --- Initialize Audio Playlists ---
  useEffect(() => {
      if (!state) return;
      const packs = state.installedMusicPacks || ['base'];
      let menuTracks: string[] = [...MUSIC_URLS.base];
      if (packs.includes('menu_pack')) {
          menuTracks = [...menuTracks, ...MUSIC_URLS.menu_pack];
      }
      
      let battleTracks: string[] = []; 
      if (packs.includes('battle_pack')) {
          battleTracks = [...MUSIC_URLS.battle_pack];
      } else {
          battleTracks = [...MUSIC_URLS.base];
      }

      audio.updatePlaylists(menuTracks, battleTracks);
  }, [state]);

  // ... (History and Audio Init logic remains same) ...
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
        if (showExitConfirm) {
            setShowExitConfirm(false);
            window.history.pushState(null, '', window.location.href);
            return;
        }

        if (showProfileModal || showBuffList || showExpTable || showTutorial || showSupportModal || showDevProfile || showContentManager || showAddSkill || selectedSkillForDetail || selectedAchievement || showDailyBonusModal || showMusicModal || showPhilosopherStoneModal || showDevCheatModal) {
            setShowProfileModal(false);
            setShowBuffList(false);
            setShowExpTable(false);
            setShowTutorial(false);
            setShowSupportModal(false);
            setShowDevProfile(false);
            setShowContentManager(false);
            setShowAddSkill(false);
            setSelectedSkillForDetail(null);
            setSelectedAchievement(null);
            setShowDailyBonusModal(false);
            setShowMusicModal(false);
            setShowPhilosopherStoneModal(false);
            setShowDevCheatModal(false);
            window.history.pushState(null, '', window.location.href);
            return;
        }

        if (view !== 'dashboard') {
            setView('dashboard');
            window.history.pushState(null, '', window.location.href);
            return;
        }

        setShowExitConfirm(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [view, showExitConfirm, showProfileModal, showBuffList, showExpTable, showTutorial, showSupportModal, showDevProfile, showContentManager, showAddSkill, selectedSkillForDetail, selectedAchievement, showDailyBonusModal, showMusicModal, showPhilosopherStoneModal]);

  // ... (Rest of Audio Init and notification/toggle handlers) ...
  useEffect(() => { 
      if (!state) return;
      audio.setEnabled(state.user.settings.soundEnabled); 
      audio.setMusicEnabled(state.user.settings.musicEnabled);
      const enableAudio = () => {
          if (state.user.settings.musicEnabled) {
              audio.startBGM();
          }
          document.removeEventListener('click', enableAudio);
          document.removeEventListener('touchstart', enableAudio);
          document.removeEventListener('keydown', enableAudio);
      };
      document.addEventListener('click', enableAudio);
      document.addEventListener('touchstart', enableAudio);
      document.addEventListener('keydown', enableAudio);
      return () => {
          document.removeEventListener('click', enableAudio);
          document.removeEventListener('touchstart', enableAudio);
          document.removeEventListener('keydown', enableAudio);
      };
  }, [state]);

  // --- NEW: Audio Visibility Handler ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        audio.suspend(); // Always pause audio on background
      } else {
        // Resume only if setting is enabled
        if (state && state.user.settings.musicEnabled) {
           audio.setMusicEnabled(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state]);

  // --- NEW: Wake Lock Handler ---
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      if (state && state.user.settings.stayAwakeEnabled && 'wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err: any) {
          if (err?.name !== 'NotAllowedError') {
            console.error(`${err?.name}, ${err?.message}`);
          } else {
            console.warn(`Wake Lock not allowed: ${err?.message}`);
          }
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLock !== null) {
        try {
          await wakeLock.release();
          wakeLock = null;
        } catch (err: any) {
          console.error(`${err?.name}, ${err?.message}`);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [state?.user?.settings?.stayAwakeEnabled]);

  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') => {
      const id = crypto.randomUUID();
      setNotifications(prev => [...prev, { id, title, message, type }]);
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
  };

  const handleToggleMusic = () => {
      const newVal = !state.user.settings.musicEnabled;
      updateSettings('musicEnabled', newVal);
      audio.setMusicEnabled(newVal);
  };

  const handleSkipMusic = () => {
      audio.skip();
  };

  const handleOpenMusicModal = () => {
      setShowMusicModal(true);
  };

  // ... (Helper functions remain same) ...
  // [Code shortened for brevity - assumed unchanged from previous steps]
  
  const getEquippedItems = (): Item[] => {
    if (state.shopItems.length === 0) return [];
    return Object.values(state.user.equipped)
      .map(id => state.shopItems.find(i => i.id === id))
      .filter((i): i is Item => !!i);
  };

  const calculateBonuses = (): ItemStats => {
      const stats: ItemStats = { 
          dmg: 0, hp: 0, hpPct: 0, heal: 0, block: 0, stun: 0, barrage: 0, 
          critRate: 0, critDmg: 0, goldBonus: 0, attackSpeed: 0, 
          challengeCostReduction: 0, streakProtectionChance: 0, 
          undieableChance: 0, skillExpBonus: 0 
      };
      if (!state) return stats;
      const items = getEquippedItems();
      items.forEach(i => {
          const enhanceLevel = state.user.equipmentEnhancements?.[i.id] || 0;
          const enhancedStats = getEnhancedStats(i.stats, i.mainStats, enhanceLevel);
          
          stats.dmg += enhancedStats.dmg || 0;
          stats.hp += (enhancedStats.hp || 0);
          stats.hpPct += (enhancedStats.hpPct || 0);
          stats.heal += enhancedStats.heal || 0;
          stats.block += enhancedStats.block || 0;
          stats.stun += enhancedStats.stun || 0;
          stats.barrage += enhancedStats.barrage || 0;
          stats.critRate += enhancedStats.critRate || 0;
          stats.critDmg += enhancedStats.critDmg || 0;
          stats.goldBonus += enhancedStats.goldBonus || 0;
          stats.attackSpeed += enhancedStats.attackSpeed || 0;
          stats.challengeCostReduction += enhancedStats.challengeCostReduction || 0;
          stats.streakProtectionChance += enhancedStats.streakProtectionChance || 0;
          stats.undieableChance += enhancedStats.undieableChance || 0;
          stats.skillExpBonus += enhancedStats.skillExpBonus || 0;
      });

      // Add active buffs from consumables
      if (state.user.activeBuffs) {
          const now = Date.now();
          Object.entries(state.user.activeBuffs).forEach(([itemId, expiry]) => {
              const exp = expiry as number;
              if (exp > now || exp === 1) {
                  const stacks = state.user.activeBuffStacks?.[itemId] || 1;
                  const newData = state.consumablesData?.find(c => c.id === itemId);
                  if (newData) {
                      const rankIndex = RANKS.indexOf(getRankName(state.user.totalLevel));
                      const maxRank = RANKS.length - 1;
                      const rankFactor = rankIndex / maxRank;
                      const lerp = (min: number, max: number) => min + (max - min) * rankFactor;

                      stats.dmg += lerp(newData.dmgMin, newData.dmgMax) * stacks;
                      stats.hp += lerp(newData.flatHpMin, newData.flatHpMax) * stacks;
                      stats.hpPct += lerp(newData.percentileHpMin, newData.percentileHpMax) * stacks;
                      stats.heal += lerp(newData.healMin, newData.healMax) * stacks;
                      stats.goldBonus += lerp(newData.goldMin, newData.goldMax) * stacks;
                      stats.block += lerp(newData.blockMin, newData.blockMax) * stacks;
                      stats.attackSpeed += lerp(newData.aspdMin, newData.aspdMax) * stacks;
                      stats.critRate += lerp(newData.critRateMin, newData.critRateMax) * stacks;
                      stats.critDmg += lerp(newData.critDmgMin, newData.critDmgMax) * stacks;
                      stats.stun += lerp(newData.stunMin, newData.stunMax) * stacks;
                      stats.barrage += lerp(newData.barrageMin, newData.barrageMax) * stacks;
                      stats.skillExpBonus += lerp(newData.skillExpMin, newData.skillExpMax) * stacks;
                      stats.challengeCostReduction += lerp(newData.cReductionMin, newData.cReductionMax) * stacks;
                      stats.streakProtectionChance += lerp(newData.streakSaveMin, newData.streakSaveMax) * stacks;
                      stats.undieableChance += lerp(newData.undyingMin, newData.undyingMax) * stacks;
                  } else {
                      switch (itemId) {
                          case 'miso_ramen': stats.hpPct += 20 * stacks; break;
                          case 'shio_ramen': stats.attackSpeed += 15 * stacks; break;
                          case 'shoyu_ramen': stats.critRate += 10 * stacks; break;
                          case 'chashuu_ramen': stats.block += 6 * stacks; break;
                          case 'chuuka_ramen': stats.heal += 2 * stacks; break;
                          case 'ichiban_shibori': stats.undieableChance += 3 * stacks; break;
                          case 'sshs_soap':
                              stats.barrage += 9 * stacks;
                              stats.critDmg += 20 * stacks;
                              stats.dmg += 30 * stacks;
                              stats.attackSpeed += 25 * stacks;
                              stats.block -= 25 * stacks;
                              stats.undieableChance -= 25 * stacks;
                              stats.skillExpBonus -= 25 * stacks;
                              break;
                      }
                  }
              }
          });
      }

      // Add milestone stats
      if (state.detailedEnemies && state.user.huntedEnemies) {
          state.detailedEnemies.forEach(enemy => {
              const killCount = state.user.huntedEnemies[enemy.name] || 0;
              if (enemy.milestones) {
                  enemy.milestones.forEach((m: any) => {
                      if (killCount >= m.kills && m.stat && m.val) {
                          const valStr = m.val.toString();
                          const val = parseFloat(valStr.replace('%', ''));
                          if (isNaN(val)) return;

                          switch (m.stat) {
                              case 'MAX_HP': 
                                  if (valStr.includes('%')) {
                                      stats.hpPct += val; 
                                  } else {
                                      stats.hp += val;
                                  }
                                  break;
                              case 'ATK_DMG': stats.dmg += val; break;
                              case 'ASPD': stats.attackSpeed += val; break;
                              case 'CRIT_RATE': stats.critRate += val; break;
                              case 'CRIT_DMG': stats.critDmg += val; break;
                              case 'BLOCK': stats.block += val; break;
                              case 'BARRAGE': stats.barrage += val; break;
                              case 'STUN': stats.stun += val; break;
                              case 'GOLD': stats.goldBonus += val; break;
                              case 'HEAL': stats.heal += val; break;
                          }
                      }
                  });
              }
          });
      }

      // Add Patron Bless stats
      const patronRank = getPatronRank(state.user.patronExp || 0);
      if (patronRank > 0) {
          const patronStats = getPatronStats(patronRank);
          stats.hp += patronStats.hp || 0;
          stats.hpPct += patronStats.hpPct || 0;
          stats.dmg += patronStats.dmg || 0;
          stats.goldBonus += patronStats.goldBonus || 0;
          stats.challengeCostReduction += patronStats.challengeCostReduction || 0;
          stats.attackSpeed += patronStats.attackSpeed || 0;
          stats.critDmg += patronStats.critDmg || 0;
          stats.barrage += patronStats.barrage || 0;
          stats.streakProtectionChance += patronStats.streakProtect || 0;
          stats.critRate += patronStats.critRate || 0;
          stats.skillExpBonus += patronStats.skillExp || 0;
          stats.stun += patronStats.stun || 0;
          stats.heal += patronStats.heal || 0;
          stats.undieableChance += patronStats.undieable || 0;
      }

      return stats;
  };

  const isSkillDuplicate = (name: string): boolean => {
      return state.proficiencies.some(p => p.name.toLowerCase() === name.trim().toLowerCase());
  };

  const checkAchievementUnlock = (user: UserProfile, id: string, conditionMet: boolean): UserProfile => {
      const achievement = user.achievements.find(a => a.id === id);
      if (achievement && !achievement.unlocked && conditionMet) {
          const updatedAchievements = user.achievements.map(a => 
              a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
          );
          setTimeout(() => { 
              addNotification("Achievement Unlocked", achievement.name, "success"); 
              audio.playSuccess(); 
          }, 500);
          return { ...user, achievements: updatedAchievements };
      }
      return user;
  };

  const handleUnlockAchievement = (id: string) => {
      setState(prev => {
          if (!prev) return prev;
          const updatedUser = checkAchievementUnlock(prev.user, id, true);
          return { ...prev, user: updatedUser };
      });
  };

  // ... (Effects for saving, periodic updates, etc remain same) ...
  useEffect(() => {
    if (state) {
      localforage.setItem('rpg_tracker_state', state).catch(e => console.error("Failed to save state to localforage", e));
    }
  }, [state]);

  useEffect(() => {
    if (isStateLoading || !state) return;
    // ... (Tutorial and periodic check logic remains exactly same) ...
    // Note: Omitted for brevity as file content will include it
    const tutorialSeen = localStorage.getItem('rpg_tracker_tutorial_seen');
    const identitySet = localStorage.getItem('rpg_tracker_identity_set');

    if (tutorialSeen !== 'true') {
        setShowTutorial(true);
    } else if (identitySet !== 'true') {
        setShowIdentityModal(true);
    }

    const initChallengeIndex = async () => {
       if (state.challengeIndex.length === 0 && navigator.onLine) {
           try {
               const index = await fetchMasterChallengeIndex(MASTER_CHALLENGE_URL);
               setState(prev => ({ ...prev, challengeIndex: index, challengeIndexLastUpdated: Date.now() }));
           } catch (e) {
               console.error("Failed to init challenge index", e);
           }
       }
    };

    const initConsumablesData = async () => {
       if ((!state.consumablesData || state.consumablesData.length === 0) && navigator.onLine) {
           try {
               const data = await fetchConsumablesData(CONSUMABLES_DATA_URL);
               setState(prev => ({ ...prev, consumablesData: data }));
               return data;
           } catch (e) {
               console.error("Failed to init consumables data", e);
           }
       }
       return state.consumablesData;
    };

    const runInit = async () => {
        await initChallengeIndex();
        const loadedConsumablesData = await initConsumablesData();
        checkPeriodicUpdates(loadedConsumablesData);
    };
    runInit();

    const checkPeriodicUpdates = (loadedConsumablesData?: ConsumableItem[]) => {
      // ... (Existing logic for date checks) ...
      const now = new Date();
      const lastCheck = new Date(state.user.lastDailyCheck);
      const todayDateStr = now.toISOString().split('T')[0];
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const lastMidnight = new Date(lastCheck.getFullYear(), lastCheck.getMonth(), lastCheck.getDate()).getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      const daysDiff = Math.round((todayMidnight - lastMidnight) / oneDay);

      let newStreak = state.user.currentStreak;
      let expDecayMsg = null;
      let updatedProficiencies = [...state.proficiencies];
      let quests = [...state.quests];
      let goldBonus = 0;
      let expBonus = 0;
      let patronExpBonus = 0;
      let frozenStreakUsed = false;
      let debtPaid = 0;
      let patronLevelStones = 0;
      let newPatronRank = getPatronRank(state.user.patronExp || 0);

      if (daysDiff >= 1) {
          if (daysDiff === 1) {
              newStreak += 1;
          } else if (daysDiff > 1) {
              if (state.user.frozenStreak) {
                  newStreak = state.user.currentStreak;
                  frozenStreakUsed = true;
              } else {
                  const bonuses = calculateBonuses();
                  const protectChance = bonuses.streakProtectionChance;
                  const roll = Math.random() * 100;
                  const protectedStreak = protectChance > 0 && roll < protectChance;

                  if (protectedStreak) {
                      addNotification("Streak Protected!", `Your item saved your ${newStreak} day streak!`, "success");
                  } else {
                      newStreak = 1;
                      const missedDays = daysDiff - 1;
                      let decayFactor = 0;
                      if (missedDays === 1) decayFactor = 0.05; 
                      else if (missedDays === 2) decayFactor = 0.10; 
                      else decayFactor = 0.15; 

                      if (decayFactor > 0) {
                          updatedProficiencies = updatedProficiencies.map(p => ({
                            ...p,
                            currentExp: Math.max(0, Math.floor(p.currentExp * (1 - decayFactor)))
                          }));
                          expDecayMsg = `You missed ${missedDays} days. Skills decayed by ${(decayFactor * 100)}%. Streak reset.`;
                      }
                  }
              }
          }

          if (state.user.debtTomorrow && state.user.debtTomorrow > 0) {
              debtPaid = state.user.debtTomorrow;
          }

          const dayCycle = ((newStreak - 1) % 7) + 1;
          const { baseExp, baseGold } = getBaseLoginRewards(newStreak);
          const rankName = getRankName(state.user.totalLevel);
          expBonus = Math.floor(baseExp * getLoginExpMultiplier(rankName));
          goldBonus = Math.floor(baseGold * getLoginGoldMultiplier(rankName));
          patronExpBonus = getLoginPatronExp(newStreak);
          
          const oldPatronRank = getPatronRank(state.user.patronExp || 0);
          newPatronRank = getPatronRank((state.user.patronExp || 0) + patronExpBonus);
          if (newPatronRank > oldPatronRank) {
              for (let r = oldPatronRank + 1; r <= newPatronRank; r++) {
                  if (r >= 1 && r <= 5) patronLevelStones += 1;
                  else if (r >= 6 && r <= 10) patronLevelStones += 2;
                  else if (r >= 11 && r <= 15) patronLevelStones += 3;
                  else if (r >= 16 && r <= 18) patronLevelStones += 4;
                  else if (r >= 19 && r <= 20) patronLevelStones += 5;
              }
          }

          if (daysDiff >= 1) {
             addNotification(`Day ${dayCycle} Login`, `+${expBonus} EXP, +${goldBonus} Gold, +${patronExpBonus} Patron EXP`, 'success');
             if (frozenStreakUsed) addNotification("Frozen Flame Effect!", "Your streak was saved by the Frozen Flame!", "success");
             if (debtPaid > 0) addNotification("Debt Collected!", `Paid ${debtPaid} Gold from Isekai Credit Card.`, "warning");
             
             // Philosopher Stone Reward
             if (dayCycle === 3 || dayCycle === 7 || patronLevelStones > 0) {
                 const totalStones = (dayCycle === 3 || dayCycle === 7 ? 1 : 0) + patronLevelStones;
                 const reason = patronLevelStones > 0 ? `Patron Level ${newPatronRank} + Day ${dayCycle}` : `Day ${dayCycle} Login`;
                 setTimeout(() => awardPhilosopherStone(reason, totalStones), 1500);
             }
          }
      }

      let startedToday = state.user.stats.startedToday;
      let dailyUsageReset = false;
      if (state.user.dailyQuestResetDate !== todayDateStr) {
          quests = quests.filter(q => q.category !== 'DAILY');
          const newDailies = getRandomDailyQuests();
          quests = [...quests, ...newDailies];
          startedToday = 0;
          dailyUsageReset = true;
      }

      let newWeeklyResetDate = state.user.weeklyQuestResetDate || todayDateStr;
      let weeklyUsageReset = false;
      const lastWeeklyReset = new Date(newWeeklyResetDate).getTime();
      const daysSinceWeekly = (todayMidnight - lastWeeklyReset) / oneDay;
      if (!state.user.weeklyQuestResetDate || daysSinceWeekly >= 7) {
          quests = quests.filter(q => q.category !== 'WEEKLY');
          const newWeeklies = getRandomWeeklyQuests();
          quests = [...quests, ...newWeeklies];
          newWeeklyResetDate = todayDateStr;
          weeklyUsageReset = true;
      }

      const activeMainIds = new Set(quests.filter(q => q.category === 'MAIN').map(q => q.id));
      MAIN_QUESTS.forEach(mq => {
          if (!activeMainIds.has(mq.id) && state.user.totalLevel >= (mq.minLevel || 0)) {
              quests.push({ ...mq });
          }
      });

      if (daysDiff > 0 || state.user.dailyQuestResetDate !== todayDateStr || quests.length !== state.quests.length || dailyUsageReset || weeklyUsageReset) {
          setState(prev => {
              let updatedUser: UserProfile = { 
                  ...prev.user, 
                  lastDailyCheck: Date.now(),
                  currentStreak: newStreak,
                  highestStreak: Math.max(prev.user.highestStreak, newStreak),
                  dailyQuestResetDate: todayDateStr,
                  weeklyQuestResetDate: newWeeklyResetDate,
                  gold: Math.max(0, prev.user.gold + goldBonus - debtPaid),
                  totalExp: prev.user.totalExp + expBonus,
                  patronExp: (prev.user.patronExp || 0) + patronExpBonus,
                  frozenStreak: frozenStreakUsed ? false : prev.user.frozenStreak,
                  debtTomorrow: debtPaid > 0 ? 0 : prev.user.debtTomorrow,
                  dailyUsage: dailyUsageReset ? {} : prev.user.dailyUsage,
                  weeklyUsage: weeklyUsageReset ? {} : prev.user.weeklyUsage,
                  stats: { ...prev.user.stats, startedToday }
              };
              
              const oldLvl = prev.user.totalLevel;
              updatedUser.totalLevel = getProfileLevelFromExp(updatedUser.totalExp);
              if (updatedUser.totalLevel > oldLvl) {
                   setTimeout(() => setLevelUpQueue(q => [...q, { type: 'USER', name: updatedUser.name, newLevel: updatedUser.totalLevel }]), 100);
              }

              updatedUser = checkAchievementUnlock(updatedUser, 'a5', newStreak >= 3);
              updatedUser = checkAchievementUnlock(updatedUser, 'a17', newStreak >= 7);
              updatedUser = checkAchievementUnlock(updatedUser, 'a32', newStreak >= 30);
              updatedUser = checkAchievementUnlock(updatedUser, 'a39', newStreak >= 60);
              updatedUser = checkAchievementUnlock(updatedUser, 'a47', newStreak >= 365);

              // Generate Dark Merchant Stock
              let newDarkMerchantStock = prev.darkMerchantStock;
              if (daysDiff > 0 || !prev.darkMerchantStock || prev.darkMerchantStock.date !== todayDateStr) {
                  const rankIndex = RANKS.indexOf(getRankName(updatedUser.totalLevel));
                  newDarkMerchantStock = {
                      date: todayDateStr,
                      items: generateDarkMerchantStock(Math.max(0, rankIndex), updatedUser.gold, loadedConsumablesData || prev.consumablesData),
                      refreshCount: 0,
                      badHaggleChance: 0
                  };
              }

              return { 
                  ...prev, 
                  user: updatedUser, 
                  proficiencies: updatedProficiencies, 
                  quests: quests,
                  darkMerchantStock: newDarkMerchantStock
              };
          });

          if (expDecayMsg) setConsequenceMessage(expDecayMsg);
      }
    };

  }, [isStateLoading]);

  // ... (All handler functions remain same) ...
  // [Code shortened]
  const handleTutorialClose = (dontShowAgain: boolean) => {
    setShowTutorial(false);
    if (dontShowAgain) localStorage.setItem('rpg_tracker_tutorial_seen', 'true');
    const identitySet = localStorage.getItem('rpg_tracker_identity_set');
    if (identitySet !== 'true') {
        setShowIdentityModal(true);
    }
  };

  const handleIdentityConfirm = (newName: string) => {
      setState(prev => prev ? ({ ...prev, user: { ...prev.user, name: newName } }) : prev);
      setShowIdentityModal(false);
      setShowAvatarModal(true);
      audio.playSuccess();
  };

  const handleAvatarConfirm = (avatarUrl: string) => {
      setState(prev => prev ? ({ ...prev, user: { ...prev.user, avatarUrl: avatarUrl } }) : prev);
      localStorage.setItem('rpg_tracker_identity_set', 'true');
      setShowAvatarModal(false);
      
      const hasAnyContent = state ? Object.values(state.extraPhrases).some(val => Array.isArray(val) && val.length > 0) : false;
      if (!hasAnyContent) {
          if (state && !state.user.settings?.hideContentManagerOnStartup) {
              setTimeout(() => setShowContentManager(true), 500);
          }
      }
      if (state) {
          addNotification("Identity Established", `Welcome, ${state.user.name}.`, "success");
      }
      audio.playSuccess();
  };

  const handleRenameConfirm = (newName: string) => {
      setState(prev => prev ? ({ ...prev, user: { ...prev.user, name: newName } }) : prev);
      setShowRenameModal(false);
      addNotification("Identity Update", "Alias successfully rewritten.", "success");
      audio.playSuccess();
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
      setState(prev => prev ? ({ ...prev, user: { ...prev.user, avatarUrl: avatarUrl } }) : prev);
      setShowProfileEditAvatar(false);
      addNotification("Vessel Update", "Appearance reconfigured.", "success");
      audio.playSuccess();
  };

  const handleAddSkill = (skillName: string, category: string) => {
    if (!skillName.trim()) return;
    if (isSkillDuplicate(skillName)) {
        addNotification("Duplicate Skill", "You have already learned this skill!", "warning");
        return;
    }
    audio.playClick();
    
    const cachedData = state.downloadedChallenges?.[skillName] || [];

    const newSkill: Proficiency = {
      id: crypto.randomUUID(),
      name: skillName,
      category: category,
      currentExp: 0,
      level: 1,
      totalHours: 0,
      unlockedQuestionIds: [],
      externalQuestions: cachedData
    };
    setState(prev => {
        let updatedUser = prev.user;
        const skillCount = prev.proficiencies.length + 1;
        updatedUser = checkAchievementUnlock(updatedUser, 'a13', skillCount >= 3);
        return { ...prev, user: updatedUser, proficiencies: [...prev.proficiencies, newSkill] };
    });
    setCustomSkillName('');
    setShowAddSkill(false);
    if (cachedData.length > 0) {
        addNotification("Data Loaded", `${cachedData.length} challenges ready.`, "success");
    }
  };

  const startSession = (skill: Proficiency, mode: 'STOPWATCH' | 'TIMER') => {
    audio.playStart();
    setState(prev => ({
        ...prev,
        user: {
            ...prev.user,
            stats: {
                ...prev.user.stats,
                totalStarted: prev.user.stats.totalStarted + 1,
                startedToday: prev.user.stats.startedToday + 1,
                startedThisWeek: prev.user.stats.startedThisWeek + 1
            }
        }
    }));
    setActiveSkill(skill);
    
    setTimerInitialMode(mode);
    setTimerAutoStart(mode === 'STOPWATCH'); 
    setTimerLockMode(true); 
    
    setView('session');
    setSelectedSkillForDetail(null); 
  };

  const handleChallengeClick = (skill: Proficiency) => {
      const meta = state.challengeIndex.find(c => c.skill === skill.name);
      const externalDataUrl = meta?.url;
      const hasDownloadedData = skill.externalQuestions && skill.externalQuestions.length > 0;
      
      if (externalDataUrl && !hasDownloadedData) {
          setActiveChallengeSkill(skill);
          setShowDownloadModal(true);
      } else {
          handleOpenChallengeStart(skill);
      }
  };

  const handleDownloadConfirm = async () => {
      if (!activeChallengeSkill) return;
      const meta = state.challengeIndex.find(c => c.skill === activeChallengeSkill.name);
      const url = meta?.url;
      
      if (!url) return;
      try {
          const questions = await fetchChallengeData(url, activeChallengeSkill.name, activeChallengeSkill.category);
          handleUpdateSkillData(activeChallengeSkill.name, questions, activeChallengeSkill.category);
          addNotification("Download Complete", `${questions.length} questions added.`, "success");
          setShowDownloadModal(false);
          
          if (selectedSkillForDetail && selectedSkillForDetail.id === activeChallengeSkill.id) {
              const updatedSkill = { ...activeChallengeSkill, externalQuestions: questions };
              setSelectedSkillForDetail(updatedSkill);
          }
          const updatedSkill = { ...activeChallengeSkill, externalQuestions: questions };
          handleOpenChallengeStart(updatedSkill);
      } catch (err) {
          addNotification("Download Failed", "Check connection.", "warning");
      }
  };

  const handleOpenChallengeStart = (skill: Proficiency) => {
      const rank = getRankName(skill.level);
      const challengeCosts = getChallengeCost(rank, state.user.gold, skill.name);
      const bonuses = calculateBonuses();
      
      const hasFreeChallenge = state.user.activeBuffs && Object.entries(state.user.activeBuffs).some(([itemId, expiry]) => {
          if ((expiry as number) > Date.now() || expiry === 1) {
              return state.consumablesData?.find(c => c.id === itemId)?.freeChallenge;
          }
          return false;
      });

      if (hasFreeChallenge) {
          challengeCosts.total = 0;
      } else if (bonuses.challengeCostReduction > 0) {
          const discount = Math.floor(challengeCosts.total * (bonuses.challengeCostReduction / 100));
          challengeCosts.total = Math.max(0, challengeCosts.total - discount);
      }
      
      setActiveChallengeSkill(skill);
      setChallengeCostDetails(challengeCosts); 
      setShowChallengeStart(true);
  };

  const handleOpenRechallengeStart = (skill: Proficiency) => {
      setActiveChallengeSkill(skill);
      setShowRechallengeStart(true);
  };

  const startChallengeSession = (selectedRank: string, useStone: boolean = false) => {
      if (!activeChallengeSkill) return;
      let challengeCosts = getChallengeCost(selectedRank, state.user.gold, activeChallengeSkill.name);
      const bonuses = calculateBonuses();
      
      const hasFreeChallenge = state.user.activeBuffs && Object.entries(state.user.activeBuffs).some(([itemId, expiry]) => {
          if ((expiry as number) > Date.now() || expiry === 1) {
              return state.consumablesData?.find(c => c.id === itemId)?.freeChallenge;
          }
          return false;
      });

      if (hasFreeChallenge) {
          challengeCosts.total = 0;
      } else if (bonuses.challengeCostReduction > 0) {
          const discount = Math.floor(challengeCosts.total * (bonuses.challengeCostReduction / 100));
          challengeCosts.total = Math.max(0, challengeCosts.total - discount);
      }

      if (useStone) {
          if ((state.user.currencies?.philosopherStones || 0) < 1) {
              addNotification("Insufficient Stones", "You don't have enough Philosopher Stones.", "warning");
              audio.playError();
              return;
          }
      } else {
          if (state.user.gold < challengeCosts.total) {
              addNotification("Insufficient Gold", `Cost: ${formatNumber(challengeCosts.total)} G`, 'warning');
              audio.playError();
              return;
          }
      }

      const external = activeChallengeSkill.externalQuestions || [];
      const combinedPool = [...ALL_QUIZZES, ...external];
      
      let pool = combinedPool.filter(q => {
          const matchSkill = q.skill === activeChallengeSkill.name || q.category === activeChallengeSkill.category || q.skill === 'Unity';
          return matchSkill && q.rank === selectedRank;
      });

      const lockedQuestions = pool.filter(q => !activeChallengeSkill.unlockedQuestionIds.includes(q.id));
      if (lockedQuestions.length === 0) {
          addNotification("Mastered", `No locked ${selectedRank} questions available!`, "success");
          setShowChallengeStart(false);
          return;
      }

      const shuffledPool = lockedQuestions.sort(() => 0.5 - Math.random());
      const sessionQuestions = shuffledPool.slice(0, 25).map(q => {
          const qCopy = { ...q, options: [...q.options] };
          const correctText = qCopy.options[qCopy.correctAnswerIndex];
          qCopy.options.sort(() => 0.5 - Math.random());
          qCopy.correctAnswerIndex = qCopy.options.findIndex(opt => opt === correctText);
          return qCopy;
      });

      audio.playPurchase();
      if (useStone) {
          setState(prev => ({
              ...prev,
              user: {
                  ...prev.user,
                  currencies: {
                      ...prev.user.currencies,
                      philosopherStones: (prev.user.currencies?.philosopherStones || 0) - 1
                  }
              }
          }));
          setIsPhilosopherStoneChallenge(true);
      } else {
          const goldAfter = state.user.gold - challengeCosts.total;
          setState(prev => {
              let updatedUser = { ...prev.user, gold: goldAfter };
              updatedUser = checkAchievementUnlock(updatedUser, 'a23', goldAfter < 5 && goldAfter > 0);
              return { ...prev, user: updatedUser };
          });
          setIsPhilosopherStoneChallenge(false);
      }
      
      setChallengeCostPaid(useStone ? 0 : challengeCosts.total);
      setChallengeSessionQuestions(sessionQuestions);
      setIsReviewMode(false);
      setShowChallengeStart(false);
      setSelectedSkillForDetail(null);
  };

  const startRechallengeSession = (selectedRank: string) => {
      if (!activeChallengeSkill) return;
      const external = activeChallengeSkill.externalQuestions || [];
      const combinedPool = [...ALL_QUIZZES, ...external];
      const rankQuestions = combinedPool.filter(q => 
          (q.skill === activeChallengeSkill.name || q.category === activeChallengeSkill.category) && 
          q.rank === selectedRank
      );
      const unlockedQuestions = rankQuestions.filter(q => activeChallengeSkill.unlockedQuestionIds.includes(q.id));
      if (unlockedQuestions.length === 0) {
          addNotification("No Data", "Unlock questions via Challenge mode first.", "warning");
          return;
      }
      const shuffledPool = unlockedQuestions.sort(() => 0.5 - Math.random());
      const sessionQuestions = shuffledPool.slice(0, 25).map(q => {
          const qCopy = { ...q, options: [...q.options] };
          const correctText = qCopy.options[qCopy.correctAnswerIndex];
          qCopy.options.sort(() => 0.5 - Math.random());
          qCopy.correctAnswerIndex = qCopy.options.findIndex(opt => opt === correctText);
          return qCopy;
      });
      setChallengeSessionQuestions(sessionQuestions);
      setIsReviewMode(true);
      setShowRechallengeStart(false);
      setSelectedSkillForDetail(null);
      addNotification("Rechallenge Started", "Reviewing known knowledge.", "info");
  };

  const handleChallengeCorrect = (questionId: string) => {
      if (!activeChallengeSkill) return;
      if (isReviewMode) return; 
      setState(prev => ({
          ...prev,
          proficiencies: prev.proficiencies.map(p => {
              if (p.id === activeChallengeSkill.id) {
                   if (!p.unlockedQuestionIds.includes(questionId)) {
                       return { ...p, unlockedQuestionIds: [...p.unlockedQuestionIds, questionId] };
                   }
              }
              return p;
          })
      }));
  };

  const handleChallengeComplete = (results: { correct: number; failed: boolean }) => {
      if (!activeChallengeSkill) return;
      if (isReviewMode) {
          addNotification("Review Complete", `You answered ${results.correct} questions.`, "success");
          setChallengeSessionQuestions(null);
          setActiveChallengeSkill(null);
          return;
      }
      if (!results.failed) {
          audio.playSuccess();
          addNotification("Victory!", `${results.correct} Questions Conquered.`, "success");
      } else {
          if (isPhilosopherStoneChallenge) {
              addNotification("Stone Protection!", "Philosopher Stone prevented memory loss.", "success");
              audio.playSuccess();
          } else {
              const bonuses = calculateBonuses();
              if (bonuses.undieableChance > 0 && Math.random() * 100 < bonuses.undieableChance) {
                  addNotification("Divine Intervention!", "Gear prevented failure!", "success");
                  audio.playSuccess();
                  setChallengeSessionQuestions(null);
                  setActiveChallengeSkill(null);
                  return; 
              }
              audio.playError();
              
              setState(prev => {
                  let updatedUser = { ...prev.user, stats: { ...prev.user.stats, challengesFailed: prev.user.stats.challengesFailed + 1 } };
                  updatedUser = checkAchievementUnlock(updatedUser, 'a7', true);
                  updatedUser = checkAchievementUnlock(updatedUser, 'a37', updatedUser.stats.challengesFailed >= 10);

                  const currentSkill = prev.proficiencies.find(p => p.id === activeChallengeSkill?.id);
                  let updatedProficiencies = prev.proficiencies;
                  if (currentSkill && currentSkill.unlockedQuestionIds.length > 0) {
                      const shuffled = [...currentSkill.unlockedQuestionIds].sort(() => 0.5 - Math.random());
                      const toKeep = shuffled.slice(2);
                      updatedProficiencies = prev.proficiencies.map(p => p.id === currentSkill.id ? { ...p, unlockedQuestionIds: toKeep } : p);
                      addNotification("Failure...", `Lost ${currentSkill.unlockedQuestionIds.length - toKeep.length} unlocked memories.`, "warning");
                  } else {
                      addNotification("Defeat", "Gold lost.", "warning");
                  }

                  return { ...prev, user: updatedUser, proficiencies: updatedProficiencies };
              });
          }
      }
      setChallengeSessionQuestions(null);
      setActiveChallengeSkill(null);
      setIsPhilosopherStoneChallenge(false);
  };

  const completeSession = (durationMinutes: number, notes: string, lootGold: number = 0, wasEarly: boolean = false, defeatedEnemies: Record<string, number> = {}) => {
    if (!activeSkill) return;
    const effectiveMinutes = Math.floor(durationMinutes);
    if (effectiveMinutes < 1) { setView('dashboard'); setActiveSkill(null); return; }
    audio.playSuccess();
    
    let baseExp = effectiveMinutes * 1; 
    let streakMultiplier = 0;
    if (state.user.currentStreak >= 30) { streakMultiplier = 0.25; }
    else if (state.user.currentStreak >= 7) { streakMultiplier = 0.1; }
    const bonuses = calculateBonuses();
    const gearMultiplier = bonuses.skillExpBonus > 0 ? (bonuses.skillExpBonus / 100) : 0;
    const skillUnlockedCount = activeSkill.unlockedQuestionIds?.length || 0;
    const libraryMultiplier = skillUnlockedCount > 0 ? (skillUnlockedCount * 0.005) : 0; 
    const totalGlobalMultiplier = 1 + streakMultiplier + gearMultiplier + libraryMultiplier;
    const baseWithGlobal = Math.floor(baseExp * totalGlobalMultiplier);
    let timeBonusPercent = 0;
    if (effectiveMinutes >= 120) timeBonusPercent = 0.4;
    else if (effectiveMinutes >= 60) timeBonusPercent = 0.3;
    else if (effectiveMinutes >= 30) timeBonusPercent = 0.2;
    else if (effectiveMinutes >= 10) timeBonusPercent = 0.1;
    const finalSessionExpBase = Math.floor(baseWithGlobal * (1 + timeBonusPercent));
    let finalSessionExp = finalSessionExpBase;
    const baseTimeGold = Math.floor(effectiveMinutes);
    const timeGoldBonus = Math.floor(baseTimeGold * (bonuses.goldBonus / 100));
    const totalGold = (baseTimeGold + timeGoldBonus) + lootGold;

    // Update hunted enemies
    const newHuntedEnemies = { ...(state.user.huntedEnemies || {}) };
    for (const [enemyName, count] of Object.entries(defeatedEnemies)) {
        newHuntedEnemies[enemyName] = (newHuntedEnemies[enemyName] || 0) + count;
    }

    let updatedUser = { 
        ...state.user, 
        totalExp: state.user.totalExp + finalSessionExp, 
        gold: state.user.gold + totalGold,
        huntedEnemies: newHuntedEnemies 
    };

    // SSS Soap Effect
    if (state.user.activeBuffs && state.user.activeBuffs['sss_soap']) {
        if (effectiveMinutes >= 30) {
            finalSessionExp = finalSessionExpBase * 2;
            addNotification("SSS Soap Effect: Double EXP!", "success");
        } else {
            finalSessionExp = 0;
            addNotification("SSS Soap Effect: Session under 30m, 0 EXP received.", "warning");
        }
        // Clear buff
        updatedUser.activeBuffs = { ...updatedUser.activeBuffs, 'sss_soap': 0 };
        // Re-calculate totalExp with the correct finalSessionExp
        updatedUser.totalExp = state.user.totalExp + finalSessionExp;
    }

    const updatedSkill = { ...activeSkill, currentExp: activeSkill.currentExp + finalSessionExp, totalHours: activeSkill.totalHours + (effectiveMinutes/60) };
    
    if (wasEarly) {
        updatedUser.stats = { ...updatedUser.stats, timersCancelledEarly: updatedUser.stats.timersCancelledEarly + 1 };
    }

    let nextLevelExp = getSkillExpRequired(updatedSkill.level);
    while (updatedSkill.currentExp >= nextLevelExp) {
        updatedSkill.level++;
        updatedSkill.currentExp -= nextLevelExp;
        nextLevelExp = getSkillExpRequired(updatedSkill.level);
        audio.playLevelUp();
        setLevelUpQueue(prev => [...prev, { type: 'SKILL', name: updatedSkill.name, newLevel: updatedSkill.level }]);
    }
    
    const oldUserLevel = updatedUser.totalLevel;
    updatedUser.totalLevel = getProfileLevelFromExp(updatedUser.totalExp);
    if (updatedUser.totalLevel > oldUserLevel) {
        audio.playLevelUp();
        setLevelUpQueue(prev => [...prev, { type: 'USER', name: updatedUser.name, newLevel: updatedUser.totalLevel }]);
        addNotification("Level Up!", `Profile Level ${updatedUser.totalLevel}`, "success");
    }

    let updatedQuests = [...state.quests];
    updatedQuests = updatedQuests.map(q => {
        if (q.isCompleted) return q;
        const newSteps = q.steps.map(step => {
            if (step.type === 'minutes') return { ...step, current: step.current + effectiveMinutes };
            if (step.type === 'sessions') return { ...step, current: step.current + 1 };
            if (step.type === 'level') return { ...step, current: updatedUser.totalLevel };
            if (step.type === 'streak') return { ...step, current: updatedUser.currentStreak };
            return step;
        });
        const allMet = newSteps.every(s => s.current >= s.target);
        if (allMet && !q.isCompleted) {
            addNotification("Quest Complete!", q.title, "success");
            audio.playSuccess();
        }
        return { ...q, steps: newSteps, isCompleted: allMet };
    });

    updatedUser = checkAchievementUnlock(updatedUser, 'a1', updatedUser.stats.totalStarted >= 1);
    updatedUser = checkAchievementUnlock(updatedUser, 'a19', updatedUser.stats.totalStarted >= 100);
    updatedUser = checkAchievementUnlock(updatedUser, 'a40', updatedUser.stats.totalStarted >= 1000);
    updatedUser = checkAchievementUnlock(updatedUser, 'a11', updatedUser.stats.totalStarted >= 50); 
    updatedUser = checkAchievementUnlock(updatedUser, 'a14', updatedUser.stats.timersCancelledEarly >= 1); 
    updatedUser = checkAchievementUnlock(updatedUser, 'a43', finalSessionExp >= 1000); 
    updatedUser = checkAchievementUnlock(updatedUser, 'a24', updatedSkill.level >= 30); 
    
    const skillsForCheck = state.proficiencies.map(p => p.id === activeSkill.id ? updatedSkill : p);
    const lvl50Count = skillsForCheck.filter(p => p.level >= 50).length;
    updatedUser = checkAchievementUnlock(updatedUser, 'a42', lvl50Count >= 5); 

    const totalHours = skillsForCheck.reduce((acc, p) => acc + p.totalHours, 0);
    updatedUser = checkAchievementUnlock(updatedUser, 'a18', totalHours >= 24);
    updatedUser = checkAchievementUnlock(updatedUser, 'a33', totalHours >= 100);
    updatedUser = checkAchievementUnlock(updatedUser, 'a48', totalHours >= 10000);

    setState(prev => ({
      ...prev,
      user: updatedUser,
      proficiencies: prev.proficiencies.map(p => p.id === activeSkill.id ? updatedSkill : p),
      quests: updatedQuests,
      sessions: [...prev.sessions, { id: crypto.randomUUID(), proficiencyId: activeSkill.id, timestamp: Date.now(), durationMinutes: effectiveMinutes, expGained: finalSessionExp, notes }]
    }));
    setView('dashboard');
    setActiveSkill(null);
  };

  const claimQuest = (questId: string) => { 
      const quest = state.quests.find(q => q.id === questId);
      if (!quest || !quest.isCompleted || quest.isClaimed) return;
      audio.playPurchase();
      
      const rewards = getQuestRewards(quest, state.user.totalLevel);
      
      setState(prev => {
          let stonesToAward = 0;
          if (quest.category === 'MAIN' || quest.category === 'WEEKLY') {
              stonesToAward = 1;
          }

          let updatedUser: UserProfile = { 
              ...prev.user, 
              gold: prev.user.gold + rewards.gold,
              patronExp: (prev.user.patronExp || 0) + rewards.patronExp,
              totalExp: prev.user.totalExp + rewards.profileExp,
              currencies: {
                  ...prev.user.currencies,
                  philosopherStones: (prev.user.currencies?.philosopherStones || 0) + stonesToAward
              },
              stats: { 
                  ...prev.user.stats, 
                  questsCompleted: prev.user.stats.questsCompleted + 1 
              }
          };
          
          // Check for profile level up (totalLevel)
          const newTotalLevel = getProfileLevelFromExp(updatedUser.totalExp);
          if (newTotalLevel > updatedUser.totalLevel) {
              updatedUser.totalLevel = newTotalLevel;
              addNotification("Profile Level Up!", `Reached Level ${newTotalLevel}`, "success");
          }

          if (stonesToAward > 0) {
              setTimeout(() => {
                  setPhilosopherStoneReason(`${quest.category} Mission Cleared`);
                  setPhilosopherStoneAmount(stonesToAward);
                  setShowPhilosopherStoneModal(true);
                  audio.playSuccess();
              }, 500);
          }

          updatedUser = checkAchievementUnlock(updatedUser, 'a15', true); 
          updatedUser = checkAchievementUnlock(updatedUser, 'q1', updatedUser.stats.questsCompleted >= 10);
          updatedUser = checkAchievementUnlock(updatedUser, 'q2', updatedUser.stats.questsCompleted >= 50);
          updatedUser = checkAchievementUnlock(updatedUser, 'q3', updatedUser.stats.questsCompleted >= 100);
          updatedUser = checkAchievementUnlock(updatedUser, 'q4', updatedUser.stats.questsCompleted >= 500);
          updatedUser = checkAchievementUnlock(updatedUser, 'q5', updatedUser.stats.questsCompleted >= 1000);

          return {
            ...prev,
            user: updatedUser,
            quests: prev.quests.map(q => q.id === questId ? { ...q, isClaimed: true } : q)
          };
      });
      addNotification("Reward Claimed", `+${formatNumber(rewards.gold)} Gold`, "success");
  };

  const buyDarkMerchantItem = (item: any) => {
      if (state.user.gold >= item.price && item.quantity > 0) {
          const currentQty = (state.user.consumables && state.user.consumables[item.itemId]) || 0;
          if (currentQty >= 6) {
              addNotification("Inventory Full", `You can't carry any more ${item.name} (Max 6).`, "warning");
              return;
          }

          audio.playPurchase();
          setState(prev => {
              const goldAfter = prev.user.gold - item.price;
              
              const updatedStock = prev.darkMerchantStock?.items.map(i => 
                  i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
              ) || [];

              const updatedUser = { ...prev.user, gold: goldAfter };
              
              if (item.itemId === 'philosopher_stone') {
                  updatedUser.currencies = {
                      ...updatedUser.currencies,
                      philosopherStones: (updatedUser.currencies?.philosopherStones || 0) + 1
                  };
              } else {
                  updatedUser.consumables = {
                      ...updatedUser.consumables,
                      [item.itemId]: (updatedUser.consumables?.[item.itemId] || 0) + 1
                  };
              }

              return { 
                  ...prev, 
                  user: updatedUser,
                  darkMerchantStock: {
                      ...prev.darkMerchantStock!,
                      items: updatedStock
                  }
              };
          });
          addNotification("Purchase Successful", `Bought ${item.name}`, "success");
      } else {
          audio.playError();
          addNotification("Cannot Purchase", "Not enough gold or out of stock.", "warning");
      }
  };

  const refreshDarkMerchant = () => {
    const rankIndex = RANKS.indexOf(getRankName(state.user.totalLevel));
    const refreshCost = 500 + (rankIndex * 500);
    
    if (state.user.gold >= refreshCost && (state.darkMerchantStock?.refreshCount || 0) < 1) {
      setState(prev => ({
        ...prev,
        user: { ...prev.user, gold: prev.user.gold - refreshCost },
        darkMerchantStock: {
          ...prev.darkMerchantStock!,
          items: generateDarkMerchantStock(Math.max(0, rankIndex), prev.user.gold - refreshCost, prev.consumablesData),
          refreshCount: (prev.darkMerchantStock?.refreshCount || 0) + 1
        }
      }));
      audio.playPurchase();
      addNotification("Stock Refreshed", "The Dark Merchant has new items.", "success");
    } else {
      audio.playError();
      addNotification("Cannot Refresh", "Not enough gold or already refreshed today.", "warning");
    }
  };

  const handleHaggle = (item: DarkMerchantItem) => {
    if (!state.darkMerchantStock) return;
    
    const rankIndex = RANKS.indexOf(getRankName(state.user.totalLevel));
    const maxHaggles = 1 + rankIndex;
    
    if ((item.haggledCount || 0) >= maxHaggles) {
      addNotification("Max Haggles Reached", "The merchant is losing patience.", "warning");
      return;
    }

    // Formula: [-30% to -90%] to [+30% to +200%]
    const minDiscount = 0.3 + (rankIndex / 8) * 0.6; // 0.3 to 0.9
    const maxIncrease = 0.3 + (rankIndex / 8) * 1.7; // 0.3 to 2.0
    
    // Random change between -minDiscount and +maxIncrease
    let change = (Math.random() * (maxIncrease + minDiscount)) - minDiscount;
    
    // Bad haggle chance logic
    const badHaggleChanceBase = 0.15 - (rankIndex / 8) * 0.10; // 15% to 5%
    const currentBadChance = state.darkMerchantStock.badHaggleChance || 0;
    
    if (Math.random() < currentBadChance) {
      // Force a bad haggle (increase price)
      change = Math.random() * maxIncrease;
    }

    const originalPrice = item.originalPrice || item.price;
    const newPrice = Math.max(1, Math.floor(item.price * (1 + change)));
    
    const isWorse = newPrice > item.price;
    let newBadChance = currentBadChance;
    if (isWorse) {
      newBadChance += badHaggleChanceBase;
    }

    setState(prev => ({
      ...prev,
      darkMerchantStock: {
        ...prev.darkMerchantStock!,
        badHaggleChance: newBadChance,
        items: prev.darkMerchantStock!.items.map(i => {
          if (i.id === item.id) {
            return {
              ...i,
              price: newPrice,
              originalPrice: originalPrice,
              haggledCount: (i.haggledCount || 0) + 1
            };
          }
          return i;
        })
      }
    }));

    if (newPrice < item.price) {
      addNotification("Successful Haggle!", "Price reduced.", "success");
      audio.playSuccess();
    } else if (newPrice > item.price) {
      addNotification("Haggle Failed...", "The merchant raised the price!", "warning");
      audio.playError();
    } else {
      addNotification("No Change", "The merchant didn't budge.", "info");
    }
  };

  const enchantEquipment = (item: Item, success: boolean, cost: number) => {
      const stoneCost = getEnhancementStoneCost(item.rarity);
      if (state.user.gold < cost || (state.user.currencies?.philosopherStones || 0) < stoneCost) {
          addNotification("Cannot Enchant", "Not enough resources.", "warning");
          return;
      }

      setState(prev => {
          const goldAfter = prev.user.gold - cost;
          const updatedUser = { 
            ...prev.user, 
            gold: goldAfter,
            currencies: {
              ...prev.user.currencies,
              philosopherStones: success ? Math.max(0, (prev.user.currencies?.philosopherStones || 0) - stoneCost) : (prev.user.currencies?.philosopherStones || 0)
            }
          };
          
          if (success) {
              updatedUser.equipmentEnhancements = {
                  ...updatedUser.equipmentEnhancements,
                  [item.id]: (updatedUser.equipmentEnhancements?.[item.id] || 0) + 1
              };
          }
          
          return { ...prev, user: updatedUser };
      });

      if (success) {
          const newLevel = (state.user.equipmentEnhancements?.[item.id] || 0) + 1;
          audio.playSuccess();
          addNotification("Enhancement Success!", `${item.name} is now +${newLevel}`, "success");
      } else {
          audio.playError();
          addNotification("Enhancement Failed", `The tempering was unsuccessful. Lost ${cost} Gold.`, "warning");
      }
  };

    const useConsumable = (itemId: string) => {
        const newData = state.consumablesData?.find(c => c.id === itemId);
        const oldData = CONSUMABLE_DATA[itemId];
        const data = newData || oldData;
        if (!data) return;

        const currentUsage = (state.user.dailyUsage && state.user.dailyUsage[itemId]) || 0;
        const currentWeeklyUsage = (state.user.weeklyUsage && state.user.weeklyUsage[itemId]) || 0;
        const rankIndex = RANKS.indexOf(getRankName(state.user.totalLevel));

        // Check limits
        const dailyLimit = data && 'dailyLimit' in data ? data.dailyLimit : (oldData?.dailyLimit);
        const weeklyLimit = data && 'weeklyLimit' in data ? data.weeklyLimit : (oldData?.weeklyLimit);

        let effectiveDailyLimit = dailyLimit;
        if (itemId === 'sss_soap') {
            effectiveDailyLimit = rankIndex >= 4 ? 3 : (rankIndex >= 2 ? 2 : 1);
        }

        if (effectiveDailyLimit !== undefined && currentUsage >= effectiveDailyLimit) {
            addNotification(`Daily limit reached for ${data.name}!`, 'warning');
            return;
        }

        if (weeklyLimit !== undefined && currentWeeklyUsage >= weeklyLimit) {
            addNotification(`Weekly limit reached for ${data.name}!`, 'warning');
            return;
        }

        // Apply effects
        setState(prev => {
            const newUser = { ...prev.user };
            const currentQty = (newUser.consumables && newUser.consumables[itemId]) || 0;
            
            if (currentQty <= 0) {
                return prev;
            }

            // Consume item
            newUser.consumables = { 
                ...(newUser.consumables || {}), 
                [itemId]: currentQty - 1 
            };
            
            if (newUser.consumables[itemId] <= 0) {
                delete newUser.consumables[itemId];
            }

            // Update usage
            newUser.dailyUsage = { ...(newUser.dailyUsage || {}), [itemId]: currentUsage + 1 };
            newUser.weeklyUsage = { ...(newUser.weeklyUsage || {}), [itemId]: currentWeeklyUsage + 1 };

            if (newData) {
                // Apply generic effects from new data
                const lerp = (min: number, max: number) => {
                    const maxRank = RANKS.length - 1;
                    const rankFactor = rankIndex / maxRank;
                    return Math.floor(min + (max - min) * rankFactor);
                };

                const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

                // Flat EXP
                const expGain = rand(newData.flatExpGainMin, newData.flatExpGainMax);
                if (expGain !== 0) {
                    newUser.totalExp = Math.max(0, newUser.totalExp + expGain);
                    addNotification(`Used ${newData.name}: ${expGain > 0 ? '+' : ''}${expGain} Profile EXP!`, expGain > 0 ? 'success' : 'warning');
                }

                // Philosopher Stones
                const stoneGain = rand(newData.receiveStoneMin, newData.receiveStoneMax);
                if (stoneGain > 0) {
                    newUser.currencies = {
                        ...newUser.currencies,
                        philosopherStones: (newUser.currencies?.philosopherStones || 0) + stoneGain
                    };
                    addNotification(`Used ${newData.name}: +${stoneGain} Philosopher's Stones!`, 'success');
                }

                // Patron EXP
                const patronGain = rand(newData.patronGainMin, newData.patronGainMax);
                if (patronGain > 0) {
                    const oldRank = getPatronRank(newUser.patronExp || 0);
                    newUser.patronExp = (newUser.patronExp || 0) + patronGain;
                    const newRank = getPatronRank(newUser.patronExp);
                    
                    if (newRank > oldRank) {
                        let stones = 0;
                        for (let r = oldRank + 1; r <= newRank; r++) {
                            if (r >= 1 && r <= 5) stones += 1;
                            else if (r >= 6 && r <= 10) stones += 2;
                            else if (r >= 11 && r <= 15) stones += 3;
                            else if (r >= 16 && r <= 18) stones += 4;
                            else if (r >= 19 && r <= 20) stones += 5;
                        }
                        if (stones > 0) {
                            newUser.currencies = {
                                ...newUser.currencies,
                                philosopherStones: (newUser.currencies?.philosopherStones || 0) + stones
                            };
                            setTimeout(() => {
                                setPhilosopherStoneReason(`Patron Level ${newRank} Reached!`);
                                setPhilosopherStoneAmount(stones);
                                setShowPhilosopherStoneModal(true);
                                audio.playSuccess();
                            }, 500);
                        }
                    }
                    addNotification(`Used ${newData.name}: +${patronGain} Patron EXP!`, 'success');
                }

                // Buffs
                if (newData.durationStr !== '0D_0H_0M') {
                    const parts = newData.durationStr.split('_');
                    let durationMs = 0;
                    if (parts.length === 3) {
                        const d = parseInt(parts[0]) || 0;
                        const h = parseInt(parts[1]) || 0;
                        const m = parseInt(parts[2]) || 0;
                        durationMs = (d * 24 * 60 * 60 + h * 60 * 60 + m * 60) * 1000;
                    }
                    if (durationMs > 0) {
                        const expiry = Date.now() + durationMs;
                        newUser.activeBuffs = { ...(newUser.activeBuffs || {}), [itemId]: expiry };
                        
                        const currentStacks = newUser.activeBuffStacks?.[itemId] || 0;
                        const maxStacks = newData.stackable > 0 ? newData.stackable : 1;
                        const newStacks = Math.min(currentStacks + 1, maxStacks);
                        newUser.activeBuffStacks = { ...(newUser.activeBuffStacks || {}), [itemId]: newStacks };

                        addNotification(`Used ${newData.name}: Buff applied!`, 'success');
                    }
                }

                // Specific hardcoded logic for dynamic items that need it
                if (itemId === 'isekai_credit_card') {
                    newUser.gold += 100000;
                    newUser.debtTomorrow = (newUser.debtTomorrow || 0) + 120000;
                    addNotification("Used Isekai Credit Card: Gained 100,000 Gold (120,000 debt tomorrow)!", 'success');
                } else if (itemId === 'philosopher_stone') {
                    newUser.gold += 50000;
                    addNotification("Used Philosopher's Stone: Gained 50,000 Gold!", 'success');
                }

            } else {
                // Old specific effects
                const oneDayMs = 24 * 60 * 60 * 1000;
                const expiry = Date.now() + oneDayMs;

                switch (itemId) {
                    case 'philosopher_stone':
                        newUser.gold += 50000;
                        addNotification("Used Philosopher's Stone: Gained 50,000 Gold!", 'success');
                        break;
                    case 'frozen_flame':
                        newUser.frozenStreak = true;
                        addNotification("Used Frozen Flame: Your streak is frozen for the next missed day!", 'success');
                        break;
                    case 'sss_soap':
                        newUser.activeBuffs = { ...(newUser.activeBuffs || {}), 'sss_soap': 1 };
                        addNotification("Used SSS Soap: Next session >30m will give 2x EXP!", 'success');
                        break;
                    case 'misery_box_1': {
                        const gain = Math.random() > 0.4 ? 15 : -10;
                        newUser.totalExp = Math.max(0, newUser.totalExp + gain);
                        addNotification(`Opened Misery Box+1: ${gain > 0 ? '+' : ''}${gain} Profile EXP!`, gain > 0 ? 'success' : 'warning');
                        break;
                    }
                    case 'misery_box_2': {
                        const gain = Math.random() > 0.4 ? 75 : -50;
                        newUser.totalExp = Math.max(0, newUser.totalExp + gain);
                        addNotification(`Opened Misery Box+2: ${gain > 0 ? '+' : ''}${gain} Profile EXP!`, gain > 0 ? 'success' : 'warning');
                        break;
                    }
                    case 'misery_box_3': {
                        const gain = Math.random() > 0.4 ? 300 : -200;
                        newUser.totalExp = Math.max(0, newUser.totalExp + gain);
                        addNotification(`Opened Misery Box+3: ${gain > 0 ? '+' : ''}${gain} Profile EXP!`, gain > 0 ? 'success' : 'warning');
                        break;
                    }
                    case 'isekai_credit_card':
                        newUser.gold += 100000;
                        newUser.debtTomorrow = (newUser.debtTomorrow || 0) + 120000;
                        addNotification("Used Isekai Credit Card: Gained 100,000 Gold (120,000 debt tomorrow)!", 'success');
                        break;
                    case 'patron_blessing': {
                        const oldRank = getPatronRank(newUser.patronExp || 0);
                        newUser.patronExp = (newUser.patronExp || 0) + 1;
                        const newRank = getPatronRank(newUser.patronExp);
                        
                        if (newRank > oldRank) {
                            let stones = 0;
                            for (let r = oldRank + 1; r <= newRank; r++) {
                                if (r >= 1 && r <= 5) stones += 1;
                                else if (r >= 6 && r <= 10) stones += 2;
                                else if (r >= 11 && r <= 15) stones += 3;
                                else if (r >= 16 && r <= 18) stones += 4;
                                else if (r >= 19 && r <= 20) stones += 5;
                            }
                            if (stones > 0) {
                                newUser.currencies = {
                                    ...newUser.currencies,
                                    philosopherStones: (newUser.currencies?.philosopherStones || 0) + stones
                                };
                                setTimeout(() => {
                                    setPhilosopherStoneReason(`Patron Level ${newRank} Reached!`);
                                    setPhilosopherStoneAmount(stones);
                                    setShowPhilosopherStoneModal(true);
                                    audio.playSuccess();
                                }, 500);
                            }
                        }
                        addNotification("Used Patron Blessing: Gained 1 Patron EXP!", 'success');
                        break;
                    }
                    case 'miso_ramen':
                    case 'shio_ramen':
                    case 'shoyu_ramen':
                    case 'chashuu_ramen':
                    case 'chuuka_ramen':
                    case 'ichiban_shibori':
                    case 'sshs_soap':
                        newUser.activeBuffs = { ...(newUser.activeBuffs || {}), [itemId]: expiry };
                        addNotification(`Used ${data.name}: Buff applied for 24 hours!`, 'success');
                        break;
                }
            }

            return { ...prev, user: newUser };
        });
    };

    const buyItem = (item: Item) => { 
      const stoneCost = getBlacksmithStoneCost(item.rarity);
      const hasEnoughGold = state.user.gold >= item.cost;
      const hasEnoughStones = (state.user.currencies?.philosopherStones || 0) >= stoneCost;
      const isOwned = state.user.inventory.includes(item.id);

      if (hasEnoughGold && hasEnoughStones && !isOwned) {
          audio.playPurchase();
          setState(prev => {
              const goldAfter = prev.user.gold - item.cost;
              const stonesAfter = (prev.user.currencies?.philosopherStones || 0) - stoneCost;
              const newInventory = [...prev.user.inventory, item.id];
              let updatedUser: UserProfile = { 
                  ...prev.user, 
                  gold: goldAfter, 
                  currencies: {
                      ...prev.user.currencies,
                      philosopherStones: stonesAfter
                  },
                  inventory: newInventory,
                  stats: {
                      ...prev.user.stats,
                      itemsBought: prev.user.stats.itemsBought + 1,
                      shopVisitsWithoutBuy: 0 
                  }
              };
              
              updatedUser = checkAchievementUnlock(updatedUser, 'a3', true); 
              updatedUser = checkAchievementUnlock(updatedUser, 'a20', updatedUser.stats.itemsBought >= 5); 
              updatedUser = checkAchievementUnlock(updatedUser, 'a65', updatedUser.stats.itemsBought >= 100); 
              updatedUser = checkAchievementUnlock(updatedUser, 'a49', newInventory.length >= prev.shopItems.length && prev.shopItems.length > 0); 
              updatedUser = checkAchievementUnlock(updatedUser, 'a23', goldAfter < 5 && goldAfter > 0); 

              return { ...prev, user: updatedUser };
          });
          addNotification("Purchase Successful", `Bought ${item.name}`, "success");
      } else { 
          audio.playError(); 
          let msg = "Not enough gold or already owned.";
          if (!hasEnoughStones) msg = `Not enough Philosopher Stones (Need ${stoneCost}).`;
          else if (!hasEnoughGold) msg = "Not enough Gold.";
          addNotification("Cannot Purchase", msg, "warning"); 
      }
  };

  const equipItem = (item: Item) => {
      if (state.user.inventory.includes(item.id)) {
          audio.playEquip();
          setState(prev => {
              const newEquipped = { ...prev.user.equipped, [item.slot]: item.id };
              let updatedUser = { ...prev.user, equipped: newEquipped };
              updatedUser = checkAchievementUnlock(updatedUser, 'a38', item.rarity === RarityType.GOD);
              
              const slotsFilled = Object.entries(newEquipped)
                  .filter(([key]) => key !== ItemSlot.BACKGROUND)
                  .every(([_, val]) => val !== null);
              updatedUser = checkAchievementUnlock(updatedUser, 'a9', slotsFilled);

              const allEquipped = Object.values(newEquipped).map(id => prev.shopItems.find(i => i.id === id)).filter(i => !!i) as Item[];
              const totalDmg = allEquipped.reduce((acc, i) => acc + (i.stats.dmg || 0), 0);
              updatedUser = checkAchievementUnlock(updatedUser, 'a27', totalDmg > 100);

              return { ...prev, user: updatedUser };
          });
          addNotification("Equipped", item.name, "info");
      }
  };

  const handleDownloadShop = async () => {
      try {
         addNotification("Downloading Catalog", "Fetching latest gear...", "info");
         const items = await fetchEquipmentData(EQUIPMENT_DATA_URL);
         setState(prev => ({ ...prev, shopItems: items }));
         addNotification("Shop Updated", `${items.length} items loaded.`, "success");
     } catch (e) {
         addNotification("Error", "Failed to download shop data.", "warning");
     }
  };

  const updateSettings = (k: keyof typeof state.user.settings, v: any) => {
    setState(prev => {
      if (!prev) return prev;
      return { ...prev, user: { ...prev.user, settings: { ...prev.user.settings, [k]: v } } };
    });
  };
  
  const applyPhilosopherStoneCheat = () => {
      setState(prev => {
          if (!prev) return prev;
          return {
              ...prev,
              user: {
                  ...prev.user,
                  currencies: {
                      ...prev.user.currencies,
                      philosopherStones: (prev.user.currencies?.philosopherStones || 0) + 10
                  }
              }
          };
      });
      addNotification("Dev Cheat", "+10 Philosopher's Stones", "success");
  };

  const refreshDarkMerchantCheat = () => {
      const rankIndex = RANKS.indexOf(getRankName(state.user.totalLevel));
      setState(prev => ({
        ...prev,
        darkMerchantStock: prev.darkMerchantStock ? {
          ...prev.darkMerchantStock,
          items: generateDarkMerchantStock(Math.max(0, rankIndex), prev.user.gold, prev.consumablesData),
          refreshCount: 0
        } : prev.darkMerchantStock
      }));
      audio.playPurchase();
      addNotification("Dev Cheat", "Dark Merchant Stock Refreshed (Free)", "success");
  };

  const maxEnhanceAllOwnedItemsCheat = () => {
      setState(prev => {
          const newEnhancements = { ...(prev.user.equipmentEnhancements || {}) };
          prev.user.inventory.forEach(itemId => {
              const item = prev.shopItems.find(i => i.id === itemId);
              if (item) {
                  newEnhancements[itemId] = getMaxEnhancementLevel(item.rarity);
              }
          });
          return {
              ...prev,
              user: {
                  ...prev.user,
                  equipmentEnhancements: newEnhancements
              }
          };
      });
      audio.playSuccess();
      addNotification("Dev Mode", "All items enhanced to their max level", "success");
  };

  const redefaultEquipmentsCheat = () => {
      setState(prev => ({
          ...prev,
          user: {
              ...prev.user,
              inventory: [],
              equipped: {
                  [ItemSlot.HEAD]: null,
                  [ItemSlot.BODY]: null,
                  [ItemSlot.RIGHT_HAND]: null,
                  [ItemSlot.LEFT_HAND]: null,
                  [ItemSlot.FEET]: null,
                  [ItemSlot.ACCESSORY]: null,
                  [ItemSlot.BACKGROUND]: null,
              },
              equipmentEnhancements: {}
          }
      }));
      audio.playError();
      addNotification("Dev Mode", "All Items Locked & Reset", "warning");
  };

  const handleDevInput = (v: string) => { 
      setDevInput(v); 
      if (v === 'EnableDevCheat') {
          setDevModeEnabled(true); 
          addNotification("Dev", "Enabled", "warning");
          setState(prev => ({ ...prev, user: checkAchievementUnlock(prev.user, 'a55', true) }));
          maxEnhanceAllOwnedItemsCheat();
      }
      if (v === 'ImCreator') {
          setState(prev => ({ 
              ...prev, 
              user: { 
                  ...prev.user, 
                  name: 'Damara', 
                  avatarUrl: 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/damar.png' 
              } 
          }));
          addNotification("Creator Mode", "Identity Overwritten", "success");
          setDevInput('');
      }
  };
  
  const applyCheat = (type: 'GOLD' | 'STREAK' | 'EXP') => {
      setState(prev => {
          const u = { ...prev.user };
          if (type === 'GOLD') u.gold += 5000;
          if (type === 'STREAK') {
              u.currentStreak += 10;
              u.highestStreak = Math.max(u.highestStreak, u.currentStreak);
          }
          if (type === 'EXP') { u.totalExp += 5000; u.totalLevel = getProfileLevelFromExp(u.totalExp); }
          return { ...prev, user: u };
      });
      addNotification("Cheat Applied", type, "info");
  };

  const handleAddCustomGold = () => {
      const amount = parseInt(devGoldInput);
      if (!isNaN(amount)) {
          setState(prev => ({
              ...prev,
              user: { ...prev.user, gold: prev.user.gold + amount }
          }));
          addNotification("Dev Cheat", `${amount > 0 ? '+' : ''}${formatNumber(amount)} Gold`, "success");
          setDevGoldInput('');
      }
  };
  
  const handleUpdateSkillData = (skillName: string, data: QuizQuestion[] | null, category?: string) => {
      setState(prev => {
          const updatedDownloaded = { ...(prev.downloadedChallenges || {}) };
          if (data && data.length > 0) {
              updatedDownloaded[skillName] = data;
          } else {
              delete updatedDownloaded[skillName];
          }

          const existingIndex = prev.proficiencies.findIndex(p => p.name === skillName);
          let newProficiencies = prev.proficiencies;
          
          if (existingIndex >= 0) {
              newProficiencies = [...prev.proficiencies];
              newProficiencies[existingIndex] = {
                  ...newProficiencies[existingIndex],
                  externalQuestions: data || [] 
              };
          }

          return { 
              ...prev, 
              proficiencies: newProficiencies, 
              downloadedChallenges: updatedDownloaded 
          };
      });
      
      if (data) {
          addNotification("Data Downloaded", `${skillName} content cached.`, "success");
      } else {
          addNotification("Data Removed", `${skillName} content cleared.`, "info");
      }
  };

  const handleUpdateMusic = (packId: string) => {
      setState(prev => {
          const currentPacks = prev.installedMusicPacks || ['base'];
          if (!currentPacks.includes(packId)) {
              return { ...prev, installedMusicPacks: [...currentPacks, packId] };
          }
          return prev;
      });
      addNotification("Music Pack Added", "Playlist updated.", "success");
  };

  const handleUpdateNpcImages = () => {
      setState(prev => ({ ...prev, installedNpcImages: true }));
      addNotification("NPC Images Added", "Store banners updated.", "success");
  };

  const handleUpdateEnemyImages = () => {
      setState(prev => ({ ...prev, installedEnemyImages: true }));
      addNotification("Enemy Images Added", "Enemy visuals updated.", "success");
  };

  const handleUpdateConsumableImages = () => {
      setState(prev => ({ ...prev, installedConsumableImages: true }));
      addNotification("Consumable Images Added", "Consumable visuals updated.", "success");
  };

  const handleUpdateShop = (items: Item[]) => {
      setState(prev => ({ ...prev, shopItems: items }));
      if (items.length > 0) {
          addNotification("Shop Updated", `${items.length} items available.`, "success");
      } else {
          addNotification("Shop Cleared", "Equipment data removed.", "info");
      }
  };

  const handleRefreshChallengeIndex = async () => {
      try {
          const index = await fetchMasterChallengeIndex(MASTER_CHALLENGE_URL);
          setState(prev => ({ ...prev, challengeIndex: index, challengeIndexLastUpdated: Date.now() }));
          addNotification("Updated", `${index.length} Challenges Found`, "success");
      } catch (e) {
          addNotification("Refresh Failed", "Could not fetch list.", "warning");
      }
  };

  const handleShopVisit = () => {
      setState(prev => {
          let updatedUser = {
              ...prev.user,
              stats: {
                  ...prev.user.stats,
                  shopVisitsWithoutBuy: prev.user.stats.shopVisitsWithoutBuy + 1
              }
          };
          updatedUser = checkAchievementUnlock(updatedUser, 'a6', updatedUser.stats.shopVisitsWithoutBuy >= 10);
          return { ...prev, user: updatedUser };
      });
  };

  const handleSupport = (amount: number) => {
      setState(prev => {
          const newTotal = prev.user.stats.totalDonated + amount;
          let updatedUser = {
              ...prev.user,
              stats: {
                  ...prev.user.stats,
                  totalDonated: newTotal
              }
          };
          
          updatedUser = checkAchievementUnlock(updatedUser, 's1', newTotal > 0);
          updatedUser = checkAchievementUnlock(updatedUser, 's2', newTotal >= 10);
          updatedUser = checkAchievementUnlock(updatedUser, 's3', newTotal >= 100);
          updatedUser = checkAchievementUnlock(updatedUser, 'a62', newTotal > 450); 

          return { ...prev, user: updatedUser };
      });
      handleAddPatronExp(amount);
  };

  const handleWatchAd = () => {
      audio.playClick();
      addNotification("Watching Vision...", "The gods are preparing a vision for you.", "info");
      
      // Simulate ad delay
      setTimeout(() => {
          handleAddPatronExp(0.01);
          audio.playSuccess();
      }, 3000);
  };

  const unlockAllEquipmentsCheat = () => {
      if (state.shopItems.length === 0) { addNotification("Error", "Download shop data first.", "warning"); return; }
      const allIds = state.shopItems.map(i => i.id);
      setState(prev => prev ? ({ ...prev, user: { ...prev.user, inventory: allIds } }) : prev);
      addNotification("Dev Mode", "Inventory Full", "success");
  };

  const unlockAllAchievementsCheat = () => {
      setState(prev => prev ? ({ ...prev, user: { ...prev.user, achievements: prev.user.achievements.map(a => ({ ...a, unlocked: true, unlockedAt: Date.now() })) } }) : prev);
      addNotification("Dev Mode", "Achievements Unlocked", "success");
  };

  const unlockAllEnemiesCheat = () => {
      if (state.detailedEnemies.length === 0) { addNotification("Error", "No enemy data loaded.", "warning"); return; }
      const allEnemies = state.detailedEnemies.reduce((acc, e) => {
          acc[e.name] = 9999999;
          return acc;
      }, {} as Record<string, number>);
      
      setState(prev => ({ ...prev, user: { ...prev.user, huntedEnemies: allEnemies } }));
      addNotification("Dev Mode", "Enemy Encyclopedia Unlocked", "success");
  };

  const lockAllEnemiesCheat = () => {
      setState(prev => ({ ...prev, user: { ...prev.user, huntedEnemies: {} } }));
      addNotification("Dev Mode", "Enemy Encyclopedia Reset", "warning");
  };

  const resetAllQuestsCheat = () => {
      setState(prev => ({ ...prev, quests: prev.quests.map(q => ({ ...q, isCompleted: false, isClaimed: false, steps: q.steps.map(s => ({ ...s, current: 0 })) })) }));
      addNotification("Dev Mode", "Quests Reset", "warning");
  };

  const applySkillCheat = () => {
      if (!selectedDevSkillId) return;
      setState(prev => ({
          ...prev,
          proficiencies: prev.proficiencies.map(p => {
              if (p.id === selectedDevSkillId) {
                  return { ...p, currentExp: p.currentExp + 5000, level: p.level + 10 };
              }
              return p;
          })
      }));
      addNotification("Cheat Applied", "Skill Boosted", "info");
  };

  const applyRankCheat = () => {
      if (!selectedDevSkillId || !selectedDevRank) return;
      let targetLevel = 1;
      switch(selectedDevRank) {
          case 'Novice': targetLevel = 1; break;
          case 'Apprentice': targetLevel = 11; break;
          case 'Professional': targetLevel = 31; break;
          case 'Expert': targetLevel = 61; break;
          case 'Master': targetLevel = 101; break;
          case 'Grandmaster': targetLevel = 201; break;
          case 'Legend': targetLevel = 401; break;
          case 'Mythic': targetLevel = 701; break;
          case 'Transcendent': targetLevel = 1000; break;
      }
      setState(prev => ({
          ...prev,
          proficiencies: prev.proficiencies.map(p => {
              if (p.id === selectedDevSkillId) {
                  return { ...p, level: targetLevel, currentExp: 0 };
              }
              return p;
          })
      }));
      addNotification("Cheat Applied", `Set to ${selectedDevRank}`, "success");
  };

  const applyProfileRankCheat = () => {
      if (!selectedDevProfileRank) return;
      let targetLevel = 1;
      switch(selectedDevProfileRank) {
          case 'Novice': targetLevel = 1; break;
          case 'Apprentice': targetLevel = 11; break;
          case 'Professional': targetLevel = 31; break;
          case 'Expert': targetLevel = 61; break;
          case 'Master': targetLevel = 101; break;
          case 'Grandmaster': targetLevel = 201; break;
          case 'Legend': targetLevel = 401; break;
          case 'Mythic': targetLevel = 701; break;
          case 'Transcendent': targetLevel = 1000; break;
      }
      const sumSeries = (targetLevel * (targetLevel - 1)) / 2;
      const totalExpRequired = 45 * sumSeries;
      setState(prev => ({
          ...prev,
          user: {
              ...prev.user,
              totalLevel: targetLevel,
              totalExp: totalExpRequired
          }
      }));
      addNotification("Cheat Applied", `Profile Set to ${selectedDevProfileRank}`, "success");
  };

  const unlockLibraryCheat = () => {
      setState(prev => ({
          ...prev,
          proficiencies: prev.proficiencies.map(p => {
              const allExternalIds = (p.externalQuestions || []).map(q => q.id);
              return { ...p, unlockedQuestionIds: allExternalIds };
          })
      }));
      addNotification("Dev Mode", "All Knowledge Unlocked", "success");
  };

  const lockLibraryCheat = () => {
      setState(prev => ({ ...prev, proficiencies: prev.proficiencies.map(p => ({ ...p, unlockedQuestionIds: [] })) }));
      addNotification("Dev Mode", "Library Reset", "warning");
  };

  const resetPatronCheat = () => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        patronExp: 0
      }
    }));
    addNotification("Dev Cheat", "Patron Level & Exp reset to 0.", "warning");
  };

  const resetCharacterData = () => { if(confirm("Reset all?")){ localStorage.removeItem('rpg_tracker_state'); window.location.reload(); } };
  
  const awardPhilosopherStone = (reason: string, amount: number = 1) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        currencies: {
          ...prev.user.currencies,
          philosopherStones: (prev.user.currencies?.philosopherStones || 0) + amount
        }
      }
    }));
    setPhilosopherStoneReason(reason);
    setPhilosopherStoneAmount(amount);
    setShowPhilosopherStoneModal(true);
    audio.playSuccess();
  };

  const handleAddPatronExp = (amount: number, cost: number = 0) => {
      setState(prev => {
          const currentExp = prev.user.patronExp || 0;
          const newExp = currentExp + amount;
          const currentGold = prev.user.gold || 0;

          const oldRank = getPatronRank(currentExp);
          const newRank = getPatronRank(newExp);
          let stonesToAward = 0;

          if (newRank > oldRank) {
              for (let r = oldRank + 1; r <= newRank; r++) {
                  if (r >= 1 && r <= 5) stonesToAward += 1;
                  else if (r >= 6 && r <= 10) stonesToAward += 2;
                  else if (r >= 11 && r <= 15) stonesToAward += 3;
                  else if (r >= 16 && r <= 18) stonesToAward += 4;
                  else if (r >= 19 && r <= 20) stonesToAward += 5;
              }
          }

          if (stonesToAward > 0) {
              setTimeout(() => {
                  setPhilosopherStoneReason(`Patron Level ${newRank} Reached!`);
                  setPhilosopherStoneAmount(stonesToAward);
                  setShowPhilosopherStoneModal(true);
                  audio.playSuccess();
              }, 500);
          }

          return {
              ...prev,
              user: {
                  ...prev.user,
                  gold: currentGold - cost,
                  patronExp: newExp,
                  currencies: {
                      ...prev.user.currencies,
                      philosopherStones: (prev.user.currencies?.philosopherStones || 0) + stonesToAward
                  }
              }
          };
      });
      addNotification("Support Received", `Added ${amount.toFixed(2)} Patron Exp!`, "success");
  };

  const handleExitStay = () => {
      setShowExitConfirm(false);
      window.history.pushState(null, '', window.location.href);
  };

  const handleExitLeave = () => {
      setShowExitConfirm(false);
      window.history.back();
  };

  const handleNav = (v: typeof view) => {
      setView(v);
      setSkillFilterCategory('All');
  };
  
  const bonuses = calculateBonuses();
  const baseStats = state ? getPlayerBaseStats(state.user.totalLevel) : { critRate: 0, attackSpeed: 0, heal: 0, block: 0, stun: 0, barrage: 0 };

  const totalMaxHp = state ? Math.floor((33 + (state.user.totalLevel * 5) + bonuses.hp) * (1 + (bonuses.hpPct / 100))) : 0;

  let streakMultiplier = state ? (state.user.currentStreak >= 30 ? 0.25 : state.user.currentStreak >= 7 ? 0.1 : 0) : 0;
  const gearMultiplier = bonuses.skillExpBonus > 0 ? (bonuses.skillExpBonus / 100) : 0;
  const activeSkillUnlockedCount = activeSkill?.unlockedQuestionIds?.length || 0;
  const libraryMultiplier = activeSkillUnlockedCount > 0 ? (activeSkillUnlockedCount * 0.005) : 0;

  // --- Render Functions ---
  const renderDashboard = () => {
    // ... existing dashboard code ...
    // Note: Render logic omitted for brevity as it is unchanged from previous, 
    // just ensuring context is correct. The full file content provided will include it.
    
    const rankColor = getRankColor(state.user.totalLevel);
    const rankName = getRankName(state.user.totalLevel);
    const frameBorderColor = rankColor.split(' ').find(c => c.startsWith('border-')) || 'border-slate-700';
    const profileExpReq = getProfileExpRequired(state.user.totalLevel);
    const profileProgress = Math.min(((state.user.totalExp % profileExpReq) / profileExpReq) * 100, 100);

    const currentStreakMod = state.user.currentStreak % 7; 
    const days = [1, 2, 3, 4, 5, 6, 7];

    const todayDate = new Date().toDateString();
    const minutesToday = Math.floor(state.sessions
        .filter(s => new Date(s.timestamp).toDateString() === todayDate)
        .reduce((acc, s) => acc + s.durationMinutes, 0));
    const dailyGoal = state.user.settings.dailyGoalMinutes;
    const dailyProgress = Math.min((minutesToday / dailyGoal) * 100, 100);
    const isGoalMet = minutesToday >= dailyGoal;

    return (
      <div className="space-y-6 pb-20 animate-in fade-in">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Base Operations</h3>
            <button onClick={() => setActiveHelpFeature('dashboard')} className="text-slate-500 hover:text-white transition-colors"><HelpCircle size={14}/></button>
        </div>

        {consequenceMessage && (
            <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-red-500 shrink-0" />
                <div className="flex-1"><p className="text-red-200 text-sm">{consequenceMessage}</p></div>
                <button onClick={() => setConsequenceMessage(null)}><X className="text-red-400" size={16}/></button>
            </div>
        )}

        <div className={`bg-slate-900 p-6 rounded-2xl border-4 ${frameBorderColor} shadow-xl relative overflow-hidden group transition-colors duration-500`}>
          <div className="flex items-center gap-6 relative z-10">
            <div className="relative cursor-pointer group/avatar" onClick={() => setShowProfileModal(true)}>
               <div className={`w-24 h-24 rounded-lg bg-slate-800 border-4 ${frameBorderColor} shadow-inner flex items-center justify-center overflow-hidden`}>
                   <img src={state.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover pixel-art animate-idle group-hover/avatar:scale-110 transition-transform" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded border border-slate-700">
                   Lvl {state.user.totalLevel}
               </div>
               {state.user.activeBuffs && Object.values(state.user.activeBuffs).some(expiry => (expiry as number) > Date.now() || expiry === 1) && (
                   <div 
                       onClick={(e) => { e.stopPropagation(); setShowBuffList(true); }}
                       className="absolute -top-2 -right-2 bg-yellow-500 text-slate-950 p-1.5 rounded-full border-2 border-slate-900 shadow-lg animate-bounce cursor-pointer hover:scale-110 transition-transform z-20"
                   >
                       <Zap size={12} fill="currentColor" />
                   </div>
               )}
            </div>
            <div className="flex-1 cursor-pointer" onClick={() => setShowProfileModal(true)}>
              <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-xl font-rpg font-bold text-white tracking-wide">{state.user.name}</h2>
                    {state.user.selectedTitle && (
                        <p className="text-xs text-purple-300 italic mt-0.5">"{state.user.selectedTitle}"</p>
                    )}
                    <p className={`text-xs font-mono uppercase font-bold inline-block px-2 py-0.5 rounded border mt-1 ${rankColor}`}>{rankName}</p>
                 </div>
                 <div className="flex flex-col items-center">
                    <img 
                        src={getRankImage(state.user.totalLevel)} 
                        alt={rankName} 
                        className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                    />
                 </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold uppercase"><span>Next Level</span><span>{Math.floor(state.user.totalExp % profileExpReq)} / {profileExpReq} EXP</span></div>
                <div className="w-full bg-slate-800 rounded-full h-2 border border-slate-700 overflow-hidden"><div className="bg-gradient-to-r from-purple-600 to-blue-500 h-full rounded-full" style={{ width: `${profileProgress}%` }}></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Commitment Widget */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden">
            <div className="flex justify-between items-end mb-2 relative z-10">
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        <Target size={14} className={isGoalMet ? "text-emerald-400" : "text-blue-400"} /> Daily Commitment
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {isGoalMet ? "Goal Achieved! Great work." : "Keep pushing to reach your target."}
                    </p>
                </div>
                <div className="text-right">
                    <span className={`text-xl font-mono font-bold ${isGoalMet ? "text-emerald-400" : "text-white"}`}>
                        {minutesToday} <span className="text-sm text-slate-500">/ {dailyGoal}m</span>
                    </span>
                </div>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative z-10">
                <div 
                    className={`h-full transition-all duration-1000 ${isGoalMet ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                    style={{ width: `${dailyProgress}%` }}
                >
                    {isGoalMet && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                </div>
            </div>
            {isGoalMet && <div className="absolute inset-0 bg-emerald-900/10 pointer-events-none"></div>}
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
              <Flame className={`mb-1 ${state.user.currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-600'}`} size={24} />
              <div className="flex items-baseline gap-1"><span className="text-2xl font-bold">{state.user.currentStreak}</span></div>
              <span className="text-xs text-slate-400 uppercase">Day Streak</span>
           </div>
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 mb-1"><div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div><span className="text-yellow-500 font-bold uppercase text-xs">Gold</span></div>
              <span className="text-2xl font-bold text-white">{formatNumber(state.user.gold)}</span>
              <span className="text-xs text-slate-400 uppercase">Currency</span>
           </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-400"/> Daily Login Bonus
                </h3>
                <button onClick={() => setActiveHelpFeature('daily_bonus')} className="text-slate-500 hover:text-white"><HelpCircle size={12}/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {days.map((day, idx) => {
                    const isClaimed = idx < currentStreakMod || (currentStreakMod === 0 && state.user.currentStreak > 0); 
                    const isToday = (idx === currentStreakMod - 1) || (currentStreakMod === 0 && idx === 6 && state.user.currentStreak > 0);
                    
                    return (
                        <div 
                            key={day} 
                            onClick={() => setShowDailyBonusModal(true)}
                            className={`flex flex-col items-center gap-1 p-1 rounded-lg border cursor-pointer hover:bg-slate-700 transition-colors ${isToday ? 'bg-emerald-900/30 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-slate-700 opacity-70'}`}
                        >
                            <div className="text-[10px] font-bold text-slate-500">Day {day}</div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 border border-slate-600 relative">
                                {isClaimed ? (
                                    <CheckCircle size={16} className="text-emerald-500"/>
                                ) : (
                                    day === 7 ? <Coins size={16} className="text-yellow-500"/> : <Zap size={16} className="text-purple-500"/>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

        <CalendarHeatmap sessions={state.sessions} daysToShow={14} />

        <div>
          <h3 className="text-slate-400 text-sm font-bold uppercase mb-4 flex items-center gap-2"><Book size={16} /> Quick Training</h3>
          <div className="grid grid-cols-1 gap-4">
            {state.proficiencies.slice(0, 3).map(skill => (
                <SkillCard 
                    key={skill.id} 
                    skill={skill} 
                    downloadUrl={state.challengeIndex.find(c => c.skill === skill.name)?.url}
                    onClick={() => setSelectedSkillForDetail(skill)} 
                    onQuickStart={(e) => { e.stopPropagation(); startSession(skill, 'STOPWATCH'); }} 
                    onChallenge={(e) => { e.stopPropagation(); handleChallengeClick(skill); }} 
                />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSkills = () => {
      const existingCategories = Array.from(new Set(state.proficiencies.map(p => p.category)));
      const allCategories = ['All', ...existingCategories];

      const filteredSkills = [...state.proficiencies]
        .filter(p => skillFilterCategory === 'All' || p.category === skillFilterCategory)
        .sort((a,b) => skillSort === 'level-desc' ? b.level - a.level : skillSort === 'level-asc' ? a.level - b.level : a.name.localeCompare(b.name));

      return (
      <div className="pb-20 animate-in fade-in">
          {/* Skills content remains same */}
          <div className="flex flex-col mb-6">
            <h2 className="text-2xl font-rpg font-bold text-white mb-2 flex items-center gap-2">
                Skill Grimoire
                <button onClick={() => setActiveHelpFeature('skills')} className="text-slate-500 hover:text-white"><HelpCircle size={16}/></button>
            </h2>
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <button onClick={() => setView('library')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-bold border border-slate-600"><BookOpen size={16} className="inline mr-1" /> Library</button>
                    <button onClick={() => setShowExpTable(true)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-bold border border-slate-600"><TrendingUp size={16} className="inline mr-1" /> Exp Table</button>
                </div>
                <div className="flex gap-2">
                     <div className="relative">
                         <button 
                            onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowSortMenu(false); }}
                            className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1 transition-colors ${skillFilterCategory !== 'All' ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'}`}
                            title={skillFilterCategory !== 'All' ? `Filtering by: ${skillFilterCategory}` : 'Filter Categories'}
                         >
                             <Filter size={16} />
                         </button>
                         {showCategoryMenu && (
                             <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowCategoryMenu(false)}></div>
                                <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 max-h-48 overflow-y-auto custom-scrollbar">
                                    {allCategories.map(cat => (
                                        <button 
                                            key={cat}
                                            onClick={() => { setSkillFilterCategory(cat); setShowCategoryMenu(false); }} 
                                            className={`block w-full text-left px-4 py-2 text-xs hover:bg-slate-700 transition-colors ${skillFilterCategory === cat ? 'text-purple-400 font-bold' : 'text-white'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                             </>
                         )}
                     </div>

                     <div className="relative">
                         <button 
                            onClick={() => { setShowSortMenu(!showSortMenu); setShowCategoryMenu(false); }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-xs font-bold border border-slate-600 flex items-center gap-1 transition-colors"
                         >
                             <ArrowDownUp size={16} />
                         </button>
                         {showSortMenu && (
                             <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)}></div>
                                <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95">
                                    <button onClick={() => { setSkillSort('level-desc'); setShowSortMenu(false); }} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-700 transition-colors">Level (High)</button>
                                    <button onClick={() => { setSkillSort('level-asc'); setShowSortMenu(false); }} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-700 transition-colors">Level (Low)</button>
                                    <button onClick={() => { setSkillSort('name-asc'); setShowSortMenu(false); }} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-700 transition-colors">Name (A-Z)</button>
                                </div>
                             </>
                         )}
                     </div>
                     <button onClick={() => setShowAddSkill(true)} className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg"><Plus size={20} /></button>
                </div>
            </div>
          </div>
          
          {showAddSkill && (
             <div className="mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700 animation-fade-in">
                 <h3 className="text-white font-bold mb-3 flex items-center justify-between">Add New Skill <button onClick={() => setShowAddSkill(false)} className="text-slate-500 hover:text-white"><X size={16}/></button></h3>
                 <div className="flex gap-2 overflow-x-auto pb-2 mb-3 custom-scrollbar">
                     {Object.keys(SKILL_PRESETS).concat("Other").map(cat => (
                         <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}>{cat}</button>
                     ))}
                 </div>
                 {selectedCategory !== 'Other' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
                        {/* @ts-ignore */}
                        {SKILL_PRESETS[selectedCategory]?.map((skill: string) => (
                            <button key={skill} onClick={() => handleAddSkill(skill, selectedCategory)} disabled={isSkillDuplicate(skill)} className="text-left p-2 rounded border text-xs bg-slate-900 border-slate-700 text-slate-300">{skill}</button>
                        ))}
                    </div>
                 ) : (
                     <div className="mb-4">
                         <input type="text" placeholder="Custom Skill Name..." value={customSkillName} onChange={e => setCustomSkillName(e.target.value)} className="w-full bg-slate-900 p-3 rounded mb-2 text-white border border-slate-700" />
                         <button onClick={() => handleAddSkill(customSkillName, 'Custom')} disabled={!customSkillName.trim()} className="w-full py-2 bg-emerald-600 rounded text-white text-sm font-bold">Add Custom Skill</button>
                     </div>
                 )}
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSkills.map(skill => (
              <SkillCard 
                key={skill.id} 
                skill={skill} 
                downloadUrl={state.challengeIndex.find(c => c.skill === skill.name)?.url}
                onClick={() => setSelectedSkillForDetail(skill)} 
                onQuickStart={(e) => { e.stopPropagation(); startSession(skill, 'STOPWATCH'); }} 
                onChallenge={(e) => { e.stopPropagation(); handleChallengeClick(skill); }} 
              />
            ))}
            {filteredSkills.length === 0 && (
                <div className="col-span-full text-center py-8 text-slate-500 text-sm italic">
                    No skills found in this category.
                </div>
            )}
          </div>
      </div>
  )};

  if (isStateLoading || !state) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-rpg text-white font-bold tracking-widest animate-pulse">LOADING STATE...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans selection:bg-purple-500 selection:text-white relative">
      {/* ... (Modals) ... */}
      {showExpTable && <ExpTableModal onClose={() => setShowExpTable(false)} />}
      
      {showProfileModal && (
          <ProfileDetailModal 
              user={state.user} 
              shopItems={state.shopItems} 
              proficiencies={state.proficiencies}
              sessions={state.sessions}
              detailedEnemies={state.detailedEnemies}
              consumablesData={state.consumablesData}
              onClose={() => setShowProfileModal(false)} 
              onEditAvatar={() => { setShowProfileModal(false); setShowProfileEditAvatar(true); }}
              onSelectTitle={(title) => setState(prev => ({ ...prev, user: { ...prev.user, selectedTitle: title } }))}
              onOpenPatronModal={() => setShowPatronModal(true)}
              onOpenInventory={() => setShowInventoryModal(true)}
              onOpenBuffList={() => setShowBuffList(true)}
          />
      )}

      {showBuffList && (
          <BuffListModal 
            user={state.user}
            activeBuffs={state.user.activeBuffs || {}} 
            consumablesData={state.consumablesData}
            installedConsumableImages={state.installedConsumableImages}
            onClose={() => setShowBuffList(false)} 
          />
      )}
      
      {/* ... (Other modals unchanged) ... */}
      {selectedAchievement && <AchievementDetailModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />}
      {levelUpQueue.length > 0 && <LevelUpModal type={levelUpQueue[0].type} name={levelUpQueue[0].name} newLevel={levelUpQueue[0].newLevel} onClose={() => setLevelUpQueue(prev => prev.slice(1))} />}
      {showTutorial && <TutorialModal onClose={handleTutorialClose} />}
      {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} onSupport={handleSupport} onWatchAd={handleWatchAd} />}
      {showExitConfirm && <ExitConfirmModal onStay={handleExitStay} onLeave={handleExitLeave} />}
      
      {showIdentityModal && <IdentityRegistrationModal onConfirm={handleIdentityConfirm} />}
      {showAvatarModal && <AvatarSelectionModal currentName={state.user.name} onConfirm={handleAvatarConfirm} isInitialSetup={true} />}
      
      {showRenameModal && <IdentityRegistrationModal onConfirm={handleRenameConfirm} isRenaming={true} onCancel={() => setShowRenameModal(false)} />}
      {showInventoryModal && (
          <InventoryModal
              user={state.user}
              shopItems={state.shopItems}
              consumablesData={state.consumablesData}
              installedConsumableImages={state.installedConsumableImages}
              onClose={() => setShowInventoryModal(false)}
              onEquip={equipItem}
              onUseConsumable={useConsumable}
              onEnhance={enchantEquipment}
          />
      )}

      {showProfileEditAvatar && (
          <AvatarSelectionModal 
              currentName={state.user.name} 
              currentAvatar={state.user.avatarUrl} 
              onConfirm={handleAvatarUpdate} 
              onCancel={() => setShowProfileEditAvatar(false)} 
              onRename={() => { setShowProfileEditAvatar(false); setShowRenameModal(true); }}
              isInitialSetup={false} 
          />
      )}
      
      {showDevProfile && <DevProfileModal onClose={() => setShowDevProfile(false)} />}
      {showContentManager && (
          <ContentManagerModal 
            currentPhrases={state.extraPhrases}
            proficiencies={state.proficiencies}
            shopItems={state.shopItems} 
            consumablesData={state.consumablesData}
            challengeIndex={state.challengeIndex}
            challengeLastUpdated={state.challengeIndexLastUpdated}
            downloadedChallenges={state.downloadedChallenges || {}}
            installedMusicPacks={state.installedMusicPacks}
            installedNpcImages={state.installedNpcImages}
            installedEnemyImages={state.installedEnemyImages}
            installedConsumableImages={state.installedConsumableImages}
            detailedEnemies={state.detailedEnemies}
            onUpdatePhrases={(newPhrases) => setState(prev => ({ ...prev, extraPhrases: { ...prev.extraPhrases, ...newPhrases } }))}
            onUpdateSkillData={handleUpdateSkillData}
            onUpdateShop={handleUpdateShop}
            onUpdateConsumables={(data) => setState(prev => ({ ...prev, consumablesData: data }))}
            onUpdateMusic={handleUpdateMusic}
            onUpdateNpcImages={handleUpdateNpcImages}
            onUpdateEnemyImages={handleUpdateEnemyImages}
            onUpdateConsumableImages={handleUpdateConsumableImages}
            onRefreshChallenges={handleRefreshChallengeIndex}
            onUpdateEnemies={(data) => setState(prev => ({ ...prev, detailedEnemies: data || [] }))}
            onClose={() => setShowContentManager(false)} 
          />
      )}
      {activeHelpFeature && <HelpModal feature={activeHelpFeature} onClose={() => setActiveHelpFeature(null)} />}
      {showDailyBonusModal && <DailyBonusModal currentStreak={state.user.currentStreak} userLevel={state.user.totalLevel} onClose={() => setShowDailyBonusModal(false)} />}
      
      <PhilosopherStoneModal
          isOpen={showPhilosopherStoneModal}
          reason={philosopherStoneReason}
          amount={philosopherStoneAmount}
          onClose={() => setShowPhilosopherStoneModal(false)}
      />
      
      {showMusicModal && (
          <MusicControlModal 
              onClose={() => setShowMusicModal(false)}
              isPlaying={state.user.settings.musicEnabled}
              onToggle={handleToggleMusic}
              onSkip={handleSkipMusic}
          />
      )}

      {showPatronModal && (
          <PatronBlessModal
              user={state.user}
              onClose={() => setShowPatronModal(false)}
              onWatchAd={handleWatchAd}
              onSendTip={() => {
                  setShowPatronModal(false);
                  setShowSupportModal(true);
              }}
          />
      )}

      {selectedSkillForDetail && (
          <SkillDetailModal 
              skill={selectedSkillForDetail}
              user={state.user}
              shopItems={state.shopItems}
              sessions={state.sessions}
              onClose={() => setSelectedSkillForDetail(null)}
              onStartFocus={() => startSession(selectedSkillForDetail, 'STOPWATCH')}
              onStartTimer={() => startSession(selectedSkillForDetail, 'TIMER')}
              onStartChallenge={() => handleChallengeClick(selectedSkillForDetail)}
              onStartRechallenge={() => handleOpenRechallengeStart(selectedSkillForDetail)}
          />
      )}

      {showChallengeStart && activeChallengeSkill && (
          <ChallengeStartModal 
              skill={activeChallengeSkill}
              currentGold={state.user.gold} 
              philosopherStoneCount={state.user.currencies?.philosopherStones || 0}
              onConfirm={startChallengeSession} 
              onConfirmWithStone={(rank) => startChallengeSession(rank, true)}
              onCancel={() => setShowChallengeStart(false)} 
          />
      )}

      {showRechallengeStart && activeChallengeSkill && (
          <RechallengeStartModal 
              skill={activeChallengeSkill}
              onConfirm={startRechallengeSession}
              onCancel={() => setShowRechallengeStart(false)}
          />
      )}

      {showDownloadModal && activeChallengeSkill && <ChallengeDownloadModal skillName={activeChallengeSkill.name} url={state.challengeIndex.find(c => c.skill === activeChallengeSkill.name)?.url || ''} onConfirm={handleDownloadConfirm} onCancel={() => setShowDownloadModal(false)} />}
      {challengeSessionQuestions && activeChallengeSkill && (
          <ChallengeModal 
              questions={challengeSessionQuestions} 
              onCorrect={handleChallengeCorrect} 
              onComplete={handleChallengeComplete} 
              isReviewMode={isReviewMode} 
              isPhilosopherStoneMode={isPhilosopherStoneChallenge}
          />
      )}

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
          {notifications.map(n => (
              <div key={n.id} className={`bg-slate-900 border-l-4 rounded-lg p-3 shadow-2xl flex items-start gap-3 pointer-events-auto ${n.type === 'success' ? 'border-emerald-500' : n.type === 'warning' ? 'border-red-500' : 'border-blue-500'}`}>
                  <div><h4 className="font-bold text-sm text-white">{n.title}</h4><p className="text-xs text-slate-300">{n.message}</p></div>
              </div>
          ))}
      </div>

      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 pt-10 sm:pt-14 pb-4 flex justify-between items-center">
        <div onClick={() => setView('dashboard')} className="cursor-pointer"><Logo className="w-10 h-10" /></div>
        
        <div className="flex items-center gap-3">
          <MusicPlayerWidget 
            isPlaying={state.user.settings.musicEnabled}
            onToggle={handleToggleMusic}
            onSkip={handleSkipMusic}
            onOpenControl={handleOpenMusicModal}
          />
          <button onClick={() => setShowSupportModal(true)} className="text-pink-500 hover:text-pink-400 animate-pulse"><Heart size={20} fill="currentColor" /></button>
          <button onClick={() => setShowTutorial(true)} className="text-slate-400 hover:text-white"><HelpCircle size={20} /></button>
          <button onClick={() => setView('settings')} className="text-slate-400 hover:text-white"><Settings size={20} /></button>
          <div onClick={() => setShowProfileModal(true)} className="w-8 h-8 rounded-lg border-2 border-slate-600 bg-slate-800 overflow-hidden cursor-pointer">
            <img src={state.user.avatarUrl} alt="Mini Avatar" className="w-full h-full object-cover pixel-art" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 min-h-[calc(100vh-80px)]">
        {view === 'dashboard' && renderDashboard()}
        {view === 'skills' && renderSkills()}
        {view === 'profile_stats' && <StatsPage user={state.user} sessions={state.sessions} proficiencies={state.proficiencies} shopItems={state.shopItems} />} 
        {view === 'stats' && <div className="pb-20"><CalendarHeatmap sessions={state.sessions} /></div>}
        {view === 'quests' && (
            <BoardMenu 
                quests={state.quests} 
                onClaim={claimQuest} 
                onShowHelp={() => setActiveHelpFeature('quests')}
                detailedEnemies={state.detailedEnemies}
                huntedEnemies={state.user.huntedEnemies}
                highestRankIndex={RANKS.indexOf(getRankName(Math.max(state.user.totalLevel, ...state.proficiencies.map(p => p.level), 0)))}
                userTotalLevel={state.user.totalLevel}
                installedEnemyImages={state.installedEnemyImages}
            />
        )}
        {view === 'store' && (
            <Store 
                user={state.user} 
                shopItems={state.shopItems} 
                consumablesData={state.consumablesData}
                installedNpcImages={state.installedNpcImages}
                installedConsumableImages={state.installedConsumableImages}
                onDownloadShop={handleDownloadShop} 
                onPurchase={buyItem} 
                onEquip={equipItem}
                onShowHelp={() => setActiveHelpFeature('store')}
                onVisit={handleShopVisit}
                darkMerchantStock={state.darkMerchantStock}
                onBuyDarkMerchantItem={buyDarkMerchantItem}
                onRefreshDarkMerchant={refreshDarkMerchant}
                onHaggle={handleHaggle}
                onEnchant={enchantEquipment}
                onOpenInventory={() => setShowInventoryModal(true)}
            />
        )}
        
        {view === 'settings' && (
            <div className="pb-20 animate-in fade-in">
                {/* ... (Settings content unchanged) ... */}
                <h2 className="text-2xl font-rpg font-bold text-white mb-6">SETTINGS</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
                    <div className="p-5 border-b border-slate-800">
                        <h3 className="text-white font-bold text-base mb-1">Daily Commitment</h3>
                        <p className="text-xs text-slate-400 mb-4">Set your minimum learning target.</p>
                        <div className="grid grid-cols-4 gap-2">
                            {[15, 30, 45, 60].map(m => (
                                <button key={m} onClick={() => updateSettings('dailyGoalMinutes', m)} className={`py-2 rounded-lg text-sm font-bold transition-colors ${state.user.settings.dailyGoalMinutes === m ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{m}m</button>
                            ))}
                        </div>
                    </div>
                    {/* ... Rest of settings (sound, extra content, etc) ... */}
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3"><Volume2 className="text-slate-400" size={20}/><span className="text-slate-200 font-medium">Sound Effects</span></div>
                        <button onClick={() => updateSettings('soundEnabled', !state.user.settings.soundEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors relative ${state.user.settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${state.user.settings.soundEnabled ? 'left-7' : 'left-1'}`}></div></button>
                    </div>
                    {/* Music Toggle */}
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3"><Music className="text-slate-400" size={20}/><span className="text-slate-200 font-medium">Background Music</span></div>
                        <button onClick={() => updateSettings('musicEnabled', !state.user.settings.musicEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors relative ${state.user.settings.musicEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${state.user.settings.musicEnabled ? 'left-7' : 'left-1'}`}></div></button>
                    </div>
                    {/* Floating Mock Toggle */}
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3"><Sparkles className="text-slate-400" size={20}/><span className="text-slate-200 font-medium">Floating Mock</span></div>
                        <button onClick={() => updateSettings('floatingMockEnabled', !state.user.settings.floatingMockEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors relative ${state.user.settings.floatingMockEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${state.user.settings.floatingMockEnabled ? 'left-7' : 'left-1'}`}></div></button>
                    </div>
                    {/* Stay Awake Toggle */}
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3"><Sun className="text-slate-400" size={20}/><span className="text-slate-200 font-medium">Keep Screen Awake</span></div>
                        <button onClick={() => updateSettings('stayAwakeEnabled', !state.user.settings.stayAwakeEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors relative ${state.user.settings.stayAwakeEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${state.user.settings.stayAwakeEnabled ? 'left-7' : 'left-1'}`}></div></button>
                    </div>

                    {/* VFX Level Setting */}
                    <div className="p-5 border-b border-slate-800">
                        <div className="flex items-center gap-3 mb-1"><Sparkles className="text-slate-400" size={20}/><span className="text-slate-200 font-medium">Battle VFX Level</span></div>
                        <p className="text-xs text-slate-400 mb-4">Adjust visual effects in battles for better performance.</p>
                        <div className="grid grid-cols-4 gap-2">
                            {['LOW', 'MEDIUM', 'HIGH', 'ULTRA'].map(level => (
                                <button key={level} onClick={() => updateSettings('vfxLevel', level)} className={`py-2 rounded-lg text-xs font-bold transition-colors ${state.user.settings.vfxLevel === level ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{level}</button>
                            ))}
                        </div>
                    </div>

                    {/* Device Performance Setting */}
                    <div className="p-5 border-b border-slate-800">
                        <div className="flex items-center gap-3 mb-1"><Activity className="text-slate-400" size={20}/><span className="text-slate-200 font-medium">Device Performance</span></div>
                        <p className="text-xs text-slate-400 mb-4">Choose rendering mode based on your device's power.</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'ULTRA_STRONG', label: 'Ultra Strong', sub: 'Greatest Visuals' },
                                { id: 'ROTTEN_POTATO', label: 'Rotten Potato', sub: 'Highly Optimized' }
                            ].map(perf => (
                                <button 
                                    key={perf.id} 
                                    onClick={() => {
                                        updateSettings('devicePerformance', perf.id as any);
                                        if (perf.id === 'ROTTEN_POTATO') {
                                            addNotification("Rotten Potato Mode", "Since this is newly implemented, visual bugs may appear a lot.", "warning");
                                        } else if (perf.id === 'ULTRA_STRONG') {
                                            addNotification("Ultra Strong Mode", "Uses old inefficient and unoptimized code to render the battle. Must have strong device like tablet above.", "warning");
                                        }
                                    }} 
                                    className={`py-3 px-2 rounded-lg flex flex-col items-center justify-center transition-colors ${state.user.settings.devicePerformance === perf.id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    <span className="text-xs font-black uppercase tracking-tighter">{perf.label}</span>
                                    <span className="text-[10px] opacity-60 mt-1">{perf.sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div onClick={() => setShowContentManager(true)} className="p-5 border-b border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3"><Database className="text-blue-400" size={20}/><span className="text-slate-200 font-medium">Extra Content</span></div>
                        <span className="text-xs text-slate-500 font-bold">Download Packs</span>
                    </div>
                    <div onClick={() => setShowDevProfile(true)} className="p-5 border-b border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3"><Code2 className="text-purple-400" size={20}/><span className="text-slate-200 font-medium">Developer Profile</span></div>
                        <span className="text-xs text-slate-500 font-bold">Credits</span>
                    </div>
                    <div onClick={() => setShowSupportModal(true)} className="p-5 border-b border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3"><Heart className="text-pink-500" size={20}/><span className="text-slate-200 font-medium">Support Development</span></div>
                        <span className="text-xs text-pink-400 font-bold">Tip</span>
                    </div>
                    <div className="p-5 bg-red-950/20">
                        <h3 className="text-red-400 font-bold text-sm mb-3">Danger Zone</h3>
                        <button onClick={resetCharacterData} className="w-full py-3 bg-red-900/30 border border-red-900/50 text-red-300 font-bold rounded-lg hover:bg-red-900/50 transition-colors text-sm">Reset Character Data</button>
                    </div>
                </div>
                <div className="flex justify-center py-6">
                    <button 
                        onClick={() => setShowDevCheatModal(true)}
                        className="group relative flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-md overflow-hidden transition-all hover:border-emerald-500/50 hover:bg-slate-900"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <Terminal size={12} className="text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-emerald-400 transition-colors">
                            <span className="text-emerald-600 mr-1">$</span>
                            Developer Console
                            <span className="inline-block w-1 h-3 ml-1 bg-emerald-500 animate-bounce" />
                        </span>
                    </button>
                </div>
            </div>
        )}

        {view === 'library' && (
            <Library 
                state={state} 
                onClose={() => setView('skills')} 
                onShowHelp={() => setActiveHelpFeature('library')}
            />
        )}
        
        {view === 'session' && activeSkill && (
            <div className="fixed inset-0 z-[60] bg-slate-950">
                <Timer 
                    addNotification={addNotification}
                    proficiency={activeSkill} 
                    autoStart={timerAutoStart} 
                    initialMode={timerInitialMode}
                    lockMode={timerLockMode} 
                    userAvatar={state.user.avatarUrl}
                    floatingMockEnabled={state.user.settings.floatingMockEnabled}
                    onComplete={completeSession} 
                    onCancel={() => { setView('dashboard'); setActiveSkill(null); }}
                    onUnlockAchievement={handleUnlockAchievement}
                    userLevel={state.user.totalLevel}
                    playerMaxHp={totalMaxHp}
                    bonusDmg={bonuses.dmg}
                    bonusHeal={bonuses.heal + baseStats.heal}
                    bonusBlock={bonuses.block + baseStats.block}
                    bonusStun={bonuses.stun + baseStats.stun}
                    bonusBarrage={bonuses.barrage + baseStats.barrage}
                    bonusCrit={bonuses.critRate + baseStats.critRate}
                    critDmgMultiplier={2.0 + (bonuses.critDmg / 100)}
                    attackSpeed={bonuses.attackSpeed + baseStats.attackSpeed}
                    bonusGoldPct={bonuses.goldBonus}
                    undieableChance={bonuses.undieableChance}
                    detailedEnemies={state.detailedEnemies}
                    vfxLevel={state.user.settings.vfxLevel}
                    devicePerformance={state.user.settings.devicePerformance || 'ULTRA_STRONG'}
                    streakMultiplier={streakMultiplier}
                    gearMultiplier={gearMultiplier}
                    libraryMultiplier={libraryMultiplier}
                    speedMultiplier={timerSpeedMultiplier}
                    extraPhrases={state.extraPhrases}
                    installedEnemyImages={state.installedEnemyImages}
                    installedConsumableImages={state.installedConsumableImages}
                    musicEnabled={state.user.settings.musicEnabled}
                    onToggleMusic={handleToggleMusic}
                    onSkipMusic={handleSkipMusic}
                    onToggleVfx={() => {
                        const levels = ['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as const;
                        const currentIdx = levels.indexOf(state.user.settings.vfxLevel);
                        const nextIdx = (currentIdx + 1) % levels.length;
                        updateSettings('vfxLevel', levels[nextIdx]);
                    }}
                    activeBuffs={state.user.activeBuffs}
                    activeBuffStacks={state.user.activeBuffStacks}
                    consumablesData={state.consumablesData}
                />
            </div>
        )}

        <DevCheatModal 
            isOpen={showDevCheatModal}
            onClose={() => setShowDevCheatModal(false)}
            devInput={devInput}
            onDevInput={handleDevInput}
            devModeEnabled={devModeEnabled}
            applyCheat={applyCheat}
            resetCharacterData={resetCharacterData}
            unlockAllEquipmentsCheat={unlockAllEquipmentsCheat}
            redefaultEquipmentsCheat={redefaultEquipmentsCheat}
            maxEnhanceAllOwnedItemsCheat={maxEnhanceAllOwnedItemsCheat}
            unlockAllAchievementsCheat={unlockAllAchievementsCheat}
            resetAllQuestsCheat={resetAllQuestsCheat}
            unlockLibraryCheat={unlockLibraryCheat}
            lockLibraryCheat={lockLibraryCheat}
            unlockAllEnemiesCheat={unlockAllEnemiesCheat}
            lockAllEnemiesCheat={lockAllEnemiesCheat}
            applyPhilosopherStoneCheat={applyPhilosopherStoneCheat}
            refreshDarkMerchantCheat={refreshDarkMerchantCheat}
            handleAddPatronExp={handleAddPatronExp}
            resetPatronCheat={resetPatronCheat}
            devGoldInput={devGoldInput}
            setDevGoldInput={setDevGoldInput}
            handleAddCustomGold={handleAddCustomGold}
            timerSpeedMultiplier={timerSpeedMultiplier}
            setTimerSpeedMultiplier={setTimerSpeedMultiplier}
            selectedDevSkillId={selectedDevSkillId}
            setSelectedDevSkillId={setSelectedDevSkillId}
            proficiencies={state.proficiencies}
            applySkillCheat={applySkillCheat}
            selectedDevRank={selectedDevRank}
            setSelectedDevRank={setSelectedDevRank}
            applyRankCheat={applyRankCheat}
            selectedDevProfileRank={selectedDevProfileRank}
            setSelectedDevProfileRank={setSelectedDevProfileRank}
            applyProfileRankCheat={applyProfileRankCheat}
        />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-40">
        <div className="flex justify-around items-center h-16 max-w-3xl mx-auto">
          <button onClick={() => handleNav('dashboard')} className={`flex flex-col items-center justify-center w-full h-full ${view === 'dashboard' ? 'text-purple-400' : 'text-slate-500'}`}><Layout size={20} /><span className="text-[10px]">Base</span></button>
          <button onClick={() => handleNav('skills')} className={`flex flex-col items-center justify-center w-full h-full ${view === 'skills' ? 'text-purple-400' : 'text-slate-500'}`}><Book size={20} /><span className="text-[10px]">Skills</span></button>
          <button onClick={() => handleNav('quests')} className={`flex flex-col items-center justify-center w-full h-full ${view === 'quests' ? 'text-purple-400' : 'text-slate-500'}`}><Scroll size={20} /><span className="text-[10px]">Board</span></button>
          <button onClick={() => handleNav('profile_stats')} className={`flex flex-col items-center justify-center w-full h-full ${view === 'profile_stats' ? 'text-purple-400' : 'text-slate-500'}`}><Activity size={20} /><span className="text-[10px]">Stats</span></button>
          <button onClick={() => handleNav('store')} className={`flex flex-col items-center justify-center w-full h-full ${view === 'store' ? 'text-purple-400' : 'text-slate-500'}`}><ShoppingBag size={20} /><span className="text-[10px]">Shop</span></button>
        </div>
      </nav>
    </div>
  );
};

export default App;
