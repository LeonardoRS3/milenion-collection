import { cn } from "@/lib/utils";
import { Star, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function CardThumbnail({ card, onClick, showPrice = true, showFavorite = false, className }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick?.(card)}
      className={cn(
        "relative group cursor-pointer rounded-xl overflow-hidden glass transition-all duration-300",
        className
      )}
    >
      <div className="aspect-[421/614] relative overflow-hidden rounded-lg">
        {card.image_url ? (
          <img
            src={card.image_url}
            alt={card.card_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground text-xs text-center px-2">{card.card_name}</span>
          </div>
        )}
        
        {showFavorite && card.is_favorite && (
          <div className="absolute top-2 right-2 p-1 rounded-full bg-background/70 backdrop-blur-sm">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </div>
        )}

        {card.quantity > 1 && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-primary/90 backdrop-blur-sm">
            <span className="text-[10px] font-display font-bold text-primary-foreground">x{card.quantity}</span>
          </div>
        )}
      </div>

      <div className="p-2">
        <p className="text-xs font-body font-medium truncate">{card.card_name}</p>
        {showPrice && card.current_price > 0 && (
          <p className="text-[10px] font-display text-gold mt-0.5">
            R$ {card.current_price?.toFixed(2)}
          </p>
        )}
      </div>
    </motion.div>
  );
}