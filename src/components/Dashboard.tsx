import React, { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar.tsx";
import { SaveCard, SaveItem } from "@/components/SaveCard.tsx";
import { SaveModal } from "@/components/SaveModal.tsx";
import { Search, Sparkles, SlidersHorizontal, Loader2, RefreshCw, Clock, BrainCircuit, Layers, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { db, COLLECTIONS } from "@/lib/firebase.ts";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { geminiService } from "@/services/geminiService.ts";
import { cosineSimilarity } from "@/lib/vectorUtils.ts";
import { handleFirestoreError, OperationType } from "@/lib/firestoreErrorHandler.ts";
import { cn } from "@/lib/utils.ts";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { QuickView } from "@/components/QuickView.tsx";

export function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [saves, setSaves] = useState<SaveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<SaveItem[] | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SaveItem | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, COLLECTIONS.SAVES), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SaveItem));
      setSaves(items);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.SAVES);
    });

    return unsubscribe;
  }, [user]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const queryEmbedding = await geminiService.getEmbedding(searchQuery);
      
      const ranked = saves.map(save => {
        const score = (save as any).embedding 
          ? cosineSimilarity(queryEmbedding, (save as any).embedding) 
          : 0;
        return { ...save, score };
      }).sort((a, b) => b.score - a.score);

      // Filter by similarity threshold
      setSearchResults(ranked.filter(r => (r as any).score > 0.4).slice(0, 20));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredSaves = useMemo(() => {
    if (searchResults) return searchResults;
    
    switch (activeTab) {
      case "home": return saves.filter(s => !s.isDeleted).slice(0, 10); // Curated list for Home
      case "all": return saves.filter(s => !s.isDeleted);
      case "favorites": return saves.filter(s => s.isFavorite);
      case "prompts": return saves.filter(s => s.type === "prompt");
      case "websites": return saves.filter(s => s.type === "website");
      case "videos": return saves.filter(s => s.type === "video");
      case "screenshots": return saves.filter(s => s.type === "screenshot");
      case "notes": return saves.filter(s => s.type === "note");
      case "trash": return (saves as any).filter((s: any) => s.isDeleted);
      case "rediscover": {
        return saves.filter(s => {
          if (!s.createdAt) return false;
          let created = 0;
          if (s.createdAt && typeof s.createdAt.toDate === 'function') {
            created = s.createdAt.toDate().getTime();
          } else {
            created = new Date(s.createdAt).getTime();
          }
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          return created < thirtyDaysAgo;
        }).slice(0, 6);
      }
      default: return saves.filter((s: any) => !s.isDeleted);
    }
  }, [saves, activeTab, searchResults]);

  const toggleFavorite = async (id: string) => {
    const item = saves.find(s => s.id === id);
    if (!item) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.SAVES, id), { isFavorite: !item.isFavorite });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${COLLECTIONS.SAVES}/${id}`);
    }
  };

  const deleteSave = async (id: string) => {
    const item = saves.find(s => s.id === id);
    if (!item) return;

    try {
      if (item.isDeleted) {
        // Permanent delete if already in trash
        await deleteDoc(doc(db, COLLECTIONS.SAVES, id));
        toast.success("Unit permanently purged");
      } else {
        // Soft delete
        await updateDoc(doc(db, COLLECTIONS.SAVES, id), { isDeleted: true });
        toast.success("Unit moved to trash");
      }
    } catch (e) {
      handleFirestoreError(e, item.isDeleted ? OperationType.DELETE : OperationType.UPDATE, `${COLLECTIONS.SAVES}/${id}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#020203] text-white overflow-hidden font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(id) => {
          setActiveTab(id);
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Optimized Static Background */}
        <div className="absolute inset-0 z-[-1] pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,101,241,0.03),transparent_70%)]" />
        </div>

        <header className="p-4 md:p-8 pb-4 w-full">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6 max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 md:gap-6 w-full xl:w-auto">
              {/* Mobile Sidebar Toggle & Logo */}
              <div className="flex items-center gap-3 lg:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/40 hover:text-white"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu size={24} />
                </Button>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-white shrink-0">S</div>
              </div>
              
              <form onSubmit={handleSearch} className="flex-1 min-w-0 md:min-w-[400px] xl:min-w-[600px] relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-indigo-400 transition-all duration-300" size={20} />
                <Input 
                  placeholder="Ask your stash anything..."
                  className="w-full bg-white/[0.01] border-white/[0.03] focus:border-indigo-500/20 h-14 md:h-16 pl-16 pr-16 rounded-[2rem] text-base md:text-lg transition-all shadow-2xl shadow-black/60 placeholder:text-white/5"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value) setSearchResults(null);
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isSearching && <Loader2 className="animate-spin text-indigo-500/60" size={20} />}
                  <Button 
                    type="submit"
                    size="icon" 
                    className="bg-indigo-600/5 hover:bg-indigo-600/20 text-indigo-400 rounded-full h-8 w-8 md:h-10 md:w-10 border border-indigo-500/10"
                  >
                    <Sparkles size={18} />
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="flex items-center gap-4 w-full xl:w-auto justify-end">
               <SaveModal onSuccess={() => setActiveTab("all")} />
               <Button variant="outline" size="icon" className="border-white/5 bg-white/5 rounded-2xl h-12 w-12 md:h-14 md:w-14 hover:bg-white/10 transition-all shrink-0">
                 <SlidersHorizontal size={22} />
               </Button>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 pt-4">
          <div className="max-w-7xl mx-auto space-y-10">
            {activeTab === "home" && !searchResults && (
               <div className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                   <div className="p-10 rounded-[3.5rem] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/5 relative overflow-hidden group hover:bg-white/[0.01] transition-all duration-700">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="w-14 h-14 bg-white/[0.02] rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5 shadow-2xl transition-transform group-hover:scale-110 duration-500"><Clock size={28} /></div>
                        <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter">Memory Stream</h3>
                          <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Latest Extractions</p>
                        </div>
                      </div>
                      <p className="text-base text-white/40 leading-relaxed font-medium max-w-sm">Stash AI is actively mapping your session. Your neural network is synchronized and ready for queries.</p>
                      <Sparkles className="absolute -bottom-6 -right-6 w-32 h-32 text-indigo-500 opacity-5 group-hover:scale-110 transition-transform duration-1000" />
                   </div>
                   <div className="p-10 rounded-[3.5rem] bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/5 relative overflow-hidden group hover:bg-white/[0.01] transition-all duration-700">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="w-14 h-14 bg-white/[0.02] rounded-2xl flex items-center justify-center text-purple-400 border border-white/5 shadow-2xl transition-transform group-hover:scale-110 duration-500"><BrainCircuit size={28} /></div>
                        <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter">Rediscovery</h3>
                          <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">Neural Recalls</p>
                        </div>
                      </div>
                      <p className="text-base text-white/40 leading-relaxed font-medium max-w-sm">Automated intelligence scan discovered 6 units that may require your attention today.</p>
                      <Layers className="absolute -bottom-6 -right-6 w-32 h-32 text-purple-500 opacity-5 group-hover:scale-110 transition-transform duration-1000" />
                   </div>
                 </div>

                 <div className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                       <h2 className="text-3xl font-black uppercase tracking-tighter">Active Archive</h2>
                       <Button variant="ghost" onClick={() => setActiveTab("all")} className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60 hover:text-indigo-400 transition-colors h-10 px-6 rounded-full border border-white/5">Neural Index</Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 pb-32">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {filteredSaves.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.03, 0.3), duration: 0.3, ease: "easeOut" }}
                          >
                            <SaveCard 
                              item={item} 
                              onToggleFavorite={toggleFavorite}
                              onDelete={deleteSave}
                              onOpen={setSelectedItem}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                 </div>
               </div>
            )}

            {(activeTab !== "home" || searchResults) && (
              <>
                <div className="flex items-end justify-between px-2">
                  <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
                      {searchResults ? "Insights" : activeTab.replace("-", " ")}
                    </h1>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                      {searchResults ? `Matches for "${searchQuery}"` : "Memory Extraction"}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-full">
                    <RefreshCw size={14} className={cn("text-indigo-400", loading ? "animate-spin" : "")} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{filteredSaves.length} Units</span>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-80 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] animate-pulse" />
                    ))}
                  </div>
                ) : filteredSaves.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-[40vh] flex flex-col items-center justify-center text-center space-y-8"
                  >
                    <div className="w-24 h-24 bg-indigo-500/5 rounded-3xl flex items-center justify-center text-indigo-500/20 border border-indigo-500/10">
                      <Sparkles size={48} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black uppercase tracking-tight">Void State</h3>
                      <p className="text-white/20 max-w-sm mx-auto font-medium">Memory is empty in this sector.</p>
                    </div>
                    <SaveModal onSuccess={() => setActiveTab("all")} />
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {filteredSaves.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.3), duration: 0.3, ease: "easeOut" }}
                        >
                          <SaveCard 
                            item={item} 
                            onToggleFavorite={toggleFavorite}
                            onDelete={deleteSave}
                            onOpen={setSelectedItem}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <QuickView item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
