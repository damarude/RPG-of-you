
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Star, Hexagon } from 'lucide-react';

interface PhilosopherStoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  amount?: number;
}

export const PhilosopherStoneModal: React.FC<PhilosopherStoneModalProps> = ({ isOpen, onClose, reason, amount = 1 }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop with mystical blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
          />

          {/* Magical Particles Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight,
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  y: [null, Math.random() * -200],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 3, 
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className="absolute w-1 h-1 bg-purple-400 rounded-full blur-[1px]"
              />
            ))}
          </div>

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: -90 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="relative w-full max-w-sm bg-gradient-to-b from-indigo-950/80 to-slate-950 border-2 border-purple-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(139,92,246,0.3)] flex flex-col items-center text-center overflow-hidden"
          >
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />
            
            {/* Animated Hexagon Frame */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -right-20 w-64 h-64 border border-purple-500/20 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-20 -left-20 w-64 h-64 border border-blue-500/20 rounded-full"
            />

            {/* The Philosopher's Stone Icon */}
            <div className="relative mb-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  filter: ["drop-shadow(0 0 10px rgba(168,85,247,0.5))", "drop-shadow(0 0 30px rgba(168,85,247,0.8))", "drop-shadow(0 0 10px rgba(168,85,247,0.5))"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-900 rounded-2xl flex items-center justify-center border-2 border-purple-400 shadow-2xl relative z-10"
              >
                <Hexagon size={48} className="text-purple-100 fill-purple-100/20" />
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white/20 rounded-2xl"
                />
              </motion.div>
              
              {/* Decorative Rings */}
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
                className="absolute inset-[-10px] border border-dashed border-purple-400/40 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, scale: { duration: 2.5, repeat: Infinity } }}
                className="absolute inset-[-20px] border border-dotted border-blue-400/30 rounded-full"
              />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-rpg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-blue-300 mb-2 tracking-wider">
                Alchemical Gift
              </h2>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles size={16} className="text-yellow-400 animate-pulse" />
                <span className="text-purple-200 text-sm font-medium uppercase tracking-widest">Mystery Unveiled</span>
                <Sparkles size={16} className="text-yellow-400 animate-pulse" />
              </div>

              <p className="text-slate-300 text-sm mb-8 leading-relaxed italic">
                "The universe conspires to reward your persistence. A fragment of the infinite has manifested in your hands."
              </p>

              <div className="bg-slate-900/50 border border-purple-500/30 rounded-2xl p-4 mb-8 relative group">
                <div className="absolute inset-0 bg-purple-500/5 blur-xl group-hover:bg-purple-500/10 transition-colors" />
                <p className="text-xs text-slate-500 uppercase tracking-tighter mb-1">Received for:</p>
                <p className="text-purple-300 font-bold text-lg">{reason}</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-white font-mono text-2xl">+{amount}</span>
                  <span className="text-purple-400 text-xs font-bold uppercase">Philosopher's Stone</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-900/40 border border-purple-400/50 transition-all"
              >
                Accept the Power
              </motion.button>
            </motion.div>

            {/* Bottom Flare */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-purple-500/20 blur-3xl rounded-full" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
