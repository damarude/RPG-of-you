
export enum RarityType {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
  GOD = 'God',
  WORLD = 'World'
}

export enum ItemSlot {
  HEAD = 'Head',
  BODY = 'Body',
  RIGHT_HAND = 'Right Hand',
  LEFT_HAND = 'Left Hand',
  FEET = 'Feet',
  ACCESSORY = 'Accessory',
  BACKGROUND = 'Background'
}

export interface ItemStats {
  dmg: number;
  hp: number; // Flat health bonus
  hpPct: number; // Percentage bonus
  heal: number; // New (% per sec)
  block: number; // New (% chance)
  stun: number; // New (% chance)
  barrage: number; // New (% chance)
  critRate: number;
  critDmg: number; // New: Default is 0 (which adds to base 2.0x)
  goldBonus: number;
  attackSpeed: number;
  // Unique Stats
  challengeCostReduction: number;
  streakProtectionChance: number;
  undieableChance: number; // Chance to survive a wrong answer
  skillExpBonus: number;
}

export interface Item {
  id: string;
  name: string;
  slot: ItemSlot;
  cost: number;
  description: string;
  visualPrompt: string; // Used for AI generation
  icon: string; // Lucide icon name or emoji
  rarity: RarityType;
  mainStatDesc: string; // Text display for main stat
  stats: ItemStats; // Aggregated numeric values (Total)
  mainStats: ItemStats; // Numeric values of just the main stat (Subset)
}

export interface QuestStep {
  id: string;
  description: string;
  target: number;
  current: number;
  type: 'minutes' | 'sessions' | 'streak' | 'level';
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'MAIN' | 'DAILY' | 'WEEKLY';
  minLevel?: number; // For Main quests
  rewardGold: number;
  difficulty?: number; // 1-5
  steps: QuestStep[];
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface LearningSession {
  id: string;
  proficiencyId: string;
  timestamp: number;
  durationMinutes: number;
  expGained: number;
  notes: string;
  multipliersApplied?: string[]; // e.g., ["Streak x1.1", "Night Owl x1.1"]
}

export interface QuizQuestion {
  id: string;
  rank: string;
  category: string;
  skill: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Proficiency {
  id: string;
  name: string;
  category: string; // e.g., Coding, Language, Art
  currentExp: number;
  level: number;
  totalHours: number;
  unlockedQuestionIds: string[]; // Track answered questions for permanent bonus
  externalQuestions?: QuizQuestion[]; // Store downloaded questions here
}

export enum AchievementTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
  DIAMOND = 'Diamond'
}

export interface Achievement {
  id: string;
  name: string;
  description: string; // How to receive it
  flavorText: string; // Comedy/Sarcasm
  unlocked: boolean;
  unlockedAt?: number;
  tier: AchievementTier;
  icon: string;
  conditionType: 'streak' | 'total_hours' | 'level' | 'total_sessions' | 'single_session' | 'spend_gold' | 'other';
  conditionValue: number;
}

export interface UserSettings {
  dailyGoalMinutes: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  stayAwakeEnabled?: boolean;
  theme: 'dark' | 'light'; // Preparation for future
  hideContentManagerOnStartup?: boolean;
  vfxLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
  floatingMockEnabled: boolean;
  devicePerformance?: 'ULTRA_STRONG' | 'ROTTEN_POTATO';
}

export interface SessionStats {
  totalStarted: number;
  startedToday: number;
  startedThisWeek: number;
  questsCompleted: number;
  itemsBought: number;
  shopVisitsWithoutBuy: number;
  challengesFailed: number;
  totalDonated: number;
  timersCancelledEarly: number;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  totalLevel: number;
  totalExp: number;
  currentStreak: number;
  highestStreak: number;
  lastDailyCheck: number;
  dailyQuestResetDate: string;
  weeklyQuestResetDate: string;
  gold: number;
  settings: UserSettings;
  achievements: Achievement[];
  inventory: string[];
  equipped: {
    [key in ItemSlot]: string | null;
  };
  stats: SessionStats;
  huntedEnemies: Record<string, number>;
  selectedTitle: string | null;
  patronExp?: number;
  equipmentEnhancements?: Record<string, number>;
  consumables?: Record<string, number>;
  currencies?: {
    philosopherStones: number;
  };
  activeBuffs?: Record<string, number>; // itemId -> expiration timestamp
  activeBuffStacks?: Record<string, number>; // itemId -> number of stacks
  dailyUsage?: Record<string, number>; // itemId -> count today
  weeklyUsage?: Record<string, number>; // itemId -> count this week
  frozenStreak?: boolean;
  debtTomorrow?: number;
}

export interface PhrasePack {
  screensaver: string[];
  enemies: string[];
  character: string[];
  enemyReviveToxic: string[];
}

export interface ChallengeMetadata {
  skill: string;
  category: string;
  url: string;
}

export interface LevelUpEvent {
  type: 'USER' | 'SKILL';
  name: string;
  newLevel: number;
}

export interface DarkMerchantItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  icon: string;
  rarity: string;
  haggledCount?: number;
  originalPrice?: number;
}

export interface ConsumableItem {
    id: string;
    name: string;
    rank: RarityType;
    baseCost: number;
    currentMoneyCostPct: number;
    profileCostMin: number;
    profileCostMax: number;
    durationStr: string;
    stackable: number;
    appearanceMin: number;
    appearanceMax: number;
    itemCountMin: number;
    itemCountMax: number;
    receiveStoneMin: number;
    receiveStoneMax: number;
    flatExpGainMin: number;
    flatExpGainMax: number;
    patronGainMin: number;
    patronGainMax: number;
    freeChallenge: boolean;
    dmgMin: number;
    dmgMax: number;
    flatHpMin: number;
    flatHpMax: number;
    percentileHpMin: number;
    percentileHpMax: number;
    healMin: number;
    healMax: number;
    goldMin: number;
    goldMax: number;
    blockMin: number;
    blockMax: number;
    aspdMin: number;
    aspdMax: number;
    critRateMin: number;
    critRateMax: number;
    critDmgMin: number;
    critDmgMax: number;
    stunMin: number;
    stunMax: number;
    barrageMin: number;
    barrageMax: number;
    skillExpMin: number;
    skillExpMax: number;
    cReductionMin: number;
    cReductionMax: number;
    streakSaveMin: number;
    streakSaveMax: number;
    undyingMin: number;
    undyingMax: number;
    description: string;
}

export interface AppState {
  user: UserProfile;
  proficiencies: Proficiency[];
  sessions: LearningSession[];
  quests: Quest[];
  dailyQuestPool: Quest[];
  shopItems: Item[];
  consumablesData: ConsumableItem[];
  extraPhrases: PhrasePack;
  challengeIndex: ChallengeMetadata[];
  challengeIndexLastUpdated: number;
  lastLogin: number;
  downloadedChallenges: Record<string, QuizQuestion[]>; // Store downloaded questions here
  installedMusicPacks: string[]; // 'base', 'menu_pack', 'battle_pack'
  installedNpcImages?: boolean;
  installedEnemyImages?: boolean;
  installedConsumableImages?: boolean;
  detailedEnemies: any[]; // DetailedEnemy[]
  darkMerchantStock?: {
    date: string;
    items: DarkMerchantItem[];
    refreshCount?: number;
    badHaggleChance?: number; // Stacked chance for bad haggle
  };
}
