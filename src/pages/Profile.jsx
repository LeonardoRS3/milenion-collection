import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { LogOut, Layers, DollarSign, Star, BookOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: collection = [] } = useQuery({
    queryKey: ["collection"],
    queryFn: () => base44.entities.CollectionCard.list("-created_date", 500),
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => base44.entities.WishlistCard.list("-created_date", 200),
  });

  const { data: decks = [] } = useQuery({
    queryKey: ["decks"],
    queryFn: () => base44.entities.Deck.list("-created_date", 50),
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => base44.entities.Purchase.list("-created_date", 500),
  });

  const totalCards = collection.reduce((sum, c) => sum + (c.quantity || 1), 0);
  const totalValue = collection.reduce((sum, c) => sum + ((c.current_price || 0) * (c.quantity || 1)), 0);
  const totalSpent = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
  const wishlistPending = wishlist.filter(w => !w.is_purchased).length;

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-neon-blue to-gold flex items-center justify-center glow-purple mb-3">
          <span className="font-display text-2xl font-bold text-white">
            {user?.full_name?.[0]?.toUpperCase() || "M"}
          </span>
        </div>
        <h1 className="font-display text-lg font-bold">{user?.full_name || "Colecionador"}</h1>
        <p className="text-xs text-muted-foreground font-body">{user?.email || ""}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <StatCard title="Total Cartas" value={totalCards} icon={Layers} glowClass="glow-purple" iconColor="text-primary" />
        <StatCard title="Valor Coleção" value={`R$ ${totalValue.toFixed(2)}`} icon={DollarSign} glowClass="glow-gold" iconColor="text-gold" />
        <StatCard title="Total Gasto" value={`R$ ${totalSpent.toFixed(2)}`} icon={DollarSign} glowClass="glow-blue" iconColor="text-neon-blue" />
        <StatCard title="Wishlist Pendente" value={wishlistPending} icon={Star} glowClass="glow-gold" iconColor="text-gold" />
        <StatCard title="Decks" value={decks.length} icon={BookOpen} glowClass="glow-blue" iconColor="text-neon-blue" />
        <StatCard title="Compras" value={purchases.length} icon={DollarSign} glowClass="glow-purple" iconColor="text-primary" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button onClick={handleLogout} variant="outline" className="w-full border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/30 gap-2">
          <LogOut className="w-4 h-4" /> Sair da Conta
        </Button>
      </motion.div>
    </div>
  );
}