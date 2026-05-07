import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="h-screen w-screen bg-[#020203] flex flex-col items-center justify-center relative overflow-hidden noise-bg">
      {/* Premium Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full top-[-10%] left-[-10%]" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full bottom-[-10%] right-[-10%]" 
      />

      <div className="relative flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center font-bold text-4xl shadow-2xl shadow-indigo-500/50">
            <span className="text-white drop-shadow-lg">S</span>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border border-white/5 rounded-[2.5rem]"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 border border-white/5 rounded-[3rem]"
          />
        </motion.div>

        <div className="flex flex-col items-center gap-3">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-black tracking-widest text-white/90 uppercase"
          >
            Stash
          </motion.h2>
          <div className="flex items-center gap-2 overflow-hidden px-4">
             <motion.div 
               initial={{ x: -100 }}
               animate={{ x: 100 }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className="h-[2px] w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
             />
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/20 text-xs font-black tracking-[0.4em] uppercase flex items-center gap-2"
          >
            <Sparkles size={12} className="text-indigo-500" />
            Neural Stash AI Ready
          </motion.p>
        </div>
      </div>
    </div>
  );
}
