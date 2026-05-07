import React, { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";
import { db, COLLECTIONS, auth } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { 
  Sparkles, 
  Globe, 
  Camera, 
  StickyNote, 
  Code, 
  UtensilsCrossed, 
  Rocket, 
  BrainCircuit,
  ArrowRight,
  Loader2
} from "lucide-react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { toast } from "sonner";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success("Welcome back!");
    } catch (e) {
      toast.error("Authentication failed");
    }
  };

  const handleGithubLogin = async () => {
     try {
      await signInWithPopup(auth, new GithubAuthProvider());
      toast.success("Welcome back!");
    } catch (e) {
      toast.error("Authentication failed");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created!");
      }
    } catch (e) {
      toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Effects */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full -top-[20%] -left-[10%]" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full -bottom-[20%] -right-[10%]" 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="max-w-md w-full space-y-12 relative z-10"
      >
        <div className="text-center space-y-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center font-bold text-4xl mx-auto shadow-2xl shadow-indigo-500/50 ring-1 ring-white/20"
          >
            S
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase whitespace-nowrap">
              Stash<span className="text-indigo-500">.</span>
            </h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-[0.3em]">
              Your AI-Powered Mind
            </p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
          
          <form onSubmit={handleEmailAuth} className="space-y-6 relative z-10">
            <div className="space-y-3">
               <Input 
                 type="email" 
                 placeholder="Email address" 
                 className="bg-white/[0.05] border-white/5 h-14 rounded-2xl px-6 focus:border-indigo-500/50 transition-all text-base"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
               <Input 
                 type="password" 
                 placeholder="Password" 
                 className="bg-white/[0.05] border-white/5 h-14 rounded-2xl px-6 focus:border-indigo-500/50 transition-all text-base"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
            </div>

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : isLogin ? "Sign In" : "Register"}
            </Button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full h-[1px] bg-white/5" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black"><span className="bg-[#0c0c0e] px-4 text-white/20">Secure Connector</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <Button variant="outline" className="border-white/5 bg-white/[0.03] rounded-2xl h-14 hover:bg-white/[0.08] font-bold text-white/60 hover:text-white transition-all" onClick={handleGoogleLogin}>
              Google
            </Button>
            <Button variant="outline" className="border-white/5 bg-white/[0.03] rounded-2xl h-14 hover:bg-white/[0.08] font-bold text-white/60 hover:text-white transition-all" onClick={handleGithubLogin}>
              GitHub
            </Button>
          </div>

          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center mt-10 text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors"
          >
            {isLogin ? "Join the collective" : "Return to Stash"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const ONBOARDING_OPTIONS = [
  { id: "prompts", label: "AI Prompts", icon: Sparkles },
  { id: "websites", label: "Websites", icon: Globe },
  { id: "inspiration", label: "Inspiration", icon: Camera },
  { id: "coding", label: "Coding", icon: Code },
  { id: "research", label: "Research", icon: BrainCircuit },
  { id: "recipes", label: "Recipes", icon: UtensilsCrossed },
  { id: "startup", label: "Startup Ideas", icon: Rocket },
  { id: "other", label: "Other", icon: StickyNote },
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleOption = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        onboardingComplete: true,
        preferences: { topSaves: selected },
      });
      onComplete();
    } catch (e) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 pb-20">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full space-y-12 relative"
      >
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black tracking-tight">What do you stash most?</h1>
          <p className="text-white/40 text-xl">We'll personalize your experience based on your interests.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ONBOARDING_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group",
                  isSelected 
                    ? "bg-indigo-600 border-indigo-500 scale-105 shadow-2xl shadow-indigo-500/40" 
                    : "bg-white/5 border-white/5 hover:border-white/20"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  isSelected ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                )}>
                  <Icon size={24} className={isSelected ? "text-white" : "text-white/40"} />
                </div>
                <span className={cn("font-bold", isSelected ? "text-white" : "text-white/60")}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center pt-8">
          <Button 
            onClick={handleComplete}
            disabled={selected.length === 0 || loading}
            className="bg-white text-black hover:bg-white/90 h-14 px-12 rounded-2xl font-bold text-lg gap-3"
          >
            {loading ? "Saving..." : "Start Stashing"}
            <ArrowRight size={20} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";
