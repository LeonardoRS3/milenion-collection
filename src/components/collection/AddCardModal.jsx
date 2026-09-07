import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPurchaseFromCard } from "@/lib/purchaseService";
import { Search as SearchIcon, Loader2, Plus, Star, Zap, Clock, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import AddCardSheet from "@/components/collection/AddCardSheet";
import { translatePtToEn, normalize, getSuggestions, popularCards } from "@/lib/cardTranslations";

const MAX_HISTORY = 6;

function getHistory() {
  try { return JSON.parse(localStorage.getItem("mc_search_history") || "[]"); } catch { return []; }
}
function saveHistory(query) {
  const h = [query, ...getHistory().filter(q => q !== query)].slice(0, MAX_HISTORY);
  localStorage.setItem("mc_search_history", JSON.stringify(h));
}

export default function AddCardModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchInfo, setSearchInfo] = useState(null); // { translatedTo, originalQuery }
  const [addingCard, setAddingCard] = useState(null);
  const [history, setHistory] = useState(getHistory);
  const [suggestions, setSuggestions] = useState([]);
  const queryClient = useQueryClient();
  const debounceRef = useRef(null);

  // Tenta buscar com um termo; retorna { data, term }
  const fetchCards = async (term) => {
    const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(term)}&num=20&offset=0`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok || json.error) return { data: [], term };
    return { data: json.data || [], term };
  };

  const searchCards = async (q) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) return;

    setLoading(true);
    setSearched(true);
    setSuggestions([]);
    setResults([]);
    setSearchInfo(null);

    try {
      // 1. Tenta tradução PT→EN
      const translated = translatePtToEn(trimmed);
      let finalTerm = translated || trimmed;
      let translationUsed = translated ? { from: trimmed, to: translated } : null;

      // 2. Busca principal
      let { data } = await fetchCards(finalTerm);

      // 3. Fallback: se não encontrou com tradução, tenta com o termo original
      if (data.length === 0 && translated) {
        const fallback = await fetchCards(trimmed);
        data = fallback.data;
        translationUsed = null;
      }

      // 4. Fallback: tenta sem acentos / normalizado
      if (data.length === 0) {
        const normTerm = normalize(trimmed).replace(/\s+/g, " ");
        if (normTerm !== trimmed.toLowerCase()) {
          const fallback2 = await fetchCards(normTerm);
          data = fallback2.data;
        }
      }

      setResults(data);
      setSearchInfo(translationUsed);
      saveHistory(trimmed);
      setHistory(getHistory());
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSuggestions(val.trim().length >= 2 ? getSuggestions(val, 4) : []);

    clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => searchCards(val), 700);
    } else {
      setResults([]);
      setSearched(false);
      setSearchInfo(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      clearTimeout(debounceRef.current);
      searchCards(query);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (q) => {
    setQuery(q);
    setSuggestions([]);
    clearTimeout(debounceRef.current);
    searchCards(q);
  };

  const addToCollection = useMutation({
  mutationFn: async ({ card, formData }) => {
    const imageUrl =
      card.card_images?.[0]?.image_url_small || "";

    let createdCollectionCard;

    try {
      // 1. Cria a carta na coleção
      createdCollectionCard =
        await base44.entities.CollectionCard.create({
          card_name: card.name,
          card_id: String(card.id),
          image_url: imageUrl,
          card_type: card.type,
          attribute: card.attribute || "",
          archetype: card.archetype || "",
          rarity:
            formData.rarity ||
            card.card_sets?.[0]?.set_rarity ||
            "",
          quantity: Number(formData.quantity) || 1,
          purchase_price:
            Number(formData.purchase_price) || 0,
          current_price:
            card.card_prices?.[0]?.tcgplayer_price
              ? parseFloat(
                  card.card_prices[0].tcgplayer_price
                )
              : 0,
          status: formData.status,
          priority: formData.priority,
          condition: formData.condition,
          language: formData.language,
          notes: formData.notes,
          level: card.level || 0,
          atk: card.atk || 0,
          def: card.def || 0,
        });

      // 2. Se foi marcada como COMPRADA,
      // registra automaticamente em purchases
      if (formData.status === "owned") {
        try {
          await createPurchaseFromCard({
            cardId: card.id,
            cardName: card.name,
            imageUrl,
            quantity: formData.quantity,
            purchasePrice: formData.purchase_price,
            notes: formData.notes,
          });
        } catch (purchaseError) {
          // Se não conseguiu criar a compra,
          // remove a carta para não deixar os dados inconsistentes.
          try {
            await base44.entities.CollectionCard.delete(
              createdCollectionCard.id
            );
          } catch {
            // Ignora erro secundário.
          }

          throw new Error(
            "A carta não foi adicionada porque o registro da compra falhou."
          );
        }
      }

      return createdCollectionCard;
    } catch (error) {
      throw error;
    }
  },

  onSuccess: (created, { card, formData }) => {
    queryClient.invalidateQueries({
      queryKey: ["collection"],
    });

    queryClient.invalidateQueries({
      queryKey: ["purchases"],
    });

    toast.success(
      formData.status === "owned"
        ? "Carta adicionada e compra registrada!"
        : "Carta adicionada à coleção!"
    );

    import("@/lib/historyService").then(({ logEvent }) => {
      logEvent("collection_add", {
        title: `Adicionou ${card.name} à coleção`,
        card_name: card.name,
        card_image_url:
          card.card_images?.[0]?.image_url_small || "",
        new_value: created.purchase_price || 0,
      });

      if (formData.status === "owned") {
        logEvent("purchase", {
          title: `Comprou ${card.name}`,
          card_name: card.name,
          card_image_url:
            card.card_images?.[0]?.image_url_small || "",
          new_value:
            (Number(formData.purchase_price) || 0) *
            (Number(formData.quantity) || 1),
        });
      }
    });

    handleClose();
  },

  onError: (error) => {
    toast.error(
      error.message ||
        "Não foi possível adicionar a carta."
    );
  },
});

  const handleClose = () => {
    clearTimeout(debounceRef.current);
    setQuery("");
    setResults([]);
    setSearched(false);
    setSearchInfo(null);
    setSuggestions([]);
    setAddingCard(null);
    onClose();
  };

  const showEmptyHome = !loading && !searched && results.length === 0;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-card border-border/50 max-w-lg h-[82vh] flex flex-col p-0 gap-0">
          {/* Header */}
          <DialogHeader className="px-5 pt-5 pb-4 flex-shrink-0 border-b border-border/30">
            <DialogTitle className="font-display text-sm bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent">
              ⚡ Adicionar Carta à Coleção
            </DialogTitle>
          </DialogHeader>

          {/* Search bar */}
          <div className="px-5 py-3 flex-shrink-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                )}
                <Input
                  placeholder="Dark Magician ou Mago Negro..."
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="pl-10 pr-10 bg-secondary border-border/50 font-body focus-visible:ring-primary text-sm"
                  autoFocus
                />
              </div>
              <Button
                onClick={() => { clearTimeout(debounceRef.current); searchCards(query); setSuggestions([]); }}
                disabled={loading || !query.trim()}
                className="bg-primary hover:bg-primary/90 flex-shrink-0"
                size="icon"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
              </Button>
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-1.5 bg-secondary border border-border/50 rounded-xl overflow-hidden z-10"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s.en)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/10 transition-colors text-left"
                    >
                      <SearchIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs font-body text-foreground">{s.en}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{s.pt}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Translation info */}
            <AnimatePresence>
              {searchInfo && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] text-muted-foreground font-body mt-2"
                >
                  🌐 Traduzido: <span className="text-primary">"{searchInfo.from}"</span> → <span className="text-neon-blue">"{searchInfo.to}"</span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-5">

            {/* Empty home — popular + history */}
            {showEmptyHome && (
              <div className="space-y-5 pt-1">
                {/* History */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-[11px] font-body text-muted-foreground uppercase tracking-wider">Recentes</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {history.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(h)}
                          className="text-xs font-body px-2.5 py-1 rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary border border-border/40 transition-colors"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-[11px] font-body text-muted-foreground uppercase tracking-wider">Populares</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularCards.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(c.query)}
                        className="text-xs font-body px-2.5 py-1 rounded-lg glass hover:border-primary/40 hover:text-primary border border-border/20 transition-colors"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hint */}
                <div className="glass rounded-xl p-3 border border-primary/10">
                  <div className="flex gap-2 items-start">
                    <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-body font-medium text-foreground/90">Busca bilíngue</p>
                      <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                        Aceita PT e EN. Ex: "Mago Negro" ou "Dark Magician"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground font-body">Buscando cartas...</p>
              </div>
            )}

            {/* Not found */}
            {!loading && searched && results.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <SearchIcon className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                <p className="text-muted-foreground text-sm font-body">Nenhuma carta encontrada para</p>
                <p className="text-foreground text-sm font-body font-medium">"{query}"</p>
                <p className="text-muted-foreground text-xs font-body pt-2">
                  💡 Tente pesquisar em inglês: <span className="text-primary">Dark Magician</span>
                </p>
              </div>
            )}

            {/* Results */}
            <div className="space-y-2.5 pt-1">
              <AnimatePresence>
                {!loading && results.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <CardResultItem card={card} onAdd={() => setAddingCard(card)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

function CardResultItem({ card, onAdd }) {
  const image = card.card_images?.[0]?.image_url_small;
  const price = card.card_prices?.[0]?.tcgplayer_price;
  const rarity = card.card_sets?.[0]?.set_rarity;

  return (
    <div className="glass rounded-xl p-3 flex gap-3 hover:border-primary/30 border border-transparent transition-all duration-200">
      <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
        {image ? (
          <img src={image} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Star className="w-4 h-4 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="font-body font-semibold text-sm leading-tight line-clamp-2">{card.name}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-body truncate max-w-[110px]">{card.type}</span>
            {card.attribute && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neon-blue/10 text-neon-blue font-body">{card.attribute}</span>
            )}
            {card.level && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gold/10 text-gold font-body">LV{card.level}</span>
            )}
          </div>
          {rarity && <p className="text-[10px] text-muted-foreground font-body mt-1">{rarity}</p>}
        </div>
        {price && parseFloat(price) > 0 && (
          <p className="text-xs font-display text-gold">${parseFloat(price).toFixed(2)}</p>
        )}
      </div>

      <div className="flex-shrink-0 flex items-center">
        <Button
          size="sm"
          onClick={onAdd}
          className="bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 hover:border-primary transition-all duration-200 font-body text-xs h-8 px-3"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}