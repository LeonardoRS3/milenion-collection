import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Star, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function CardItem({ card, onRemove, onWishlist, onClick }) {
  const [imgError, setImgError] = useState(false);
  const missing = card.missing_qty || 0;
  const isComplete = card.is_complete;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative glass rounded-xl overflow-hidden border transition-all duration-200 hover:scale-[1.03] hover:border-primary/40 cursor-pointer group ${
        isComplete ? "border-green-500/20" : missing > 0 ? "border-gold/30" : "border-border/30"
      }`}
      onClick={() => onClick(card)}
    >
      {/* Card image */}
      <div className="aspect-[3/4] bg-secondary relative overflow-hidden">
        {card.image_url && !imgError ? (
          <img
            src={card.image_url}
            alt={card.card_name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <Star className="w-6 h-6" />
          </div>
        )}

        {/* Quantity badge */}
        <div className="absolute top-1 left-1 bg-black/70 rounded-md px-1.5 py-0.5 text-[10px] font-display font-bold text-white">
          x{card.quantity || 1}
        </div>

        {/* Status badge */}
        <div className={`absolute top-1 right-1 rounded-md px-1 py-0.5 ${isComplete ? "bg-green-500/80" : "bg-destructive/80"}`}>
          {isComplete ? (
            <CheckCircle2 className="w-3 h-3 text-white" />
          ) : (
            <span className="text-[9px] font-bold text-white">-{card.missing_qty}</span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 bg-black/40 hover:bg-destructive/80"
            onClick={(e) => { e.stopPropagation(); onRemove(card.card_id); }}
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
          </Button>
          {!isComplete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 bg-black/40 hover:bg-gold/80"
              onClick={(e) => { e.stopPropagation(); onWishlist(card); }}
            >
              <Star className="w-3.5 h-3.5 text-white" />
            </Button>
          )}
        </div>
      </div>

      {/* Card name */}
      <div className="p-1.5">
        <p className="text-[10px] font-body leading-tight line-clamp-2 text-center text-foreground/90">{card.card_name}</p>
        {missing > 0 && (
          <p className="text-[9px] text-gold text-center mt-0.5 font-body">Falta {missing}x</p>
        )}
      </div>
    </motion.div>
  );
}

export default function DeckCardGrid({ title, cards, accentColor = "primary", onRemove, onWishlist, onCardClick }) {
  if (!cards || cards.length === 0) return null;

  const total = cards.reduce((s, c) => s + (c.quantity || 1), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`font-display text-sm font-semibold text-${accentColor}`}>{title}</h3>
        <span className="text-xs text-muted-foreground font-body bg-secondary px-2 py-0.5 rounded-full">
          {total} cartas
        </span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        <AnimatePresence>
          {cards.map((card) => (
            <CardItem
              key={card.card_id}
              card={card}
              onRemove={onRemove}
              onWishlist={onWishlist}
              onClick={onCardClick}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}