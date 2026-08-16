
import React, { useMemo } from 'react';
import { DoorOpen, AlertTriangle } from 'lucide-react';
import { SARCASTIC_QUOTES, PAUSE_QUOTES } from '../gameData';

interface ExitConfirmModalProps {
  onStay: () => void;
  onLeave: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({ onStay, onLeave }) => {
  const quote = useMemo(() => {
    const all = [...SARCASTIC_QUOTES, ...PAUSE_QUOTES];
    return all[Math.floor(Math.random() * all.length)];
  }, []);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[999] p-6 animate-in fade-in zoom-in-95" onClick={onStay}>
      <div className="bg-slate-900 border-2 border-red-500/50 rounded-2xl w-full max-w-sm p-6 relative shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center" onClick={e => e.stopPropagation()}>
        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500 animate-pulse">
            <DoorOpen className="text-red-500" size={40} />
        </div>
        
        <h2 className="text-2xl font-rpg font-bold text-white mb-2 uppercase tracking-widest text-shadow">Abandon Ship?</h2>
        
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-2 text-slate-500">
                <AlertTriangle size={16} />
            </div>
            <p className="text-sm text-slate-300 italic leading-relaxed">"{quote}"</p>
        </div>

        <div className="flex gap-3">
            <button onClick={onStay} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700">
                Stay & Grind
            </button>
            <button onClick={onLeave} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/30 transition-all">
                Quit
            </button>
        </div>
      </div>
    </div>
  );
};
