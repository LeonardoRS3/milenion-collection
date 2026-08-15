// Collection analytics service - pure calculation functions

export function calcStats(cards = [], decks = []) {
  const totalCards = cards.reduce((s, c) => s + (c.quantity || 1), 0);
  const uniqueCards = cards.length;
  const totalValue = cards.reduce((s, c) => s + ((c.current_price || 0) * (c.quantity || 1)), 0);
  const totalSpent = cards.reduce((s, c) => s + ((c.purchase_price || 0) * (c.quantity || 1)), 0);
  const avgPrice = totalCards > 0 ? totalValue / totalCards : 0;

  const mostExpensive = cards.reduce((best, c) => {
    return (c.current_price || 0) > (best?.current_price || 0) ? c : best;
  }, null);

  // By type
  const byType = {};
  cards.forEach((c) => {
    const t = normalizeType(c.card_type);
    byType[t] = (byType[t] || 0) + (c.quantity || 1);
  });

  // By rarity
  const byRarity = {};
  cards.forEach((c) => {
    if (c.rarity) {
      byRarity[c.rarity] = (byRarity[c.rarity] || 0) + (c.quantity || 1);
    }
  });

  // By attribute
  const byAttribute = {};
  cards.forEach((c) => {
    if (c.attribute) {
      byAttribute[c.attribute] = (byAttribute[c.attribute] || 0) + (c.quantity || 1);
    }
  });

  // By archetype
  const byArchetype = {};
  cards.forEach((c) => {
    if (c.archetype) {
      byArchetype[c.archetype] = (byArchetype[c.archetype] || 0) + (c.quantity || 1);
    }
  });
  const topArchetype = Object.entries(byArchetype).sort((a, b) => b[1] - a[1])[0];

  // Most common type
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];

  // Monthly evolution (last 6 months)
  const now = new Date();
  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    const count = cards.filter((c) => {
      const cd = new Date(c.created_date);
      return cd >= d && cd < end;
    }).reduce((s, c) => s + (c.quantity || 1), 0);
    monthly.push({ label, count });
  }

  // Deck stats
  const deckStats = decks.map((d) => {
    const allCards = [...(d.cards || []), ...(d.extra_deck || []), ...(d.side_deck || [])];
    const total = allCards.reduce((s, c) => s + (c.quantity || 1), 0);
    const missing = allCards.filter((c) => c.owned === false).reduce((s, c) => s + (c.quantity || 1), 0);
    const value = d.estimated_value || 0;
    return { ...d, total, missing, value };
  });

  const mostExpensiveDeck = deckStats.reduce((best, d) => (d.value > (best?.value || 0) ? d : best), null);
  const mostMissingDeck = deckStats.reduce((best, d) => (d.missing > (best?.missing || 0) ? d : best), null);

  return {
    totalCards,
    uniqueCards,
    totalValue,
    totalSpent,
    avgPrice,
    mostExpensive,
    byType,
    byRarity,
    byAttribute,
    topArchetype: topArchetype ? topArchetype[0] : "—",
    topType: topType ? topType[0] : "—",
    monthly,
    mostExpensiveDeck,
    mostMissingDeck,
  };
}

function normalizeType(t = "") {
  const lower = t.toLowerCase();
  if (lower.includes("monster") || lower.includes("monstro") || lower.includes("xyz") || lower.includes("synchro") || lower.includes("fusion") || lower.includes("link") || lower.includes("ritual") || lower.includes("pendulum")) return "Monstro";
  if (lower.includes("spell") || lower.includes("magia")) return "Magia";
  if (lower.includes("trap") || lower.includes("armadilha")) return "Armadilha";
  return t || "Outro";
}