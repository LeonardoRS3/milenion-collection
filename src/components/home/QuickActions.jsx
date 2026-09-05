import { Link } from "react-router-dom";
import { Plus, Layers, Star, BookOpen, Search, List, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuickActions({ onAddCard, onImportList }) {
  const links = [
    { icon: Search, label: "Buscar", path: "/search", color: "text-neon-blue", glow: "glow-blue" },
    { icon: Layers, label: "Coleção", path: "/collection", color: "text-primary", glow: "glow-purple" },
    { icon: Star, label: "Wishlist", path: "/wishlist", color: "text-gold", glow: "glow-gold" },
    { icon: BookOpen, label: "Decks", path: "/decks", color: "text-neon-blue", glow: "glow-blue" },
    { icon: ShoppingBag, label: "Compras", path: "/purchases", color: "text-gold", glow: "glow-gold" },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {/* Adicionar Carta — abre modal diretamente */}
      <button
        onClick={onAddCard}
        className={cn(
          "flex flex-col items-center gap-1.5 min-w-[64px] p-3 rounded-xl glass transition-all duration-300 hover:scale-105 glow-purple"
        )}
      >
        <Plus className="w-5 h-5 text-primary" />
        <span className="text-[10px] font-body font-medium text-muted-foreground">Adicionar</span>
      </button>

      {/* Importar Lista */}
      <button
        onClick={onImportList}
        className={cn(
          "flex flex-col items-center gap-1.5 min-w-[64px] p-3 rounded-xl glass transition-all duration-300 hover:scale-105 glow-blue"
        )}
      >
        <List className="w-5 h-5 text-neon-blue" />
        <span className="text-[10px] font-body font-medium text-muted-foreground">Importar</span>
      </button>

      {links.map((action) => (
        <Link
          key={action.path}
          to={action.path}
          className={cn(
            "flex flex-col items-center gap-1.5 min-w-[64px] p-3 rounded-xl glass transition-all duration-300 hover:scale-105",
            action.glow
          )}
        >
          <action.icon className={cn("w-5 h-5", action.color)} />
          <span className="text-[10px] font-body font-medium text-muted-foreground">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}