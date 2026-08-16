
import { Item, ItemSlot, Quest, RarityType, Achievement, AchievementTier, QuizQuestion } from './types';

// --- EXP & Leveling Logic ---

export const getSkillExpRequired = (level: number) => level * 15;
export const getProfileExpRequired = (level: number) => level * 45;

export const getSkillLevelFromExp = (totalExp: number) => {
  let level = 1;
  let expForNext = 15;
  let tempTotal = totalExp;
  while (tempTotal >= expForNext) {
    tempTotal -= expForNext;
    level++;
    expForNext = level * 15;
  }
  return level;
};

export const getProfileLevelFromExp = (totalExp: number) => {
  let level = 1;
  let expForNext = 45;
  let tempTotal = totalExp;
  while (tempTotal >= expForNext) {
    tempTotal -= expForNext;
    level++;
    expForNext = level * 45;
  }
  return level;
};

// --- Patron Bless Logic ---
export const PATRON_RANK_TITLES = [
    "Peasant of Pity",
    "Squire of the Unskippable",
    "Apprentice of the Fake \"X\"",
    "Acolyte of the Algorithm",
    "Knight of the Digital Tip Jar",
    "Mage of Micro-Charity",
    "Cleric of the Caffeine Fix",
    "Bard of the Banner Ads",
    "Paladin of the Playable Demo",
    "Duke of Disposable Income",
    "High Priest of \"Take My Money\"",
    "Warlock of the Wallet",
    "Grandmaster of the Grind Skip",
    "Hero of the Hosting Fees",
    "Champion of Server Uptime",
    "Mythic Sponsor of Spaghetti Code",
    "Demigod of Daily Active Users",
    "Overlord of the Overhead",
    "Avatar of the Indie Dream",
    "The Actual Main Character"
];

export const PATRON_EXP_CAPS = [
    0, 1, 2.5, 6, 12, 18, 27, 38, 60, 110, 170, 250, 350, 450, 600, 800, 1050, 1350, 1750, 2250, 3000
];

export function getPatronRank(exp: number = 0): number {
    let rank = 0;
    for (let i = 1; i <= 20; i++) {
        if (exp >= PATRON_EXP_CAPS[i]) {
            rank = i;
        } else {
            break;
        }
    }
    return rank;
}

export function getPatronStats(rank: number) {
    const stats = {
        hp: 0, goldBonus: 0, dmg: 0, challengeCostReduction: 0,
        attackSpeed: 0, critDmg: 0, barrage: 0, streakProtect: 0,
        hpPct: 0, critRate: 0, skillExp: 0, stun: 0, heal: 0, undieable: 0
    };

    if (rank >= 1) {
        stats.hp = 15 + (rank - 1) * ((6666 - 15) / 19);
        stats.goldBonus = 6 + (rank - 1) * ((273 - 6) / 19);
    }
    if (rank >= 2) {
        stats.dmg = 2 + (rank - 2) * ((222 - 2) / 18);
        stats.challengeCostReduction = 1.5 + (rank - 2) * ((33 - 1.5) / 18);
    }
    if (rank >= 3) {
        stats.attackSpeed = 1 + (rank - 3) * ((25 - 1) / 17);
        stats.critDmg = 4 + (rank - 3) * ((88 - 4) / 17);
    }
    if (rank >= 4) {
        stats.barrage = 2 + (rank - 4) * ((9.5 - 2) / 16);
        stats.streakProtect = 3 + (rank - 4) * ((14 - 3) / 16);
    }
    if (rank >= 5) {
        stats.hpPct = 2 + (rank - 5) * ((44 - 2) / 15);
        stats.critRate = 3 + (rank - 5) * ((33 - 3) / 15);
    }
    if (rank >= 6) {
        stats.skillExp = 2 + (rank - 6) * ((22 - 2) / 14);
    }
    if (rank >= 7) {
        stats.stun = 0.25 + (rank - 7) * ((2.3 - 0.25) / 13);
        stats.heal = 0.4 + (rank - 7) * ((3.3 - 0.4) / 13); // Revive Speed
    }
    if (rank >= 9) {
        stats.undieable = 5 + (rank - 9) * ((22 - 5) / 11);
    }

    return stats;
}

export const FALLBACK_ENEMY_IMAGES = [
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/G1.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/G2.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/S1.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/S2.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/O1.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/O2.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/P1.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/P2.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/B1.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/B2.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/D1.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/D2.png',
  'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/U1.png'
];

export const getEnemyImageUrl = (imageStr: string | undefined, fallbackIndex: number = 0): string => {
    if (!imageStr) return FALLBACK_ENEMY_IMAGES[fallbackIndex % FALLBACK_ENEMY_IMAGES.length];
    if (imageStr.startsWith('http') || imageStr.startsWith('data:')) return imageStr;
    return `https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/${imageStr}.png`;
};

export const getEquipmentItemImageUrl = (itemName: string, rank: RarityType): string => {
    return `https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EquipmentImages/${rank}/${encodeURIComponent(itemName)}.png`;
};

export const getEquipmentAuraUrl = (rank: RarityType): string | null => {
    if (rank === RarityType.WORLD) return `https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EquipmentImages/AURA/World.png`;
    if (rank === RarityType.EPIC) return `https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EquipmentImages/AURA/Epic.png`;
    if (rank === RarityType.LEGENDARY) return `https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EquipmentImages/AURA/Legendary.png`;
    if (rank === RarityType.GOD) return `https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EquipmentImages/AURA/God.png`;
    return null;
};

export const getEquipmentWorldPlusAuraUrl = (): string => {
    return `https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EquipmentImages/AURA/WorldPlus.png`;
};

export const getConsumableImageUrl = (itemName?: string): string | null => {
    if (!itemName) return null;
    const name = itemName.toLowerCase();
    const map: Record<string, string> = {
        'chashuu ramen without chashuu': 'Chashuu%20Ramen%20without%20Chashuu.png',
        'chashuu ramen': 'Chashuu%20Ramen%20without%20Chashuu.png',
        'chuuka ramen with a lot of sticky unknown white broth': 'Chuuka%20Ramen%20with%20a%20LOT%20of%20Sticky%20Unknown%20White%20Broth.png',
        'chuuka ramen': 'Chuuka%20Ramen%20with%20a%20LOT%20of%20Sticky%20Unknown%20White%20Broth.png',
        'disgusting shoyu ramen': 'Disgusting%20Shoyu%20Ramen.png',
        'shoyu ramen': 'Disgusting%20Shoyu%20Ramen.png',
        'frozen flame': 'Frozen%20Flame.png',
        'men katame no miso ramen': 'Men%20Katame%20no%20Miso%20Ramen.png',
        'miso ramen': 'Men%20Katame%20no%20Miso%20Ramen.png',
        'misery box+1': 'Misery%20Box.png',
        'misery box+2': 'Misery%20Box.png',
        'misery box+3': 'Misery%20Box.png',
        'misery box': 'Misery%20Box.png',
        'sshs-super slippy holed soap': 'SSHS-Super%20Slippy%20Holed%20Soap.png',
        '[sshs] super slippy holed soap': 'SSHS-Super%20Slippy%20Holed%20Soap.png',
        'sss-stiff and spiky soap': 'SSS-Stiff%20and%20Spiky%20Soap.png',
        '[sss] stiff and spiky soap': 'SSS-Stiff%20and%20Spiky%20Soap.png',
        'sweet shio ramen': 'Sweet%20Shio%20Ramen.png',
        'shio ramen': 'Sweet%20Shio%20Ramen.png',
        'unthrowable glove': 'Unthrowable%20Glove.png',
        'patron blessing': 'World%20Developer%20Blessing.png',
        'world developer blessing': 'World%20Developer%20Blessing.png',
        'philosopher stone': 'The%20Philosopher%20Stone.png',
        'the philosopher stone': 'The%20Philosopher%20Stone.png'
    };
    const filename = map[name];
    if (!filename) return null;
    return `https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/ConsumablesImages/${filename}`;
};

