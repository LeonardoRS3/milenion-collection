import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, BookOpen, Trash2, List, ChevronRight, Layers, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImportListModal from "@/components/collection/ImportListModal";
import { Link } from "react-router-dom";

const FORMAT_LABELS = {
  standard: "Standard",
  speed_duel: "Speed Duel",
  rush_duel: "Rush Duel",
  goat: "Goat Format",
  edison: "Edison",
  other: "Outro",
};

export default function Decks() {
  const [showCreate, setShowCreate] = useState(false);
  const [importListOpen, setImportListOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFormat, setNewFormat] = useState("standard");
  const queryClient = useQueryClient();

  const { data: decks = [], isLoading } = useQuery({
    queryKey: ["decks"],
    queryFn: () => base44.entities.Deck.list("-created_date", 50),
  });

  const { data: collection = [] } = useQuery({
    queryKey: ["collection"],
    queryFn: () => base44.entities.CollectionCard.list("-created_date", 200),
  });

  const createDeck = useMutation({
    mutationFn: (data) => base44.entities.Deck.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setShowCreate(false);
      setNewName("");
      toast.success("Deck criado!");
    },
  });

  const deleteDeck = useMutation({
    mutationFn: (id) => base44.entities.Deck.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast.success("Deck removido!");
    },
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createDeck.mutate({ name: newName.trim(), format: newFormat, cards: [], extra_deck: [], side_deck: [] });
  };

  // Compute per-deck stats
  const getCompletion = (deck) => {
    const allCards = [...(deck.cards || []), ...(deck.extra_deck || []), ...(deck.side_deck || [])];
    if (allCards.length === 0) return { pct: 0, missing: 0, total: 0 };
    let owned = 0, total = 0, missing = 0;
    allCards.forEach((dc) => {
      const need = dc.quantity || 1;
      total += need;
      const have = collection.filter(
        (c) => c.card_id === dc.card_id || c.card_name?.toLowerCase() === dc.card_name?.toLowerCase()
      ).reduce((s, c) => s + (c.quantity || 1), 0);
      const got = Math.min(have, need);
      owned += got;
      if (have < need) missing += need - have;
    });
    return { pct: total > 0 ? Math.round((owned / total) * 100) : 0, missing, total };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold">Decks</h1>
          <p className="text-xs text-muted-foreground font-body">{decks.length} deck{decks.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 gap-1.5 text-xs"
            onClick={() => setImportListOpen(true)}
          >
            <List className="w-3.5 h-3.5" /> Importar
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 gap-1.5 text-xs"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Novo Deck
          </Button>
        </div>
      </div>

      <ImportListModal open={importListOpen} onClose={() => setImportListOpen(false)} />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display">Criar Novo Deck</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Nome do deck..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="bg-secondary border-border/50 font-body"
              autoFocus
            />
            <Select value={newFormat} onValueChange={setNewFormat}>
              <SelectTrigger className="bg-secondary border-border/50 font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FORMAT_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} className="w-full bg-primary hover:bg-primary/90 font-body" disabled={!newName.trim()}>
              Criar Deck
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {decks.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-30" />
          <p className="text-muted-foreground text-sm font-body">Nenhum deck criado ainda.</p>
          <p className="text-muted-foreground text-xs mt-1 font-body">Crie seu primeiro deck ou importe uma lista!</p>
          <Button size="sm" className="mt-4 bg-primary hover:bg-primary/90" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Criar Deck
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {decks.map((deck, i) => {
              const mainCount = (deck.cards || []).reduce((s, c) => s + (c.quantity || 1), 0);
              const extraCount = (deck.extra_deck || []).reduce((s, c) => s + (c.quantity || 1), 0);
              const sideCount = (deck.side_deck || []).reduce((s, c) => s + (c.quantity || 1), 0);
              const { pct, missing } = getCompletion(deck);

              return (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/decks/${deck.id}`} className="block group">
                    <div className={`glass rounded-xl p-4 hover:scale-[1.01] transition-all duration-300 border ${
                      pct === 100 ? "border-green-500/20 hover:border-green-500/40" :
                      missing > 0 ? "border-gold/15 hover:border-gold/35" :
                      "border-border/30 hover:border-primary/30"
                    }`}>
                      <div className="flex items-center gap-3">
                        {/* Cover or placeholder */}
                        <div className="relative flex-shrink-0">
                          {deck.cover_image ? (
                            <img src={deck.cover_image} alt="" className="w-10 h-14 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-neon-blue/20 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          {/* Completion dot */}
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                            pct === 100 ? "bg-green-400" : missing > 0 ? "bg-gold" : "bg-secondary"
                          }`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-body font-semibold text-sm truncate">{deck.name}</h3>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-body">
                              {FORMAT_LABELS[deck.format] || deck.format}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-body flex items-center gap-0.5">
                              <Layers className="w-2.5 h-2.5" />
                              {mainCount}+{extraCount}+{sideCount}
                            </span>
                          </div>
                          {/* Mini progress */}
                          {mainCount + extraCount + sideCount > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    pct === 100 ? "bg-green-400" : pct >= 70 ? "bg-gold" : "bg-destructive"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`text-[9px] font-body font-bold ${
                                pct === 100 ? "text-green-400" : pct >= 70 ? "text-gold" : "text-destructive"
                              }`}>
                                {pct}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {missing > 0 && (
                            <span className="text-[9px] bg-gold/10 text-gold px-1.5 py-0.5 rounded-md font-body">
                              -{missing}
                            </span>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteDeck.mutate(deck.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}