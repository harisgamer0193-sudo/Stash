import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { 
  Link, 
  Type, 
  Camera, 
  StickyNote, 
  Loader2, 
  Sparkles, 
  Plus, 
  Youtube
} from "lucide-react";
import { geminiService } from "@/services/geminiService";
import { db, COLLECTIONS } from "@/lib/firebase";
import { handleFirestoreError, OperationType } from "@/lib/firestoreErrorHandler";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "motion/react";

export function SaveModal({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [text, setText] = useState("");

  const getYTId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSaveLink = async (type: "website" | "video") => {
    if (!url || !user) return;
    setLoading(true);
    try {
      const aiData = await geminiService.summarize(url + " " + purpose, type);
      const category = await geminiService.classify(url + " " + purpose);
      const embedding = await geminiService.getEmbedding(url + " " + purpose + " " + aiData.summary);

      const ytId = type === "video" ? getYTId(url) : null;
      const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

      try {
        await addDoc(collection(db, COLLECTIONS.SAVES), {
          userId: user.uid,
          type: type,
          title: title || aiData.title || url.replace("https://", "").replace("www.", "").split("/")[0],
          content: url,
          description: purpose,
          aiSummary: aiData.summary,
          tags: aiData.tags.split(",").map((s: string) => s.trim()),
          category,
          embedding,
          thumbnailUrl,
          sourceUrl: url,
          isFavorite: false,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, COLLECTIONS.SAVES);
        return;
      }

      toast.success("Committed to Memory");
      setOpen(false);
      setUrl("");
      setTitle("");
      setPurpose("");
      onSuccess?.();
    } catch (e) {
      toast.error("Process failed");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveText = async () => {
    if (!text || !user) return;
    setLoading(true);
    try {
      const aiData = await geminiService.summarize(text + " " + purpose, "note");
      const category = await geminiService.classify(text + " " + purpose);
      const embedding = await geminiService.getEmbedding(text + " " + purpose + " " + aiData.summary);

      try {
        await addDoc(collection(db, COLLECTIONS.SAVES), {
          userId: user.uid,
          type: "note",
          title: title || aiData.title || aiData.summary.split(" ").slice(0, 5).join(" "),
          content: text,
          description: purpose,
          aiSummary: aiData.summary,
          tags: aiData.tags.split(",").map((s: string) => s.trim()),
          category,
          embedding,
          isFavorite: false,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, COLLECTIONS.SAVES);
        return;
      }

      toast.success("Analyzed & Stashed");
      setOpen(false);
      setText("");
      setTitle("");
      setPurpose("");
      onSuccess?.();
    } catch (e) {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
          <Plus size={18} /> Add Stash
        </Button>
      } />
      <DialogContent className="bg-[#0a0a0c]/90 border-white/[0.05] text-white sm:max-w-xl rounded-[2.5rem] backdrop-blur-3xl shadow-[0_64px_128px_-12px_rgba(0,0,0,1)] p-0 overflow-hidden">
        <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
           
           <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase text-center">
              Stash <span className="text-indigo-500">Memory</span>
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid grid-cols-5 bg-white/[0.02] p-1 rounded-[1.5rem] border border-white/[0.05] mb-8 gap-0.5">
              <TabsTrigger value="link" className="rounded-[1rem] py-2 data-[state=active]:bg-white/[0.05] data-[state=active]:text-indigo-400 font-black uppercase tracking-widest text-[8px] sm:text-[9px] transition-all flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Link size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline">Link</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="rounded-[1rem] py-2 data-[state=active]:bg-white/[0.05] data-[state=active]:text-indigo-400 font-black uppercase tracking-widest text-[8px] sm:text-[9px] transition-all flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Youtube size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline">Video</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="rounded-[1rem] py-2 data-[state=active]:bg-white/[0.05] data-[state=active]:text-indigo-400 font-black uppercase tracking-widest text-[8px] sm:text-[9px] transition-all flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Type size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline">Text</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="rounded-[1rem] py-2 data-[state=active]:bg-white/[0.05] data-[state=active]:text-indigo-400 font-black uppercase tracking-widest text-[8px] sm:text-[9px] transition-all flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Camera size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline">Snap</span>
              </TabsTrigger>
              <TabsTrigger value="note" className="rounded-[1rem] py-2 data-[state=active]:bg-white/[0.05] data-[state=active]:text-indigo-400 font-black uppercase tracking-widest text-[8px] sm:text-[9px] transition-all flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <StickyNote size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline">Note</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="space-y-6">
              <TabsContent value="link" className="space-y-4 sm:space-y-6 mt-0">
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Knowledge Source</label>
                  <Input 
                    placeholder="https://..." 
                    className="bg-white/[0.02] border-white/5 focus:border-indigo-500/30 h-14 sm:h-16 rounded-2xl px-6 text-base sm:text-lg transition-all"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Memory Label (Optional)</label>
                  <Input 
                    placeholder="E.g. Project Alpha Specs" 
                    className="bg-white/[0.02] border-white/5 focus:border-indigo-500/30 h-14 sm:h-16 rounded-2xl px-6 text-sm transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Contextual Purpose</label>
                  <textarea 
                    placeholder="Why are you stashing this?" 
                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 h-28 sm:h-32 focus:border-indigo-500/30 outline-none transition-all text-sm sm:text-base placeholder:text-white/10 resize-none"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleSaveLink("website")} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 sm:h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20"
                  disabled={loading || !url}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Commit Link"}
                </Button>
              </TabsContent>

              <TabsContent value="video" className="space-y-4 sm:space-y-6 mt-0">
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-red-500/40 uppercase tracking-[0.4em] font-black px-2">YouTube Intelligence</label>
                  <Input 
                    placeholder="Paste YouTube Video URL..." 
                    className="bg-white/[0.02] border-white/5 focus:border-red-500/30 h-14 sm:h-16 rounded-2xl px-6 text-base sm:text-lg transition-all"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Video Alias (Optional)</label>
                  <Input 
                    placeholder="E.g. Tailwind Tutorial" 
                    className="bg-white/[0.02] border-white/5 focus:border-red-500/30 h-14 rounded-2xl px-6 text-sm transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Video Insights</label>
                  <textarea 
                    placeholder="Key takeaways or why this matters..." 
                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 h-28 sm:h-32 focus:border-indigo-500/30 outline-none transition-all text-sm sm:text-base placeholder:text-white/10 resize-none"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => handleSaveLink("video")} 
                  className="w-full bg-red-600 hover:bg-red-700 h-14 sm:h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-600/20"
                  disabled={loading || !url}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Stash Video Insights"}
                </Button>
              </TabsContent>

              <TabsContent value="text" className="space-y-4 sm:space-y-6 mt-0">
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Neural Input / Prompt Alias</label>
                  <Input 
                    placeholder="E.g. Deployment Command" 
                    className="bg-white/[0.02] border-white/5 focus:border-indigo-500/30 h-14 rounded-2xl px-6 text-sm transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Neural Input / Prompt</label>
                  <textarea 
                    placeholder="Paste raw data or AI prompts..." 
                    className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 h-48 focus:border-indigo-500/30 outline-none transition-all text-sm sm:text-base placeholder:text-white/10 shadow-inner shadow-black/20 resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Knowledge Context</label>
                  <textarea 
                    placeholder="What is this for?" 
                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 h-24 focus:border-indigo-500/30 outline-none transition-all text-sm sm:text-base placeholder:text-white/10 resize-none"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleSaveText}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 sm:h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-[0.98]"
                  disabled={loading || !text}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Analyze & Stash"}
                </Button>
              </TabsContent>

              <TabsContent value="image" className="space-y-4 sm:space-y-6 mt-0">
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Snap URL</label>
                  <Input 
                    placeholder="https://image-source.com/..." 
                    className="bg-white/[0.02] border-white/5 focus:border-indigo-500/30 h-14 sm:h-16 rounded-2xl px-6 text-sm sm:text-base transition-all"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Snap Label</label>
                  <Input 
                    placeholder="E.g. Logo Reference" 
                    className="bg-white/[0.02] border-white/5 focus:border-indigo-500/30 h-14 rounded-2xl px-6 text-sm transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Visual Insight</label>
                  <textarea 
                    placeholder="Describe this snap or its purpose..." 
                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 h-28 focus:border-indigo-500/30 outline-none transition-all text-sm sm:text-base placeholder:text-white/10 resize-none"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
                <Button 
                   onClick={() => handleSaveLink("image" as any)} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 sm:h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20"
                  disabled={loading || !url}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Commence Visual Stash"}
                </Button>
              </TabsContent>

              <TabsContent value="note" className="space-y-4 sm:space-y-6 mt-0">
                 <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Note Label</label>
                  <Input 
                    placeholder="E.g. Grocery List" 
                    className="bg-white/[0.02] border-white/5 focus:border-indigo-500/30 h-14 rounded-2xl px-6 text-sm transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Neural Thought</label>
                  <textarea 
                    placeholder="Capture a fleeting thought..." 
                    className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 h-48 focus:border-indigo-500/30 outline-none transition-all text-sm sm:text-base placeholder:text-white/10 shadow-inner shadow-black/20 resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black px-2">Thought Intention</label>
                  <textarea 
                    placeholder="What is the intention for this thought?" 
                    className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 h-24 focus:border-indigo-500/30 outline-none transition-all text-sm sm:text-base placeholder:text-white/10 resize-none"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
                <Button 
                   onClick={handleSaveText}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 sm:h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30"
                  disabled={loading || !text}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Commit Thought"}
                </Button>
              </TabsContent>
            </div>
          </Tabs>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex items-center gap-2 justify-center pt-4"
          >
            <Sparkles size={14} className="text-indigo-500/40 animate-pulse" />
            <span className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black animate-pulse transition-all">Stash AI Neural Processor</span>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
