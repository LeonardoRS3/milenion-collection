const CATEGORIES = [
  { value: "collection", label: "Coleção", color: "bg-green-400/15 text-green-400 border-green-400/30" },
  { value: "purchase", label: "Compras", color: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30" },
  { value: "price", label: "Preços", color: "bg-purple-400/15 text-purple-400 border-purple-400/30" },
  { value: "deck", label: "Decks", color: "bg-blue-400/15 text-blue-400 border-blue-400/30" },
  { value: "wishlist", label: "Wishlist", color: "bg-orange-400/15 text-orange-400 border-orange-400/30" },
  { value: "goal", label: "Metas", color: "bg-pink-400/15 text-pink-400 border-pink-400/30" },
];

export default function HistoryFilters({ active, onChange }) {
  const toggle = (val) => {
    onChange(active.includes(val) ? active.filter((v) => v !== val) : [...active, val]);
  };

  return (
    <div className="flex gap-1.5 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => toggle(cat.value)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-body border transition-all duration-200 ${
            active.includes(cat.value)
              ? cat.color
              : "bg-secondary/50 border-border/30 text-muted-foreground hover:border-primary/30"
          }`}
        >
          {cat.label}
        </button>
      ))}
      {active.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="px-2.5 py-1 rounded-full text-[11px] font-body border border-border/30 text-muted-foreground hover:text-red-400 transition-colors"
        >
          Limpar
        </button>
      )}
    </div>
  );
}