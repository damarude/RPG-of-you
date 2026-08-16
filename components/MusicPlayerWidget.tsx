
import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

interface MusicPlayerWidgetProps {
  isPlaying: boolean;
  onToggle: () => void;
  onSkip: () => void;
  onOpenControl?: () => void; // New Prop
}

export const MusicPlayerWidget: React.FC<MusicPlayerWidgetProps> = ({ isPlaying, onToggle, onSkip, onOpenControl }) => {
  return (
    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/50 rounded-full pl-3 pr-2 py-1.5 backdrop-blur-md shadow-lg mr-1 animate-in fade-in slide-in-from-top-4 hover:border-purple-500/30 transition-colors group">
      {/* Visualizer Icon - Clickable */}
      <div 
        onClick={onOpenControl}
        className="flex items-end gap-0.5 h-3 w-4 pb-0.5 cursor-pointer hover:opacity-80 active:scale-90 transition-transform"
        title="Open Audio Interface"
      >
          <div className={`w-1 bg-purple-500 rounded-t-sm transition-all duration-300 ${isPlaying ? 'h-3 animate-pulse' : 'h-1'}`}></div>
          <div className={`w-1 bg-purple-400 rounded-t-sm transition-all duration-300 ${isPlaying ? 'h-2.5 animate-pulse delay-75' : 'h-1'}`}></div>
          <div className={`w-1 bg-purple-600 rounded-t-sm transition-all duration-300 ${isPlaying ? 'h-3 animate-pulse delay-150' : 'h-1'}`}></div>
      </div>

      <div className="h-4 w-px bg-slate-700/50"></div>

      {/* Controls */}
      <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title={isPlaying ? "Pause Music" : "Play Music"}
          >
              {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onSkip(); }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Skip Track"
          >
              <SkipForward size={12} fill="currentColor" />
          </button>
      </div>
    </div>
  );
};
