import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import DashboardStats from "@/components/home/DashboardStats";
import QuickActions from "@/components/home/QuickActions";
import RecentCards from "@/components/home/RecentCards";
import AddCardModal from "@/components/collection/AddCardModal";
import ImportListModal from "@/components/collection/ImportListModal";
import ActiveGoalsSection from "@/components/home/ActiveGoalsSection";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [importListOpen, setImportListOpen] = useState(false);

  const { data: collection = [], isLoading: loadingCollection } = useQuery({
    queryKey: ["collection"],
    queryFn: () => base44.entities.CollectionCard.list("-created_date", 50),
  });

  const { data: wishlist = [], isLoading: loadingWishlist } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => base44.entities.WishlistCard.list("-created_date", 50),
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => base44.entities.Purchase.list("-created_date", 50),
  });

  const isLoading = loadingCollection || loadingWishlist;

  const totalCards = collection.reduce((sum, c) => sum + (c.quantity || 1), 0);
  const totalValue = collection.reduce((sum, c) => sum + ((c.current_price || 0) * (c.quantity || 1)), 0);
  const wishlistCount = wishlist.filter(w => !w.is_purchased).length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthSpent = purchases
    .filter(p => new Date(p.created_date) >= monthStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const mostValuable = [...collection]
    .sort((a, b) => (b.current_price || 0) - (a.current_price || 0))
    .slice(0, 6);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-xl font-bold bg-gradient-to-r from-primary via-neon-blue to-gold bg-clip-text text-transparent">
            Millennium
          </h1>
          <p className="text-xs text-muted-foreground font-body">Collection Manager</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-neon-blue flex items-center justify-center glow-purple">
          <span className="font-display text-sm font-bold text-white">MC</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DashboardStats
          totalCards={totalCards}
          totalValue={totalValue}
          wishlistCount={wishlistCount}
          deckCount={0}
          monthSpent={monthSpent}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-display text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Ações Rápidas</h2>
        <QuickActions onAddCard={() => setAddCardOpen(true)} onImportList={() => setImportListOpen(true)} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="font-display text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Últimas Adicionadas</h2>
        <RecentCards cards={collection.slice(0, 6)} />
      </motion.div>

      {mostValuable.length > 0 && mostValuable[0]?.current_price > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="font-display text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Mais Valiosas</h2>
          <RecentCards cards={mostValuable} />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <ActiveGoalsSection collection={collection} purchases={purchases} />
      </motion.div>
      <AddCardModal open={addCardOpen} onClose={() => setAddCardOpen(false)} />
      <ImportListModal open={importListOpen} onClose={() => setImportListOpen(false)} />
    </div>
  );
}