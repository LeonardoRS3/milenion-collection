/**
 * Compute automatic progress for a goal based on collection/purchase data.
 * Returns { progress_pct, current_computed, target_computed, auto_label }
 */
export function computeGoalProgress(goal, collection = [], purchases = []) {
  if (!goal.auto_track) {
    const pct = goal.target_value > 0
      ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
      : 0;
    return { progress_pct: pct, current_computed: goal.current_value, target_computed: goal.target_value, auto_label: null };
  }

  switch (goal.type) {
    case "archetype": {
      if (!goal.target_archetype) break;
      const owned = collection.filter(
        (c) => c.archetype?.toLowerCase() === goal.target_archetype?.toLowerCase()
      ).length;
      const target = goal.target_value || owned || 1;
      return {
        progress_pct: Math.min(100, Math.round((owned / target) * 100)),
        current_computed: owned,
        target_computed: target,
        auto_label: `${owned}/${target} cartas`,
      };
    }
    case "card": {
      if (!goal.target_card_name) break;
      const owned = collection
        .filter((c) => c.card_name?.toLowerCase().includes(goal.target_card_name?.toLowerCase()))
        .reduce((s, c) => s + (c.quantity || 1), 0);
      const target = goal.target_value || 1;
      return {
        progress_pct: Math.min(100, Math.round((owned / target) * 100)),
        current_computed: owned,
        target_computed: target,
        auto_label: `${owned}/${target} cópias`,
      };
    }
    case "financial": {
      const totalValue = collection.reduce((s, c) => s + (c.current_price || 0) * (c.quantity || 1), 0);
      const target = goal.target_value || 1;
      return {
        progress_pct: Math.min(100, Math.round((totalValue / target) * 100)),
        current_computed: parseFloat(totalValue.toFixed(2)),
        target_computed: target,
        auto_label: `R$ ${totalValue.toFixed(0)} / R$ ${target}`,
      };
    }
    default:
      break;
  }

  // Fallback: manual progress
  const pct = goal.target_value > 0
    ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
    : 0;
  return { progress_pct: pct, current_computed: goal.current_value, target_computed: goal.target_value, auto_label: null };
}