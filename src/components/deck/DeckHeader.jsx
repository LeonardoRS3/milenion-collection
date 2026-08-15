import { ArrowLeft, BookOpen, Calendar, Layers, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const FORMAT_LABELS = {
  standard: "Standard",
  speed_duel: "Speed Duel",
  rush_duel: "Rush Duel",
  goat: "Goat Format",
  edison: "Edison",
  other: "Outro",
};

export default function DeckHeader({ deck, stats }) {
  const completionColor =
    stats.completionPct === 100
      ? "text-green-400"
      : stats.completionPct >= 70
      ? "text-gold"
      : "text-destructive";

  const glowClass =
    stats.completionPct === 100
      ? "glow-green"
      : stats.missingCopies > 0
      ? ""
      : "glow-purple";

  return (
    <div className="space-y-4">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Link to="/decks">
          <Button size="icon" variant="ghost" className="hover:bg-primary/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-lg font-bold truncate">{deck.name}</h1>
          <p className="text-xs text-muted-foreground font-body">
            {FORMAT_LABELS[deck.format] || deck.format}
          </p>
        </div>
      </div>

      {/* Banner card */}
      <div
        className={`glass rounded-2xl overflow-hidden border ${
          stats.completionPct === 100 ? "border-green-500/30" : stats.missingCopies > 0 ? "border-gold/20" : "border-primary/20"
        }`}
      >
        {deck.cover_image && (
          <div className="h-28 relative overflow-hidden">
            <img
              src={deck.cover_image}
              alt={deck.name}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>
        )}

        <div className={`p-4 ${deck.cover_image ? "-mt-8 relative" : ""}`}>
          <div className="flex items-start gap-3">
            {!deck.cover_image && (
              <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-primary/30 to-neon-blue/30 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-3 mt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{stats.totalCount} cartas</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-body">
                  <span className={`font-semibold ${completionColor}`}>{stats.completionPct}% completo</span>
                </div>
                {deck.created_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(deck.created_date), "dd MMM yyyy", { locale: ptBR })}</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-body text-muted-foreground mb-1">
                  <span>Progresso da coleção</span>
                  <span className={completionColor}>{stats.completionPct}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      stats.completionPct === 100
                        ? "bg-green-400"
                        : stats.completionPct >= 70
                        ? "bg-gold"
                        : "bg-destructive"
                    }`}
                    style={{ width: `${stats.completionPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}