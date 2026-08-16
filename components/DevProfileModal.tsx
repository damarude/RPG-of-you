
import React, { useState } from 'react';
import { X, Code, MapPin, Coffee, Hammer, Bug, Terminal, Cpu, Heart } from 'lucide-react';
import { SupportModal } from './SupportModal';

interface DevProfileModalProps {
  onClose: () => void;
  devModeEnabled?: boolean;
  onRedefaultItems?: () => void;
}

export const DevProfileModal: React.FC<DevProfileModalProps> = ({ 
  onClose, 
  devModeEnabled, 
  onRedefaultItems 
}) => {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in zoom-in-95" onClick={onClose}>
        {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
        
        <div 
            className="bg-slate-900 border-4 border-purple-500 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(168,85,247,0.2)] custom-scrollbar flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-2 bg-black/20 rounded-full transition-colors">
                <X size={24} />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-purple-900 p-8 text-center border-b border-purple-500/30 shrink-0">
                <div className="w-32 h-32 mx-auto bg-slate-800 rounded-full border-4 border-white shadow-2xl overflow-hidden mb-4 relative">
                     <img src="https://raw.githubusercontent.com/damarude/PUBLICDAMAR/main/damar.png" alt="Dev" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                <h2 className="text-3xl font-rpg font-bold text-white tracking-wide text-shadow">Damara the Giant Dreamer</h2>
                <p className="text-purple-400 font-mono text-xs uppercase tracking-widest mt-2">Indie Dev / Prof. Salvager / Accidental Genius (笑)</p>
                
                <div className="flex justify-center gap-4 mt-4 text-xs text-slate-400 font-bold">
                    <span className="flex items-center gap-1"><Terminal size={12} /> +81</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> 日本</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1">
                {/* About Me */}
                <section>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Coffee className="text-yellow-500" size={20} /> About Me
                    </h3>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm text-slate-300 leading-relaxed">
                        <p className="mb-3">
                            A solo developer who somehow survives on high doses of caffeine, ice cream, wagashi, questionable life choices, and the belief that “this next project will fix everything.”
                        </p>
                        <p className="mb-3">
                            Specializes in turning random ideas into apps that are mostly undone and occasionally impress just 1 person (bestfriendo).
                        </p>
                        <p className="italic text-slate-500">
                            Known for saying “I’ll continue that project later” and then forgetting it exists for three months to years.
                        </p>
                    </div>
                </section>

                {/* Mission */}
                <section>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Code className="text-emerald-500" size={20} /> Mission
                    </h3>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm text-slate-300">
                        <p>To create apps that make people say:</p>
                        <p className="text-white font-bold my-1">“Wow, this is cool,”</p>
                        <p>followed immediately by</p>
                        <p className="text-red-400 font-bold my-1">“Why does this one button do absolutely nothing?”</p>
                    </div>
                </section>

                {/* Skills */}
                <section>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Hammer className="text-blue-500" size={20} /> Skills
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div> Breaking things that were previously working</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div> Fixing things I broke (sometimes)</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div> 3D modeling, Unity, Corel, Etc. (Mostly half-as*ed)</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></div> Pretending to understand my own code</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"></div> Debugging by staring at the screen until the bug gets scared and leaves.</li>
                    </ul>
                </section>

                {/* Fun Facts */}
                <section>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Bug className="text-pink-500" size={20} /> Fun Facts
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400">
                            <span className="block text-white font-bold mb-1">Commit Messages</span>
                            “final_fix_v2_realfinal_FINAL_sumpahTerakhirCuok”
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400">
                            <span className="block text-white font-bold mb-1">Compatibility</span>
                            My code works perfectly… on my device only.
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400">
                            <span className="block text-white font-bold mb-1">Sleep Schedule</span>
                            Once said “I’ll sleep after this build” and hasn’t been seen since. (24h+ no sleep + 10h+ physical labor/day).
                        </div>
                    </div>
                </section>

                {/* Support Button */}
                <div className="space-y-3 mt-4">
                    <button 
                        onClick={() => setShowSupport(true)}
                        className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 transform transition hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Heart size={20} className="fill-white animate-pulse" /> Tip for Caffeine
                    </button>

                    {devModeEnabled && onRedefaultItems && (
                        <button 
                            onClick={onRedefaultItems}
                            className="w-full py-3 bg-red-900/30 border border-red-900/50 text-red-400 font-mono text-xs rounded-xl hover:bg-red-900/50 transition-all flex items-center justify-center gap-2"
                        >
                            <Terminal size={14} /> Redefault Items (Cheat)
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center pt-4 border-t border-slate-800 mt-4">
                    <p className="text-xs font-mono text-slate-500 mb-2">Developer Philosophy</p>
                    <p className="text-xl font-rpg font-bold text-white">“If it works, break it.”</p>
                </div>
            </div>
        </div>
    </div>
  );
};
