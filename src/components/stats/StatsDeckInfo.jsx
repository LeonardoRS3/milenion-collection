import { motion } from "framer-motion";
import { BookOpen, AlertTriangle } from "lucide-react";

export default function StatsDeckInfo({ stats }) {
  const fmt = (n) => n?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0,00";

  if (!stats.mostExpensiveDeck && !stats.mostMissingDeck) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Decks</p>
      <div className="grid grid-cols-2 gap-3">
        {stats.mostExpensiveDeck && (
          <div className="glass rounded-xl p-4 space-y-1.5" style={{ boxShadow: "0 0 20px rgba(245,158,11,0.08)" }}>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gold" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Deck Mais Caro</span>
            </div>
            <p className="font-body font-semibold text-sm truncate">{stats.mostExpensiveDeck.name}</p>
            <p className="font-display text-base font-bold text-gold">{fmt(stats.mostExpensiveDeck.value)}</p>
          </div>
        )}
        {stats.mostMissingDeck && stats.mostMissingDeck.missing > 0 && (
          <div className="glass rounded-xl p-4 space-y-1.5" style={{ boxShadow: "0 0 20px rgba(239,68,68,0.08)" }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-body">Mais Incompleto</span>
            </div>
            <p className="font-body font-semibold text-sm truncate">{stats.mostMissingDeck.name}</p>
            <p className="font-display text-base font-bold text-destructive">{stats.mostMissingDeck.missing} faltando</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}