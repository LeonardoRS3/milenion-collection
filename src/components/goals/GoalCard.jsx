import { motion } from "framer-motion";
import { CheckCircle2, Pause, Play, Pencil, Trash2, Trophy, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TYPE_LABELS = {
  financial: { label: "Financeiro", color: "text-gold", bg: "bg-yellow-400/10" },
  deck: { label: "Deck", color: "text-neon-blue", bg: "bg-blue-400/10" },
  archetype: { label: "Arquétipo", color: "text-primary", bg: "bg-purple-400/10" },
  card: { label: "Carta", color: "text-green-400", bg: "bg-green-400/10" },
};

export default function GoalCard({ goal, onEdit, onComplete, onPause, onDelete }) {
  const meta = TYPE_LABELS[goal.type] || TYPE_LABELS.card;
  const isCompleted = goal.status === "completed";
  const isPaused = goal.status === "paused";
  const pct = goal.progress_pct ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={cn(
        "glass rounded-2xl p-4 border transition-all duration-300 space-y-3",
        isCompleted
          ? "border-primary/40 glow-purple"
          : isPaused
          ? "border-border/20 opacity-60"
          : "border-border/30 hover:border-primary/30"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-body font-semibold", meta.color, meta.bg)}>
              {meta.label}
            </span>
            {isCompleted && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-body font-semibold bg-primary/20 text-primary flex items-center gap-1">
                <Trophy className="w-2.5 h-2.5" /> Concluída
              </span>
            )}
            {goal.deadline && !isCompleted && (
              <span className="text-[10px] text-muted-foreground font-body flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {format(new Date(goal.deadline), "dd MMM", { locale: ptBR })}
              </span>
            )}
          </div>
          <h3 className="font-body font-semibold text-sm text-foreground truncate">{goal.title}</h3>
          {goal.description && (
            <p className="text-[11px] text-muted-foreground font-body mt-0.5 line-clamp-2">{goal.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isCompleted && (
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-7 w-7 text-muted-foreground hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-body">
            {goal.auto_label || `${goal.current_computed ?? 0} / ${goal.target_computed ?? 0}`}
          </span>
          <span className={cn(
            "text-xs font-display font-bold",
            pct >= 100 ? "text-primary" : pct >= 75 ? "text-green-400" : "text-muted-foreground"
          )}>
            {pct}%
          </span>
        </div>
        <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "absolute left-0 top-0 h-full rounded-full",
              pct >= 100
                ? "bg-gradient-to-r from-primary to-neon-blue shadow-[0_0_8px_rgba(124,58,237,0.6)]"
                : pct >= 75
                ? "bg-gradient-to-r from-green-500 to-green-400"
                : "bg-gradient-to-r from-primary/60 to-primary"
            )}
          />
        </div>
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPause}
            className="flex-1 text-xs font-body text-muted-foreground h-7 border border-border/30"
          >
            {isPaused ? <><Play className="w-3 h-3 mr-1" />Retomar</> : <><Pause className="w-3 h-3 mr-1" />Pausar</>}
          </Button>
          <Button
            size="sm"
            onClick={onComplete}
            className="flex-1 text-xs font-body h-7 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Concluir
          </Button>
        </div>
      )}
    </motion.div>
  );
}