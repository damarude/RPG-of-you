import React from 'react';
import { X, Terminal, FastForward, Code2 } from 'lucide-react';
import { AppState, Proficiency } from '../types';
import { RANKS, formatNumber } from '../gameData';

interface DevCheatModalProps {
  isOpen: boolean;
  onClose: () => void;
  devInput: string;
  onDevInput: (val: string) => void;
  devModeEnabled: boolean;
  applyCheat: (type: 'GOLD' | 'STREAK' | 'EXP') => void;
  resetCharacterData: () => void;
  unlockAllEquipmentsCheat: () => void;
  redefaultEquipmentsCheat: () => void;
  maxEnhanceAllOwnedItemsCheat: () => void;
  unlockAllAchievementsCheat: () => void;
  resetAllQuestsCheat: () => void;
  unlockLibraryCheat: () => void;
  lockLibraryCheat: () => void;
  unlockAllEnemiesCheat: () => void;
  lockAllEnemiesCheat: () => void;
  applyPhilosopherStoneCheat: () => void;
  refreshDarkMerchantCheat: () => void;
  handleAddPatronExp: (amount: number) => void;
  resetPatronCheat: () => void;
  devGoldInput: string;
  setDevGoldInput: (val: string) => void;
  handleAddCustomGold: () => void;
  timerSpeedMultiplier: number;
  setTimerSpeedMultiplier: (val: number) => void;
  selectedDevSkillId: string;
  setSelectedDevSkillId: (val: string) => void;
  proficiencies: Proficiency[];
  applySkillCheat: () => void;
  selectedDevRank: string;
  setSelectedDevRank: (val: string) => void;
  applyRankCheat: () => void;
  selectedDevProfileRank: string;
  setSelectedDevProfileRank: (val: string) => void;
  applyProfileRankCheat: () => void;
}

