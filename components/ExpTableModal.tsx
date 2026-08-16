
import React from 'react';
import { X, TrendingUp, User, Book } from 'lucide-react';
import { getSkillExpRequired, getProfileExpRequired, getRankName, getRankColor, formatNumber } from '../gameData';

interface ExpTableModalProps {
  onClose: () => void;
}

export const ExpTableModal: React.FC<ExpTableModalProps> = ({ onClose }) => {
  // Show first 50, then every 10th level up to 1000
  const levels = [
      ...Array.from({ length: 50 }, (_, i) => i + 1),
      ...Array.from({ length: 95 }, (_, i) => (i + 6) * 10) // 60, 70, ... 1000
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-rpg font-bold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-400" /> Rank & EXP Table
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-slate-500 uppercase bg-slate-800/80 sticky top-0 backdrop-blur">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Level</th>
                <th className="px-4 py-3">Rank Title</th>
                <th className="px-4 py-3 text-right text-emerald-400"><Book size={12} className="inline mr-1"/>Skill EXP</th>
                <th className="px-4 py-3 rounded-tr-lg text-right text-purple-400"><User size={12} className="inline mr-1"/>Profile EXP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {levels.map(lvl => {
                const rankName = getRankName(lvl);
                const rankColor = getRankColor(lvl);
                // Extract text color class only
                const textColor = rankColor.split(' ').find(c => c.startsWith('text-')) || 'text-white';
                
                return (
                  <tr key={lvl} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2 font-mono text-slate-300 border-r border-slate-800/50">{lvl}</td>
                    <td className={`px-4 py-2 font-bold ${textColor} border-r border-slate-800/50`}>{rankName}</td>
                    <td className="px-4 py-2 text-right font-mono text-emerald-400 border-r border-slate-800/50">
                      {formatNumber(getSkillExpRequired(lvl))}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-purple-400">
                      {formatNumber(getProfileExpRequired(lvl))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
