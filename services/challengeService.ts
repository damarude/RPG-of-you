
import { QuizQuestion, ChallengeMetadata } from '../types';

export const fetchChallengeFileSize = async (url: string): Promise<number | null> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) return null;
        const length = response.headers.get('content-length');
        return length ? parseInt(length, 10) : 0;
    } catch (error) {
        // Silent failure for size check
        return null;
    }
};

export const fetchMasterChallengeIndex = async (url: string): Promise<ChallengeMetadata[]> => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch master index");
        const text = await response.text();
        return parseMasterIndex(text);
    } catch (error) {
        console.error("Fetch master index failed", error);
        throw error;
    }
};

const parseMasterIndex = (text: string): ChallengeMetadata[] => {
    const lines = text.split('\n');
    let currentCategory = 'Other';
    let currentSkill = null;
    let currentLink = null;
    const results: ChallengeMetadata[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const categoryMatch = trimmed.match(/\[CHALLENGE_CATEGORY: (.*)\]/);
        const skillMatch = trimmed.match(/\[CHALLENGE_DATA: (.*)\]/);
        
        if (categoryMatch) {
            currentCategory = categoryMatch[1].trim();
        } else if (skillMatch) {
            currentSkill = skillMatch[1].trim();
        } else if (trimmed.startsWith('LINK:')) {
            currentLink = trimmed.replace('LINK:', '').trim();
        } else if (trimmed === '[END]') {
            if (currentSkill && currentLink) {
                results.push({ 
                    skill: currentSkill, 
                    category: currentCategory, 
                    url: currentLink 
                });
            }
            // Reset per block
            currentSkill = null;
            currentLink = null;
        }
    }
    return results;
};

export const fetchChallengeData = async (url: string, skillName: string, category: string): Promise<QuizQuestion[]> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Download skipped for ${skillName} (Status: ${response.status})`);
            return []; // Return empty instead of throwing
        }
        const text = await response.text();
        return parseChallengeFile(text, skillName, category);
    } catch (error) {
        console.warn(`Download error for ${skillName}:`, error);
        return []; // Return empty to be safe
    }
};

const parseChallengeFile = (text: string, skillName: string, category: string): QuizQuestion[] => {
    const blocks = text.split('[END]');
    const questions: QuizQuestion[] = [];

    blocks.forEach(block => {
        const cleanBlock = block.trim();
        if (!cleanBlock) return;

        const rankMatch = cleanBlock.match(/\[RANK:(.*?)\]/);
        const idMatch = cleanBlock.match(/\[ID:(.*?)\]/);
        
        // Extract Question
        const qMatch = cleanBlock.match(/Q:(.*?)(\n|$)/);
        // Extract Answer Text (The correct text)
        const aMatch = cleanBlock.match(/A:(.*?)(\n|$)/);
        
        if (!rankMatch || !idMatch || !qMatch || !aMatch) return;

        const rank = rankMatch[1].trim();
        const id = idMatch[1].trim();
        const questionText = qMatch[1].trim();
        const correctText = aMatch[1].trim();

        // Extract Options C1-C6
        const options: string[] = [];
        const optionRegex = /C\d+:(.*?)(\n|$)/g;
        let match;
        while ((match = optionRegex.exec(cleanBlock)) !== null) {
            options.push(match[1].trim());
        }

        // Find correct index based on text match
        // Note: The challenge modal will handle shuffling visual order, 
        // but here we just need to identify the correct index in this specific list.
        let correctIndex = options.findIndex(opt => opt === correctText);
        
        // Fallback: If exact match fails (e.g. whitespace issues), try loose match
        if (correctIndex === -1) {
             correctIndex = options.findIndex(opt => opt.includes(correctText) || correctText.includes(opt));
        }

        // If still not found, add it to options (data integrity fallback)
        if (correctIndex === -1) {
            options.push(correctText);
            correctIndex = options.length - 1;
        }

        questions.push({
            id: `ext_${skillName}_${id}`,
            rank: rank,
            category: category, // Dynamic category from skill
            skill: skillName,
            question: questionText,
            options: options,
            correctAnswerIndex: correctIndex
        });
    });

    return questions;
};
