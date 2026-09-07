import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPurchaseFromCard } from "@/lib/purchaseService";
import { Input } from "@/components/ui/input";
import AddCardModal from "@/components/collection/AddCardModal";
import CollectionCardItem from "@/components/collection/CollectionCardItem";
import CardDetailSheet from "@/components/collection/CardDetailSheet";
import AdvancedFilters from "@/components/collection/AdvancedFilters";
import { DEFAULT_FILTERS, applyFilters } from "@/lib/collectionFilters";
import { logEvent } from "@/lib/historyService";

export default function Collection() {
  const queryClient = useQueryClient();
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["collection"],
    queryFn: () => base44.entities.CollectionCard.list("-created_date", 200),
  });

  const updateMutation = useMutation({
  mutationFn: async ({ id, data, previousCard }) => {
    const oldStatus = previousCard?.status;
    const newStatus = data.status;

    // Verifica se houve uma mudança REAL para "Comprada"
    const becamePurchased =
      oldStatus !== "owned" &&
      newStatus === "owned";

    // 1. Atualiza a carta
    const updatedCard =
      await base44.entities.CollectionCard.update(
        id,
        data
      );

    // 2. Se acabou de virar "Comprada",
    // cria automaticamente uma compra
    if (becamePurchased) {
      try {
        await createPurchaseFromCard({
          cardId: updatedCard.card_id,
          cardName: updatedCard.card_name,
          imageUrl: updatedCard.image_url,
          quantity: updatedCard.quantity,
          purchasePrice: updatedCard.purchase_price,
          notes: updatedCard.notes,
        });
      } catch (error) {
        // Tenta desfazer a alteração do status
        try {
          await base44.entities.CollectionCard.update(
            id,
            {
              status: oldStatus,
            }
          );
        } catch {
          // Ignora erro secundário.
        }

        throw new Error(
          "A carta não foi marcada como comprada porque o registro da compra falhou."
        );
      }
    }

    return {
      updatedCard,
      becamePurchased,
    };
  },

  onSuccess: (
    result,
    { data, previousCard }
  ) => {
    queryClient.invalidateQueries({
      queryKey: ["collection"],
    });

    if (result.becamePurchased) {
      queryClient.invalidateQueries({
        queryKey: ["purchases"],
      });
    }

    if (
      data.current_price != null &&
      previousCard?.current_price != null &&
      data.current_price !==
        previousCard.current_price
    ) {
      logEvent("price_change", {
        title: `Preço alterado: ${previousCard.card_name}`,
        card_name: previousCard.card_name,
        card_image_url: previousCard.image_url,
        old_value: previousCard.current_price,
        new_value: data.current_price,
      });
    } else {
      logEvent("collection_update", {
        title: `Carta atualizada: ${previousCard?.card_name}`,
        card_name: previousCard?.card_name,
        card_image_url: previousCard?.image_url,
      });
    }

    if (result.becamePurchased) {
      logEvent("purchase", {
        title: `Comprou ${previousCard.card_name}`,
        card_name: previousCard.card_name,
        card_image_url: previousCard.image_url,
        new_value:
          (Number(data.purchase_price) || 0) *
          (Number(data.quantity) || 1),
      });

      toast.success(
        "Carta marcada como comprada e compra registrada!"
      );
    }
  },

  onError: (error) => {
    toast.error(
      error.message ||
        "Não foi possível atualizar a carta."
    );
  },
});

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CollectionCard.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
      logEvent("collection_remove", {
        title: `Carta removida: ${selectedCard?.card_name}`,
        card_name: selectedCard?.card_name,
        card_image_url: selectedCard?.image_url,
      });
      setSelectedCard(null);
    },
  });

  const filteredCards = applyFilters(cards, filters);
  const totalCards = cards.reduce((sum, c) => sum + (c.quantity || 1), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">Coleção</h1>
          <p className="text-xs text-muted-foreground font-body">{totalCards} cartas · {cards.length} únicas</p>
        </div>
        <Button size="sm" onClick={() => setAddCardOpen(true)} className="gap-1.5 bg-primary hover:bg-primary/90 font-body text-xs">
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Buscar carta..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="bg-secondary border-border/50 font-body text-sm"
      />

      {/* Filters */}
      <AdvancedFilters filters={filters} onChange={setFilters} />

      {/* Results count */}
      {filteredCards.length !== cards.length && (
        <p className="text-xs text-muted-foreground font-body">
          Mostrando {filteredCards.length} de {cards.length} cartas
        </p>
      )}

      {/* Card grid */}
      {filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 glass rounded-2xl">
          <p className="text-muted-foreground font-body text-sm">
            {cards.length === 0 ? "Sua coleção está vazia" : "Nenhuma carta encontrada"}
          </p>
          {cards.length === 0 && (
            <Button size="sm" onClick={() => setAddCardOpen(true)} className="bg-primary hover:bg-primary/90 font-body text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar primeira carta
            </Button>
          )}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          <AnimatePresence>
            {filteredCards.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <CollectionCardItem card={card} onClick={() => setSelectedCard(card)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AddCardModal open={addCardOpen} onClose={() => setAddCardOpen(false)} />

      {selectedCard && (
        <CardDetailSheet
          card={selectedCard}
          open={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={(data) =>
  updateMutation.mutate({
    id: selectedCard.id,
    data,
    previousCard: selectedCard,
  })
}
          onDelete={() => deleteMutation.mutate(selectedCard.id)}
        />
      )}
    </div>
  );
}