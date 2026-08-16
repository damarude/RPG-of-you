
import React, { useState } from 'react';
import { Fingerprint, Skull, Feather, CheckCircle, RefreshCw } from 'lucide-react';

interface IdentityRegistrationModalProps {
  onConfirm: (name: string) => void;
  isRenaming?: boolean;
  onCancel?: () => void;
}

export const IdentityRegistrationModal: React.FC<IdentityRegistrationModalProps> = ({ onConfirm, isRenaming = false, onCancel }) => {
  const [name, setName] = useState('');

  const handleConfirm = () => {
      if (name.trim()) {
          onConfirm(name.trim());
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[150] p-6 animate-in fade-in duration-700 backdrop-blur-sm" onClick={isRenaming && onCancel ? onCancel : undefined}>
       <div 
         className="max-w-md w-full bg-slate-900 border-2 border-purple-500/50 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.2)]"
         onClick={(e) => e.stopPropagation()}
       >
          {/* Close button for renaming mode */}
          {isRenaming && onCancel && (
              <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors text-xs uppercase font-bold tracking-widest z-20">
                  Cancel
              </button>
          )}

          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform rotate-12">
             <Skull size={180} />
          </div>
          
          <div className="relative z-10 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-purple-900/20 rounded-full flex items-center justify-center mb-6 border border-purple-500 animate-pulse-slow shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                {isRenaming ? <RefreshCw className="text-purple-400" size={40} /> : <Fingerprint className="text-purple-400" size={40} />}
             </div>

             <h2 className="text-3xl font-rpg font-bold text-white mb-2 tracking-widest text-shadow-lg uppercase">
                 {isRenaming ? 'Alias Rewrite' : 'Soul Binding'}
             </h2>
             <div className="w-16 h-1 bg-purple-600 rounded-full mb-6"></div>

             <p className="text-slate-300 text-sm mb-8 leading-relaxed italic font-serif">
                {isRenaming 
                    ? "Rebranding yourself? Very well. Enter the new designation for your digital existence."
                    : '"Welcome to the simulation, Entity #404... Apologies, that sounded rude. Please enter the alias you wish to be known by while conquering your own procrastination."'
                }
             </p>

             <div className="relative w-full mb-8 group">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-950 border-b-2 border-slate-700 focus:border-purple-500 outline-none py-4 text-center text-2xl font-bold text-white transition-all placeholder:text-slate-800 font-mono tracking-wider"
                  placeholder={isRenaming ? "NEW NAME" : "ENTER NAME"}
                  autoFocus
                  maxLength={15}
                />
                <Feather className="absolute right-2 top-5 text-slate-700 group-focus-within:text-purple-500 transition-colors opacity-50" size={24} />
             </div>

             <button 
               onClick={handleConfirm}
               disabled={!name.trim()}
               className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] rounded-lg hover:bg-purple-400 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] flex items-center justify-center gap-3"
             >
                <CheckCircle size={20} /> {isRenaming ? 'Confirm Alteration' : 'Initialize Identity'}
             </button>
             
             {!isRenaming && (
                 <p className="text-[10px] text-slate-600 mt-6 font-mono opacity-60">
                    * By clicking above, you acknowledge that any lack of productivity is purely a "skill issue".
                 </p>
             )}
          </div>
       </div>
    </div>
  );
};
