import StatCard from "@/components/ui/StatCard";
import { Layers, DollarSign, Star, BookOpen } from "lucide-react";

export default function DashboardStats({ totalCards, totalValue, wishlistCount, deckCount, monthSpent }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        title="Total de Cartas"
        value={totalCards}
        icon={Layers}
        glowClass="glow-purple"
        iconColor="text-primary"
      />
      <StatCard
        title="Valor da Coleção"
        value={`R$ ${totalValue.toFixed(2)}`}
        icon={DollarSign}
        glowClass="glow-gold"
        iconColor="text-gold"
      />
      <StatCard
        title="Wishlist"
        value={wishlistCount}
        icon={Star}
        glowClass="glow-blue"
        iconColor="text-neon-blue"
      />
      <StatCard
        title="Gasto do Mês"
        value={`R$ ${monthSpent.toFixed(2)}`}
        icon={DollarSign}
        glowClass="glow-purple"
        iconColor="text-primary"
      />
    </div>
  );
}