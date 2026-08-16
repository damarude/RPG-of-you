
import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { AlertTriangle, Swords, Trophy, Skull, CheckCircle2, XCircle, RefreshCw, ChevronDown, X } from 'lucide-react';
import { formatNumber } from '../gameData';

interface ChallengeModalProps {
  questions: QuizQuestion[]; // Array of questions
  onCorrect: (questionId: string) => void;
  onComplete: (results: { correct: number; failed: boolean }) => void;
  isReviewMode?: boolean; // New prop for safe rechallenge
  isPhilosopherStoneMode?: boolean; // New prop for stone protection
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({ 
    questions, 
    onCorrect, 
    onComplete, 
    isReviewMode = false,
    isPhilosopherStoneMode = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [failed, setFailed] = useState(false);

  const currentQuestion = questions[currentIndex];
  const mainColor = isReviewMode ? 'emerald' : (isPhilosopherStoneMode ? 'purple' : 'purple');
  const borderColor = isReviewMode ? 'border-emerald-600' : (isPhilosopherStoneMode ? 'border-purple-600' : (failed ? 'border-red-600' : 'border-purple-600'));

  const handleSubmit = () => {
      if (selected === null) return;
      
      setIsRevealed(true);
      const isCorrect = selected === currentQuestion.correctAnswerIndex;
      
      if (isCorrect) {
          setCorrectCount(prev => prev + 1);
          if (!isReviewMode) onCorrect(currentQuestion.id); 
          
          setTimeout(() => {
              proceedNext();
          }, 1000);
      } else {
          if (isReviewMode || isPhilosopherStoneMode) {
              setTimeout(() => {
                  proceedNext();
              }, 2000);
          } else {
              setFailed(true);
              setTimeout(() => {
                  onComplete({ correct: correctCount, failed: true });
              }, 2000);
          }
      }
  };

  const proceedNext = () => {
      if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setSelected(null);
          setIsRevealed(false);
      } else {
          onComplete({ correct: correctCount + (selected === currentQuestion.correctAnswerIndex ? 0 : 0), failed: false });
      }
  };

  const handleExit = () => {
      // Treat as completion with current stats
      if (!isReviewMode && !failed) {
          // If in challenge mode and exiting early, effectively a "retreat" or "fail" depending on rules?
          // Usually exiting a sudden death challenge means forfeiture.
          if (confirm("Exiting the challenge now will forfeit any streak. Are you sure?")) {
              onComplete({ correct: correctCount, failed: true });
          }
      } else {
          // Review mode just exits
          onComplete({ correct: correctCount, failed: false });
      }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in zoom-in-95">
        <div className={`bg-slate-900 border-2 ${borderColor} rounded-2xl w-full max-w-md p-6 relative shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-colors duration-500 max-h-[90vh] flex flex-col`}>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isReviewMode ? 'Rechallenge' : 'Challenge'}</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-bold text-white border border-slate-700">
                        {currentIndex + 1} / {questions.length}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 size={14} /> {correctCount}
                    </div>
                    <button onClick={handleExit} className="p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Question - Scrollable */}
            <div className={`bg-slate-800 p-5 rounded-xl border border-slate-700 mb-4 relative overflow-hidden shrink-0 flex flex-col`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${failed ? 'bg-red-600' : `bg-${mainColor}-600`}`}></div>
                <div className="overflow-y-auto custom-scrollbar max-h-[25vh] pr-2">
                    <p className="text-sm font-bold text-white leading-relaxed whitespace-pre-wrap">{currentQuestion.question}</p>
                </div>
                {/* Scroll hint if needed (could calculate height, but simple gradient works) */}
                <div className="h-4 bg-gradient-to-t from-slate-800 to-transparent shrink-0"></div>
            </div>

            {/* Options - Scrollable Container */}
            <div className="space-y-3 mb-6 overflow-y-auto custom-scrollbar flex-1 pr-1 min-h-0">
                {currentQuestion.options.map((opt, idx) => {
                    let btnClass = "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500";
                    let icon = null;

                    if (selected === idx) btnClass = `bg-${mainColor}-900/50 border-${mainColor}-500 text-white`;
                    
                    if (isRevealed) {
                        if (idx === currentQuestion.correctAnswerIndex) {
                            btnClass = "bg-emerald-900/80 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]";
                            icon = <Trophy size={16} className="text-emerald-400 animate-bounce shrink-0" />;
                        } else if (selected === idx) {
                            btnClass = "bg-red-900/80 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]";
                            icon = <XCircle size={16} className="text-red-400 animate-pulse shrink-0" />;
                        } else {
                            btnClass = "opacity-30 bg-slate-950 border-slate-800";
                        }
                    }

                    return (
                        <button 
                            key={idx}
                            onClick={() => !isRevealed && setSelected(idx)}
                            disabled={isRevealed}
                            className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-300 flex justify-between items-center gap-3 group ${btnClass}`}
                        >
                            <span className="break-words w-full">{opt}</span>
                            {icon}
                        </button>
                    );
                })}
            </div>

            {/* Action */}
            <div className="shrink-0 mt-auto">
                {!failed ? (
                    <button 
                        onClick={handleSubmit}
                        disabled={selected === null || isRevealed}
                        className={`w-full py-4 bg-gradient-to-r ${isReviewMode ? 'from-emerald-700 to-emerald-600 hover:from-emerald-600' : 'from-purple-700 to-purple-600 hover:from-purple-600'} hover:to-${mainColor}-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl shadow-lg transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2`}
                    >
                        {isRevealed ? (isReviewMode ? 'Next' : 'Processing...') : 'Confirm'}
                        {!isRevealed && (isReviewMode ? <RefreshCw size={16} /> : <Swords size={16} />)}
                    </button>
                ) : (
                    <div className="text-center text-red-500 font-bold uppercase tracking-widest animate-pulse p-4 bg-red-950/30 rounded-xl border border-red-900/50">
                        Session Terminated
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
