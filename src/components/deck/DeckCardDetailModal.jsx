import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Swords, Shield, Star, Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function DeckCardDetailModal({ card, collection, open, onClose }) {
  const [fullCard, setFullCard] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!card || !open) return;
    setLoading(true);
    setFullCard(null);
    const url = card.card_id
      ? `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${card.card_id}`
      : `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(card.card_name)}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => setFullCard(d?.data?.[0] || null))
      .catch(() => setFullCard(null))
      .finally(() => setLoading(false));
  }, [card, open]);

  if (!card) return null;

  const ownedInCollection = collection
    ? collection.filter(
        (c) => c.card_id === card.card_id || c.card_name?.toLowerCase() === card.card_name?.toLowerCase()
      ).reduce((s, c) => s + (c.quantity || 1), 0)
    : 0;

  const price = fullCard?.card_prices?.[0]?.tcgplayer_price;
  const image = fullCard?.card_images?.[0]?.image_url || card.image_url;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50 max-w-sm p-0 overflow-hidden">
        {/* Close */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-10 h-7 w-7"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Image */}
        <div className="relative">
          {image ? (
            <img src={image} alt={card.card_name} className="w-full h-52 object-cover" />
          ) : (
            <div className="w-full h-52 bg-secondary flex items-center justify-center">
              <Star className="w-10 h-10 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="font-display text-base font-bold text-white drop-shadow">{card.card_name}</h2>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {loading && (
            <p className="text-xs text-muted-foreground text-center font-body animate-pulse">Carregando dados...</p>
          )}

          {!loading && fullCard && (
            <>
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {fullCard.type && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body">{fullCard.type}</span>
                )}
                {fullCard.attribute && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue font-body">{fullCard.attribute}</span>
                )}
                {fullCard.level && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold font-body">
                    <Star className="w-2.5 h-2.5 inline mr-0.5" />Nível {fullCard.level}
                  </span>
                )}
                {fullCard.card_sets?.[0]?.set_rarity && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-body">
                    {fullCard.card_sets[0].set_rarity}
                  </span>
                )}
              </div>

              {/* ATK / DEF */}
              {(fullCard.atk != null || fullCard.def != null) && (
                <div className="flex gap-4">
                  {fullCard.atk != null && (
                    <div className="flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-sm font-display font-bold">{fullCard.atk}</span>
                    </div>
                  )}
                  {fullCard.def != null && (
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-neon-blue" />
                      <span className="text-sm font-display font-bold">{fullCard.def}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {fullCard.desc && (
                <p className="text-[11px] text-muted-foreground font-body leading-relaxed line-clamp-4">
                  {fullCard.desc}
                </p>
              )}

              {/* Price + collection */}
              <div className="flex items-center justify-between pt-1 border-t border-border/30">
                {price && parseFloat(price) > 0 ? (
                  <span className="text-sm font-display text-gold font-bold">${parseFloat(price).toFixed(2)}</span>
                ) : (
                  <span className="text-xs text-muted-foreground font-body">Sem preço</span>
                )}
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className={`text-xs font-body font-semibold ${ownedInCollection > 0 ? "text-green-400" : "text-muted-foreground"}`}>
                    {ownedInCollection}x na coleção
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Deck info */}
          <div className="flex items-center justify-between text-xs font-body text-muted-foreground pt-1 border-t border-border/30">
            <span>No deck: <strong className="text-foreground">{card.quantity || 1}x</strong></span>
            <span className={card.is_complete ? "text-green-400" : "text-gold"}>
              {card.is_complete ? "✓ Você possui" : `Falta ${card.missing_qty}x`}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}