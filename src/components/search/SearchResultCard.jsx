import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";

export default function SearchResultCard({ card, onAddCollection, onAddWishlist }) {
  const price = card.card_prices?.[0]?.tcgplayer_price;
  const image = card.card_images?.[0]?.image_url_small;
  const rarity = card.card_sets?.[0]?.set_rarity || "—";

  return (
    <div className="glass rounded-xl p-3 flex gap-3 hover:scale-[1.01] transition-all duration-300">
      <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
        {image ? (
          <img src={image} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[8px]">
            No img
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-body font-semibold text-sm truncate">{card.name}</h3>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-body">{card.type}</span>
          {card.attribute && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-blue/10 text-neon-blue font-body">{card.attribute}</span>
          )}
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-body">{rarity}</span>
        </div>
        {price && parseFloat(price) > 0 && (
          <p className="text-xs font-display text-gold mt-1.5">${parseFloat(price).toFixed(2)}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 flex-shrink-0">
        <Button size="icon" variant="ghost" onClick={onAddCollection} className="h-8 w-8 hover:bg-primary/10">
          <Plus className="w-4 h-4 text-primary" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onAddWishlist} className="h-8 w-8 hover:bg-gold/10">
          <Star className="w-4 h-4 text-gold" />
        </Button>
      </div>
    </div>
  );
}