export const DevCheatModal: React.FC<DevCheatModalProps> = ({
  isOpen,
  onClose,
  devInput,
  onDevInput,
  devModeEnabled,
  applyCheat,
  resetCharacterData,
  unlockAllEquipmentsCheat,
  redefaultEquipmentsCheat,
  maxEnhanceAllOwnedItemsCheat,
  unlockAllAchievementsCheat,
  resetAllQuestsCheat,
  unlockLibraryCheat,
  lockLibraryCheat,
  unlockAllEnemiesCheat,
  lockAllEnemiesCheat,
  applyPhilosopherStoneCheat,
  refreshDarkMerchantCheat,
  handleAddPatronExp,
  resetPatronCheat,
  devGoldInput,
  setDevGoldInput,
  handleAddCustomGold,
  timerSpeedMultiplier,
  setTimerSpeedMultiplier,
  selectedDevSkillId,
  setSelectedDevSkillId,
  proficiencies,
  applySkillCheat,
  selectedDevRank,
  setSelectedDevRank,
  applyRankCheat,
  selectedDevProfileRank,
  setSelectedDevProfileRank,
  applyProfileRankCheat,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-purple-900/20">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2 text-purple-400">
            <Terminal size={20} />
            <h2 className="font-rpg font-bold text-lg tracking-tight">DEVELOPER CONSOLE</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Command Input</label>
            <input 
              type="text" 
              placeholder="Enter Dev Commands..." 
              value={devInput} 
              onChange={(e) => onDevInput(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-mono text-slate-300 focus:border-purple-500 outline-none transition-all shadow-inner" 
            />
            {!devModeEnabled && (
              <p className="text-[10px] text-slate-600 italic">Enter the correct command to unlock cheats.</p>
            )}
          </div>

          {devModeEnabled && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => applyCheat('GOLD')} className="bg-slate-800/50 border border-slate-700 text-yellow-500 text-xs p-3 rounded-xl hover:bg-slate-700 transition-all font-mono font-bold">+5000 Gold</button>
                <button onClick={() => applyCheat('EXP')} className="bg-slate-800/50 border border-slate-700 text-purple-500 text-xs p-3 rounded-xl hover:bg-slate-700 transition-all font-mono font-bold">+5000 Exp</button>
                <button onClick={() => applyCheat('STREAK')} className="bg-slate-800/50 border border-slate-700 text-orange-500 text-xs p-3 rounded-xl hover:bg-slate-700 transition-all font-mono font-bold">+10 Streak</button>
                <button onClick={unlockAllEquipmentsCheat} className="bg-slate-800/50 border border-slate-700 text-blue-400 text-xs p-3 rounded-xl hover:bg-slate-700 transition-all font-mono font-bold">Unlock All Items</button>
                <button onClick={maxEnhanceAllOwnedItemsCheat} className="bg-slate-800/50 border border-slate-700 text-emerald-400 text-xs p-3 rounded-xl hover:bg-slate-700 transition-all font-mono font-bold">Max Enhance All</button>
                <button onClick={unlockAllAchievementsCheat} className="bg-slate-800/50 border border-slate-700 text-green-400 text-xs p-3 rounded-xl hover:bg-slate-700 transition-all font-mono font-bold">Unlock Achievements</button>
                <button onClick={applyPhilosopherStoneCheat} className="bg-slate-800/50 border border-slate-700 text-cyan-400 text-xs p-3 rounded-xl hover:bg-slate-700 transition-all font-mono font-bold">+10 Philo Stone</button>
                <button onClick={refreshDarkMerchantCheat} className="bg-slate-800/50 border border-slate-700 text-indigo-400 text-xs p-3 rounded-xl hover:bg-slate-700 transition-all font-mono font-bold">Refresh Merchant</button>
                <button onClick={() => handleAddPatronExp(100)} className="bg-amber-900/20 border border-amber-900/30 text-amber-400 text-xs p-3 rounded-xl hover:bg-amber-900/40 transition-all font-mono font-bold">+100 Patron Exp</button>
                <button onClick={unlockAllEnemiesCheat} className="bg-purple-900/20 border border-purple-900/30 text-purple-400 text-xs p-3 rounded-xl hover:bg-purple-900/40 transition-all font-mono font-bold">Unlock Enemies</button>
                <button onClick={unlockLibraryCheat} className="bg-emerald-900/20 border border-emerald-900/30 text-emerald-400 text-xs p-3 rounded-xl hover:bg-emerald-900/40 transition-all font-mono font-bold">Unlock Library</button>
                <button onClick={resetAllQuestsCheat} className="bg-slate-800/50 border border-slate-700 text-slate-300 text-xs p-3 rounded-xl hover:bg-slate-700 transition-all font-mono font-bold">Reset Quests</button>
              </div>

              <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-xl space-y-2">
                <h3 className="text-red-400 font-bold text-[10px] uppercase tracking-widest">Danger Zone</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={resetCharacterData} className="bg-red-900/30 border border-red-900/50 text-red-300 text-[10px] p-2 rounded-lg hover:bg-red-900/50 transition-all font-bold">Reset All Data</button>
                  <button onClick={redefaultEquipmentsCheat} className="bg-red-900/30 border border-red-900/50 text-red-300 text-[10px] p-2 rounded-lg hover:bg-red-900/50 transition-all font-bold">Reset Items</button>
                  <button onClick={lockLibraryCheat} className="bg-red-900/30 border border-red-900/50 text-red-300 text-[10px] p-2 rounded-lg hover:bg-red-900/50 transition-all font-bold">Reset Library</button>
                  <button onClick={lockAllEnemiesCheat} className="bg-red-900/30 border border-red-900/50 text-red-300 text-[10px] p-2 rounded-lg hover:bg-red-900/50 transition-all font-bold">Reset Enemies</button>
                  <button onClick={resetPatronCheat} className="bg-red-900/30 border border-red-900/50 text-red-300 text-[10px] p-2 rounded-lg hover:bg-red-900/50 transition-all font-bold">Reset Patron</button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Custom Gold</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={devGoldInput} 
                    onChange={(e) => setDevGoldInput(e.target.value)} 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-yellow-500 font-mono"
                    placeholder="Amount..."
                  />
                  <button onClick={handleAddCustomGold} className="bg-yellow-600 text-black text-xs font-bold px-5 rounded-xl hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-900/20">Add</button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block flex items-center gap-2">
                  <FastForward size={14} className="text-purple-400"/> Timer Speed Multiplier
                </label>
                <div className="flex gap-1">
                  {[1, 2, 5, 10, 60].map(speed => (
                    <button 
                      key={speed}
                      onClick={() => setTimerSpeedMultiplier(speed)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${timerSpeedMultiplier === speed ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Skill & Rank Management</label>
                <select 
                  onChange={(e) => setSelectedDevSkillId(e.target.value)}
                  className="w-full bg-slate-950 text-sm text-white p-3 border border-slate-800 rounded-xl outline-none focus:border-purple-500"
                  value={selectedDevSkillId}
                >
                  <option value="">Select Skill...</option>
                  {proficiencies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                
                <div className="flex gap-2">
                  <button onClick={applySkillCheat} className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs p-3 rounded-xl hover:bg-slate-700 transition-all font-bold">Boost (+10 Lvl)</button>
                  
                  <select 
                    onChange={(e) => setSelectedDevRank(e.target.value)}
                    className="flex-1 bg-slate-950 text-sm text-white p-3 border border-slate-800 rounded-xl outline-none focus:border-purple-500"
                    value={selectedDevRank}
                  >
                    <option value="">Set Rank...</option>
                    {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={applyRankCheat} className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-4 rounded-xl hover:bg-slate-700 transition-all font-bold">Set</button>
                </div>

                <div className="flex gap-2">
                  <select 
                    onChange={(e) => setSelectedDevProfileRank(e.target.value)}
                    className="flex-1 bg-slate-950 text-sm text-white p-3 border border-slate-800 rounded-xl outline-none focus:border-purple-500"
                    value={selectedDevProfileRank}
                  >
                    <option value="">Set Profile Rank...</option>
                    {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={applyProfileRankCheat} className="bg-emerald-900/30 border border-emerald-900/50 text-emerald-400 text-xs px-4 rounded-xl hover:bg-emerald-900/50 transition-all font-bold">Set Profile</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-600 font-mono">RPG OF YOU DEVELOPER CONSOLE v1.02</p>
        </div>
      </div>
    </div>
  );
};
