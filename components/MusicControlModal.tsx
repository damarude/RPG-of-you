
import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, SkipForward, Play, Pause, Music, Radio, Disc, Mic2, ListMusic, AudioWaveform, Zap, Disc3, Swords } from 'lucide-react';
import { audio } from '../services/audioService';

interface MusicControlModalProps {
  onClose: () => void;
  isPlaying: boolean;
  onToggle: () => void;
  onSkip: () => void;
}

const COMEDY_CAPTIONS = [
    "Compiling beats...",
    "Buffering emotional damage...",
    "Bass so heavy it fixes posture.",
    "Loading concentration.exe...",
    "Deleting silence...",
    "Lo-fi beats to regret choices to.",
    "Maximum overdrive initiated.",
    "Synthesizing dopamine.",
    "Spinning digital plastic."
];

const VOLUME_TITLES = (vol: number) => {
    if (vol === 0) return "Mime Mode (Silence)";
    if (vol < 20) return "Library Whisper";
    if (vol < 50) return "Casual Background";
    if (vol < 80) return "Vibe Zone";
    if (vol < 100) return "Neighbour's Problem";
    return "Eardrum Erasure";
};

export const MusicControlModal: React.FC<MusicControlModalProps> = ({ onClose, isPlaying, onToggle, onSkip }) => {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'playlist'>('visualizer');
  const [volume, setVolume] = useState(audio.getVolume() * 100);
  const [currentTrackName, setCurrentTrackName] = useState(audio.getCurrentTrackName());
  const [currentTrackUrl, setCurrentTrackUrl] = useState(audio.getCurrentTrackUrl());
  const [context, setContext] = useState(audio.getCurrentContext());
  const [visualizerBars, setVisualizerBars] = useState<number[]>(new Array(20).fill(10));
  const [caption, setCaption] = useState(COMEDY_CAPTIONS[0]);
  
  // Lists
  const menuTracks = audio.getMenuTracks();
  const battleTracks = audio.getBattleTracks();

  useEffect(() => {
      // Audio polling for track changes
      const interval = setInterval(() => {
          setCurrentTrackName(audio.getCurrentTrackName());
          setCurrentTrackUrl(audio.getCurrentTrackUrl());
          setContext(audio.getCurrentContext());
          
          if (isPlaying) {
              setVisualizerBars(prev => prev.map(() => Math.max(10, Math.random() * 100)));
          } else {
              setVisualizerBars(new Array(20).fill(5));
          }
      }, 100);
      return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
      setCaption(COMEDY_CAPTIONS[Math.floor(Math.random() * COMEDY_CAPTIONS.length)]);
  }, [currentTrackUrl]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      setVolume(val);
      audio.setVolume(val / 100);
  };

  const playSpecific = (url: string) => {
      audio.playSpecificTrack(url);
      audio.playClick();
  };

  const loadCategory = (type: 'MENU' | 'BATTLE') => {
      audio.setPlaylistAndPlay(type);
      audio.playSuccess();
      setCaption(type === 'MENU' ? "Chill vibes loaded." : "Combat protocols engaged.");
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[200] p-3 sm:p-6 animate-in fade-in zoom-in-95" onClick={onClose}>
        <div 
            className="w-full max-w-lg bg-slate-900 border-2 border-purple-500/50 rounded-3xl relative shadow-[0_0_100px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col h-[85vh] sm:h-[700px]"
            onClick={e => e.stopPropagation()}
        >
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,18,23,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 blur-[80px] rounded-full animate-pulse-slow pointer-events-none ${context === 'BATTLE' ? 'bg-red-900/30' : 'bg-purple-900/30'}`}></div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 relative z-10 bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${context === 'BATTLE' ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-purple-900/20 border-purple-500 text-purple-400'}`}>
                        <Radio size={20} className={isPlaying ? "animate-pulse" : ""} />
                    </div>
                    <div>
                        <h2 className="text-lg font-rpg font-bold text-white uppercase tracking-wider leading-none shadow-black drop-shadow-md">Sonic Deck</h2>
                        <p className="text-[9px] text-slate-400 font-mono mt-1 uppercase tracking-widest">{context} FREQUENCY</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
                
                {/* Visualizer View */}
                {activeTab === 'visualizer' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-right-4">
                        
                        {/* 3D Cassette Container */}
                        <div className="perspective-1000 w-64 h-40 mb-8 relative group">
                            <div className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${isPlaying ? 'rotate-x-12 rotate-y-12' : 'rotate-x-0 rotate-y-0'}`}>
                                {/* Cassette Body */}
                                <div className={`absolute inset-0 rounded-2xl border-4 ${context === 'BATTLE' ? 'bg-slate-900 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]'} flex items-center justify-center overflow-hidden`}>
                                    {/* Label */}
                                    <div className="absolute top-2 left-2 right-2 h-8 bg-white/10 rounded px-2 flex items-center justify-between">
                                        <span className="text-[8px] font-bold text-white/50 uppercase">Mix Tape Vol. 1</span>
                                        <span className="text-[8px] font-mono text-white/30">A-Side</span>
                                    </div>
                                    
                                    {/* Reels */}
                                    <div className="flex gap-4 items-center justify-center mt-4">
                                        <div className={`w-12 h-12 rounded-full border-4 border-slate-700 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}>
                                            <div className="w-10 h-10 bg-white/10 rounded-full border border-dashed border-white/30"></div>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full border-4 border-slate-700 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}>
                                            <div className="w-10 h-10 bg-white/10 rounded-full border border-dashed border-white/30"></div>
                                        </div>
                                    </div>

                                    {/* Tape Window */}
                                    <div className="absolute bottom-4 left-10 right-10 h-6 bg-black/50 rounded-sm border border-white/10"></div>
                                </div>
                            </div>
                        </div>

                        {/* Track Info */}
                        <div className="text-center w-full mb-6">
                            <div className="inline-block px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2 backdrop-blur">
                                {caption}
                            </div>
                            <div className="h-16 flex items-center justify-center">
                                <h3 className="text-2xl font-bold text-white leading-tight px-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] line-clamp-2 animate-pulse-slow">
                                    {currentTrackName}
                                </h3>
                            </div>
                        </div>

                        {/* Spectrum Visualizer */}
                        <div className="flex items-end justify-center gap-1 h-12 w-full px-4">
                            {visualizerBars.map((h, i) => (
                                <div 
                                    key={i} 
                                    className={`w-2 rounded-t-sm transition-all duration-100 ease-linear ${context === 'BATTLE' ? 'bg-red-500' : 'bg-purple-500'}`}
                                    style={{ height: `${h}%`, opacity: 0.5 + (h/200) }}
                                ></div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Playlist View */}
                {activeTab === 'playlist' && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 animate-in fade-in slide-in-from-left-4">
                        {/* Battle Category */}
                        <div>
                            <div className="flex justify-between items-center mb-2 px-2">
                                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                    <Swords size={12}/> Combat / Focus
                                </h4>
                                <button onClick={() => loadCategory('BATTLE')} className="text-[9px] font-bold bg-red-900/30 text-red-300 px-2 py-1 rounded border border-red-800 hover:bg-red-800 hover:text-white transition-colors flex items-center gap-1" title="Play only these tracks">
                                    <Play size={8} fill="currentColor"/> Load Deck
                                </button>
                            </div>
                            <div className="space-y-1">
                                {battleTracks.map((url, i) => {
                                    const name = audio.getCurrentTrackName(url);
                                    const isCurrent = url === currentTrackUrl;
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => playSpecific(url)}
                                            className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all group ${isCurrent ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-500'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCurrent ? 'bg-black/20' : 'bg-slate-900 border border-slate-700 group-hover:border-slate-500'}`}>
                                                {isCurrent && isPlaying ? <AudioWaveform size={14} className="animate-pulse"/> : <Play size={10} fill="currentColor"/>}
                                            </div>
                                            <span className="text-xs font-bold truncate">{name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Menu Category */}
                        <div>
                            <div className="flex justify-between items-center mb-2 px-2">
                                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={12}/> Chill / Menu
                                </h4>
                                <button onClick={() => loadCategory('MENU')} className="text-[9px] font-bold bg-purple-900/30 text-purple-300 px-2 py-1 rounded border border-purple-800 hover:bg-purple-800 hover:text-white transition-colors flex items-center gap-1" title="Play only these tracks">
                                    <Play size={8} fill="currentColor"/> Load Deck
                                </button>
                            </div>
                            <div className="space-y-1">
                                {menuTracks.map((url, i) => {
                                    const name = audio.getCurrentTrackName(url);
                                    const isCurrent = url === currentTrackUrl;
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => playSpecific(url)}
                                            className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all group ${isCurrent ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-500'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCurrent ? 'bg-black/20' : 'bg-slate-900 border border-slate-700 group-hover:border-slate-500'}`}>
                                                {isCurrent && isPlaying ? <AudioWaveform size={14} className="animate-pulse"/> : <Play size={10} fill="currentColor"/>}
                                            </div>
                                            <span className="text-xs font-bold truncate">{name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="p-6 pt-2 bg-slate-900/80 backdrop-blur-lg border-t border-white/5 relative z-20">
                
                {/* Volume Slider */}
                <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mb-1 px-1">
                        <span>Volume</span>
                        <span className={volume > 80 ? "text-red-400 animate-pulse" : "text-purple-400"}>{VOLUME_TITLES(volume)}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <Volume2 size={16} className={volume === 0 ? "text-slate-600" : "text-white"} />
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={volume} 
                            onChange={handleVolumeChange} 
                            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-purple-400 transition-all"
                        />
                        <span className="text-xs font-mono font-bold text-white w-8 text-right">{volume}%</span>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button 
                            onClick={() => setActiveTab('visualizer')}
                            className={`p-2 rounded-lg transition-all ${activeTab === 'visualizer' ? 'bg-white text-black shadow' : 'text-slate-400 hover:text-white'}`}
                            title="Visualizer Mode"
                        >
                            <Disc3 size={18} className={activeTab === 'visualizer' && isPlaying ? 'animate-spin-slow' : ''} />
                        </button>
                        <button 
                            onClick={() => setActiveTab('playlist')}
                            className={`p-2 rounded-lg transition-all ${activeTab === 'playlist' ? 'bg-white text-black shadow' : 'text-slate-400 hover:text-white'}`}
                            title="Playlist Mode"
                        >
                            <ListMusic size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onToggle}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-xl border-2 ${isPlaying ? 'bg-purple-600 border-purple-400 text-white shadow-purple-900/30' : 'bg-slate-800 border-slate-600 text-slate-300'}`}
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>

                        <button 
                            onClick={onSkip}
                            className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-600 text-slate-400 hover:text-white hover:border-white transition-all active:scale-95 flex items-center justify-center"
                            title="Skip Track"
                        >
                            <SkipForward size={20} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};
