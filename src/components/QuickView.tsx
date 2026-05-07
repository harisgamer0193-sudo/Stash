import React from "react";
import { 
  X, 
  ExternalLink, 
  Copy, 
  Clock, 
  Tag, 
  Globe, 
  Youtube, 
  Camera, 
  StickyNote, 
  Twitter, 
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { SaveItem } from "@/components/SaveCard.tsx";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";

interface QuickViewProps {
  item: SaveItem | null;
  onClose: () => void;
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  website: { icon: Globe, color: "text-blue-400", bg: "bg-blue-400/10" },
  prompt: { icon: Sparkles, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  screenshot: { icon: Camera, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  note: { icon: StickyNote, color: "text-amber-400", bg: "bg-amber-400/10" },
  tweet: { icon: Twitter, color: "text-sky-400", bg: "bg-sky-400/10" },
  video: { icon: Youtube, color: "text-red-400", bg: "bg-red-400/10" },
};

export function QuickView({ item, onClose }: QuickViewProps) {
  if (!item) return null;

  const config = TYPE_CONFIG[item.type] || { icon: Layers, color: "text-white", bg: "bg-white/10" };
  const Icon = config.icon;

  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    toast.success("Content copied to neural buffer");
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url.replace(/^https?:\/\//, "").split("/")[0] || "Source";
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      // Handle Firestore Timestamp
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      // Handle number or string
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Recent";
      return d.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return "Recent";
    }
  };

  const getYTId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const renderContent = () => {
    switch (item.type) {
      case "video":
        const videoId = getYTId(item.content);
        if (videoId) {
          return (
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/5">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title={item.title}
              />
            </div>
          );
        }
        break;
      case "screenshot":
      case "image" as any:
        return (
          <div className="relative rounded-3xl overflow-hidden border border-white/5 group">
            <img 
              src={item.content || item.thumbnailUrl} 
              alt={item.title} 
              className="w-full h-auto max-h-[60vh] object-contain bg-black/40"
              referrerPolicy="no-referrer"
            />
          </div>
        );
      case "prompt":
      case "note":
        return (
          <div className="relative group">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/70 max-h-[50vh] overflow-y-auto custom-scrollbar shadow-inner shadow-black/40">
              {item.content}
            </div>
            <Button 
              size="icon" 
              onClick={handleCopy}
              className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
            >
              <Copy size={16} />
            </Button>
          </div>
        );
      default:
        return (
          <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 text-center space-y-6">
            <div className="w-16 h-16 bg-white/[0.02] rounded-2xl flex items-center justify-center mx-auto text-white/20 border border-white/5">
                <Icon size={32} />
            </div>
            <div className="space-y-2">
                <p className="text-white/40 font-medium leading-relaxed max-w-xs mx-auto">This unit is a link-based resource. Open directly in source browser using the external link icon above.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="bg-[#020203]/90 border-white/[0.05] text-white sm:max-w-4xl rounded-[3rem] backdrop-blur-3xl shadow-[0_64px_128px_-12px_rgba(0,0,0,1)] p-0 overflow-hidden outline-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-h-[90vh] overflow-y-auto custom-scrollbar p-8 sm:p-12 space-y-10"
          style={{ transform: "translateZ(0)", willChange: "transform, opacity" }}
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-3">
                <Badge className={cn("px-4 py-2 rounded-full font-black uppercase tracking-widest text-[10px] border-none", config.bg, config.color)}>
                  <Icon size={12} className="mr-2" /> {item.type}
                </Badge>
                {item.isFavorite && (
                  <Badge className="bg-yellow-400/10 text-yellow-500 px-4 py-2 rounded-full font-black uppercase tracking-widest text-[10px] border-none">
                    Favorite Unit
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic text-white line-clamp-3 leading-[1.1]">
                {item.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-indigo-400/40" /> 
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                {item.sourceUrl && (
                  <a href={ensureAbsoluteUrl(item.sourceUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-indigo-400 transition-colors group">
                    <Globe size={14} className="text-indigo-400/40 group-hover:text-indigo-400/60" /> 
                    <span className="truncate max-w-[200px] border-b border-white/5 group-hover:border-indigo-400/40 pb-0.5">{getHostname(item.sourceUrl)}</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
               <Button 
                onClick={() => window.open(ensureAbsoluteUrl(item.sourceUrl || item.content), '_blank')}
                variant="outline" 
                size="icon" 
                className="w-14 h-14 rounded-2xl bg-white/[0.02] border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 hover:text-indigo-400 transition-all shadow-xl"
               >
                 <ExternalLink size={20} />
               </Button>
               <Button 
                onClick={onClose}
                variant="outline" 
                size="icon" 
                className="w-14 h-14 rounded-2xl bg-white/[0.02] border-white/5 hover:bg-white/[0.05] transition-all"
               >
                 <X size={20} />
               </Button>
            </div>
          </div>

          {renderContent()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
            <div className="space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Sparkles size={14} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/60">AI Intelligence Report</h3>
               </div>
               <p className="text-base text-white/40 leading-relaxed font-medium">
                 {item.aiSummary || "Neural processor active. Extraction complete."}
               </p>
               {item.description && (
                  <div className="pt-4 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Stash Context</h3>
                    <p className="text-base text-white/60 italic leading-relaxed">"{item.description}"</p>
                  </div>
               )}
            </div>

            <div className="space-y-8">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Tag size={14} className="text-indigo-400/40" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Semantic Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <Badge key={tag} className="bg-white/[0.03] border-white/5 text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 py-2 px-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
                        {tag}
                      </Badge>
                    ))}
                  </div>
               </div>

               {item.score !== undefined && (
                 <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Search Relevance</span>
                     <span className="text-2xl font-black italic text-indigo-400">{Math.round(item.score * 100)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-indigo-500/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-indigo-500 shadow-[0_0_12px_#6366f1]" 
                      />
                   </div>
                 </div>
               )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