export const getPlayerBaseStats = (level: number) => {
    // Linear interpolation: start + ((level - 1) * (end - start) / 999)
    const lerp = (start: number, end: number) => {
        if (level <= 1) return start;
        if (level >= 1000) return end;
        return start + ((level - 1) * (end - start) / 999);
    };

    return {
        critRate: lerp(1, 20),      // 1% -> 20%
        attackSpeed: lerp(0, 15),   // 0% -> 15%
        heal: lerp(1, 3),           // 1% -> 3%
        block: lerp(1, 5),          // 1% -> 5%
        stun: lerp(1, 5),           // 1% -> 5%
        barrage: lerp(1, 5)         // 1% -> 5%
    };
};

export const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    if (num < 0) return '-' + formatNumber(Math.abs(num));

    // For extremely large numbers, use scientific notation (like the shop default)
    if (num >= 1e15) {
        return num.toExponential(2).replace('+', '');
    }
    
    // Billions
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
    }
    
    // Millions
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
    }
    
    // Thousands (only truncate if > 10k to keep small numbers precise)
    if (num >= 10_000) {
        return (Math.floor(num) / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    }

    return Math.floor(num).toLocaleString('en-US');
};

// --- External Data URLs ---
export const MASTER_CHALLENGE_URL = "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/ChallengeData/CHALLENGE_LINK.txt";

export const EQUIPMENT_DATA_URL = "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EquipmentData/Equipments.txt";
export const CONSUMABLES_DATA_URL = "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/ConsumablesData/Consumables.txt";

export const CUSTOM_ITEMS_DATA = `
[SLOT:Body]
[NAME:Divine Dress of Dimensional Dashes]
[RANK:God]
[COST:32000000]
[MAINSTAT:Health Percentile +82.0%]
[SUBSTAT1:Dmg +50]
[SUBSTAT2:Gold +18%]
[SUBSTAT3:CritRate +14%]
[SUBSTAT4:Speed +10%]
[SUBSTAT5:Chance Undieable Challenge 6%]
[SUBSTAT6:HP +600]
[DESCRIPTION:Steps between realities to find the one where you're not late. Usually the 347th try.]
[END]
`;

// --- Rank System Logic ---
export const RANKS = ['Novice', 'Apprentice', 'Professional', 'Expert', 'Master', 'Grandmaster', 'Legend', 'Mythic', 'Transcendent'];

export const RANK_IMAGES: Record<string, string> = {
    'Novice': 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/RankImages/Novice.png',
    'Apprentice': 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/RankImages/Apprentice.png',
    'Professional': 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/RankImages/Professional.png',
    'Expert': 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/RankImages/Expert.png',
    'Master': 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/RankImages/Master.png',
    'Grandmaster': 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/RankImages/Grandmaster.png',
    'Legend': 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/RankImages/Legend.png',
    'Mythic': 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/RankImages/Mythic.png',
    'Transcendent': 'https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/RankImages/Transcendent.png',
};

// Primary and Secondary (Background/Light) colors
const RANK_COLORS_HEX: Record<string, { p: string, s: string }> = {
    'Novice': { p: '#4A90E2', s: '#A0CFFF' },
    'Apprentice': { p: '#50E3C2', s: '#B2F5E9' },
    'Professional': { p: '#F5A623', s: '#FFE3A0' },
    'Expert': { p: '#9013FE', s: '#D1B3FF' },
    'Master': { p: '#D0021B', s: '#FFB3B3' },
    'Grandmaster': { p: '#C21807', s: '#FF9999' },
    'Legend': { p: '#E94E77', s: '#FFD6D6' },
    'Mythic': { p: '#F8E71C', s: '#FFF6A0' },
    'Transcendent': { p: '#B3E5FC', s: '#E1F5FE' }
};

export const getRankName = (level: number): string => {
  if (level <= 10) return 'Novice';
  if (level <= 30) return 'Apprentice';
  if (level <= 60) return 'Professional';
  if (level <= 100) return 'Expert';
  if (level <= 200) return 'Master';
  if (level <= 400) return 'Grandmaster';
  if (level <= 700) return 'Legend';
  if (level <= 999) return 'Mythic';
  return 'Transcendent';
};

export const getRankImage = (level: number): string => {
    return RANK_IMAGES[getRankName(level)];
};

export const getLoginExpMultiplier = (rankName: string): number => {
    const multipliers: Record<string, number> = {
        'Novice': 1.0,
        'Apprentice': 1.15,
        'Professional': 1.4,
        'Expert': 2.0,
        'Master': 2.5,
        'Grandmaster': 3.0,
        'Legend': 4.0,
        'Mythic': 6.0,
        'Transcendent': 10.0
    };
    return multipliers[rankName] || 1.0;
};

export const getLoginGoldMultiplier = (rankName: string): number => {
    const multipliers: Record<string, number> = {
        'Novice': 1,
        'Apprentice': 15,
        'Professional': 50,
        'Expert': 150,
        'Master': 400,
        'Grandmaster': 800,
        'Legend': 1500,
        'Mythic': 2200,
        'Transcendent': 3000
    };
    return multipliers[rankName] || 4;
};

export const getLoginPatronExp = (day: number): number => {
    const cycleDay = ((day - 1) % 7) + 1;
    if (cycleDay <= 3) return 0.3;
    if (cycleDay <= 5) return 0.4;
    if (cycleDay === 6) return 0.5;
    return 0.6;
};

export const getBaseLoginRewards = (day: number) => {
    const cycleDay = ((day - 1) % 7) + 1;
    const baseExp = cycleDay * 50 + (cycleDay === 7 ? 200 : 0);
    const baseGold = cycleDay * 10 + (cycleDay === 7 ? 100 : 0);
    return { baseExp, baseGold };
};

export const getQuestRewards = (quest: Quest, totalLevel: number) => {
    const rankName = getRankName(totalLevel);
    const rankMultiplier = getLoginGoldMultiplier(rankName);
    const gold = quest.rewardGold * rankMultiplier;
    
    let patronExp = 0;
    let profileExp = 0;
    
    if (quest.category === 'MAIN') {
        patronExp = 0.25;
        // 50 + (difficulty - 1) * 62.5
        profileExp = 50 + ((quest.difficulty || 1) - 1) * 62.5;
    } else if (quest.category === 'WEEKLY') {
        patronExp = 0.25;
    }
    
    return { gold, patronExp, profileExp };
};

