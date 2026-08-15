import { base44 } from "@/api/base44Client";

export async function logEvent(eventType, data = {}) {
  try {
    await base44.entities.HistoryLog.create({
      event_type: eventType,
      ...data,
    });
  } catch (e) {
    // Silent fail — logging should never break main flows
    console.warn("historyService: failed to log event", e);
  }
}

export const EVENT_META = {
  collection_add:      { color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  label: "Coleção"  },
  collection_remove:   { color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    label: "Coleção"  },
  collection_update:   { color: "text-neon-blue",  bg: "bg-blue-400/10",   border: "border-blue-400/20",   label: "Coleção"  },
  collection_favorite: { color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    label: "Favorito" },
  purchase:            { color: "text-gold",        bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "Compra"   },
  price_change:        { color: "text-primary",     bg: "bg-purple-400/10", border: "border-purple-400/20", label: "Preço"    },
  deck_create:         { color: "text-neon-blue",  bg: "bg-blue-400/10",   border: "border-blue-400/20",   label: "Deck"     },
  deck_add_card:       { color: "text-neon-blue",  bg: "bg-blue-400/10",   border: "border-blue-400/20",   label: "Deck"     },
  deck_remove_card:    { color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    label: "Deck"     },
  wishlist_add:        { color: "text-gold",        bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "Wishlist" },
  wishlist_purchased:  { color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  label: "Wishlist" },
  goal_completed:      { color: "text-primary",     bg: "bg-purple-400/10", border: "border-purple-400/20", label: "Meta"     },
  goal_created:        { color: "text-primary",     bg: "bg-purple-400/10", border: "border-purple-400/20", label: "Meta"     },
};