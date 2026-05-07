import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  Layers, 
  Sparkles, 
  Globe, 
  Camera, 
  StickyNote, 
  Star, 
  Trash2, 
  Settings, 
  LogOut,
  ChevronRight,
  Plus,
  Clock,
  Youtube
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
  { id: "home", label: "Core", icon: Home },
  { id: "all", label: "All Units", icon: Layers },
  { id: "prompts", label: "AI Prompts", icon: Sparkles },
  { id: "websites", label: "Web Intelligence", icon: Globe },
  { id: "videos", label: "Video Intelligence", icon: Youtube },
  { id: "screenshots", label: "Visual Stash", icon: Camera },
  { id: "notes", label: "Cognitive Notes", icon: StickyNote },
  { separator: true },
  { id: "favorites", label: "Priority", icon: Star },
  { id: "recent", label: "Memory Log", icon: Clock },
  { id: "rediscover", label: "Rediscover", icon: Sparkles },
  { id: "trash", label: "Purged", icon: Trash2 },
];

export function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: { 
  activeTab: string; 
  setActiveTab: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { profile, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "fixed lg:relative z-50 h-screen border-r border-white-[0.05] bg-[#020203] flex flex-col transition-[width,transform] duration-300 ease-[0.2,1,0.2,1] overflow-hidden shadow-2xl shadow-black",
        isCollapsed ? "w-24" : "w-72",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      style={{ transform: "translateZ(0)", willChange: "width, transform" }}
      >
        {/* Decorative Orbs inside Sidebar */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />

      <div className="p-8 pb-4 flex items-center justify-between relative z-10">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-[1.2rem] flex items-center justify-center font-black text-white shadow-2xl shadow-indigo-500/30 ring-1 ring-white/20">
                S
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1.5 border-[0.5px] border-white/5 rounded-[1.4rem]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter uppercase leading-none">
                Stash AI<span className="text-indigo-500">.</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500/60 mt-1">Free Collective</span>
            </div>
          </motion.div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white/20 hover:text-white/60 hover:bg-white/5 rounded-full"
        >
          <ChevronRight className={cn("transition-transform duration-500", isCollapsed ? "" : "rotate-180")} />
        </Button>
      </div>

      <div className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pt-8 relative z-10">
        {NAV_ITEMS.map((item, idx) => {
          if (item.separator) {
            return <div key={`sep-${idx}`} className="h-[1px] bg-white/[0.03] mx-4 my-8" />;
          }
          const Icon = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id!)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors duration-200 group relative overflow-hidden",
                isActive 
                  ? "text-white font-bold" 
                  : "text-white/30 hover:text-white/60"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/[0.03] border border-white/[0.05] rounded-2xl shadow-inner shadow-white/5"
                />
              )}
              <Icon size={20} className={cn("relative z-10 transition-all duration-300", isActive ? "text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "group-hover:scale-110")} />
              {!isCollapsed && (
                <span className="font-bold text-[15px] tracking-tight relative z-10 uppercase">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
                 <div className="ml-auto w-1 h-3 bg-indigo-500 rounded-full relative z-10 shadow-[0_0_10px_#6366f1]" />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="p-6 mt-auto relative z-10 border-t border-white/[0.03]">
        <div className={cn(
          "p-4 rounded-[2.5rem] bg-white/[0.01] border border-white/[0.03] flex items-center gap-4 group hover:bg-white/[0.03] transition-all duration-700",
          isCollapsed ? "justify-center p-2" : ""
        )}>
          <div className="relative">
            <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-black text-indigo-400">{profile?.displayName?.[0] || "?"}</span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#020203] rounded-full flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-black text-white uppercase tracking-tighter truncate group-hover:text-indigo-400 transition-colors">
                {profile?.displayName || "Neural Identity"}
              </p>
              <motion.button 
                onClick={signOut}
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 text-[9px] text-white/20 font-black uppercase tracking-[0.3em] hover:text-red-400 transition-all mt-1"
              >
                <LogOut size={10} /> Disconnect
              </motion.button>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