export const getRankBonus = (rankName: string): number => {
    const index = RANKS.indexOf(rankName);
    if (index === -1) return 0.5;
    // Base 0.5, +0.1 per rank roughly
    return parseFloat((0.5 + (index * 0.1)).toFixed(1));
};

export const getChallengeCost = (targetRank: string, currentGold: number, skillName?: string) => {
    if (skillName === "Fry Pan Meister") {
        return {
            base: 0,
            fee: 0,
            total: 0
        };
    }

    let baseCost = 50;
    let percent = 0.10;

    switch (targetRank) {
        case 'Novice': baseCost = 50; percent = 0.10; break;
        case 'Apprentice': baseCost = 500; percent = 0.15; break;
        case 'Professional': baseCost = 1500; percent = 0.20; break;
        case 'Expert': baseCost = 6000; percent = 0.25; break;
        case 'Master': baseCost = 15000; percent = 0.35; break;
        case 'Grandmaster': baseCost = 30000; percent = 0.45; break;
        case 'Legend': baseCost = 150000; percent = 0.60; break;
        case 'Mythic': baseCost = 600000; percent = 0.75; break;
        case 'Transcendent': baseCost = 1000000; percent = 0.99; break;
    }

    const fee = Math.floor(currentGold * percent);
    return {
        base: baseCost,
        fee: fee,
        total: baseCost + fee
    };
};

export const getRankColor = (level: number): string => {
  const name = getRankName(level);
  const colors = RANK_COLORS_HEX[name] || RANK_COLORS_HEX['Novice'];
  
  // Tailwind arbitrary values for specific hex codes
  // Structure: text-[HEX] border-[HEX] bg-[HEX]/opacity
  let base = `text-[${colors.p}] border-[${colors.p}] bg-[${colors.s}]/20 shadow-[0_0_10px_${colors.p}40]`; // 40 is hex alpha ~25%
  
  if (level > 700) base += ' animate-pulse';
  return base;
};

export const CONSUMABLE_DATA: Record<string, { name: string; description: string; icon: string; rarity: string; dailyLimit?: number; weeklyLimit?: number }> = {
    'philosopher_stone': {
        name: 'Philosopher Stone',
        description: 'A mysterious stone used for enchanting equipment.',
        icon: 'Sparkles',
        rarity: 'Legendary'
    },
    'frozen_flame': {
        name: 'Frozen Flame',
        description: 'Freeze the streak: next non-login will not break day streak and daily login bonus streak. Usable 1x/week.',
        icon: 'Flame',
        rarity: 'Epic',
        weeklyLimit: 1
    },
    'sss_soap': {
        name: '[SSS] Stiff and Spiky Soap',
        description: 'Next train session > 30m: 2x EXP. If < 30m: 0 EXP. Usable 1-3x/day based on rank.',
        icon: 'Zap',
        rarity: 'Rare',
        dailyLimit: 1
    },
    'misery_box_1': {
        name: 'Misery Box+1',
        description: 'Gain +15 profile EXP or lose -10 profile EXP (cannot level down).',
        icon: 'Gift',
        rarity: 'Uncommon'
    },
    'misery_box_2': {
        name: 'Misery Box+2',
        description: 'Gain +75 profile EXP or lose -50 profile EXP (cannot level down).',
        icon: 'Gift',
        rarity: 'Rare'
    },
    'misery_box_3': {
        name: 'Misery Box+3',
        description: 'Gain +300 profile EXP or lose -200 profile EXP (cannot level down).',
        icon: 'Gift',
        rarity: 'Epic'
    },
    'patron_blessing': {
        name: 'Patron Blessing',
        description: 'Gain +1 Patron EXP. Max 2 uses per day.',
        icon: 'Crown',
        rarity: 'Epic',
        dailyLimit: 2
    },
    'isekai_credit_card': {
        name: 'Isekai Credit Card',
        description: 'Receive 2x gold of price. Pay back 1x-4x tomorrow based on training time.',
        icon: 'Coins',
        rarity: 'Rare'
    },
    'miso_ramen': {
        name: 'Miso Ramen',
        description: 'Gain +20% max health percentile for 1 day. Usable 1x/day.',
        icon: 'Coffee',
        rarity: 'Common',
        dailyLimit: 1
    },
    'shio_ramen': {
        name: 'Shio Ramen',
        description: 'Gain +15% ASPD for 1 day. Usable 1x/day.',
        icon: 'Coffee',
        rarity: 'Common',
        dailyLimit: 1
    },
    'shoyu_ramen': {
        name: 'Shoyu Ramen',
        description: 'Gain +10% Crit Rate for 1 day. Usable 1x/day.',
        icon: 'Coffee',
        rarity: 'Common',
        dailyLimit: 1
    },
    'chashuu_ramen': {
        name: 'Chashuu Ramen',
        description: 'Gain +6% Block for 1 day. Usable 1x/day.',
        icon: 'Coffee',
        rarity: 'Common',
        dailyLimit: 1
    },
    'chuuka_ramen': {
        name: 'Chuuka Ramen',
        description: 'Gain +2% Revive Speed for 1 day. Usable 1x/day.',
        icon: 'Coffee',
        rarity: 'Uncommon',
        dailyLimit: 1
    },
    'ichiban_shibori': {
        name: 'Ichiban Shibori',
        description: 'Gain +3% Undying for 1 day. Usable 1x/day.',
        icon: 'Volume2',
        rarity: 'Uncommon',
        dailyLimit: 1
    },
    'sshs_soap': {
        name: '[SSHS] Super Slippy Holed Soap',
        description: 'Massive buffs (+9% barrage, 20% crit dmg, +30 dmg, 25% aspd) but -25% block, undying, skill exp for 1 day.',
        icon: 'Shield',
        rarity: 'Epic',
        dailyLimit: 1
    }
};

export const getRarityColor = (rarity: RarityType): string => {
    switch (rarity) {
        case RarityType.COMMON: return 'text-slate-400 border-slate-600 bg-slate-800';
        case RarityType.UNCOMMON: return 'text-green-400 border-green-600 bg-green-900/20';
        case RarityType.RARE: return 'text-blue-400 border-blue-600 bg-blue-900/20';
        case RarityType.EPIC: return 'text-purple-400 border-purple-600 bg-purple-900/20';
        case RarityType.LEGENDARY: return 'text-orange-400 border-orange-600 bg-orange-900/20 shadow-orange-500/20';
        case RarityType.GOD: return 'text-red-500 border-red-600 bg-red-950/40 shadow-red-500/30 animate-pulse';
        case RarityType.WORLD: return 'text-yellow-400 border-yellow-500 bg-yellow-950/50 shadow-yellow-500/40 animate-pulse';
        default: return 'text-slate-400';
    }
};

// --- Enemy Logic ---
export const getEnemyBaseHp = (id: number) => {
    const baseHp = 50 + (id * 30);
    const baseGold = 5 + (id * 3);
    return { hp: baseHp, baseGold };
};

