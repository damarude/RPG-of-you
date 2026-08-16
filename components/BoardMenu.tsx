import React, { useState } from 'react';
import { Scroll, Shield, ChevronLeft, BookOpen, Skull, Target } from 'lucide-react';
import { QuestBoard } from './QuestBoard';
import { EnemyEncyclopediaModal } from './EnemyEncyclopediaModal';
import { Quest } from '../types';

interface BoardMenuProps {
    quests: Quest[];
    onClaim: (questId: string) => void;
    onShowHelp?: () => void;
    detailedEnemies: any[];
    huntedEnemies: Record<string, number>;
    highestRankIndex: number;
    userTotalLevel: number;
    installedEnemyImages?: boolean;
}

export const BoardMenu: React.FC<BoardMenuProps> = ({ quests, onClaim, onShowHelp, detailedEnemies, huntedEnemies, highestRankIndex, userTotalLevel, installedEnemyImages }) => {
    const [activeBoard, setActiveBoard] = useState<'menu' | 'quests' | 'monsters'>('menu');

    if (activeBoard === 'quests') {
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <button 
                    onClick={() => setActiveBoard('menu')}
                    className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 w-fit"
                >
                    <ChevronLeft size={16} /> Back to Board
                </button>
                <QuestBoard 
                    quests={quests} 
                    onClaim={onClaim} 
                    onShowHelp={onShowHelp}
                    detailedEnemies={detailedEnemies}
                    huntedEnemies={huntedEnemies}
                    hideEncyclopediaButton={true}
                    userTotalLevel={userTotalLevel}
                    installedEnemyImages={installedEnemyImages}
                />
            </div>
        );
    }

    if (activeBoard === 'monsters') {
        return (
            <div className="animate-in fade-in">
                <EnemyEncyclopediaModal 
                    onClose={() => setActiveBoard('menu')}
                    detailedEnemies={detailedEnemies}
                    huntedEnemies={huntedEnemies}
                    highestRankIndex={highestRankIndex}
                    installedEnemyImages={installedEnemyImages}
                />
            </div>
        );
    }

    return (
        <div className="pb-20 animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-6">
                <h2 className="text-3xl font-rpg font-bold text-white drop-shadow-md">Notice Board</h2>
                <p className="text-sm text-slate-400">Select a board to view.</p>
            </div>

            <div className="bg-[#2c1810] border-[12px] border-[#3e2723] rounded-xl p-6 shadow-[inset_0_0_60px_rgba(0,0,0,0.9),0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden min-h-[65vh] flex flex-col gap-6">
                {/* Wood Grain Texture */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"></div>
                
                {/* Decorative Corner Brackets */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-amber-900/40 rounded-tl-lg pointer-events-none"></div>
                <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-amber-900/40 rounded-tr-lg pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-amber-900/40 rounded-bl-lg pointer-events-none"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-amber-900/40 rounded-br-lg pointer-events-none"></div>

                <button 
                    onClick={() => setActiveBoard('quests')}
                    className="group relative bg-[#f4e4bc] hover:bg-[#fdf2d5] border-2 border-[#8b5e3c] rounded-sm p-6 transition-all duration-300 text-left overflow-hidden shadow-lg transform hover:-rotate-1 active:scale-95"
                    style={{ boxShadow: '3px 3px 0px #5d4037' }}
                >
                    {/* Paper Texture */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none"></div>
                    
                    <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                        <Scroll size={120} className="text-[#5d4037]" />
                    </div>
                    
                    {/* Thumbtack */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-700 rounded-full shadow-md border border-red-900">
                        <div className="absolute top-1 left-1 w-1 h-1 bg-white/40 rounded-full"></div>
                    </div>

                    <div className="relative z-10 flex items-center gap-4 mb-3">
                        <div className="p-3 bg-amber-900/10 rounded-lg border border-amber-900/20 text-amber-900 group-hover:scale-110 transition-transform">
                            <Scroll size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-rpg font-bold text-[#3e2723] group-hover:text-black transition-colors">Quest Board</h3>
                            <div className="h-0.5 w-full bg-amber-900/20 mt-1"></div>
                        </div>
                    </div>
                    <p className="text-[#5d4037] text-sm font-medium pl-1 italic leading-relaxed">
                        "Brave souls needed! View active missions, daily tasks, and weekly challenges. Glory and gold await those who persevere."
                    </p>
                </button>

                <button 
                    onClick={() => setActiveBoard('monsters')}
                    className="group relative bg-[#e0d5c1] hover:bg-[#e8decb] border-2 border-[#5d4037] rounded-sm p-6 transition-all duration-300 text-left overflow-hidden shadow-lg transform hover:rotate-1 active:scale-95"
                    style={{ boxShadow: '3px 3px 0px #3e2723' }}
                >
                    {/* Paper Texture */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none"></div>

                    <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:opacity-20 transition-opacity -rotate-12">
                        <Skull size={120} className="text-[#3e2723]" />
                    </div>

                    {/* Thumbtack */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-700 rounded-full shadow-md border border-slate-900">
                        <div className="absolute top-1 left-1 w-1 h-1 bg-white/40 rounded-full"></div>
                    </div>

                    <div className="relative z-10 flex items-center gap-4 mb-3">
                        <div className="p-3 bg-slate-900/10 rounded-lg border border-slate-900/20 text-slate-900 group-hover:scale-110 transition-transform">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-rpg font-bold text-[#2c1810] group-hover:text-black transition-colors">Monster Board</h3>
                            <div className="h-0.5 w-full bg-slate-900/20 mt-1"></div>
                        </div>
                    </div>
                    <p className="text-[#3e2723] text-sm font-medium pl-1 italic leading-relaxed">
                        "Know thy enemy. Consult the Encyclopedia of defeated foes. Study their weaknesses to ensure your survival in the wilds."
                    </p>
                </button>

                {/* Future proofing empty slot */}
                <div className="opacity-20 border-2 border-dashed border-white/10 rounded-xl p-6 flex items-center justify-center min-h-[100px] bg-black/20">
                    <span className="text-white/40 font-rpg text-lg tracking-widest uppercase">Vacant Slot</span>
                </div>
            </div>
        </div>
    );
};
