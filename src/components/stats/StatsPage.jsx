import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { calcStats } from "@/lib/collectionStats";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import StatsSummaryCards from "./StatsSummaryCards";
import StatsCharts from "./StatsCharts";
import StatsDeckInfo from "./StatsDeckInfo";

export default function StatsPage() {
  const { data: cards = [], isLoading: loadingCards } = useQuery({
    queryKey: ["collection"],
    queryFn: () => base44.entities.CollectionCard.list("-created_date", 500),
  });

  const { data: decks = [], isLoading: loadingDecks } = useQuery({
    queryKey: ["decks"],
    queryFn: () => base44.entities.Deck.list("-created_date", 50),
  });

  if (loadingCards || loadingDecks) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = calcStats(cards, decks);

  return (
    <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-lg font-bold">Estatísticas</h1>
        <p className="text-xs text-muted-foreground font-body">Análise da sua coleção</p>
      </motion.div>

      <StatsSummaryCards stats={stats} />
      <StatsCharts stats={stats} />
      <StatsDeckInfo stats={stats} />
    </div>
  );
}