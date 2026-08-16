
import React from 'react';
import { X, HelpCircle, Info } from 'lucide-react';

interface HelpModalProps {
  feature: string;
  onClose: () => void;
}

const HELP_CONTENT: Record<string, { title: string; content: string }> = {
  "dashboard": {
    title: "Command Center",
    content: "This is your Base. It shows your pathetic stats and how many days you've managed to function like a human being (Streak). That heatmap shows your activity; try to keep it green, unlike your plants."
  },
  "skills": {
    title: "Grimoire of Knowledge",
    content: "Here lies the list of things you pretend to be good at. Click a card to train. 'Challenge' mode is a sudden death quiz—get it wrong, and you lose progress. High risk, high reward, just like that questionable sushi you ate."
  },
  "quests": {
    title: "Chore Board",
    content: "Daily and Weekly tasks to bribe you into productivity. Complete them for Gold. Main Quests guide your overall evolution. Ignore them at your own peril (and poverty)."
  },
  "store": {
    title: "Capitalism Simulator",
    content: "Spend your hard-earned gold on digital drip. Equipment provides actual stat bonuses like EXP multipliers and Streak Protection. Yes, buying a better shirt makes you code better. It's science."
  },
  "library": {
    title: "The Archives",
    content: "A collection of all the quiz questions you've conquered. Unlocking more knowledge here provides a permanent global EXP multiplier. Basically, the smarter you get, the faster you level up."
  },
  "daily_bonus": {
    title: "Participation Awards",
    content: "Come back every 24 hours for free stuff. The rewards scale up to Day 7. Miss a day, and it resets to Day 1. Don't cry about it, just be consistent."
  }
};

export const HelpModal: React.FC<HelpModalProps> = ({ feature, onClose }) => {
  const data = HELP_CONTENT[feature] || { title: "Unknown", content: "No data available." };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in zoom-in-95" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-900/30 flex items-center justify-center border border-indigo-500/30">
                <HelpCircle className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white font-rpg">{data.title}</h3>
        </div>

        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed italic">
            "{data.content}"
        </div>
        
        <div className="mt-4 text-center">
            <button onClick={onClose} className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wider">
                Dismiss
            </button>
        </div>
      </div>
    </div>
  );
};
