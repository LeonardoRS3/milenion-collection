import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, LayoutGrid, AlertTriangle, BarChart3, Plus, List, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImportListModal from "@/components/collection/ImportListModal";
import DeckHeader from "@/components/deck/DeckHeader";
import DeckStatsBar from "@/components/deck/DeckStatsBar";
import DeckCardGrid from "@/components/deck/DeckCardGrid";
import MissingCardsSection from "@/components/deck/MissingCardsSection";
import DeckCardDetailModal from "@/components/deck/DeckCardDetailModal";
import AddCardToDeckPanel from "@/components/deck/AddCardToDeckPanel";
import { compareDeckWithCollection, computeDeckStats } from "@/lib/deckUtils";

const TABS = [
  { id: "cards", label: "Cartas", icon: LayoutGrid },
  { id: "missing", label: "Faltando", icon: AlertTriangle },
  { id: "stats", label: "Stats", icon: BarChart3 },
];

export default function DeckDetail() {
  const { id: deckId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("cards");
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const { data: deck, isLoading: loadingDeck } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: async () => {
      const decks = await base44.entities.Deck.list();
      return decks.find((d) => d.id === deckId) || null;
    },
    enabled: !!deckId,
  });

  const { data: collection = [] } = useQuery({
    queryKey: ["collection"],
    queryFn: () => base44.entities.CollectionCard.list("-created_date", 200),
  });

  const updateDeck = useMutation({
    mutationFn: (data) => base44.entities.Deck.update(deckId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  if (loadingDeck || !deck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = computeDeckStats(deck, collection);

  const withComparison = (cards) => compareDeckWithCollection(cards || [], collection);

  const mainCards = withComparison(deck.cards);
  const extraCards = withComparison(deck.extra_deck);
  const sideCards = withComparison(deck.side_deck);
  const allCards = [...mainCards, ...extraCards, ...sideCards];
  const missingCards = allCards.filter((c) => c.missing_qty > 0);

  const removeCard = (section, cardId) => {
    const key = section === "main" ? "cards" : section === "extra" ? "extra_deck" : "side_deck";
    const updated = (deck[key] || []).filter((c) => c.card_id !== cardId);
    updateDeck.mutate({ [key]: updated });
    toast.success("Carta removida do deck!");
  };

  const addCardToDeck = (card, section) => {
  const key = section === "main" ? "cards" : section === "extra" ? "extra_deck" : "side_deck";
  const cardId = String(card.id);

  // Conta quantas cópias desta carta já existem no deck inteiro
  const allSections = [
    ...(deck.cards || []),
    ...(deck.extra_deck || []),
    ...(deck.side_deck || []),
  ];

  const totalCopies = allSections
    .filter((c) => String(c.card_id) === cardId)
    .reduce((total, c) => total + (Number(c.quantity) || 0), 0);

  // Regra oficial: máximo de 3 cópias da mesma carta no deck inteiro
  if (totalCopies >= 3) {
    toast.error("Limite atingido: máximo de 3 cópias desta carta no deck.");
    return;
  }

  const current = [...(deck[key] || [])];
  const existing = current.find((c) => String(c.card_id) === cardId);

  if (existing) {
    existing.quantity = (Number(existing.quantity) || 1) + 1;
  } else {
    current.push({
      card_name: card.name,
      card_id: cardId,
      image_url: card.card_images?.[0]?.image_url_small || "",
      quantity: 1,
      card_type: card.type,
      owned: false,
    });
  }

  updateDeck.mutate({ [key]: current });
  toast.success(`${card.name} adicionada!`);
};

  const addToWishlist = async (cardData) => {
    await base44.entities.WishlistCard.create({
      card_name: cardData.card_name,
      card_id: cardData.card_id,
      image_url: cardData.image_url,
      card_type: cardData.card_type,
    });
    queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    toast.success("Adicionada à wishlist!");
  };

  const typeEntries = Object.entries(stats.typeMap).sort((a, b) => b[1] - a[1]);
  const maxTypeVal = typeEntries[0]?.[1] || 1;

  return (
    <div className="px-4 pt-6 pb-24 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <DeckHeader deck={deck} stats={stats} />

      {/* Stats bar */}
      <DeckStatsBar stats={stats} />

      {/* Action buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <Button
          size="sm"
          variant="outline"
          className={`flex-shrink-0 gap-1.5 text-xs font-body border-primary/30 ${showAddPanel ? "bg-primary/10 text-primary" : ""}`}
          onClick={() => setShowAddPanel((v) => !v)}
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Carta
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-shrink-0 gap-1.5 text-xs font-body border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10"
          onClick={() => setImportOpen(true)}
        >
          <List className="w-3.5 h-3.5" /> Importar Lista
        </Button>
      </div>

      {/* Add panel */}
      <AnimatePresence>
        {showAddPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AddCardToDeckPanel onAdd={addCardToDeck} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badge = tab.id === "missing" && stats.missingCopies > 0 ? stats.missingCopies : null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-body font-medium transition-all duration-200 ${
                isActive ? "bg-primary text-white shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {badge && (
                <span className={`text-[9px] px-1 rounded-full font-bold ${isActive ? "bg-white/20" : "bg-destructive text-white"}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "cards" && (
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            <DeckCardGrid
              title="Main Deck"
              cards={mainCards}
              accentColor="primary"
              onRemove={(id) => removeCard("main", id)}
              onWishlist={addToWishlist}
              onCardClick={setSelectedCard}
            />
            <DeckCardGrid
              title="Extra Deck"
              cards={extraCards}
              accentColor="neon-blue"
              onRemove={(id) => removeCard("extra", id)}
              onWishlist={addToWishlist}
              onCardClick={setSelectedCard}
            />
            <DeckCardGrid
              title="Side Deck"
              cards={sideCards}
              accentColor="gold"
              onRemove={(id) => removeCard("side", id)}
              onWishlist={addToWishlist}
              onCardClick={setSelectedCard}
            />
            {mainCards.length === 0 && extraCards.length === 0 && sideCards.length === 0 && (
              <div className="text-center py-16 glass rounded-2xl">
                <LayoutGrid className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm font-body">Nenhuma carta no deck.</p>
                <p className="text-xs text-muted-foreground/60 font-body mt-1">Use "Adicionar Carta" ou "Importar Lista"</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "missing" && (
          <motion.div
            key="missing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <MissingCardsSection missingCards={missingCards} onAddToWishlist={addToWishlist} />
          </motion.div>
        )}

        {activeTab === "stats" && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Completion */}
            <div className="glass rounded-xl p-4 space-y-3">
              <h3 className="font-display text-sm font-semibold">Completude do Deck</h3>
              <div className="flex justify-between text-xs font-body mb-1">
                <span className="text-muted-foreground">Cartas possuídas</span>
                <span className={stats.completionPct === 100 ? "text-green-400" : "text-gold"}>
                  {stats.completionPct}%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    stats.completionPct === 100 ? "bg-green-400" : stats.completionPct >= 70 ? "bg-gold" : "bg-destructive"
                  }`}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: "Total", val: stats.totalCount },
                  { label: "Faltando", val: `${stats.missingCopies}x`, color: stats.missingCopies > 0 ? "text-destructive" : "text-green-400" },
                  { label: "Tipos", val: typeEntries.length },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className={`font-display text-lg font-bold ${s.color || "text-foreground"}`}>{s.val}</p>
                    <p className="text-[10px] text-muted-foreground font-body">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card types */}
            {typeEntries.length > 0 && (
              <div className="glass rounded-xl p-4 space-y-3">
                <h3 className="font-display text-sm font-semibold">Tipos de Cartas (Main)</h3>
                <div className="space-y-2">
                  {typeEntries.map(([type, count]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-xs font-body">
                        <span className="text-muted-foreground truncate max-w-[70%]">{type}</span>
                        <span className="text-foreground font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / maxTypeVal) * 100}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section breakdown */}
            <div className="glass rounded-xl p-4 space-y-3">
              <h3 className="font-display text-sm font-semibold">Distribuição</h3>
              {[
                { label: "Main Deck", count: stats.mainCount, color: "bg-primary", max: 60 },
                { label: "Extra Deck", count: stats.extraCount, color: "bg-neon-blue", max: 15 },
                { label: "Side Deck", count: stats.sideCount, color: "bg-gold", max: 15 },
              ].map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="text-foreground font-medium">{s.count}/{s.max}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((s.count / s.max) * 100, 100)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${s.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card detail modal */}
      <DeckCardDetailModal
        card={selectedCard}
        collection={collection}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />

      {/* Import modal — bound to this deck */}
      <ImportListModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        targetDeckId={deckId}
        targetDeckName={deck.name}
      />
    </div>
  );
}