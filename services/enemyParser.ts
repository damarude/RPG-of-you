export function parseEnemyData(text: string): any[] {
    const enemies: any[] = [];
    
    // Extract main stats
    const mainStatBlockMatch = text.match(/\[MAINSTAT\]([\s\S]*?)\[END\]/);
    const mainStatBlock = mainStatBlockMatch ? mainStatBlockMatch[1] : '';
    
    const extractMainStat = (key: string) => {
        const regex = new RegExp(`\\[${key}:\\s*(.*?)\\%\\]`);
        const match = mainStatBlock.match(regex);
        return match ? parseFloat(match[1]) / 100 : 1; // Default to 100% (1)
    };

    const appearance = extractMainStat('APPEARCHANCE') || extractMainStat('APPEARANCE') || 1;
    const statModifiers = {
        hp: extractMainStat('HP'),
        dmg: extractMainStat('DMG'),
        crit: extractMainStat('CRIT'),
        aspd: extractMainStat('ASPD'),
        block: extractMainStat('BLOCK'),
        critDmg: extractMainStat('CRITDMG'),
        stun: extractMainStat('STUN'),
        barrage: extractMainStat('BARRAGE')
    };

    const enemyBlocks = text.split('[FILENAME:').slice(1);
    
    for (const block of enemyBlocks) {
        const fullBlock = '[FILENAME:' + block;
        
        const extractValue = (key: string) => {
            const regex = new RegExp(`\\[${key}:\\s*(.*?)\\]`);
            const match = fullBlock.match(regex);
            return match ? match[1].trim() : '';
        };

        const extractLore = (num: number) => {
            const regex = new RegExp(`\\[LORE${num}:\\s*([\\s\\S]*?)\\[END\\]`);
            const match = fullBlock.match(regex);
            return match ? match[1].trim() : '';
        };

        const id = extractValue('FILENAME');
        const name = extractValue('NAME');
        const title = extractValue('TITLE');
        const rank = extractValue('RANK');
        const race = extractValue('RACE');
        const sizeStr = extractValue('SIZE');
        const size = sizeStr ? parseInt(sizeStr, 10) : 100;
        
        const lores = [];
        for (let i = 1; i <= 8; i++) {
            const l = extractLore(i);
            if (l) lores.push(l);
        }
        
        // Extract milestones
        const milestones = [];
        const huntedRegex = /\[HUNTED:(\d+)\s*\|\s*LORE:(.*?)\s*\|\s*STAT:(.*?)\s*\|\s*VAL:(.*?)\s*\|\s*TITLE:(.*?)\]/g;
        let match;
        while ((match = huntedRegex.exec(fullBlock)) !== null) {
            milestones.push({
                kills: parseInt(match[1], 10),
                loreUnlock: match[2] !== 'NULL' ? parseInt(match[2], 10) : null,
                stat: match[3] !== 'NULL' ? match[3] : null,
                val: match[4] !== '0' ? match[4] : null,
                title: match[5] !== 'NULL' ? match[5] : null
            });
        }

        // Determine base stats based on rank or ID (simplified for now)
        let hp = 100;
        let gold = 1;
        if (rank === 'NOVICE') { hp = 50; gold = 1; }
        else if (rank === 'APPRENTICE') { hp = 150; gold = 3; }
        else if (rank === 'PROFESSIONAL') { hp = 250; gold = 5; }
        else if (rank === 'EXPERT') { hp = 400; gold = 8; }
        else if (rank === 'MASTER') { hp = 1000; gold = 20; }
        else if (rank === 'GRANDMASTER') { hp = 3000; gold = 50; }
        else if (rank === 'LEGEND' || rank === 'LEGENDARY') { hp = 10000; gold = 150; }
        else if (rank === 'MYTHIC') { hp = 50000; gold = 500; }
        else if (rank === 'TRANSCENDENT') { hp = 200000; gold = 1500; }
        
        enemies.push({
            id,
            name,
            title,
            rank,
            race,
            lores,
            size,
            appearance,
            statModifiers,
            milestones,
            hp,
            gold,
            image: `https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/EnemyImages/${id}.png`
        });
    }
    
    return enemies;
}
