
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Shield, Sword, ShoppingBag, CheckCircle2, Brain, Heart } from 'lucide-react';

interface TutorialModalProps {
  onClose: (dontShowAgain: boolean) => void;
}

const SLIDES = [
  {
    title: "Gamify Your Existence",
    text: "Welcome to the RPG of You. The concept is simple: turn your real-life productivity into stats. When you start a timer here, you earn EXP per minute. But here's the catch: You actually have to *do* the work. If you just run the timer and watch TikTok, you're only leveling up your Clown proficiency.",
    icon: <Brain size={64} className="text-cyan-400 animate-pulse" />,
    color: "from-slate-900 to-cyan-900/20"
  },
  {
    title: "The Grind is Real",
    text: "Oh, look who decided to be productive today. This app tracks your growth. It's like your real life, but with actual rewards and less disappointment from your parents.",
    icon: <Shield size={64} className="text-purple-400 animate-bounce" />,
    color: "from-slate-800 to-slate-900"
  },
  {
    title: "Beat Up Your Bugs",
    text: "Start a session to focus. We spawn monsters based on your level. If you work for 120 minutes, you might become a Legend. If you quit after 5 minutes, you remain a disappointment.",
    icon: <Sword size={64} className="text-red-400 animate-pulse" />,
    color: "from-slate-900 to-red-900/20"
  },
  {
    title: "Retail Therapy",
    text: "Earn Gold. Buy clothes. Dress up your pixel avatar because let's be honest, your real-life fashion sense is probably just 'free tech conference t-shirts'.",
    icon: <ShoppingBag size={64} className="text-yellow-400 animate-spin-slow" />,
    color: "from-slate-900 to-yellow-900/20"
  },
  {
    title: "Don't Be Weak",
    text: "Streaks matter. If you miss a day, your skills decay. Just like your social skills when you code for 12 hours straight. Keep the flame lit or suffer the consequences.",
    icon: <CheckCircle2 size={64} className="text-emerald-400 animate-pulse" />,
    color: "from-slate-900 to-emerald-900/20"
  },
  {
    title: "Support the Dev",
    text: "This game is 100% free. No forced ads, no pay-to-win. If you enjoy it, please support us by clicking the Heart button in the settings. You can leave a review, visit our website, watch a manual ad, or leave a tip. Your support keeps the updates coming!",
    icon: <Heart size={64} className="text-pink-500 animate-pulse" />,
    color: "from-slate-900 to-pink-900/20"
  }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShow, setDontShow] = useState(false);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(c => c + 1);
    } else {
      onClose(dontShow);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={() => onClose(dontShow)}>
      <div 
        className={`relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-gradient-to-br ${SLIDES[currentSlide].color} transition-colors duration-500`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-1">
            {SLIDES.map((_, idx) => (
                <div key={idx} className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx <= currentSlide ? 'bg-white' : 'bg-white/20'}`} />
            ))}
        </div>

        <button onClick={() => onClose(dontShow)} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
            <X size={24} />
        </button>

        <div className="p-8 flex flex-col items-center text-center min-h-[450px]">
           <div className="mt-8 mb-8 relative">
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full animate-pulse-slow"></div>
                <div className="relative z-10 transition-all duration-500 transform hover:scale-110">
                    {SLIDES[currentSlide].icon}
                </div>
           </div>

           <h2 className="text-2xl font-rpg font-bold text-white mb-4 animate-in slide-in-from-bottom-2 fade-in duration-500 key-{currentSlide}">
              {SLIDES[currentSlide].title}
           </h2>
           
           <p className="text-slate-300 text-sm leading-relaxed mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700 key-{currentSlide}">
              {SLIDES[currentSlide].text}
           </p>

           <div className="mt-auto w-full">
             <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={handlePrev} 
                    disabled={currentSlide === 0}
                    className={`p-2 rounded-full hover:bg-white/10 transition-colors ${currentSlide === 0 ? 'opacity-0' : 'opacity-100'}`}
                >
                    <ChevronLeft size={24} />
                </button>

                <button 
                    onClick={handleNext}
                    className="bg-white text-black font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                    {currentSlide === SLIDES.length - 1 ? "Initialize" : "Next"} <ChevronRight size={16} />
                </button>
             </div>

             <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                 <input 
                    type="checkbox" 
                    id="dontShow" 
                    checked={dontShow} 
                    onChange={(e) => setDontShow(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800"
                 />
                 <label htmlFor="dontShow" className="cursor-pointer select-none">
                    Skip intro next time.
                 </label>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
