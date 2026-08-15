import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import HistoryItem from "@/components/history/HistoryItem";
import HistoryFilters from "@/components/history/HistoryFilters";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function History() {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => base44.entities.HistoryLog.list("-created_date", 300),
  });

  const filtered = useMemo(() => {
    let result = logs;
    if (activeFilters.length > 0) {
      result = result.filter((l) => activeFilters.includes(getCategoryFromType(l.event_type)));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) => l.title?.toLowerCase().includes(q) || l.card_name?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, activeFilters, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((log) => {
      const date = log.created_date ? parseISO(log.created_date) : new Date();
      const key = format(date, "yyyy-MM-dd");
      if (!groups[key]) groups[key] = { label: getDateLabel(date), items: [] };
      groups[key].items.push(log);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div className="px-4 pt-6 pb-24 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">Histórico</h1>
          <p className="text-xs text-muted-foreground font-body">{logs.length} eventos registrados</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar no histórico..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border/50 font-body text-sm"
        />
      </div>

      {/* Filters */}
      <HistoryFilters active={activeFilters} onChange={setActiveFilters} />

      {/* Timeline */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 glass rounded-2xl">
          <Clock className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground font-body text-sm">Nenhum evento registrado</p>
          <p className="text-muted-foreground font-body text-xs text-center px-6">
            Os eventos aparecem automaticamente quando você adiciona cartas, cria decks e mais.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([dateKey, group]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <div className="relative ml-4">
                {/* Neon timeline line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
                <div className="space-y-3">
                  <AnimatePresence>
                    {group.items.map((log, i) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <HistoryItem log={log} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getCategoryFromType(type = "") {
  if (type.startsWith("collection")) return "collection";
  if (type.startsWith("purchase")) return "purchase";
  if (type.startsWith("price")) return "price";
  if (type.startsWith("deck")) return "deck";
  if (type.startsWith("wishlist")) return "wishlist";
  if (type.startsWith("goal")) return "goal";
  return "other";
}

function getDateLabel(date) {
  if (isToday(date)) return "Hoje";
  if (isYesterday(date)) return "Ontem";
  return format(date, "dd 'de' MMMM", { locale: ptBR });
}