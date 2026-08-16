
import React, { useState } from 'react';
import { X, Banknote, PlayCircle, Globe, Heart, ThumbsUp, ArrowLeft, Coins, CreditCard, Gem, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface SupportModalProps {
  onClose: () => void;
  onSupport?: (amount: number) => void;
  onWatchAd?: () => void;
}

const SUPPORT_TIERS = [
    { amount: 0.99, id: 'd1', label: "Thoughts & Prayers", desc: "It does absolutely nothing, but it makes you feel like a good person. I appreciate the validation.", icon: "🙏" },
    { amount: 2.99, id: 'd2', label: "Cheap Energy Drink", desc: "Tastes like battery acid and heart palpitations. Exactly what I need to fix this bug at 3 AM.", icon: "⚡" },
    { amount: 4.99, id: 'd3', label: "A Decent Meal", desc: "Real food. Not instant ramen. My body is in shock just thinking about actual vitamins.", icon: "🍔" },
    { amount: 9.99, id: 'd4', label: "Therapy Co-Pay", desc: "Coding is pain. This helps undo the trauma of reading my own code from 6 months ago.", icon: "🧠" },
    { amount: 19.99, id: 'd5', label: "Server & Hosting", desc: "Keeps the lights on. If the server dies, I die. Figuratively. Maybe literally.", icon: "💻" },
    { amount: 49.99, id: 'd6', label: "New Keyboard", desc: "My 'Ctrl', 'C', and 'V' keys are worn down to the plastic. I smashed the last one in a fit of rage.", icon: "⌨️" },
    { amount: 99.99, id: 'd7', label: "Rent Money", desc: "My landlord doesn't accept 'exposure' or 'cool app features' as payment. Please help.", icon: "🏠" },
    { amount: 499.99, id: 'd8', label: "I Am Your Boss Now", desc: "Look at you, moneybags. For this much, I'll name a variable after you. Maybe even a function.", icon: "👑" },
];

export const SupportModal: React.FC<SupportModalProps> = ({ onClose, onSupport, onWatchAd }) => {
  const [view, setView] = useState<'menu' | 'coffee' | 'detail'>('menu');
  const [selectedTier, setSelectedTier] = useState<typeof SUPPORT_TIERS[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTierClick = (tier: typeof SUPPORT_TIERS[0]) => {
      setSelectedTier(tier);
      setView('detail');
  };

  const handleDonate = () => {
      setIsProcessing(true);
      // Simulate payment process
      setTimeout(() => {
          setIsProcessing(false);
          alert(`Tip of $${selectedTier?.amount} simulated! You are awesome.`);
          if (onSupport && selectedTier) onSupport(selectedTier.amount);
          onClose();
      }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[200] p-4 animate-in fade-in duration-500" onClick={onClose}>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
      </div>

      {/* Main Container - Complex Glassmorphism Card */}
      <div 
        className="relative w-full max-w-md h-auto max-h-[85vh] bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ring-1 ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Animated Border Gradient */}
        <div className="absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-br from-pink-500/20 via-transparent to-purple-500/20 opacity-50 pointer-events-none"></div>

        {/* Close Button - Enhanced */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-50 p-2 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all border border-white/10 hover:border-white/30 hover:rotate-90 duration-300"
        >
          <X size={20} />
        </button>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10">
            
            {view === 'menu' && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 flex flex-col items-center">
                    {/* Hero Section */}
                    <div className="relative mb-8 mt-4 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 rounded-full"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border-4 border-slate-700 group-hover:border-pink-500 transition-colors duration-500 shadow-2xl">
                            <Heart className="text-pink-500 fill-pink-500 group-hover:scale-110 transition-transform duration-300" size={40} />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-pink-400 text-[10px] font-bold px-3 py-1 rounded-full border border-pink-500/30 whitespace-nowrap shadow-lg">
                            Dev Fuel
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-rpg font-bold text-white uppercase tracking-widest drop-shadow-md mb-2">
                            Fuel The Machine
                        </h2>
                        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                            Help me survive another sleepless night of coding bugs into features.
                        </p>
                    </div>

                    {/* Menu Grid */}
                    <div className="grid grid-cols-1 gap-3 w-full">
                        {/* Under Construction Block for Tip and Ad */}
                        <div className="relative w-full rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-[2px] flex items-center justify-center border-2 border-dashed border-yellow-500/50 cursor-not-allowed rounded-2xl">
                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #eab308 10px, #eab308 20px)'
                                }}></div>
                                <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 bg-slate-950/90 px-6 py-3 rounded-xl border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                                    <AlertCircle className="text-yellow-500 animate-bounce" size={24} />
                                    <span className="font-black text-yellow-500 text-xs tracking-widest uppercase">Under Construction</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3 w-full opacity-40 pointer-events-none grayscale">
                                <button 
                                    onClick={() => setView('coffee')}
                                    className="group relative bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-amber-500/50 rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.3)] overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:via-amber-500/10 transition-all duration-500"></div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors duration-300">
                                            <Banknote size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm mb-0.5 group-hover:text-amber-400 transition-colors">Send a Tip</h3>
                                            <p className="text-[10px] text-slate-400 leading-tight">Directly fund my bad decisions and questionable life choices. It's faster than coffee.</p>
                                        </div>
                                        <ArrowLeft className="ml-auto text-slate-600 group-hover:text-amber-500 rotate-180 transition-all transform group-hover:translate-x-1" size={16} />
                                    </div>
                                </button>

                                <button 
                                    onClick={onWatchAd}
                                    className="group relative bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-blue-500/50 rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.3)] overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:via-blue-500/10 transition-all duration-500"></div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                            <PlayCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm mb-0.5 group-hover:text-blue-400 transition-colors">Voluntarily Watch Ad</h3>
                                            <p className="text-[10px] text-slate-400 leading-tight">I get $0.01, You get 0.01 Bless exp. We suffer together for 30s.</p>
                                        </div>
                                        <ArrowLeft className="ml-auto text-slate-600 group-hover:text-blue-500 rotate-180 transition-all transform group-hover:translate-x-1" size={16} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        <button className="group relative bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-purple-500/50 rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(168,85,247,0.3)] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:via-purple-500/10 transition-all duration-500"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                                    <ThumbsUp size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm mb-0.5 group-hover:text-purple-400 transition-colors">Thanks App</h3>
                                    <p className="text-[10px] text-slate-400 leading-tight">Support purely for the sake of supporting.</p>
                                </div>
                                <ArrowLeft className="ml-auto text-slate-600 group-hover:text-purple-500 rotate-180 transition-all transform group-hover:translate-x-1" size={16} />
                            </div>
                        </button>

                        <button className="group relative bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-emerald-500/50 rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:via-emerald-500/10 transition-all duration-500"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm mb-0.5 group-hover:text-emerald-400 transition-colors">The Shrine</h3>
                                    <p className="text-[10px] text-slate-400 leading-tight">Visit the dev website. It's mostly duct tape.</p>
                                </div>
                                <ArrowLeft className="ml-auto text-slate-600 group-hover:text-emerald-500 rotate-180 transition-all transform group-hover:translate-x-1" size={16} />
                            </div>
                        </button>
                    </div>

                    <div className="mt-8 text-center px-4 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[9px] text-slate-500 italic">
                            * No actual coffee is delivered. Funds go directly to my snack budget.
                        </p>
                    </div>
                </div>
            )}

            {view === 'coffee' && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center gap-4 mb-6 mt-2">
                        <button onClick={() => setView('menu')} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-rpg font-bold text-white uppercase tracking-wider">Select Support</h2>
                            <p className="text-xs text-amber-400 font-bold">How much do you pity me?</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {SUPPORT_TIERS.map((tier) => (
                            <button 
                                key={tier.id}
                                onClick={() => handleTierClick(tier)}
                                className="w-full bg-slate-800/50 hover:bg-amber-900/10 border border-white/5 hover:border-amber-500/50 p-3 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden"
                            >
                                {/* Hover Gradient BG */}
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-transparent transition-all duration-500"></div>
                                
                                <div className="flex items-center gap-4 flex-1 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                                        {tier.icon}
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{tier.label}</div>
                                        <div className="text-[10px] text-slate-500 line-clamp-1 group-hover:text-slate-400">{tier.desc}</div>
                                    </div>
                                </div>
                                <div className="relative z-10 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 group-hover:border-amber-500/50 text-white font-mono font-bold text-xs group-hover:text-amber-400 shrink-0 shadow-lg">
                                    ${tier.amount}
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="text-center bg-slate-950/30 p-3 rounded-xl border border-white/5">
                        <p className="text-[9px] text-slate-500">
                            Processed via Google Play / App Store. Currency conversion may apply.<br/>
                            (We accept pity, guilt, and credit cards).
                        </p>
                    </div>
                </div>
            )}

            {view === 'detail' && selectedTier && (
                <div className="animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-6 mt-2 shrink-0">
                        <button onClick={() => setView('coffee')} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-rpg font-bold text-white uppercase tracking-wider">Confirm Tip</h2>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-3xl border border-white/10 mb-6 relative overflow-hidden group">
                        
                        {/* Glow Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/20 blur-[60px] rounded-full animate-pulse-slow"></div>

                        <div className="relative z-10 flex flex-col items-center w-full">
                            <div className="w-28 h-28 bg-slate-900 rounded-full flex items-center justify-center border-4 border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.3)] mb-6 animate-bounce">
                                <span className="text-6xl drop-shadow-md">{selectedTier.icon}</span>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-2 text-center text-shadow-lg">{selectedTier.label}</h3>
                            <div className="text-4xl font-mono font-bold text-amber-400 mb-8 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">${selectedTier.amount}</div>
                            
                            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 w-full mb-4 shadow-inner relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-2 text-slate-600">
                                    <Sparkles size={16} />
                                </div>
                                <p className="text-sm text-slate-300 italic text-center leading-relaxed">
                                    "{selectedTier.desc}"
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                                <AlertCircle size={12} className="text-amber-500" />
                                <span>Plus $0.00 Emotional Damage Fee (Waived)</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleDonate}
                        disabled={isProcessing}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-900/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-sm relative overflow-hidden shrink-0 group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer"></div>
                        {isProcessing ? (
                            <>Processing Transaction...</>
                        ) : (
                            <><CreditCard size={18} /> Tip ${selectedTier.amount}</>
                        )}
                    </button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
