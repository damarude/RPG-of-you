import { parseEnemyData } from './src/services/enemyParser';

const text = `[MAINSTAT]
[APPEARCHANCE: 100%]
[HP: 80%] 
[DMG: 50%]
[CRIT: 120%]
[ASPD: 150%]
[BLOCK: 20%]
[CRITDMG: 75%]
[STUN: 25%]
[BARRAGE: 150%]
[END]

[FILENAME: G1]
[RACE: GOBLIN] 
[SIZE: 80]
[NAME: Brak]
[TITLE: The Ankle-Biter of the Outer Woods]
[RANK: NOVICE]

[LORE1:
Brak is a low-level woodland terror.
[END]
[LORE2:
[END]

[HUNTED:9 | LORE:2 | STAT:MAX_HP | VAL:3 | TITLE:NULL]
[HUNTED:66 | LORE:NULL | STAT:ATK_DMG | VAL:1 | TITLE:The Ankle-Biter of the Outer Woods]
`;

console.log(JSON.stringify(parseEnemyData(text), null, 2));
