import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Loader2, CheckCircle2, AlertCircle, HelpCircle,
  Trash2, Play, Plus, ChevronDown, Zap, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  parseDecklList,
  fetchCard,
  matchStatus,
  suggestDeckSection,
  getSectionLabel,
} from "@/lib/decklistParser";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "exact")
    return <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-green-500/15 text-green-400 font-body">Encontrada</span>;
  if (status === "partial")
    return <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gold/15 text-gold font-body">Parcial</span>;
  return <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive font-body">Não encontrada</span>;
}

// ── Card preview row ──────────────────────────────────────────────────────────
function PreviewRow({ item, onRemove, onSectionChange }) {
  const { card, parsed, status } = item;
  const image = card?.card_images?.[0]?.image_url_small;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 glass rounded-xl p-2.5 border border-border/20 hover:border-border/40 transition-colors"
    >
      {/* Image */}
      <div className="w-10 h-14 flex-shrink-0 rounded-md overflow-hidden bg-secondary">
        {image ? (
          <img src={image} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            {status === "not_found" ? <AlertCircle className="w-4 h-4 text-destructive/40" /> : <HelpCircle className="w-4 h-4" />}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-body font-semibold text-foreground truncate">
            {card?.name || parsed.originalName}
          </span>
          {parsed.translatedFrom && (
            <span className="text-[10px] text-muted-foreground font-body">({parsed.translatedFrom})</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground font-body">×{parsed.quantity}</span>
          {card?.type && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-primary/10 text-primary font-body truncate max-w-[100px]">{card.type}</span>
          )}
          <StatusBadge status={status} />
          
          {card && (
  <select
    value={item.section || "main"}
    onChange={(e) => onSectionChange(e.target.value)}
    className="text-[10px] bg-secondary border border-border/40 rounded px-1.5 py-0.5 text-foreground"
  >
    <option value="main">Main</option>
    <option value="extra">Extra</option>
    <option value="side">Side</option>
  </select>
)}
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function ImportListModal({
  open,
  onClose,
  targetDeckId = null,
  targetDeckName = "",
}) {
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState([]); // { parsed, card, status }
  const [destination, setDestination] = useState(
  targetDeckId ? "deck" : "collection"
);
  const [defaultStatus, setDefaultStatus] = useState("owned");
  const [defaultPriority, setDefaultPriority] = useState("medium");
  const [saving, setSaving] = useState(false);
  const abortRef = useRef(false);
  const queryClient = useQueryClient();

  const { data: decks = [] } = useQuery({
    queryKey: ["decks"],
    queryFn: () => base44.entities.Deck.list("-created_date", 50),
    enabled: open,
  });
  const [selectedDeckId, setSelectedDeckId] = useState(
  targetDeckId || ""
);

useEffect(() => {
  if (!open) return;

  if (targetDeckId) {
    setDestination("deck");
    setSelectedDeckId(targetDeckId);
  }
}, [open, targetDeckId]);

  // Parsed lines from textarea
  const parsedLines = parseDecklList(text);
  const lineCount = parsedLines.length;

  // Stats
  const found = items.filter((i) => i.status !== "not_found").length;
  const notFound = items.filter((i) => i.status === "not_found").length;
  const processed = items.length;

  const handleProcess = async () => {
    const parsed = parseDecklList(text);
    if (!parsed.length) return;

    setProcessing(true);
    setItems([]);
    setProgress(0);
    abortRef.current = false;

    const results = [];
    for (let i = 0; i < parsed.length; i++) {
      if (abortRef.current) break;
      const p = parsed[i];
      const card = await fetchCard(p.searchName);
      const status = matchStatus(card, p.searchName);
      const section = suggestDeckSection(card, p.section);

results.push({
  parsed: p,
  card,
  status,
  section,
});
      setItems([...results]);
      setProgress(Math.round(((i + 1) / parsed.length) * 100));
    }

    setProcessing(false);
  };

  const handleRemove = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

const handleSectionChange = (idx, section) => {
  setItems((prev) =>
    prev.map((item, i) =>
      i === idx
        ? { ...item, section }
        : item
    )
  );
};

const validateDeckImport = (valid, deck) => {
  const totals = {
    main: 0,
    extra: 0,
    side: 0,
  };

  const existingCopies = {};

  // Conta o que já existe no deck
  for (const section of ["cards", "extra_deck", "side_deck"]) {
    const sectionName =
      section === "cards"
        ? "main"
        : section === "extra_deck"
          ? "extra"
          : "side";

    for (const card of deck[section] || []) {
      const cardId = String(card.card_id);
      const quantity = Number(card.quantity) || 0;

      totals[sectionName] += quantity;
      existingCopies[cardId] =
        (existingCopies[cardId] || 0) + quantity;
    }
  }

  const importedCopies = {};

  // Soma as cartas que serão importadas
  for (const item of valid) {
    const section = item.section || "main";
    const cardId = String(item.card.id);
    const quantity = Number(item.parsed.quantity) || 0;

    totals[section] += quantity;

    importedCopies[cardId] =
      (importedCopies[cardId] || 0) + quantity;
  }

  // Verifica limite de 3 cópias por carta
  for (const [cardId, quantity] of Object.entries(importedCopies)) {
    const total =
      (existingCopies[cardId] || 0) + quantity;

    if (total > 3) {
      const item = valid.find(
        (i) => String(i.card.id) === cardId
      );

      return {
        valid: false,
        message: `${item?.card?.name || "Carta"} ultrapassa o limite de 3 cópias. Total: ${total}.`,
      };
    }
  }

  // Limites das seções
  if (totals.main > 60) {
    return {
      valid: false,
      message: `Main Deck não pode ter mais de 60 cartas. Total: ${totals.main}.`,
    };
  }

  if (totals.extra > 15) {
    return {
      valid: false,
      message: `Extra Deck não pode ter mais de 15 cartas. Total: ${totals.extra}.`,
    };
  }

  if (totals.side > 15) {
    return {
      valid: false,
      message: `Side Deck não pode ter mais de 15 cartas. Total: ${totals.side}.`,
    };
  }

  return {
    valid: true,
    totals,
  };
};

  const handleSave = async () => {
    const valid = items.filter((i) => i.status !== "not_found" && i.card);
    if (!valid.length) return;

    setSaving(true);
    let count = 0;

    try {
      if (destination === "collection") {
        for (const item of valid) {
          await base44.entities.CollectionCard.create({
            card_name: item.card.name,
            card_id: String(item.card.id),
            image_url: item.card.card_images?.[0]?.image_url_small || "",
            card_type: item.card.type,
            attribute: item.card.attribute || "",
            archetype: item.card.archetype || "",
            rarity: item.card.card_sets?.[0]?.set_rarity || "",
            quantity: item.parsed.quantity,
            purchase_price: 0,
            current_price: item.card.card_prices?.[0]?.tcgplayer_price
              ? parseFloat(item.card.card_prices[0].tcgplayer_price) : 0,
            status: defaultStatus,
            priority: defaultPriority,
            level: item.card.level || 0,
            atk: item.card.atk || 0,
            def: item.card.def || 0,
          });
          count++;
        }
        queryClient.invalidateQueries({ queryKey: ["collection"] });

      } else if (destination === "wishlist") {
        for (const item of valid) {
          await base44.entities.WishlistCard.create({
            card_name: item.card.name,
            card_id: String(item.card.id),
            image_url: item.card.card_images?.[0]?.image_url_small || "",
            card_type: item.card.type,
            rarity: item.card.card_sets?.[0]?.set_rarity || "",
            quantity_desired: item.parsed.quantity,
            priority: defaultPriority,
            current_price: item.card.card_prices?.[0]?.tcgplayer_price
              ? parseFloat(item.card.card_prices[0].tcgplayer_price) : 0,
          });
          count++;
        }
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });

      } else if (destination === "deck") {
  const deckId = selectedDeckId;

  if (!deckId) {
    toast.error("Selecione um deck!");
    setSaving(false);
    return;
  }

  const deck = decks.find((d) => d.id === deckId);

  if (!deck) {
    toast.error("Deck não encontrado.");
    setSaving(false);
    return;
  }

  const validation = validateDeckImport(valid, deck);

  if (!validation.valid) {
    toast.error(validation.message);
    setSaving(false);
    return;
  }

  const sections = {
    main: [...(deck.cards || [])],
    extra: [...(deck.extra_deck || [])],
    side: [...(deck.side_deck || [])],
  };

  for (const item of valid) {
    const section = item.section || "main";

    const key =
      section === "extra"
        ? "extra"
        : section === "side"
          ? "side"
          : "main";

    const list = sections[key];

    const cardId = String(item.card.id);

    const existing = list.find(
      (c) => String(c.card_id) === cardId
    );

    if (existing) {
      existing.quantity =
        (Number(existing.quantity) || 0) +
        Number(item.parsed.quantity);
    } else {
      list.push({
        card_name: item.card.name,
        card_id: cardId,
        image_url:
          item.card.card_images?.[0]?.image_url_small || "",
        quantity: Number(item.parsed.quantity),
        card_type: item.card.type,
        owned: true,
      });
    }
  }

  await base44.entities.Deck.update(deckId, {
    cards: sections.main,
    extra_deck: sections.extra,
    side_deck: sections.side,
  });

  queryClient.invalidateQueries({
    queryKey: ["decks"],
  });

  queryClient.invalidateQueries({
    queryKey: ["deck", deckId],
  });

  count = valid.length;
}
        

      toast.success(`${count} carta${count !== 1 ? "s" : ""} adicionada${count !== 1 ? "s" : ""}!`);
      handleClose();
    } catch (err) {
      toast.error("Erro ao salvar cartas.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (processing) abortRef.current = true;
    setText("");
    setItems([]);
    setProgress(0);
    setProcessing(false);
    onClose();
  };

  const hasResults = items.length > 0;
  const canSave = hasResults && !processing && found > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border/50 max-w-lg h-[88vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 flex-shrink-0 border-b border-border/30">
          <DialogTitle className="font-display text-sm bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Importar Lista de Cartas
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex flex-col">

          {/* ── INPUT PHASE ── */}
          {!hasResults && (
            <div className="px-5 py-4 flex flex-col gap-4 flex-1">
              {/* Textarea */}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-body text-muted-foreground">Cole sua decklist abaixo</label>
                  {lineCount > 0 && (
                    <span className="text-[11px] font-body text-primary">{lineCount} carta{lineCount !== 1 ? "s" : ""} detectada{lineCount !== 1 ? "s" : ""}</span>
                  )}
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={"3 Dark Magician\n1 Blue-Eyes White Dragon\n2 Ash Blossom\n\n# Ou em português:\n3 Mago Negro\n1 Dragão Branco de Olhos Azuis\n2 Flor de Cinza\n\n# Formatos aceitos:\n3 Nome da Carta\n3x Nome\nNome x3"}
                  className="flex-1 min-h-[200px] w-full bg-secondary border border-border/50 rounded-xl p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              {/* Hint */}
              <div className="glass rounded-xl p-3 border border-primary/10 flex gap-2.5">
                <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-body font-medium text-foreground/90">Busca bilíngue PT/EN</p>
                  <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                    "Mago Negro", "Dragão Branco", "Ash Blossom" — tradução automática
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-body text-muted-foreground">Destino</label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger className="bg-secondary border-border/50 text-xs font-body h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="collection">Coleção</SelectItem>
                      <SelectItem value="wishlist">Wishlist</SelectItem>
                      <SelectItem value="deck">Deck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {destination === "deck" ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-body text-muted-foreground">Deck</label>
                    <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                      <SelectTrigger className="bg-secondary border-border/50 text-xs font-body h-8">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {decks.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-body text-muted-foreground">Status padrão</label>
                    <Select value={defaultStatus} onValueChange={setDefaultStatus}>
                      <SelectTrigger className="bg-secondary border-border/50 text-xs font-body h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owned">Comprada</SelectItem>
                        <SelectItem value="not_purchased">Não comprada</SelectItem>
                        <SelectItem value="searching">Procurando</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Process button */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setText("")}
                  variant="outline"
                  className="border-border/50 font-body text-xs"
                  disabled={!text.trim()}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Limpar
                </Button>
                <Button
                  onClick={handleProcess}
                  disabled={!text.trim() || processing}
                  className="flex-1 bg-primary hover:bg-primary/90 font-body text-xs"
                >
                  {processing ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Processando...</>
                  ) : (
                    <><Play className="w-3.5 h-3.5 mr-1.5" />Processar Lista</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── PROCESSING PROGRESS ── */}
          {processing && (
            <div className="px-5 py-3 flex-shrink-0 border-b border-border/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-body text-muted-foreground">
                  Buscando cartas... {processed}/{lineCount}
                </span>
                <span className="text-[11px] font-display text-primary">{progress}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-neon-blue rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* ── RESULTS PHASE ── */}
          {hasResults && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Stats bar */}
              <div className="px-5 py-3 flex-shrink-0 border-b border-border/20 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs font-body text-green-400">{found} válidas</span>
                </div>
                {notFound > 0 && (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-xs font-body text-destructive">{notFound} não encontradas</span>
                  </div>
                )}
                {processing && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span className="text-[11px] font-body text-muted-foreground">{progress}%</span>
                  </div>
                )}
                <button
                  onClick={() => { setItems([]); setProgress(0); }}
                  className="ml-auto text-[11px] font-body text-muted-foreground hover:text-foreground transition-colors"
                  disabled={processing}
                >
                  Editar lista
                </button>
              </div>

              {/* Card list */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                <AnimatePresence>
                  {items.map((item, i) => (
                   <PreviewRow
  key={i}
  item={item}
  onRemove={() => handleRemove(i)}
  onSectionChange={(section) =>
    handleSectionChange(i, section)
  }
/>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer action */}
              {!processing && (
                <div className="px-5 py-4 flex-shrink-0 border-t border-border/30 space-y-3">
                  {/* Destination reminder */}
                  <div className="flex gap-2 items-center">
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger className="flex-1 bg-secondary border-border/50 text-xs font-body h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collection">Coleção</SelectItem>
                        <SelectItem value="wishlist">Wishlist</SelectItem>
                        <SelectItem value="deck">Deck</SelectItem>
                      </SelectContent>
                    </Select>
                    {destination === "deck" && (
                      <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                        <SelectTrigger className="flex-1 bg-secondary border-border/50 text-xs font-body h-8">
                          <SelectValue placeholder="Selecionar deck..." />
                        </SelectTrigger>
                        <SelectContent>
                          {decks.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={!canSave || saving}
                    className="w-full bg-primary hover:bg-primary/90 font-body text-sm h-10"
                  >
                    {saving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" />Adicionar {found} carta{found !== 1 ? "s" : ""}</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}