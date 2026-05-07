import React from "react";
import { 
  Star, 
  ExternalLink, 
  Trash2, 
  Share2, 
  MoreVertical, 
  Layers, 
  Globe, 
  Camera, 
  StickyNote, 
  Twitter, 
  Sparkles,
  Youtube,
  Play,
  RotateCcw
} from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { updateDoc, doc } from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import { toast } from "sonner";

export interface SaveItem {
  id: string;
  userId?: string;
  type: "website" | "prompt" | "screenshot" | "note" | "video" | "tweet";
  title: string;
  content: string;
  aiSummary: string;
  tags: string[];
  thumbnailUrl?: string;
  sourceUrl?: string;
  description?: string;
  isFavorite: boolean;
  isDeleted?: boolean;
  score?: number;
  createdAt: any;
  updatedAt?: any;
}

const TYPE_ICONS: Record<string, any> = {
  website: Globe,
  prompt: Sparkles,
  screenshot: Camera,
  note: StickyNote,
  tweet: Twitter,
  video: Youtube,
};

export const SaveCard = React.memo(function SaveCard({ item, onToggleFavorite, onDelete, onOpen }: { 
  item: SaveItem; 
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (item: SaveItem) => void;
}) {
  const Icon = TYPE_ICONS[item.type] || Layers;

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, COLLECTIONS.SAVES, item.id), { isDeleted: false });
      toast.success("Unit restored to archive");
    } catch (e) {
      toast.error("Restoration failed");
    }
  };

  const getHostname = (url?: string) => {
    if (!url) return "Source";
    try {
      const u = url.startsWith('http') ? url : `https://${url}`;
      return new URL(u).hostname;
    } catch (e) {
      return url.replace(/^https?:\/\//, "").split("/")[0] || "Source";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={() => onOpen(item)}
      className="group relative h-full cursor-pointer"
      style={{ transform: "translateZ(0)", willChange: "transform, opacity" }}
    >
      <Card className={cn(
        "bg-white/[0.015] border-white/[0.04] overflow-hidden hover:bg-white/[0.03] transition-all duration-500 backdrop-blur-xl shadow-2xl shadow-black/80 h-full flex flex-col relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-500/[0.08] before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity rounded-[2.5rem]",
        item.isDeleted && "opacity-60 saturate-50"
      )}>
        {item.thumbnailUrl && (
          <div className="relative aspect-[16/10] overflow-hidden">
            <img 
              src={item.thumbnailUrl} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020203] via-transparent to-transparent opacity-80" />
            <Badge className="absolute top-5 left-5 bg-black/80 backdrop-blur-md border-white/5 text-[9px] font-black uppercase tracking-[0.2em] py-1.5 px-3 rounded-full">
              {item.type}
            </Badge>
            {item.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40 transform scale-75 group-hover:scale-100 transition-transform duration-500">
                  <Play fill="white" size={24} className="ml-1" />
                </div>
              </div>
            )}
          </div>
        )}
        
        {!item.thumbnailUrl && (
          <div className="p-8 pb-0 flex justify-between items-start">
             <div className="w-14 h-14 rounded-2xl bg-white/[0.02] flex items-center justify-center text-white/20 border border-white/[0.05] group-hover:text-indigo-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-500">
               <Icon size={24} />
             </div>
             <Badge className="bg-white/[0.02] border-white/5 text-[9px] font-black uppercase tracking-[0.2em] py-1.5 px-3 rounded-full text-white/20 group-hover:text-white/60 transition-colors">
              {item.type}
            </Badge>
          </div>
        )}
        
        <CardContent className="p-8 flex-1 flex flex-col gap-6 relative z-10">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
               <h3 className="font-black text-2xl text-white tracking-tighter leading-[1.1] group-hover:text-indigo-400 transition-colors line-clamp-2 uppercase italic">
                {item.title}
              </h3>
               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -mr-2">
                {!item.isDeleted && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className={cn("h-10 w-10 rounded-full", item.isFavorite ? "text-yellow-400 bg-yellow-400/10" : "text-white/10 hover:text-white/60 hover:bg-white/5")}
                  >
                    <Star size={16} fill={item.isFavorite ? "currentColor" : "none"} />
                  </Button>
                )}
                
                {item.isDeleted && (
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleRestore}
                    className="h-10 w-10 rounded-full text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20"
                  >
                    <RotateCcw size={16} />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => e.stopPropagation()}
                      className="h-10 w-10 rounded-full text-white/10 hover:text-white/60 hover:bg-white/5"
                    >
                      <MoreVertical size={16} />
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="bg-[#0a0a0c]/80 border-white/5 text-white/80 p-3 rounded-3xl backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,1)] min-w-[200px]">
                    <DropdownMenuItem 
                      onClick={(e) => e.stopPropagation()}
                      className="gap-3 rounded-xl py-3 cursor-pointer focus:bg-white/5 focus:text-white font-bold uppercase text-[10px] tracking-widest"
                    >
                      <Share2 size={14} /> Share Unit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }} 
                      className="gap-3 rounded-xl py-3 cursor-pointer text-red-500/80 focus:bg-red-500/10 focus:text-red-500 font-bold uppercase text-[10px] tracking-widest"
                    >
                      <Trash2 size={14} /> {item.isDeleted ? "Purge Permanent" : "Move to Trash"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p className="text-[14px] text-white/40 line-clamp-3 leading-relaxed font-bold uppercase tracking-tight">
              {item.description || item.aiSummary || item.content}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            {item.tags.slice(0, 3).map(tag => (
              <Badge key={tag} className="bg-white/[0.03] hover:bg-white/[0.08] text-white/40 border-white/5 text-[9px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full transition-all">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <span className="text-[10px] text-white/10 font-black self-center tracking-widest">+{item.tags.length - 3}</span>
            )}
            {item.score !== undefined && (
               <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full ml-auto">
                {Math.round(item.score * 100)}% Match
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
