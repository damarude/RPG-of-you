import React, { useState } from 'react';
import { X, Search, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PhrasePack } from '../types';

interface QuotesModalProps {
  phrases: PhrasePack;
  onClose: () => void;
}

export const QuotesModal: React.FC<QuotesModalProps> = ({ phrases, onClose }) => {
  const [activeTab, setActiveTab] = useState<'screensaver' | 'enemies' | 'character' | 'enemyReviveToxic'>('screensaver');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'screensaver', label: 'Motivational' },
    { id: 'enemies', label: 'Enemy Taunts' },
    { id: 'character', label: 'Inner Thoughts' },
    { id: 'enemyReviveToxic', label: 'Toxic Revive' }
  ] as const;

  const currentList = phrases[activeTab] || [];
  const filteredList = currentList.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Quote size={20} className="text-purple-400" />
            Quote Library
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/30 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-purple-500 text-purple-400 bg-purple-500/10' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label} ({phrases[tab.id]?.length || 0})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search quotes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-950/50">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              {currentList.length === 0 ? "No quotes downloaded for this category." : "No quotes match your search."}
            </div>
          ) : (
            filteredList.map((phrase, idx) => (
              <div key={idx} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-colors">
                "{phrase}"
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
