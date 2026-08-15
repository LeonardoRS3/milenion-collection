import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Target, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { computeGoalProgress } from "@/lib/goalUtils";

export default function ActiveGoalsSection({ collection = [], purchases = [] }) {
  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: () => base44.entities.Goal.list("-created_date", 100),
  });

  const active = goals
    .filter((g) => g.status === "active")
    .map((g) => ({ ...g, ...computeGoalProgress(g, collection, purchases) }))
    .sort((a, b) => (b.progress_pct ?? 0) - (a.progress_pct ?? 0))
    .slice(0, 3);

  if (active.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Metas Ativas
        </h2>
        <Link to="/goals" className="text-[11px] text-primary font-body flex items-center gap-0.5 hover:underline">
          Ver todas <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {active.map((goal) => {
          const pct = goal.progress_pct ?? 0;
          return (
            <Link key={goal.id} to="/goals">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="glass rounded-xl p-3 border border-border/30 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs font-body font-medium text-foreground truncate max-w-[180px]">{goal.title}</span>
                  </div>
                  <span className={cn(
                    "text-xs font-display font-bold",
                    pct >= 100 ? "text-primary" : pct >= 75 ? "text-green-400" : "text-muted-foreground"
                  )}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      pct >= 100
                        ? "bg-gradient-to-r from-primary to-neon-blue shadow-[0_0_6px_rgba(124,58,237,0.5)]"
                        : "bg-gradient-to-r from-primary/60 to-primary"
                    )}
                  />
                </div>
                {goal.auto_label && (
                  <p className="text-[10px] text-muted-foreground font-body mt-1">{goal.auto_label}</p>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}