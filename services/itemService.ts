
import { Item, ItemSlot, RarityType, ItemStats, ConsumableItem } from '../types';

export const fetchEquipmentData = async (url: string): Promise<Item[]> => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to download equipment data");
        const text = await response.text();
        return parseEquipmentData(text);
    } catch (error) {
        console.error("Equipment download failed", error);
        throw error;
    }
};

export const fetchConsumablesData = async (url: string): Promise<ConsumableItem[]> => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to download consumables data");
        const text = await response.text();
        return parseConsumablesData(text);
    } catch (error) {
        console.error("Consumables download failed", error);
        throw error;
    }
};

const parseConsumablesData = (text: string): ConsumableItem[] => {
    const blocks = text.split('[END]');
    const items: ConsumableItem[] = [];

    blocks.forEach((dataBlock) => {
        const cleanBlock = dataBlock.trim();
        if (!cleanBlock) return;

        const nameMatch = cleanBlock.match(/\[NAME:(.*?)\]/);
        if (!nameMatch) return;

        const id = nameMatch[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
        
        const parseRange = (tag: string, defaultMin = 0, defaultMax = 0) => {
            const match = cleanBlock.match(new RegExp(`\\[${tag}:(.*?)\\]`));
            if (!match) return [defaultMin, defaultMax];
            const val = match[1].trim();
            if (val.includes('<RANDOM>')) {
                const parts = val.split('<RANDOM>');
                return [parseFloat(parts[0]) || 0, parseFloat(parts[1]) || 0];
            }
            if (val.includes('<PROFILE>')) {
                const parts = val.split('<PROFILE>');
                return [parseFloat(parts[0]) || 0, parseFloat(parts[1]) || 0];
            }
            const num = parseFloat(val) || 0;
            return [num, num];
        };

        const parseString = (tag: string, defaultVal = '') => {
            const match = cleanBlock.match(new RegExp(`\\[${tag}:(.*?)\\]`));
            return match ? match[1].trim() : defaultVal;
        };

        const parseNumber = (tag: string, defaultVal = 0) => {
            const match = cleanBlock.match(new RegExp(`\\[${tag}:(.*?)\\]`));
            return match ? parseFloat(match[1].trim()) || defaultVal : defaultVal;
        };

        const rankStr = parseString('RANK', 'Common');
        let rank = RarityType.COMMON;
        if (rankStr === 'Uncommon') rank = RarityType.UNCOMMON;
        if (rankStr === 'Rare') rank = RarityType.RARE;
        if (rankStr === 'Epic') rank = RarityType.EPIC;
        if (rankStr === 'Legendary') rank = RarityType.LEGENDARY;
        if (rankStr === 'God') rank = RarityType.GOD;
        if (rankStr === 'World') rank = RarityType.WORLD;

        const profileCost = parseRange('PROFILECOST');
        const appearance = parseRange('APPEARANCE');
        const itemCount = parseRange('ITEMCOUNT', 1, 1);
        const receiveStone = parseRange('RECEIVESTONE');
        const flatExpGain = parseRange('FLATEXPGAIN');
        const patronGain = parseRange('PATRONGAIN');
        const dmg = parseRange('DMG');
        const flatHp = parseRange('FLATHP');
        const percentileHp = parseRange('PERCENTILEHP');
        const heal = parseRange('HEAL');
        const gold = parseRange('GOLD');
        const block = parseRange('BLOCK');
        const aspd = parseRange('ASPD');
        const critRate = parseRange('CRITRATE');
        const critDmg = parseRange('CRITDMG');
        const stun = parseRange('STUN');
        const barrage = parseRange('BARRAGE');
        const skillExp = parseRange('SKILLEXP');
        const cReduction = parseRange('CREDUCTION');
        const streakSave = parseRange('STREAKSAVE');
        const undying = parseRange('UNDYING');

        items.push({
            id,
            name: nameMatch[1].trim(),
            rank,
            baseCost: parseNumber('BASECOST'),
            currentMoneyCostPct: parseNumber('CURRENTMONEYCOST'),
            profileCostMin: profileCost[0],
            profileCostMax: profileCost[1],
            durationStr: parseString('DURATION', '0D_0H_0M'),
            stackable: parseNumber('STACKABLE'),
            appearanceMin: appearance[0],
            appearanceMax: appearance[1],
            itemCountMin: itemCount[0],
            itemCountMax: itemCount[1],
            receiveStoneMin: receiveStone[0],
            receiveStoneMax: receiveStone[1],
            flatExpGainMin: flatExpGain[0],
            flatExpGainMax: flatExpGain[1],
            patronGainMin: patronGain[0],
            patronGainMax: patronGain[1],
            freeChallenge: parseString('FREECHALLENGE', 'NO').toUpperCase() === 'YES',
            dmgMin: dmg[0],
            dmgMax: dmg[1],
            flatHpMin: flatHp[0],
            flatHpMax: flatHp[1],
            percentileHpMin: percentileHp[0],
            percentileHpMax: percentileHp[1],
            healMin: heal[0],
            healMax: heal[1],
            goldMin: gold[0],
            goldMax: gold[1],
            blockMin: block[0],
            blockMax: block[1],
            aspdMin: aspd[0],
            aspdMax: aspd[1],
            critRateMin: critRate[0],
            critRateMax: critRate[1],
            critDmgMin: critDmg[0],
            critDmgMax: critDmg[1],
            stunMin: stun[0],
            stunMax: stun[1],
            barrageMin: barrage[0],
            barrageMax: barrage[1],
            skillExpMin: skillExp[0],
            skillExpMax: skillExp[1],
            cReductionMin: cReduction[0],
            cReductionMax: cReduction[1],
            streakSaveMin: streakSave[0],
            streakSaveMax: streakSave[1],
            undyingMin: undying[0],
            undyingMax: undying[1],
            description: parseString('DESCRIPTION').replace(/^"|"$/g, '')
        });
    });

    return items;
};

const createEmptyStats = (): ItemStats => ({
    dmg: 0,
    hp: 0,
    hpPct: 0,
    heal: 0,
    block: 0,
    stun: 0,
    barrage: 0,
    critRate: 0,
    critDmg: 0,
    goldBonus: 0,
    attackSpeed: 0,
    streakProtectionChance: 0,
    undieableChance: 0,
    challengeCostReduction: 0,
    skillExpBonus: 0
});

const parseEquipmentData = (text: string): Item[] => {
    const blocks = text.split('[END]');
    const items: Item[] = [];

    blocks.forEach((block, index) => {
        const cleanBlock = block.trim();
        if (!cleanBlock) return;

        const slotMatch = cleanBlock.match(/\[SLOT:(.*?)\]/);
        const nameMatch = cleanBlock.match(/\[NAME:(.*?)\]/);
        const rankMatch = cleanBlock.match(/\[RANK:(.*?)\]/);
        const costMatch = cleanBlock.match(/\[COST:(.*?)\]/);
        const descMatch = cleanBlock.match(/\[DESCRIPTION:(.*?)\]/);
        const mainStatMatch = cleanBlock.match(/\[MAINSTAT:(.*?)\]/);

        if (!slotMatch || !nameMatch || !rankMatch || !costMatch) return;

        const slotName = slotMatch[1].trim();
        let slot = ItemSlot.HEAD;
        if (slotName === 'Body') slot = ItemSlot.BODY;
        if (slotName === 'Right Hand') slot = ItemSlot.RIGHT_HAND;
        if (slotName === 'Left Hand') slot = ItemSlot.LEFT_HAND;
        if (slotName === 'Feet') slot = ItemSlot.FEET;
        if (slotName === 'Accessory') slot = ItemSlot.ACCESSORY;

        const rankStr = rankMatch[1].trim();
        let rarity = RarityType.COMMON;
        if (rankStr === 'Uncommon') rarity = RarityType.UNCOMMON;
        if (rankStr === 'Rare') rarity = RarityType.RARE;
        if (rankStr === 'Epic') rarity = RarityType.EPIC;
        if (rankStr === 'Legendary') rarity = RarityType.LEGENDARY;
        if (rankStr === 'God') rarity = RarityType.GOD;
        if (rankStr === 'World') rarity = RarityType.WORLD;

        const stats: ItemStats = createEmptyStats();
        const mainStats: ItemStats = createEmptyStats();

        const mainStatText = mainStatMatch ? mainStatMatch[1].trim() : '';
        // Populate BOTH total stats and main stats from the main line
        parseStatLine(mainStatText, stats);
        parseStatLine(mainStatText, mainStats);

        // Parse Substats (SUBSTAT1 to SUBSTAT10) -> only add to Total Stats
        for (let i = 1; i <= 10; i++) {
            const subMatch = cleanBlock.match(new RegExp(`\\[SUBSTAT${i}:(.*?)\\]`));
            if (subMatch) {
                parseStatLine(subMatch[1].trim(), stats);
            }
        }

        // Icon Logic based on Slot
        let icon = 'ShoppingBag';
        if (slot === ItemSlot.HEAD) icon = 'Hood';
        if (slot === ItemSlot.BODY) icon = 'Shirt';
        if (slot === ItemSlot.RIGHT_HAND) icon = 'Sword';
        if (slot === ItemSlot.LEFT_HAND) icon = 'Shield';
        if (slot === ItemSlot.FEET) icon = 'Footprints';
        if (slot === ItemSlot.ACCESSORY) icon = 'Sparkles';

        items.push({
            id: `equip_${index}_${slot}_${rarity}`,
            name: nameMatch[1].trim(),
            slot: slot,
            cost: parseInt(costMatch[1].trim(), 10),
            description: descMatch ? descMatch[1].trim() : '',
            visualPrompt: `wearing ${nameMatch[1].trim()}`,
            icon: icon,
            rarity: rarity,
            mainStatDesc: mainStatText,
            stats: stats,
            mainStats: mainStats
        });
    });

    return items;
};

const parseStatLine = (line: string, stats: ItemStats) => {
    const lowerLine = line.toLowerCase();
    // Match numbers including decimals and signs, and optionally a percentage sign
    const valMatch = line.match(/([+-]?\d+(?:\.\d+)?)\s*(%?)/);
    if (!valMatch) return;
    
    const val = parseFloat(valMatch[1]);
    if (isNaN(val)) return;
    
    const isPercent = valMatch[2] === '%' || lowerLine.includes('percent') || line.includes('%');

    // Priority 1: Specific compound stats
    if (lowerLine.includes("crit dmg") || lowerLine.includes("cdmg") || lowerLine.includes("critdmg")) {
        stats.critDmg += val;
        return;
    } 
    
    if (lowerLine.includes("crit rate") || lowerLine.includes("critrate") || (lowerLine.includes("crit") && !lowerLine.includes("dmg"))) {
        stats.critRate += val;
        return;
    }

    // Priority 2: Core stats
    // Priority 2: Core stats
    if (lowerLine.includes("health percentile") || (lowerLine.includes("health") && isPercent)) {
        stats.hpPct += val;
        return;
    }

    if (lowerLine.includes("hp") || lowerLine.includes("health")) {
        stats.hp += val;
        return;
    }

    if (lowerLine.includes("dmg") || lowerLine.includes("damage")) {
        stats.dmg += val;
        return;
    } 

    if (lowerLine.includes("speed") || lowerLine.includes("spd") || lowerLine.includes("aspd")) {
        stats.attackSpeed += val;
        return;
    } 

    if (lowerLine.includes("heal") || lowerLine.includes("regen")) {
        stats.heal += val;
        return;
    } 

    if (lowerLine.includes("block")) {
        stats.block += val;
        return;
    } 

    if (lowerLine.includes("stun")) {
        stats.stun += val;
        return;
    } 

    if (lowerLine.includes("barrage")) {
        stats.barrage += val;
        return;
    } 

    if (lowerLine.includes("cost") || lowerLine.includes("reduce challenge") || lowerLine.includes("reduction")) {
        stats.challengeCostReduction += val;
        return;
    } 

    if (lowerLine.includes("gold") || lowerLine.includes("coin")) {
        stats.goldBonus += val;
        return;
    } 

    if (lowerLine.includes("undieable") || lowerLine.includes("undying")) {
        stats.undieableChance += val;
        return;
    } 

    if (lowerLine.includes("skill exp") || lowerLine.includes("all exp") || lowerLine.includes("exp bonus")) {
        stats.skillExpBonus += val;
        return;
    } 

    if (lowerLine.includes("streak")) {
        stats.streakProtectionChance += val;
        return;
    }
};
