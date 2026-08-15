import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import SearchResultCard from "@/components/search/SearchResultCard";
import AddCardSheet from "@/components/collection/AddCardSheet";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [addingCard, setAddingCard] = useState(null);
  const queryClient = useQueryClient();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encoded}&num=20&offset=0`);
    if (!res.ok) {
      setResults([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setResults(data.data || []);
    setLoading(false);
  };

  const addToCollection = useMutation({
    mutationFn: ({ card, formData }) => base44.entities.CollectionCard.create({
      card_name: card.name,
      card_id: String(card.id),
      image_url: card.card_images?.[0]?.image_url_small || "",
      card_type: card.type,
      attribute: card.attribute || "",
      archetype: card.archetype || "",
      rarity: formData.rarity || card.card_sets?.[0]?.set_rarity || "",
      quantity: formData.quantity,
      purchase_price: formData.purchase_price,
      current_price: card.card_prices?.[0]?.tcgplayer_price ? parseFloat(card.card_prices[0].tcgplayer_price) : 0,
      status: formData.status,
      priority: formData.priority,
      condition: formData.condition,
      language: formData.language,
      notes: formData.notes,
      level: card.level || 0,
      atk: card.atk || 0,
      def: card.def || 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
      toast.success("Carta adicionada à coleção!");
      setAddingCard(null);
    },
  });

  const addToWishlist = useMutation({
    mutationFn: (card) => base44.entities.WishlistCard.create({
      card_name: card.name,
      card_id: String(card.id),
      image_url: card.card_images?.[0]?.image_url_small || "",
      card_type: card.type,
      rarity: card.card_sets?.[0]?.set_rarity || "",
      current_price: card.card_prices?.[0]?.tcgplayer_price ? parseFloat(card.card_prices[0].tcgplayer_price) : 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Carta adicionada à wishlist!");
    },
  });

  return (
    <>
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-lg font-bold">Buscar Cartas</h1>
        <p className="text-xs text-muted-foreground font-body">Pesquise por nome, código ou arquétipo</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Nome da carta..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 bg-secondary border-border/50 font-body"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="bg-primary hover:bg-primary/90">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Nenhuma carta encontrada.</p>
        </div>
      )}

      <AnimatePresence>
        <div className="space-y-3">
          {!loading && results.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <SearchResultCard
                card={card}
                onAddCollection={() => setAddingCard(card)}
                onAddWishlist={() => addToWishlist.mutate(card)}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>

    <AddCardSheet
      open={!!addingCard}
      onClose={() => setAddingCard(null)}
      card={addingCard}
      isLoading={addToCollection.isPending}
      onConfirm={(formData) => addToCollection.mutate({ card: addingCard, formData })}
    />
    </>
  );
}