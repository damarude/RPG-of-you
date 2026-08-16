
import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle, Upload, User, Sparkles, Image as ImageIcon, Terminal, Edit2 } from 'lucide-react';

interface AvatarSelectionModalProps {
  currentName: string;
  currentAvatar?: string;
  onConfirm: (avatarUrl: string) => void;
  isInitialSetup?: boolean;
  onCancel?: () => void;
  onRename?: () => void; // Added callback for renaming
}

const DEFAULT_AVATARS = [
  "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/ProfileImages/1.png", // Gorilla
  "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/ProfileImages/2.png", // Samurai
  "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/ProfileImages/3.png", // Pink Thing
  "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/ProfileImages/4.png", // Octopus
  "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/ProfileImages/5.png", // Hamster
  "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/ProfileImages/6.png", // Skater
  "https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/Dev%20Grind/ProfileImages/7.png", // Croc
];

const FLAVOR_TEXTS = [
  "Code Monkey. Literally. At least you're honest about your skill level.",
  "Git Samurai. You resolve merge conflicts with a katana because you forgot how to rebase.",
  "The Imposter. You look cute and harmless, but you deploy to production on Fridays.",
  "Spaghetti Code Monster. A visually accurate representation of your dependency tree.",
  "Grindset Hamster. Running on the wheel of technical debt until the end of time.",
  "Legacy Turtle. Slow, ancient, but somehow keeping the entire banking system alive.",
  "Crocodile Tears. For when you cry to the Senior Dev after breaking the build again."
];

export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ 
    currentName, currentAvatar, onConfirm, isInitialSetup = false, onCancel, onRename 
}) => {
  const [selectedUrl, setSelectedUrl] = useState(currentAvatar || DEFAULT_AVATARS[0]);
  const [selectedIndex, setSelectedIndex] = useState(currentAvatar ? -1 : 0);
  const [isCustom, setIsCustom] = useState(false);

  // If passed avatar is not in defaults, treat as custom
  useEffect(() => {
      const idx = DEFAULT_AVATARS.indexOf(selectedUrl);
      if (idx === -1) {
          setIsCustom(true);
          setSelectedIndex(-1);
      } else {
          setIsCustom(false);
          setSelectedIndex(idx);
      }
  }, [selectedUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedUrl(reader.result as string);
        setIsCustom(true);
        setSelectedIndex(-1);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (url: string, index: number) => {
      setSelectedUrl(url);
      setSelectedIndex(index);
      setIsCustom(false);
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[160] p-4 animate-in fade-in duration-500 backdrop-blur-sm" onClick={!isInitialSetup && onCancel ? onCancel : undefined}>
       <div 
         className="max-w-md w-full bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 relative shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col items-center max-h-[95vh] overflow-y-auto custom-scrollbar"
         onClick={(e) => e.stopPropagation()}
       >
          
          {/* Header */}
          <div className="text-center mb-6 z-10 w-full relative shrink-0">
             {!isInitialSetup && onCancel && (
                 <button onClick={onCancel} className="absolute right-0 top-0 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">Cancel</button>
             )}
             <div className="w-16 h-16 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500 animate-pulse-slow">
                <User className="text-emerald-400" size={32} />
             </div>
             <h2 className="text-2xl font-rpg font-bold text-white tracking-widest uppercase text-shadow-lg">
                 {isInitialSetup ? "Manifestation Protocol" : "Vessel Reconfiguration"}
             </h2>
             <div className="text-xs text-emerald-500 font-mono mt-1 uppercase tracking-widest">
                 {isInitialSetup ? "Phase 2: Vessel Selection" : "Identity Override"}
             </div>
          </div>

          {/* Greeting / Name Change */}
          <div className="text-slate-400 text-xs italic text-center mb-6 max-w-xs shrink-0 flex flex-col items-center gap-1">
             <span>"Greetings,</span>
             <div className="flex items-center gap-2">
                 <span className="text-white font-bold text-sm">{currentName}</span>
                 {!isInitialSetup && onRename && (
                     <button onClick={onRename} className="p-1 bg-slate-800 rounded hover:bg-slate-700 text-emerald-400 transition-colors" title="Edit Designation">
                         <Edit2 size={12} />
                     </button>
                 )}
             </div>
             <span>Please choose the face you will wear while procrastinating."</span>
          </div>

          {/* Main Preview with Caption */}
          <div className="relative mb-8 w-full flex flex-col items-center shrink-0">
              <div className="w-40 h-40 rounded-full border-4 border-slate-700 bg-slate-800 shadow-2xl overflow-hidden relative z-10 group transition-all duration-300 hover:border-emerald-500">
                  <img src={selectedUrl} alt="Selected Avatar" className="w-full h-full object-cover pixel-art animate-idle" />
                  
                  {/* Upload Overlay */}
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                      <Camera className="text-white mb-1" size={24} />
                      <span className="text-[10px] text-white font-bold uppercase tracking-wide">Upload Custom</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
              </div>
              
              {/* Flavor Text Caption Box */}
              <div className="mt-6 bg-slate-950 border border-slate-700 px-4 py-3 rounded-lg max-w-xs text-center relative animate-in slide-in-from-top-2 shadow-lg">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 border-t border-l border-slate-700 transform rotate-45"></div>
                  
                  <div className="flex items-start gap-2">
                      <Terminal size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-300 italic leading-relaxed text-left">
                          "{!isCustom && selectedIndex !== -1 ? FLAVOR_TEXTS[selectedIndex] : (isCustom ? "A custom upload? Bold choice. I hope it's not a blurry screenshot of text." : "Choosing a face is hard. Try closing your eyes and clicking randomly.")}"
                      </p>
                  </div>
              </div>
          </div>

          {/* Presets Grid */}
          <div className="w-full mb-6 shrink-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 text-center tracking-widest">Standard Issue Vessels</p>
              
              <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-6 -mx-6 custom-scrollbar justify-start">
                  {DEFAULT_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectPreset(url, idx)}
                        className={`w-14 h-14 rounded-full border-2 shrink-0 overflow-hidden transition-all duration-300 transform ${selectedUrl === url ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] scale-110 ring-2 ring-emerald-500/20' : 'border-slate-700 opacity-60 hover:opacity-100 hover:scale-110 hover:border-slate-500'}`}
                        title="Select this avatar"
                      >
                          <img src={url} className="w-full h-full object-cover pixel-art" alt={`Preset ${idx}`} />
                      </button>
                  ))}
                  <div className="w-2 shrink-0"></div>
              </div>
          </div>

          {/* Custom Upload Button */}
          <div className="w-full mb-8 shrink-0">
              <label className="flex items-center justify-center gap-2 cursor-pointer group bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-500 py-3 rounded-xl transition-all shadow-sm">
                  <Upload size={16} className={`transition-colors ${isCustom ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className={`text-xs font-bold uppercase transition-colors ${isCustom ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      Upload Custom Image
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
          </div>

          {/* Confirm Button */}
          <button 
            onClick={() => onConfirm(selectedUrl)}
            className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-400 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3 shrink-0"
          >
             <Sparkles size={20} /> {isInitialSetup ? "Materialize" : "Update Identity"}
          </button>

       </div>
    </div>
  );
};
