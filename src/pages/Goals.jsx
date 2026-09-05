import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoalCard from "@/components/goals/GoalCard";
import GoalFormModal from "@/components/goals/GoalFormModal";
import { logEvent } from "@/lib/historyService";
import { computeGoalProgress } from "@/lib/goalUtils";
import confetti from "canvas-confetti";

const STATUS_TABS = [
  { value: "active", label: "Ativas" },
  { value: "completed", label: "Concluídas" },
  { value: "paused", label: "Pausadas" },
];

export default function Goals() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("active");
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ["goals"],
    queryFn: () => base44.entities.Goal.list("-created_date", 100),
  });

  const { data: collection = [] } = useQuery({
    queryKey: ["collection"],
    queryFn: () => base44.entities.CollectionCard.list("-created_date", 200),
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => base44.entities.Purchase.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: async (created) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      await logEvent("goal_created", { title: `Meta criada: ${created.title}`, description: created.description });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      if (vars.data.status === "completed") {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#7c3aed", "#3b82f6", "#f59e0b"] });
        logEvent("goal_completed", { title: `Meta concluída: ${vars.data.title || ""}` });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  const goalsWithProgress = goals.map((g) => ({
    ...g,
    ...computeGoalProgress(g, collection, purchases),
  }));

  const filtered = goalsWithProgress.filter((g) => g.status === tab);

  const handleSave = (data) => {
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data });
    } else {
      createMutation.mutate(data);
    }
    setFormOpen(false);
    setEditingGoal(null);
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">Metas</h1>
          <p className="text-xs text-muted-foreground font-body">
            {goalsWithProgress.filter((g) => g.status === "active").length} ativas
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => { setEditingGoal(null); setFormOpen(true); }}
          className="gap-1.5 bg-primary hover:bg-primary/90 font-body text-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Nova Meta
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-body font-medium transition-all duration-200 ${
              tab === t.value ? "bg-primary text-white shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.value === "active" && goalsWithProgress.filter((g) => g.status === "active").length > 0 && (
              <span className="ml-1 text-[10px] opacity-70">
                ({goalsWithProgress.filter((g) => g.status === "active").length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Goals list */}
      {loadingGoals ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 glass rounded-2xl">
          <Target className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground font-body text-sm">
            {tab === "active" ? "Nenhuma meta ativa" : tab === "completed" ? "Nenhuma meta concluída ainda" : "Nenhuma meta pausada"}
          </p>
          {tab === "active" && (
            <Button size="sm" onClick={() => setFormOpen(true)} className="bg-primary hover:bg-primary/90 font-body text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Criar primeira meta
            </Button>
          )}
        </div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {filtered.map((goal) => (
              <GoalCard
  key={goal.id}
  goal={goal}
  onEdit={() => { setEditingGoal(goal); setFormOpen(true); }}
  onComplete={() =>
    updateMutation.mutate({
      id: goal.id,
      data: {
        status: "completed",
        completed_at: new Date().toISOString(),
        title: goal.title,
      },
    })
  }
  onPause={() =>
    updateMutation.mutate({
      id: goal.id,
      data: {
        status: goal.status === "paused" ? "active" : "paused",
      },
    })
  }
  onDelete={() => deleteMutation.mutate(goal.id)}
/>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <GoalFormModal
        open={formOpen}
        goal={editingGoal}
        onClose={() => { setFormOpen(false); setEditingGoal(null); }}
        onSave={handleSave}
      />
    </div>
  );
}