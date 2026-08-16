import { RarityType } from '../types';

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

const parseValue = (valStr: string): { min: number, max: number } => {
    if (valStr.includes('<PROFILE>')) {
        const parts = valStr.split('<PROFILE>');
        return { min: parseFloat(parts[0]) || 0, max: parseFloat(parts[1]) || 0 };
    }
    if (valStr.includes('<RANDOM>')) {
        const parts = valStr.split('<RANDOM>');
        return { min: parseFloat(parts[0]) || 0, max: parseFloat(parts[1]) || 0 };
    }
    const val = parseFloat(valStr) || 0;
    return { min: val, max: val };
};

const parseConsumablesData = (text: string): ConsumableItem[] => {
    const blocks = text.split('[END]');
    const items: ConsumableItem[] = [];

    blocks.forEach((block, index) => {
        const cleanBlock = block.trim();
        if (!cleanBlock) return;

        const extract = (key: string) => {
            const regex = new RegExp(`\\[${key}:(.*?)\\]`);
            const match = cleanBlock.match(regex);
            return match ? match[1].trim() : '';
        };

        const name = extract('NAME');
        if (!name) return;

        const rankStr = extract('RANK');
        let rank = RarityType.COMMON;
        if (rankStr === 'Uncommon') rank = RarityType.UNCOMMON;
        if (rankStr === 'Rare') rank = RarityType.RARE;
        if (rankStr === 'Epic') rank = RarityType.EPIC;
        if (rankStr === 'Legendary') rank = RarityType.LEGENDARY;
        if (rankStr === 'God') rank = RarityType.GOD;
        if (rankStr === 'World') rank = RarityType.WORLD;

        const baseCost = parseFloat(extract('BASECOST')) || 0;
        const currentMoneyCostStr = extract('CURRENTMONEYCOST').replace('%', '');
        const currentMoneyCostPct = parseFloat(currentMoneyCostStr) || 0;

        const profileCost = parseValue(extract('PROFILECOST'));
        const durationStr = extract('DURATION');
        const stackable = parseInt(extract('STACKABLE')) || 0;
        
        const appearanceStr = extract('APPEARANCE').replace(/%/g, '');
        const appearance = parseValue(appearanceStr);

        const itemCount = parseValue(extract('ITEMCOUNT'));
        const receiveStone = parseValue(extract('RECEIVESTONE'));
        const flatExpGain = parseValue(extract('FLATEXPGAIN'));
        const patronGain = parseValue(extract('PATRONGAIN'));
        
        const freeChallenge = extract('FREECHALLENGE').toUpperCase() === 'YES';

        const dmg = parseValue(extract('DMG'));
        const flatHp = parseValue(extract('FLATHP'));
        const percentileHp = parseValue(extract('PERCENTILEHP'));
        const heal = parseValue(extract('HEAL'));
        const gold = parseValue(extract('GOLD'));
        const blockChance = parseValue(extract('BLOCK'));
        const aspd = parseValue(extract('ASPD'));
        const critRate = parseValue(extract('CRITRATE'));
        const critDmg = parseValue(extract('CRITDMG'));
        const stun = parseValue(extract('STUN'));
        const barrage = parseValue(extract('BARRAGE'));
        const skillExp = parseValue(extract('SKILLEXP'));
        const cReduction = parseValue(extract('CREDUCTION'));
        const streakSave = parseValue(extract('STREAKSAVE'));
        const undying = parseValue(extract('UNDYING'));

        let description = extract('DESCRIPTION');
        if (description.startsWith('"') && description.endsWith('"')) {
            description = description.substring(1, description.length - 1);
        }

        items.push({
            id: `consumable_${index}_${name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
            name,
            rank,
            baseCost,
            currentMoneyCostPct,
            profileCostMin: profileCost.min,
            profileCostMax: profileCost.max,
            durationStr,
            stackable,
            appearanceMin: appearance.min,
            appearanceMax: appearance.max,
            itemCountMin: itemCount.min,
            itemCountMax: itemCount.max,
            receiveStoneMin: receiveStone.min,
            receiveStoneMax: receiveStone.max,
            flatExpGainMin: flatExpGain.min,
            flatExpGainMax: flatExpGain.max,
            patronGainMin: patronGain.min,
            patronGainMax: patronGain.max,
            freeChallenge,
            dmgMin: dmg.min,
            dmgMax: dmg.max,
            flatHpMin: flatHp.min,
            flatHpMax: flatHp.max,
            percentileHpMin: percentileHp.min,
            percentileHpMax: percentileHp.max,
            healMin: heal.min,
            healMax: heal.max,
            goldMin: gold.min,
            goldMax: gold.max,
            blockMin: blockChance.min,
            blockMax: blockChance.max,
            aspdMin: aspd.min,
            aspdMax: aspd.max,
            critRateMin: critRate.min,
            critRateMax: critRate.max,
            critDmgMin: critDmg.min,
            critDmgMax: critDmg.max,
            stunMin: stun.min,
            stunMax: stun.max,
            barrageMin: barrage.min,
            barrageMax: barrage.max,
            skillExpMin: skillExp.min,
            skillExpMax: skillExp.max,
            cReductionMin: cReduction.min,
            cReductionMax: cReduction.max,
            streakSaveMin: streakSave.min,
            streakSaveMax: streakSave.max,
            undyingMin: undying.min,
            undyingMax: undying.max,
            description
        });
    });

    return items;
};
