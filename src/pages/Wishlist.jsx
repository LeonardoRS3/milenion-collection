import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader2,
  Check,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PriorityBadge from "@/components/cards/PriorityBadge";
import { Progress } from "@/components/ui/progress";

function AddWishlistModal({ open, onClose, onAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [targetPrice, setTargetPrice] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");

  const searchCards = async () => {
    const term = query.trim();

    if (!term) {
      toast.error("Digite o nome de uma carta.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const url =
        `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(term)}&num=20&offset=0`;

      const response = await fetch(url);
      const json = await response.json();

      if (!response.ok || json.error || !json.data) {
        toast.error("Nenhuma carta encontrada.");
        return;
      }

      setResults(json.data);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível pesquisar as cartas.");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setQuery("");
    setResults([]);
    setSelectedCard(null);
    setQuantity(1);
    setTargetPrice("");
    setPriority("medium");
    setNotes("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const addCard = useMutation({
    mutationFn: async () => {
      if (!selectedCard) {
        throw new Error("Selecione uma carta.");
      }

      return base44.entities.WishlistCard.create({
        card_name: selectedCard.name,
        card_id: String(selectedCard.id),
        image_url:
          selectedCard.card_images?.[0]?.image_url_small || "",
        card_type: selectedCard.type || "",
        rarity:
          selectedCard.card_sets?.[0]?.set_rarity || "",
        quantity_desired: Number(quantity) || 1,
        target_price: Number(targetPrice) || 0,
        current_price:
          parseFloat(
            selectedCard.card_prices?.[0]?.tcgplayer_price || 0
          ) || 0,
        priority,
        is_purchased: false,
        notes,
      });
    },

    onSuccess: () => {
      toast.success("Carta adicionada à Wishlist!");
      onAdded();
      handleClose();
    },

    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Erro ao adicionar carta.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border/50 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-base">
            ❤️ Adicionar à Wishlist
          </DialogTitle>
        </DialogHeader>

        {!selectedCard ? (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da carta..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchCards();
                }}
                className="bg-secondary border-border/50"
              />

              <Button
                onClick={searchCards}
                disabled={loading}
                size="icon"
                className="bg-primary"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="space-y-2 mt-4">
              {results.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="w-full flex gap-3 p-2 rounded-xl bg-secondary hover:bg-primary/10 text-left transition-colors"
                >
                  <img
                    src={card.card_images?.[0]?.image_url_small}
                    alt={card.name}
                    className="w-12 h-16 object-cover rounded"
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {card.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {card.type}
                    </p>

                    {card.card_prices?.[0]?.tcgplayer_price && (
                      <p className="text-xs text-gold mt-1">
                        ${card.card_prices[0].tcgplayer_price}
                      </p>
                    )}
                  </div>
                </button>
              ))}

              {!loading &&
                query &&
                results.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-6">
                    Nenhuma carta encontrada.
                  </p>
                )}
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-3 p-3 rounded-xl bg-secondary">
              <img
                src={selectedCard.card_images?.[0]?.image_url_small}
                alt={selectedCard.name}
                className="w-16 h-24 object-cover rounded-lg"
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {selectedCard.name}
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  {selectedCard.type}
                </p>

                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-xs text-primary mt-3"
                >
                  Escolher outra carta
                </button>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label>Quantidade desejada</Label>

                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Preço-alvo (R$)</Label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 50.00"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Prioridade</Label>

                <Select
                  value={priority}
                  onValueChange={setPriority}
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="low">
                      Baixa
                    </SelectItem>

                    <SelectItem value="medium">
                      Média
                    </SelectItem>

                    <SelectItem value="high">
                      Alta
                    </SelectItem>

                    <SelectItem value="essential">
                      Essencial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Observações</Label>

                <Textarea
                  placeholder="Ex: quero somente Near Mint..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-secondary"
                  rows={3}
                />
              </div>

              <Button
                className="w-full bg-primary"
                onClick={() => addCard.mutate()}
                disabled={addCard.isPending}
              >
                {addCard.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar à Wishlist
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Wishlist() {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () =>
      base44.entities.WishlistCard.list(
        "-created_date",
        200
      ),
  });

  const acquireCard = useMutation({
  mutationFn: async (card) => {
    // Cria a carta na coleção
    await base44.entities.CollectionCard.create({
      card_name: card.card_name,
      card_id: card.card_id,
      image_url: card.image_url || "",
      card_type: card.card_type || "",
      rarity: card.rarity || "",
      quantity: Number(card.quantity_desired) || 1,
      purchase_price: Number(card.target_price) || 0,
      current_price: Number(card.current_price) || 0,
      status: "not_purchased",
      priority: card.priority || "medium",
      condition: "near_mint",
      language: "portuguese",
      is_favorite: false,
      notes: card.notes || "",
    });

    // Remove a carta da Wishlist
    await base44.entities.WishlistCard.delete(card.id);
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["wishlist"],
    });

    queryClient.invalidateQueries({
      queryKey: ["collection"],
    });

    toast.success("Carta adicionada à coleção!");
  },

  onError: (error) => {
    console.error(error);
    toast.error(
      error.message || "Não foi possível adicionar à coleção."
    );
  },
});

  const deleteCard = useMutation({
    mutationFn: (id) =>
      base44.entities.WishlistCard.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });

      toast.success("Removido da wishlist!");
    },
  });

  const filtered = cards.filter((c) => {
    const matchSearch =
      !search ||
      c.card_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchPriority =
      priorityFilter === "all" ||
      c.priority === priorityFilter;

    return matchSearch && matchPriority;
  });

  const totalItems = cards.length;

  const purchased = cards.filter(
    (c) => c.is_purchased
  ).length;

  const progress =
    totalItems > 0
      ? (purchased / totalItems) * 100
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-lg font-bold">
              Wishlist
            </h1>

            <p className="text-xs text-muted-foreground font-body">
              {totalItems} itens · {purchased} comprados
            </p>
          </div>

          <Button
            onClick={() => setAddOpen(true)}
            className="bg-primary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {totalItems > 0 && (
          <div className="glass rounded-xl p-4 glow-gold">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground font-body">
                Progresso
              </span>

              <span className="text-xs font-display text-gold">
                {progress.toFixed(0)}%
              </span>
            </div>

            <Progress
              value={progress}
              className="h-2 bg-secondary"
            />
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <Input
            placeholder="Buscar na wishlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border/50 font-body"
          />
        </div>

        <Select
          value={priorityFilter}
          onValueChange={setPriorityFilter}
        >
          <SelectTrigger className="w-full bg-secondary border-border/50 text-xs font-body">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              Todas as prioridades
            </SelectItem>

            <SelectItem value="essential">
              Essencial
            </SelectItem>

            <SelectItem value="high">
              Alta
            </SelectItem>

            <SelectItem value="medium">
              Média
            </SelectItem>

            <SelectItem value="low">
              Baixa
            </SelectItem>
          </SelectContent>
        </Select>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              Wishlist vazia.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -100,
                  }}
                  transition={{
                    delay: i * 0.03,
                  }}
                  className={`glass rounded-xl p-3 flex gap-3 transition-all ${
                    card.is_purchased
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt={card.card_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">
                        ?
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-body font-semibold text-sm truncate ${
                        card.is_purchased
                          ? "line-through"
                          : ""
                      }`}
                    >
                      {card.card_name}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <PriorityBadge
                        priority={card.priority}
                      />

                      <span className="text-[10px] text-muted-foreground">
                        x{card.quantity_desired || 1}
                      </span>
                    </div>

                    {card.target_price > 0 && (
                      <p className="text-[10px] text-gold mt-1 font-display">
                        Alvo: R${" "}
                        {Number(card.target_price).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                     onClick={() => acquireCard.mutate(card)}
                    >
                     {acquireCard.isPending ? (
  <Loader2 className="w-4 h-4 animate-spin" />
) : (
  "Já adquirido"
)}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() =>
                        deleteCard.mutate(card.id)
                      }
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AddWishlistModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={() =>
          queryClient.invalidateQueries({
            queryKey: ["wishlist"],
          })
        }
      />
    </>
  );
}


