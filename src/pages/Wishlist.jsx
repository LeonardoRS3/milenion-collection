import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PriorityBadge from "@/components/cards/PriorityBadge";
import { Progress } from "@/components/ui/progress";

export default function Wishlist() {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => base44.entities.WishlistCard.list("-created_date", 200),
  });

  const updateCard = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WishlistCard.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Atualizado!");
    },
  });

  const deleteCard = useMutation({
    mutationFn: (id) => base44.entities.WishlistCard.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removido da wishlist!");
    },
  });

  const filtered = cards.filter((c) => {
    const matchSearch = !search || c.card_name?.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === "all" || c.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const totalItems = cards.length;
  const purchased = cards.filter(c => c.is_purchased).length;
  const progress = totalItems > 0 ? (purchased / totalItems) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="font-display text-lg font-bold">Wishlist</h1>
        <p className="text-xs text-muted-foreground font-body">{totalItems} itens · {purchased} comprados</p>
      </div>

      {totalItems > 0 && (
        <div className="glass rounded-xl p-4 glow-gold">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground font-body">Progresso</span>
            <span className="text-xs font-display text-gold">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-secondary" />
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar na wishlist..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border/50 font-body"
        />
      </div>

      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
        <SelectTrigger className="w-full bg-secondary border-border/50 text-xs font-body">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as prioridades</SelectItem>
          <SelectItem value="essential">Essencial</SelectItem>
          <SelectItem value="high">Alta</SelectItem>
          <SelectItem value="medium">Média</SelectItem>
          <SelectItem value="low">Baixa</SelectItem>
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Wishlist vazia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.03 }}
                className={`glass rounded-xl p-3 flex gap-3 transition-all ${card.is_purchased ? "opacity-60" : ""}`}
              >
                <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                  {card.image_url ? (
                    <img src={card.image_url} alt={card.card_name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">?</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-body font-semibold text-sm truncate ${card.is_purchased ? "line-through" : ""}`}>{card.card_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <PriorityBadge priority={card.priority} />
                    <span className="text-[10px] text-muted-foreground">x{card.quantity_desired || 1}</span>
                  </div>
                  {card.target_price > 0 && (
                    <p className="text-[10px] text-gold mt-1 font-display">Alvo: R$ {card.target_price?.toFixed(2)}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => updateCard.mutate({ id: card.id, data: { is_purchased: !card.is_purchased } })}
                  >
                    <Check className={`w-4 h-4 ${card.is_purchased ? "text-green-500" : "text-muted-foreground"}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => deleteCard.mutate(card.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}