import { AlertTriangle, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function MissingCardsSection({ missingCards, onAddToWishlist }) {
  if (!missingCards || missingCards.length === 0) {
    return (
      <div className="glass rounded-xl p-4 border border-green-500/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
          <Star className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-sm font-body font-medium text-green-400">Deck Completo!</p>
          <p className="text-xs text-muted-foreground font-body">Você possui todas as cartas deste deck.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-gold" />
        <h3 className="font-display text-sm font-semibold text-gold">
          Cartas Faltando ({missingCards.length})
        </h3>
      </div>

      <div className="space-y-2">
        {missingCards.map((card, i) => (
          <motion.div
            key={card.card_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass rounded-xl p-3 border border-gold/20 flex items-center gap-3"
          >
            <div className="w-9 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
              {card.image_url && (
                <img src={card.image_url} alt={card.card_name} className="w-full h-full object-cover" loading="lazy" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body font-semibold truncate">{card.card_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground font-body">
                  Possui: {card.owned_qty}x
                </span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground font-body">
                  Precisa: {card.quantity || 1}x
                </span>
                <span className="text-[10px] text-gold font-bold font-body">
                  Falta: {card.missing_qty}x
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[10px] text-gold hover:bg-gold/10 flex-shrink-0 gap-1"
              onClick={() => onAddToWishlist(card)}
            >
              <Star className="w-3 h-3" /> Wishlist
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}