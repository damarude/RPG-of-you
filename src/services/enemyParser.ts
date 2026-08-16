export interface DetailedEnemy {
    id: string;
    race: string;
    filename: string;
    size: number;
    name: string;
    title: string;
    rank: string;
    lores: string[];
    milestones: EnemyMilestone[];
    mainStat: EnemyMainStat;
}

export interface EnemyMainStat {
    appearance: number;
    hp: number;
    dmg: number;
    crit: number;
    aspd: number;
    block: number;
    critdmg: number;
    stun: number;
    barrage: number;
}

export interface EnemyMilestone {
    hunted: number;
    lore: number | null;
    stat: string | null;
    val: number;
    isPercent: boolean;
    title: string | null;
}

export const parseEnemyData = (text: string): DetailedEnemy[] => {
    const enemies: DetailedEnemy[] = [];
    const lines = text.split('\n').map(l => l.trim());
    
    let currentMainStat: EnemyMainStat | null = null;
    let currentEnemy: Partial<DetailedEnemy> | null = null;
    let inLore = false;
    let currentLoreText = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        
        if (line === '[MAINSTAT]') {
            currentMainStat = {
                appearance: 100, hp: 100, dmg: 100, crit: 100, aspd: 100, block: 100, critdmg: 100, stun: 100, barrage: 100
            };
            continue;
        }
        
        if (currentMainStat && !currentEnemy) {
            if (line.startsWith('[APPEARCHANCE:')) currentMainStat.appearance = parseFloat(line.split(':')[1]);
            else if (line.startsWith('[HP:')) currentMainStat.hp = parseFloat(line.split(':')[1]);
            else if (line.startsWith('[DMG:')) currentMainStat.dmg = parseFloat(line.split(':')[1]);
            else if (line.startsWith('[CRIT:')) currentMainStat.crit = parseFloat(line.split(':')[1]);
            else if (line.startsWith('[ASPD:')) currentMainStat.aspd = parseFloat(line.split(':')[1]);
            else if (line.startsWith('[BLOCK:')) currentMainStat.block = parseFloat(line.split(':')[1]);
            else if (line.startsWith('[CRITDMG:')) currentMainStat.critdmg = parseFloat(line.split(':')[1]);
            else if (line.startsWith('[STUN:')) currentMainStat.stun = parseFloat(line.split(':')[1]);
            else if (line.startsWith('[BARRAGE:')) currentMainStat.barrage = parseFloat(line.split(':')[1]);
            else if (line === '[END]') {
                // End of main stat
            }
        }
        
        if (line.startsWith('[FILENAME:')) {
            if (currentEnemy && currentEnemy.name) {
                enemies.push(currentEnemy as DetailedEnemy);
            }
            currentEnemy = {
                filename: line.split(':')[1].replace(']', '').trim(),
                lores: [],
                milestones: [],
                mainStat: currentMainStat ? { ...currentMainStat } : { appearance: 100, hp: 100, dmg: 100, crit: 100, aspd: 100, block: 100, critdmg: 100, stun: 100, barrage: 100 }
            };
            continue;
        }
        
        if (currentEnemy) {
            if (line.startsWith('[RACE:')) currentEnemy.race = line.split(':')[1].replace(']', '').trim();
            else if (line.startsWith('[SIZE:')) currentEnemy.size = parseFloat(line.split(':')[1].replace(']', '').trim()) || 100;
            else if (line.startsWith('[NAME:')) currentEnemy.name = line.split(':')[1].replace(']', '').trim();
            else if (line.startsWith('[TITLE:')) currentEnemy.title = line.split(':')[1].replace(']', '').trim();
            else if (line.startsWith('[RANK:')) {
                currentEnemy.rank = line.split(':')[1].replace(']', '').trim();
                currentEnemy.id = `${currentEnemy.race}_${currentEnemy.rank}`;
            }
            else if (line.startsWith('[LORE')) {
                inLore = true;
                currentLoreText = line.split(':')[1] || '';
            }
            else if (inLore && line === '[END]') {
                inLore = false;
                currentEnemy.lores!.push(currentLoreText.trim());
                currentLoreText = '';
            }
            else if (inLore) {
                currentLoreText += '\n' + line;
            }
            else if (line.startsWith('[HUNTED:')) {
                // [HUNTED:9 | LORE:2 | STAT:MAX_HP | VAL:3 | TITLE:NULL]
                const parts = line.replace('[', '').replace(']', '').split('|').map(p => p.trim());
                const milestone: EnemyMilestone = {
                    hunted: 0, lore: null, stat: null, val: 0, isPercent: false, title: null
                };
                parts.forEach(p => {
                    const [k, v] = p.split(':').map(s => s.trim());
                    if (k === 'HUNTED') milestone.hunted = parseInt(v);
                    else if (k === 'LORE') milestone.lore = v === 'NULL' ? null : parseInt(v);
                    else if (k === 'STAT') milestone.stat = v === 'NULL' ? null : v;
                    else if (k === 'VAL') {
                        if (v.endsWith('%')) {
                            milestone.isPercent = true;
                            milestone.val = parseFloat(v);
                        } else {
                            milestone.val = parseFloat(v);
                        }
                    }
                    else if (k === 'TITLE') milestone.title = v === 'NULL' ? null : v;
                });
                currentEnemy.milestones!.push(milestone);
            }
        }
    }
    
    if (currentEnemy && currentEnemy.name) {
        enemies.push(currentEnemy as DetailedEnemy);
    }
    
    return enemies;
};
