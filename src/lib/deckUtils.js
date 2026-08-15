/**
 * Compara as cartas do deck com a coleção do usuário
 * Retorna info de posse, faltando, etc.
 */
export function compareDeckWithCollection(deckCards = [], collection = []) {
  return deckCards.map((deckCard) => {
    const owned = collection.filter(
      (c) => c.card_id === deckCard.card_id || normalize(c.card_name) === normalize(deckCard.card_name)
    );
    const ownedQty = owned.reduce((s, c) => s + (c.quantity || 1), 0);
    const needed = deckCard.quantity || 1;
    const missing = Math.max(0, needed - ownedQty);
    return {
      ...deckCard,
      owned_qty: ownedQty,
      missing_qty: missing,
      is_complete: missing === 0,
    };
  });
}

export function normalize(str = "") {
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Calcula estatísticas gerais do deck
 */
export function computeDeckStats(deck, collection = []) {
  const allCards = [
    ...(deck.cards || []),
    ...(deck.extra_deck || []),
    ...(deck.side_deck || []),
  ];

  const mainCount = (deck.cards || []).reduce((s, c) => s + (c.quantity || 1), 0);
  const extraCount = (deck.extra_deck || []).reduce((s, c) => s + (c.quantity || 1), 0);
  const sideCount = (deck.side_deck || []).reduce((s, c) => s + (c.quantity || 1), 0);
  const totalCount = mainCount + extraCount + sideCount;

  const compared = compareDeckWithCollection(allCards, collection);
  const totalNeeded = compared.reduce((s, c) => s + (c.quantity || 1), 0);
  const totalOwned = compared.reduce((s, c) => s + Math.min(c.owned_qty, c.quantity || 1), 0);
  const totalMissing = compared.filter((c) => c.missing_qty > 0).length;
  const missingCopies = compared.reduce((s, c) => s + c.missing_qty, 0);
  const completionPct = totalNeeded > 0 ? Math.round((totalOwned / totalNeeded) * 100) : 0;

  // Tipo de cartas
  const typeMap = {};
  (deck.cards || []).forEach((c) => {
    const t = c.card_type || "Unknown";
    typeMap[t] = (typeMap[t] || 0) + (c.quantity || 1);
  });

  return {
    mainCount,
    extraCount,
    sideCount,
    totalCount,
    totalMissing,
    missingCopies,
    completionPct,
    typeMap,
  };
}