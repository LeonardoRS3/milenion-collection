import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Plus, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function AddCardToDeckPanel({ onAdd }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(query)}&num=8&offset=0`
    );
    if (res.ok) {
      const d = await res.json();
      setResults(d.data || []);
    } else {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="glass rounded-xl p-4 space-y-3 border border-primary/10">
      <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Adicionar Carta</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar carta..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="pl-9 bg-secondary border-border/50 text-sm font-body h-8"
          />
        </div>
        <Button onClick={search} disabled={loading} size="sm" className="bg-primary h-8 px-3">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
        </Button>
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5 max-h-52 overflow-y-auto"
          >
            {results.map((card) => (
              <div
                key={card.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors"
              >
                <div className="w-7 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                  {card.card_images?.[0]?.image_url_small && (
                    <img src={card.card_images[0].image_url_small} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <span className="text-xs font-body flex-1 truncate">{card.name}</span>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 hover:bg-primary/10 hover:text-primary" onClick={() => onAdd(card, "main")}>Main</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 hover:bg-neon-blue/10 hover:text-neon-blue" onClick={() => onAdd(card, "extra")}>Extra</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 hover:bg-gold/10 hover:text-gold" onClick={() => onAdd(card, "side")}>Side</Button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}