// --- Achievements ---
export const ACHIEVEMENTS_LIST: Achievement[] = [
    // --- BRONZE (Easy / Mocking) ---
    { id: 'a1', name: 'Bare Minimum', description: 'Complete 1 session.', flavorText: 'Wow, you did one thing. Do you want a cookie?', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Zap', conditionType: 'total_sessions', conditionValue: 1 },
    { id: 'a2', name: 'Participation Trophy', description: 'Reach Level 2.', flavorText: 'You exist. Good job.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'User', conditionType: 'level', conditionValue: 2 },
    { id: 'a3', name: 'Wallet Inspector', description: 'Spend your first gold.', flavorText: 'Capitalism has entered the chat.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Coins', conditionType: 'spend_gold', conditionValue: 1 }, 
    { id: 'a4', name: 'Touch Grass', description: 'Log 0 hours for 24 hours.', flavorText: 'Finally, you went outside. Or you died.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Sun', conditionType: 'streak', conditionValue: 0 }, 
    { id: 'a5', name: 'Baby Steps', description: 'Reach a 3-day streak.', flavorText: 'Three days? That\'s almost a habit. Almost.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Flame', conditionType: 'streak', conditionValue: 3 },
    { id: 'a6', name: 'Window Shopper', description: 'Visit the shop 10 times consecutively without buying.', flavorText: 'Are you going to buy something or just stare?', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Eye', conditionType: 'other', conditionValue: 10 }, 
    { id: 'a7', name: 'Failed Scholar', description: 'Fail a challenge.', flavorText: 'F is for Friends who do stuff together... like failing.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'XCircle', conditionType: 'other', conditionValue: 1 }, 
    { id: 'a8', name: 'Hoarder', description: 'Accumulate 500 Gold.', flavorText: 'Saving for a rainy day or just stingy?', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Archive', conditionType: 'other', conditionValue: 500 },
    { id: 'a9', name: 'Fashion Victim', description: 'Equip an item in every slot.', flavorText: 'You look ridiculous, but the stats are nice.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Shirt', conditionType: 'other', conditionValue: 5 },
    { id: 'a10', name: 'Short Attention Span', description: 'Complete a session < 10 mins.', flavorText: 'That was quick. Disappointingly quick.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Clock', conditionType: 'single_session', conditionValue: 5 },
    { id: 'a11', name: 'Clicker Hero', description: 'Complete 50 sessions.', flavorText: 'Your finger must be very tired.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'MousePointer', conditionType: 'total_sessions', conditionValue: 50 },
    { id: 'a12', name: 'Night Owl', description: 'Train between 2 AM and 5 AM.', flavorText: 'Who needs sleep when you have anxiety?', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Moon', conditionType: 'other', conditionValue: 1 },
    { id: 'a13', name: 'Jack of All Trades', description: 'Unlock 3 different skills.', flavorText: 'Master of none, clearly.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Layers', conditionType: 'other', conditionValue: 3 },
    { id: 'a14', name: 'Quitter', description: 'Cancel a Timer session early.', flavorText: 'I expected nothing and I\'m still disappointed.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'LogOut', conditionType: 'other', conditionValue: 1 },
    { id: 'a15', name: 'Gold Digger', description: 'Earn gold from a quest.', flavorText: 'Doing chores for money. Classic.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Search', conditionType: 'other', conditionValue: 1 },

    // --- SILVER (Moderate / Sarcastic) ---
    { id: 'a16', name: 'Mediocrity Achieved', description: 'Reach Level 20.', flavorText: 'You are now average. Congratulations.', unlocked: false, tier: AchievementTier.SILVER, icon: 'UserCheck', conditionType: 'level', conditionValue: 20 },
    { id: 'a17', name: 'One Week Wonder', description: '7-day streak.', flavorText: 'A whole week? Who are you trying to impress?', unlocked: false, tier: AchievementTier.SILVER, icon: 'Calendar', conditionType: 'streak', conditionValue: 7 },
    { id: 'a18', name: 'Time Waster', description: 'Log 24 total hours.', flavorText: 'A full day of your life, gone forever.', unlocked: false, tier: AchievementTier.SILVER, icon: 'Clock', conditionType: 'total_hours', conditionValue: 24 },
    { id: 'a19', name: 'Grindset Mindset', description: 'Complete 100 sessions.', flavorText: 'Please go drink some water.', unlocked: false, tier: AchievementTier.SILVER, icon: 'Activity', conditionType: 'total_sessions', conditionValue: 100 },
    { id: 'a20', name: 'Consumerism', description: 'Buy 5 items.', flavorText: 'Filling the void with digital objects.', unlocked: false, tier: AchievementTier.SILVER, icon: 'ShoppingBag', conditionType: 'other', conditionValue: 5 },
    { id: 'a21', name: 'Knowledge Hoarder', description: 'Unlock 50 Library entries.', flavorText: 'Nerd.', unlocked: false, tier: AchievementTier.SILVER, icon: 'BookOpen', conditionType: 'other', conditionValue: 50 },
    { id: 'a22', name: 'Critical Hit', description: 'Land a critical hit in training.', flavorText: 'Pure luck, no skill involved.', unlocked: false, tier: AchievementTier.SILVER, icon: 'Target', conditionType: 'other', conditionValue: 1 },
    { id: 'a23', name: 'Broke', description: 'Have less than 5 gold (but > 0).', flavorText: 'Financial planning isn\'t your strong suit.', unlocked: false, tier: AchievementTier.SILVER, icon: 'TrendingDown', conditionType: 'other', conditionValue: 1 },
    { id: 'a24', name: 'Overqualified', description: 'Reach skill level 30 on one skill.', flavorText: 'Time to put this on your CV. Just kidding.', unlocked: false, tier: AchievementTier.SILVER, icon: 'Award', conditionType: 'other', conditionValue: 30 },
    { id: 'a25', name: 'Quest Hunter', description: 'Complete 10 quests.', flavorText: 'Good dog.', unlocked: false, tier: AchievementTier.SILVER, icon: 'CheckSquare', conditionType: 'other', conditionValue: 10 },
    { id: 'a26', name: 'Iron Bladder', description: 'Complete a 120m session.', flavorText: 'Your kidneys hate you.', unlocked: false, tier: AchievementTier.SILVER, icon: 'Droplet', conditionType: 'single_session', conditionValue: 120 },
    { id: 'a27', name: 'Glass Cannon', description: 'Have more than 100 Base DMG.', flavorText: 'Living on the edge of failure.', unlocked: false, tier: AchievementTier.SILVER, icon: 'Zap', conditionType: 'other', conditionValue: 100 },
    { id: 'a28', name: 'Sunk Cost Fallacy', description: 'Spend 5000 Gold total.', flavorText: 'You can\'t stop now, you\'ve invested too much.', unlocked: false, tier: AchievementTier.SILVER, icon: 'DollarSign', conditionType: 'spend_gold', conditionValue: 5000 },
    { id: 'a29', name: 'Double Digits', description: 'Reach Level 50.', flavorText: 'Halfway to 100. Which is still low.', unlocked: false, tier: AchievementTier.SILVER, icon: 'TrendingUp', conditionType: 'level', conditionValue: 50 },
    { id: 'a30', name: 'Social Recluse', description: 'Log 50 hours in one week.', flavorText: 'Do you remember what the sun looks like?', unlocked: false, tier: AchievementTier.SILVER, icon: 'Home', conditionType: 'other', conditionValue: 50 },

    // --- GOLD (Hard / Cynical) ---
    { id: 'a31', name: 'No Life', description: 'Reach Level 100.', flavorText: 'Imagine if you put this effort into a relationship.', unlocked: false, tier: AchievementTier.GOLD, icon: 'Crown', conditionType: 'level', conditionValue: 100 },
    { id: 'a32', name: 'Addict', description: '30-day streak.', flavorText: 'The first step is admitting you have a problem.', unlocked: false, tier: AchievementTier.GOLD, icon: 'Flame', conditionType: 'streak', conditionValue: 30 },
    { id: 'a33', name: 'Century Club', description: 'Log 100 total hours.', flavorText: '100 hours. You could have learned a language.', unlocked: false, tier: AchievementTier.GOLD, icon: 'Clock', conditionType: 'total_hours', conditionValue: 100 },
    { id: 'a34', name: 'Whale', description: 'Spend 20,000 Gold.', flavorText: 'Single-handedly funding the virtual economy.', unlocked: false, tier: AchievementTier.GOLD, icon: 'CreditCard', conditionType: 'spend_gold', conditionValue: 20000 },
    { id: 'a35', name: 'Walking Encyclopedia', description: 'Unlock 200 Library entries.', flavorText: 'Useless trivia obtained.', unlocked: false, tier: AchievementTier.GOLD, icon: 'Book', conditionType: 'other', conditionValue: 200 },
    { id: 'a36', name: 'Perfectionist', description: 'Complete all Daily Quests for 7 days.', flavorText: 'Compulsive behavior detected.', unlocked: false, tier: AchievementTier.GOLD, icon: 'CheckCircle', conditionType: 'other', conditionValue: 7 },
    { id: 'a37', name: 'Skill Issue', description: 'Fail 10 challenges.', flavorText: 'Maybe this isn\'t for you.', unlocked: false, tier: AchievementTier.GOLD, icon: 'Skull', conditionType: 'other', conditionValue: 10 },
    { id: 'a38', name: 'God Complex', description: 'Equip a GOD tier item.', flavorText: 'It won\'t fill the hole in your heart.', unlocked: false, tier: AchievementTier.GOLD, icon: 'Sun', conditionType: 'other', conditionValue: 1 },
    { id: 'a39', name: 'Terminally Online', description: 'Reach a 60-day streak.', flavorText: 'Please, touch grass. I beg you.', unlocked: false, tier: AchievementTier.GOLD, icon: 'Wifi', conditionType: 'streak', conditionValue: 60 },
    { id: 'a40', name: 'Master Grinder', description: '1000 Total Sessions.', flavorText: 'Repetitive strain injury inbound.', unlocked: false, tier: AchievementTier.GOLD, icon: 'Repeat', conditionType: 'total_sessions', conditionValue: 1000 },
    { id: 'a41', name: 'Millionaire (Almost)', description: 'Hold 50,000 Gold.', flavorText: 'Rich in game, poor in reality.', unlocked: false, tier: AchievementTier.GOLD, icon: 'Briefcase', conditionType: 'other', conditionValue: 50000 },
    { id: 'a42', name: 'Polymath', description: '5 Skills at Level 50+.', flavorText: 'Jack of all trades, still broke.', unlocked: false, tier: AchievementTier.GOLD, icon: 'Hexagon', conditionType: 'other', conditionValue: 5 },
    { id: 'a43', name: 'Unstoppable', description: 'Gain 1000 EXP in a single session.', flavorText: 'Absolute unit.', unlocked: false, tier: AchievementTier.GOLD, icon: 'LifeBuoy', conditionType: 'single_session', conditionValue: 1000 },
    { id: 'a44', name: 'Overkill', description: 'Do 500% DMG in one hit.', flavorText: 'Stop, he\'s already dead!', unlocked: false, tier: AchievementTier.GOLD, icon: 'Sword', conditionType: 'other', conditionValue: 500 },
    { id: 'a45', name: 'Automation', description: 'Use a macro? (Suspected).', flavorText: 'We are watching you.', unlocked: false, tier: AchievementTier.GOLD, icon: 'Cpu', conditionType: 'other', conditionValue: 999 },

    // --- PLATINUM (Very Hard / Nihilistic) ---
    { id: 'a46', name: 'Ascended', description: 'Reach Level 500.', flavorText: 'You have transcended the need for a social life.', unlocked: false, tier: AchievementTier.PLATINUM, icon: 'Star', conditionType: 'level', conditionValue: 500 },
    { id: 'a47', name: 'Year of the Cat', description: '365-day streak.', flavorText: 'A whole year. Why?', unlocked: false, tier: AchievementTier.PLATINUM, icon: 'Calendar', conditionType: 'streak', conditionValue: 365 },
    { id: 'a48', name: '10,000 Hour Rule', description: 'Log 10,000 hours.', flavorText: 'You are now an expert at sitting.', unlocked: false, tier: AchievementTier.PLATINUM, icon: 'Watch', conditionType: 'total_hours', conditionValue: 10000 },
    { id: 'a49', name: 'Hoard Lord', description: 'Buy every item in the shop.', flavorText: 'There is nothing left to consume.', unlocked: false, tier: AchievementTier.PLATINUM, icon: 'Package', conditionType: 'other', conditionValue: 1 },
    { id: 'a50', name: 'Grand Archivist', description: 'Unlock 100% of the library.', flavorText: 'You know everything, yet understand nothing.', unlocked: false, tier: AchievementTier.PLATINUM, icon: 'Database', conditionType: 'other', conditionValue: 100 },
    { id: 'a51', name: 'Mythic Being', description: 'Reach Rank "Mythic".', flavorText: 'Do people bow when you walk by? No? Shame.', unlocked: false, tier: AchievementTier.PLATINUM, icon: 'Award', conditionType: 'level', conditionValue: 701 },
    { id: 'a52', name: 'Economic Collapse', description: 'Hold 1,000,000 Gold.', flavorText: 'Causing inflation in a fictional world.', unlocked: false, tier: AchievementTier.PLATINUM, icon: 'Globe', conditionType: 'other', conditionValue: 1000000 },
    { id: 'a53', name: 'One Punch', description: 'Defeat an enemy in 1 second.', flavorText: 'Boring fight.', unlocked: false, tier: AchievementTier.PLATINUM, icon: 'Zap', conditionType: 'other', conditionValue: 1 },
    { id: 'a54', name: 'Immortal', description: 'Prevent streak loss 10 times.', flavorText: 'You just refuse to accept consequences.', unlocked: false, tier: AchievementTier.PLATINUM, icon: 'Shield', conditionType: 'other', conditionValue: 10 },
    { id: 'a55', name: 'Developer?', description: 'Use the Dev Console.', flavorText: 'Hacking the matrix, or just following a tutorial?', unlocked: false, tier: AchievementTier.PLATINUM, icon: 'Terminal', conditionType: 'other', conditionValue: 1 },

    // --- DIAMOND (Impossible / Absurd) ---
    { id: 'a56', name: 'The Chosen One', description: 'Reach Level 1000.', flavorText: 'Go outside. Immediately.', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'Sun', conditionType: 'level', conditionValue: 1000 },
    { id: 'a57', name: 'Time Lord', description: 'Log time in the future.', flavorText: 'Stop messing with the system clock.', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'RefreshCw', conditionType: 'other', conditionValue: 1 },
    { id: 'a58', name: 'Completionist', description: 'Unlock all achievements.', flavorText: 'Now what?', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'CheckCircle', conditionType: 'other', conditionValue: 100 },
    { id: 'a59', name: 'Existential Crisis', description: 'Stare at the stats screen for 10 mins.', flavorText: 'Thinking about your life choices?', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'Eye', conditionType: 'other', conditionValue: 10 },
    { id: 'a60', name: 'Broken Mouse', description: 'Click 1 million times.', flavorText: 'RSI is real.', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'Mouse', conditionType: 'other', conditionValue: 1000000 },
    { id: 'a61', name: 'Glitch in the Matrix', description: 'Undefined behavior.', flavorText: 'You broke something, didn\'t you?', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'AlertTriangle', conditionType: 'other', conditionValue: 999 },
    { id: 'a62', name: 'Sugar Daddy', description: 'Tip > $450 to support dev.', flavorText: 'It\'s the thought (and money) that counts.', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'Heart', conditionType: 'other', conditionValue: 450 },
    { id: 'a63', name: 'Speedrunner', description: 'Reach Level 10 in 1 hour.', flavorText: 'Slow down, Sonic.', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'FastForward', conditionType: 'other', conditionValue: 1 },
    { id: 'a64', name: 'Zen Master', description: 'Complete 10 sessions of >30m in Focus mode.', flavorText: 'Inner peace achieved.', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'Flag', conditionType: 'other', conditionValue: 10 },
    { id: 'a65', name: 'Collector', description: 'Own 100 unique items.', flavorText: 'Your inventory is a mess.', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'Box', conditionType: 'other', conditionValue: 100 },
    { id: 'a66', name: 'The End', description: 'Reach the end of the content.', flavorText: 'Thanks for playing. Now get back to work.', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'X', conditionType: 'other', conditionValue: 999 },

    // --- QUEST ACHIEVEMENTS ---
    { id: 'q1', name: 'Quest Novice', description: 'Complete 10 quests.', flavorText: 'Just getting started.', unlocked: false, tier: AchievementTier.BRONZE, icon: 'CheckSquare', conditionType: 'other', conditionValue: 10 },
    { id: 'q2', name: 'Quest Apprentice', description: 'Complete 50 quests.', flavorText: 'Chore master.', unlocked: false, tier: AchievementTier.SILVER, icon: 'CheckSquare', conditionType: 'other', conditionValue: 50 },
    { id: 'q3', name: 'Quest Master', description: 'Complete 100 quests.', flavorText: 'Do you ever rest?', unlocked: false, tier: AchievementTier.GOLD, icon: 'CheckSquare', conditionType: 'other', conditionValue: 100 },
    { id: 'q4', name: 'Quest Legend', description: 'Complete 500 quests.', flavorText: 'A legend of labor.', unlocked: false, tier: AchievementTier.PLATINUM, icon: 'CheckSquare', conditionType: 'other', conditionValue: 500 },
    { id: 'q5', name: 'Quest God', description: 'Complete 1000 quests.', flavorText: 'Atlas shrugged, you kept working.', unlocked: false, tier: AchievementTier.DIAMOND, icon: 'CheckSquare', conditionType: 'other', conditionValue: 1000 },

    // --- SUPPORT ACHIEVEMENTS ---
    { id: 's1', name: 'Supporter', description: 'Send any tip.', flavorText: 'Thank you!', unlocked: false, tier: AchievementTier.BRONZE, icon: 'Heart', conditionType: 'other', conditionValue: 1 },
    { id: 's2', name: 'Patron', description: 'Tip total $10+.', flavorText: 'A true patron of the arts (code).', unlocked: false, tier: AchievementTier.SILVER, icon: 'Heart', conditionType: 'other', conditionValue: 10 },
    { id: 's3', name: 'Angel', description: 'Tip total $100+.', flavorText: 'Are you real?', unlocked: false, tier: AchievementTier.GOLD, icon: 'Heart', conditionType: 'other', conditionValue: 100 },
];

// --- Quests ---
export const MAIN_QUESTS: Quest[] = [
    {
        id: 'mq_1',
        title: 'The Journey Begins',
        description: 'Reach Profile Level 2.',
        category: 'MAIN',
        minLevel: 1,
        rewardGold: 100,
        difficulty: 1,
        steps: [{ id: 's1', description: 'Level Up', target: 2, current: 0, type: 'level' }],
        isCompleted: false,
        isClaimed: false
    },
    {
        id: 'mq_2',
        title: 'Apprentice',
        description: 'Reach Profile Level 5.',
        category: 'MAIN',
        minLevel: 2,
        rewardGold: 250,
        difficulty: 2,
        steps: [{ id: 's2', description: 'Level Up', target: 5, current: 0, type: 'level' }],
        isCompleted: false,
        isClaimed: false
    },
    {
        id: 'mq_3',
        title: 'Dedicated',
        description: 'Maintain a 3-day streak.',
        category: 'MAIN',
        minLevel: 1,
        rewardGold: 150,
        difficulty: 2,
        steps: [{ id: 's3', description: 'Streak', target: 3, current: 0, type: 'streak' }],
        isCompleted: false,
        isClaimed: false
    }
];

const DAILY_POOL: Quest[] = [
    { id: 'dq_1', title: 'Morning Focus', description: 'Complete 30 minutes of training.', category: 'DAILY', rewardGold: 50, steps: [{ id: 'ds1', description: 'Minutes', target: 30, current: 0, type: 'minutes' }], isCompleted: false, isClaimed: false },
    { id: 'dq_2', title: 'Quick Session', description: 'Complete 1 session.', category: 'DAILY', rewardGold: 30, steps: [{ id: 'ds2', description: 'Sessions', target: 1, current: 0, type: 'sessions' }], isCompleted: false, isClaimed: false },
    { id: 'dq_3', title: 'Deep Work', description: 'Complete 60 minutes of training.', category: 'DAILY', rewardGold: 80, steps: [{ id: 'ds3', description: 'Minutes', target: 60, current: 0, type: 'minutes' }], isCompleted: false, isClaimed: false },
];

const WEEKLY_POOL: Quest[] = [
    { id: 'wq_1', title: 'Marathon', description: 'Complete 300 minutes this week.', category: 'WEEKLY', rewardGold: 500, steps: [{ id: 'ws1', description: 'Minutes', target: 300, current: 0, type: 'minutes' }], isCompleted: false, isClaimed: false },
    { id: 'wq_2', title: 'Regular', description: 'Complete 10 sessions this week.', category: 'WEEKLY', rewardGold: 400, steps: [{ id: 'ws2', description: 'Sessions', target: 10, current: 0, type: 'sessions' }], isCompleted: false, isClaimed: false },
];

export const getRandomDailyQuests = (): Quest[] => {
    const shuffled = [...DAILY_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2).map(q => ({ ...q, id: q.id + Date.now() })); 
};

export const getRandomWeeklyQuests = (): Quest[] => {
    const shuffled = [...WEEKLY_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 1).map(q => ({ ...q, id: q.id + Date.now() }));
};

export const SKILL_PRESETS = {
  "Game Dev": ["Unity", "Unreal Engine", "Godot", "Blender", "ZBrush", "Maya", "Substance Painter", "Marvelous Designer", "Level Design"],
  "Programming": ["Python", "JavaScript", "TypeScript", "C#", "C++", "Rust", "Go", "Java", "Swift", "React"],
  "Video": ["Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut", "CapCut", "Color Grading", "VFX"],
  "Audio": ["Ableton Live", "FL Studio", "Pro Tools", "Audacity", "Sound Design", "Mixing", "Mastering"],
  "Language": ["Japanese", "English", "Bahasa Indonesia", "Jawa", "French", "German", "Spanish", "Mandarin", "Korean", "Russian", "Arabic", "Portuguese", "Italian"],
  "AI": ["Prompt Engineering", "Stable Diffusion", "Midjourney", "LLM Fine-tuning", "Python for AI", "Machine Learning"],
  "Basic": ["Touch Typing", "Excel", "PowerPoint", "Obsidian", "Notion", "Linux Basics"]
};

// --- QUIZZES ---
export const ALL_QUIZZES: QuizQuestion[] = [];

// --- Quotes & Mocks ---

export const SARCASTIC_QUOTES = [
    "Oh wow, you're actually working?",
    "I've seen sloths move faster.",
    "Is this what peak performance looks like? Disappointing.",
    "Don't hurt yourself thinking too hard.",
    "My grandmother codes faster than this.",
    "Are we done yet?",
    "You call that a streak?",
    "I bet you're just staring at the screen.",
    "Productivity is a myth, apparently.",
    "Just give up, go watch anime."
];

export const PAUSE_QUOTES = [
    "Oh, taking a break? I'm sure the world will wait for your greatness. (It won't)",
    "Paused? Rome wasn't built in a day, but they didn't have Netflix distractions either.",
    "Sure, rest. Your competition is probably grinding right now.",
    "Don't worry, the EXP isn't going anywhere. It's just disappointed in you.",
    "Giving up already? Or just checking your texts?",
    "Silence is golden. Your productivity is... bronze at best.",
    "Paused. Time freezes, but your aging process doesn't.",
    "Taking a breather? I hope you're not out of breath from *sitting*.",
    "I'll just wait here while you procrastinate.",
    "Legend says if you pause long enough, your skills start to rot."
];

export const TRAINING_QUOTES: Record<string, string[]> = {
    "General": [
        "Focus on the process, not the outcome.",
        "Small steps every day.",
        "Consistency beats intensity.",
        "You are building the future you.",
        "Pain is temporary, code is forever."
    ],
    "Game Dev": [
        "Fix one bug, create two more.",
        "It's not a bug, it's a feature.",
        "Baking lights... please wait.",
        "Did you save your scene?",
        "Polygons don't grow on trees."
    ],
    "Programming": [
        "It compiles! Ship it.",
        "Rubber duck debugging works.",
        "Semicolons are not optional.",
        "Write code for humans, not machines.",
        "Documentation is love letter to your future self."
    ]
};

export const ENEMY_MOCKS = [
    "Is that all you got?",
    "You fight like a dairy farmer!",
    "My HP bar is barely moving.",
    "Boring.",
    "Try hitting harder.",
    "I'm going to take a nap.",
    "Your DPS is laughable.",
    "Are you AFK?",
    "Pathetic.",
    "I've fought rats scarier than you."
];

export const generateDarkMerchantStock = (rankIndex: number, currentGold: number, consumablesData: any[] = []) => {
    // Sells a random 2(+1 per profile ranks) items every day.
    const numItems = 2 + rankIndex;
    const maxRank = RANKS.length - 1;
    const rankFactor = rankIndex / maxRank;

    const lerp = (min: number, max: number) => Math.floor(min + (max - min) * rankFactor);

    let pool = [];
    
    if (consumablesData && consumablesData.length > 0) {
        pool = consumablesData.map(item => ({
            itemId: item.id,
            name: item.name,
            description: item.description || 'A mysterious consumable.',
            basePrice: item.baseCost,
            rankPriceRange: [item.profileCostMin, item.profileCostMax],
            goldPercent: item.currentMoneyCostPct / 100,
            rateRange: [item.appearanceMin, item.appearanceMax],
            icon: 'Gift', // Default icon
            rarity: item.rank,
            itemCountMin: item.itemCountMin,
            itemCountMax: item.itemCountMax
        }));
    } else {
        // Fallback to old pool if data not loaded
        pool = [
            {
                itemId: 'philosopher_stone',
                name: 'Philosopher Stone',
                description: 'A mysterious stone used for enchanting equipment.',
                basePrice: 1000,
                rankPriceRange: [500, 1000000],
                goldPercent: 0.15,
                rateRange: [2.5, 15],
                icon: 'Sparkles',
                rarity: 'Legendary',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'frozen_flame',
                name: 'Frozen Flame',
                description: 'Freeze the streak: next non-login will not break day streak and daily login bonus streak. Usable 1x/week.',
                basePrice: 2000,
                rankPriceRange: [500, 100000],
                goldPercent: 0.10,
                rateRange: [10, 50],
                icon: 'Flame',
                rarity: 'Epic',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'sss_soap',
                name: '[SSS] Stiff and Spiky Soap',
                description: 'Next train session > 30m: 2x EXP. If < 30m: 0 EXP. Usable 1-3x/day based on rank.',
                basePrice: 200,
                rankPriceRange: [10, 10000],
                goldPercent: 0.03,
                rateRange: [10, 50],
                icon: 'Zap',
                rarity: 'Rare',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'misery_box_1',
                name: 'Misery Box+1',
                description: 'Gain +15 profile EXP or lose -10 profile EXP (cannot level down).',
                basePrice: 100,
                rankPriceRange: [10, 5000],
                goldPercent: 0.02,
                rateRange: [20, 60],
                icon: 'Gift',
                rarity: 'Uncommon',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'misery_box_2',
                name: 'Misery Box+2',
                description: 'Gain +75 profile EXP or lose -50 profile EXP (cannot level down).',
                basePrice: 1000,
                rankPriceRange: [1000, 50000],
                goldPercent: 0.04,
                rateRange: [10, 30],
                icon: 'Gift',
                rarity: 'Rare',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'misery_box_3',
                name: 'Misery Box+3',
                description: 'Gain +300 profile EXP or lose -200 profile EXP (cannot level down).',
                basePrice: 10000,
                rankPriceRange: [10000, 500000],
                goldPercent: 0.06,
                rateRange: [5, 15],
                icon: 'Gift',
                rarity: 'Epic',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'patron_blessing',
                name: 'Patron Blessing',
                description: 'Gain +1 Patron EXP. Max 2 uses per day.',
                basePrice: 10000,
                rankPriceRange: [10000, 500000],
                goldPercent: 0.06,
                rateRange: [5, 15],
                icon: 'Crown',
                rarity: 'Epic',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'isekai_credit_card',
                name: 'Isekai Credit Card',
                description: 'Receive 2x gold of price. Pay back 1x-4x tomorrow based on training time.',
                basePrice: 10,
                rankPriceRange: [10, 500],
                goldPercent: 0.15,
                rateRange: [5, 15],
                icon: 'Coins',
                rarity: 'Rare',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'miso_ramen',
                name: 'Miso Ramen',
                description: 'Gain +20% max health percentile for 1 day. Usable 1x/day.',
                basePrice: 1000,
                rankPriceRange: [1000, 50000],
                goldPercent: 0.01,
                rateRange: [30, 75],
                icon: 'Coffee',
                rarity: 'Common',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'shio_ramen',
                name: 'Shio Ramen',
                description: 'Gain +15% ASPD for 1 day. Usable 1x/day.',
                basePrice: 1000,
                rankPriceRange: [1000, 50000],
                goldPercent: 0.01,
                rateRange: [30, 75],
                icon: 'Coffee',
                rarity: 'Common',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'shoyu_ramen',
                name: 'Shoyu Ramen',
                description: 'Gain +10% Crit Rate for 1 day. Usable 1x/day.',
                basePrice: 1000,
                rankPriceRange: [1000, 50000],
                goldPercent: 0.01,
                rateRange: [30, 75],
                icon: 'Coffee',
                rarity: 'Common',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'chashuu_ramen',
                name: 'Chashuu Ramen',
                description: 'Gain +6% Block for 1 day. Usable 1x/day.',
                basePrice: 1000,
                rankPriceRange: [1000, 50000],
                goldPercent: 0.01,
                rateRange: [30, 75],
                icon: 'Coffee',
                rarity: 'Common',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'chuuka_ramen',
                name: 'Chuuka Ramen',
                description: 'Gain +2% Revive Speed for 1 day. Usable 1x/day.',
                basePrice: 1000,
                rankPriceRange: [1000, 50000],
                goldPercent: 0.01,
                rateRange: [15, 45],
                icon: 'Coffee',
                rarity: 'Uncommon',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'ichiban_shibori',
                name: 'Ichiban Shibori',
                description: 'Gain +3% Undying for 1 day. Usable 1x/day.',
                basePrice: 1000,
                rankPriceRange: [1000, 50000],
                goldPercent: 0.01,
                rateRange: [15, 45],
                icon: 'Coffee',
                rarity: 'Uncommon',
                itemCountMin: 1, itemCountMax: 1
            },
            {
                itemId: 'sshs_soap',
                name: '[SSHS] Super Slippy Holed Soap',
                description: 'Massive buffs (+9% barrage, 20% crit dmg, +30 dmg, 25% aspd) but -25% block, undying, skill exp for 1 day.',
                basePrice: 5000,
                rankPriceRange: [5000, 500000],
                goldPercent: 0.03,
                rateRange: [10, 45],
                icon: 'Shield',
                rarity: 'Epic',
                itemCountMin: 1, itemCountMax: 1
            }
        ];
    }

    const stock: any[] = [];
    const maxQuantityFallback = rankIndex >= 6 ? 3 : (rankIndex >= 3 ? 2 : 1);

    for (let i = 0; i < numItems; i++) {
        // Weighted selection based on appearance rates
        const availablePool = pool.map(item => ({
            ...item,
            currentRate: item.rateRange[0] + (item.rateRange[1] - item.rateRange[0]) * rankFactor
        }));

        const totalWeight = availablePool.reduce((sum, item) => sum + item.currentRate, 0);
        let rand = Math.random() * totalWeight;
        
        let selectedItem = availablePool[availablePool.length - 1];
        for (const item of availablePool) {
            if (rand < item.currentRate) {
                selectedItem = item;
                break;
            }
            rand -= item.currentRate;
        }

        const price = Math.floor(
            selectedItem.basePrice + 
            lerp(selectedItem.rankPriceRange[0], selectedItem.rankPriceRange[1]) + 
            (selectedItem.goldPercent * currentGold)
        );

        let quantity = maxQuantityFallback;
        if (selectedItem.itemCountMin !== undefined && selectedItem.itemCountMax !== undefined) {
            if (selectedItem.itemCountMin === selectedItem.itemCountMax) {
                quantity = selectedItem.itemCountMin;
            } else {
                quantity = Math.floor(Math.random() * (selectedItem.itemCountMax - selectedItem.itemCountMin + 1)) + selectedItem.itemCountMin;
            }
        }

        stock.push({
            id: `${selectedItem.itemId}_${Date.now()}_${i}`,
            itemId: selectedItem.itemId,
            name: selectedItem.name,
            description: selectedItem.description,
            price: price,
            originalPrice: price,
            haggledCount: 0,
            currency: 'gold',
            quantity: quantity,
            icon: selectedItem.icon,
            rarity: selectedItem.rarity
        });
    }

    return stock;
};

export const getEnhancementCost = (baseCost: number, currentLevel: number) => {
    return Math.floor((baseCost * 0.1) + (baseCost * 0.025 * currentLevel));
};
export const getBlacksmithStoneCost = (rarity: string | RarityType): number => {
    switch (rarity) {
        case RarityType.COMMON: return 0;
        case RarityType.UNCOMMON: return 0;
        case RarityType.RARE: return 1;
        case RarityType.EPIC: return 3;
        case RarityType.LEGENDARY: return 6;
        case RarityType.GOD: return 12;
        case RarityType.WORLD: return 25;
        default: return 1;
    }
};

export const getEnhancementStoneCost = (rarity: string | RarityType): number => {
    switch (rarity) {
        case RarityType.COMMON: return 0;
        case RarityType.UNCOMMON: return 0;
        case RarityType.RARE: return 1;
        case RarityType.EPIC: return 1;
        case RarityType.LEGENDARY: return 2;
        case RarityType.GOD: return 2;
        case RarityType.WORLD: return 3;
        default: return 1;
    }
};
export const getEnhancementSuccessRate = (currentLevel: number, maxLevel: number) => {
    if (currentLevel >= maxLevel) return 0;
    
    // Custom curve based on user request:
    // Level 0 -> 1: ~99%
    // Level 4 -> 5: ~50%
    // Level 7 -> 8: ~20%
    // We use a power-exponential curve for better control
    const rate = 0.99 * Math.pow(0.5, Math.pow(currentLevel / 4, 1.3));
    
    // Ensure it doesn't drop below a minimum floor for very high levels
    return Math.max(0.001, rate);
};

export const getMaxEnhancementLevel = (rarity: RarityType) => {
    switch (rarity) {
        case RarityType.COMMON: return 8;
        case RarityType.UNCOMMON: return 9;
        case RarityType.RARE: return 11;
        case RarityType.EPIC: return 13;
        case RarityType.LEGENDARY: return 15;
        case RarityType.GOD: return 16;
        case RarityType.WORLD: return 17;
        default: return 8;
    }
};

export const getEnhancedStats = (baseStats: any, mainStats: any, enhanceLevel: number): any => {
    if (!enhanceLevel) return baseStats;
    
    const enhanced: any = {};
    for (const key in baseStats) {
        const isMain = mainStats && mainStats[key] > 0;
        const multiplier = isMain ? (1 + 0.10 * enhanceLevel) : (1 + 0.08 * enhanceLevel);
        enhanced[key] = baseStats[key] * multiplier;
    }
    return enhanced;
};
