
export const PHRASE_URLS = {
    screensaver: "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MotivationalData/ScreenSaverPhrases.txt",
    enemies: "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MotivationalData/EnemiesPhrases.txt",
    character: "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MotivationalData/MainCharacterPhrases.txt",
    enemyReviveToxic: "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MotivationalData/EnemyReviveToxicPhrases.txt"
};

export const MUSIC_URLS = {
    base: [
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/Base/Level%20Up%20My%20Heart.mp3"
    ],
    menu_pack: [
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomUI/Level%20Up%20My%20Heart%202.mp3",
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomUI/Level%20Up,%20Slow%20Down%202.mp3",
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomUI/Level%20Up,%20Slow%20Down.mp3",
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomUI/Pixel%20Waltz%20of%20the%20Mind%202.mp3",
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomUI/Pixel%20Waltz%20of%20the%20Mind.mp3"
    ],
    battle_pack: [
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomBattle/Chromed%20Blade%20Circuit%202.mp3",
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomBattle/Chromed%20Blade%20Circuit.mp3",
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomBattle/Desert%20Circuit%20Clash%202.mp3",
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomBattle/Desert%20Circuit%20Clash.mp3",
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomBattle/Neon%20Clash%20Protocol%202.mp3",
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomBattle/Neon%20Clash%20Protocol.mp3",
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomBattle/Steel%20Temple%20Showdown%202.mp3",
        "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/MusicData/CustomBattle/Steel%20Temple%20Showdown.mp3"
    ]
};

export const fetchContentSize = async (url: string): Promise<number | null> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) return null;
        const length = response.headers.get('content-length');
        return length ? parseInt(length, 10) : 0;
    } catch (error) {
        console.error("Failed to check file size", error);
        return null;
    }
};

export const fetchPhrases = async (url: string): Promise<string[]> => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        const text = await response.text();
        return parsePhraseFile(text);
    } catch (error) {
        console.error("Failed to download phrases", error);
        throw error;
    }
};

const parsePhraseFile = (text: string): string[] => {
    const phrases: string[] = [];
    // Split by [END] tag
    const blocks = text.split('[END]');

    blocks.forEach(block => {
        const cleanBlock = block.trim();
        if (!cleanBlock) return;

        // Regex to extract content inside [TEXT:"..."]
        // Matches [TEXT:" followed by anything (non-greedy) until "]
        const textMatch = cleanBlock.match(/\[TEXT:"(.*?)"\]/s);

        if (textMatch && textMatch[1]) {
            phrases.push(textMatch[1].trim());
        }
    });

    return phrases;
};
