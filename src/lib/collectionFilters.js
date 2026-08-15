// Reusable filter + sort service for collection cards

export const SORT_OPTIONS = [
  { value: "recent", label: "Mais recente" },
  { value: "name_az", label: "Nome A-Z" },
  { value: "name_za", label: "Nome Z-A" },
  { value: "price_high", label: "Mais caro" },
  { value: "price_low", label: "Mais barato" },
  { value: "qty_high", label: "Maior quantidade" },
];

export const TYPE_OPTIONS = ["Monstro", "Magia", "Armadilha"];
export const ATTRIBUTE_OPTIONS = ["DARK", "LIGHT", "FIRE", "WATER", "WIND", "EARTH", "DIVINE"];
export const RARITY_OPTIONS = ["Common", "Rare", "Super Rare", "Ultra Rare", "Secret Rare"];
export const PRIORITY_OPTIONS = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "essential", label: "Essencial" },
];
export const STATUS_OPTIONS = [
  { value: "owned", label: "Comprada" },
  { value: "not_purchased", label: "Não comprada" },
  { value: "searching", label: "Procurando" },
];
export const LANGUAGE_OPTIONS = [
  { value: "portuguese", label: "PT" },
  { value: "english", label: "EN" },
  { value: "japanese", label: "JP" },
];

export const DEFAULT_FILTERS = {
  search: "",
  type: [],
  attribute: [],
  rarity: [],
  priority: [],
  status: [],
  language: [],
  priceMin: "",
  priceMax: "",
  playset: false,
  favOnly: false,
  sort: "recent",
};

export function applyFilters(cards, filters) {
  let result = [...cards];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((c) => c.card_name?.toLowerCase().includes(q));
  }
  if (filters.type?.length) {
    result = result.filter((c) => filters.type.some((t) => normalizeType(c.card_type) === t));
  }
  if (filters.attribute?.length) {
    result = result.filter((c) => filters.attribute.includes(c.attribute?.toUpperCase()));
  }
  if (filters.rarity?.length) {
    result = result.filter((c) => filters.rarity.some((r) => c.rarity?.toLowerCase().includes(r.toLowerCase())));
  }
  if (filters.priority?.length) {
    result = result.filter((c) => filters.priority.includes(c.priority));
  }
  if (filters.status?.length) {
    result = result.filter((c) => filters.status.includes(c.status));
  }
  if (filters.language?.length) {
    result = result.filter((c) => filters.language.includes(c.language));
  }
  if (filters.priceMin !== "") {
    result = result.filter((c) => (c.current_price || 0) >= parseFloat(filters.priceMin));
  }
  if (filters.priceMax !== "") {
    result = result.filter((c) => (c.current_price || 0) <= parseFloat(filters.priceMax));
  }
  if (filters.playset) {
    result = result.filter((c) => (c.quantity || 1) >= 3);
  }
  if (filters.favOnly) {
    result = result.filter((c) => c.is_favorite);
  }

  // Sort
  switch (filters.sort) {
    case "name_az":
      result.sort((a, b) => (a.card_name || "").localeCompare(b.card_name || ""));
      break;
    case "name_za":
      result.sort((a, b) => (b.card_name || "").localeCompare(a.card_name || ""));
      break;
    case "price_high":
      result.sort((a, b) => (b.current_price || 0) - (a.current_price || 0));
      break;
    case "price_low":
      result.sort((a, b) => (a.current_price || 0) - (b.current_price || 0));
      break;
    case "qty_high":
      result.sort((a, b) => (b.quantity || 1) - (a.quantity || 1));
      break;
    default:
      result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }

  return result;
}

function normalizeType(t = "") {
  const lower = t.toLowerCase();
  if (lower.includes("spell") || lower.includes("magia")) return "Magia";
  if (lower.includes("trap") || lower.includes("armadilha")) return "Armadilha";
  if (lower.length > 0) return "Monstro";
  return "Outro";
}

export function countActiveFilters(filters) {
  let count = 0;
  if (filters.type?.length) count += filters.type.length;
  if (filters.attribute?.length) count += filters.attribute.length;
  if (filters.rarity?.length) count += filters.rarity.length;
  if (filters.priority?.length) count += filters.priority.length;
  if (filters.status?.length) count += filters.status.length;
  if (filters.language?.length) count += filters.language.length;
  if (filters.priceMin !== "") count++;
  if (filters.priceMax !== "") count++;
  if (filters.playset) count++;
  if (filters.favOnly) count++;
  return count;
}