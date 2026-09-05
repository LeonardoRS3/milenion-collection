import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  Loader2,
  Trash2,
  CalendarDays,
  Store,
  Coins,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Purchases() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [store, setStore] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const { data: purchases = [], isLoading: loadingPurchases } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => base44.entities.Purchase.list("-created_date", 500),
  });

  const { data: collection = [], isLoading: loadingCollection } = useQuery({
    queryKey: ["collection"],
    queryFn: () => base44.entities.CollectionCard.list("-created_date", 500),
  });

  const totalSpent = useMemo(() => {
    return purchases.reduce((sum, purchase) => {
      return sum + Number(purchase.amount || 0);
    }, 0);
  }, [purchases]);

  const createPurchase = useMutation({
    mutationFn: async () => {
      if (!amount || Number(amount) <= 0) {
        throw new Error("Informe o valor da compra.");
      }

      if (selectedCards.length === 0) {
        throw new Error("Selecione pelo menos uma carta.");
      }

      const cardsPurchased = selectedCards.map((card) => ({
        card_id: card.card_id,
        card_name: card.card_name,
        quantity: card.quantity || 1,
        image_url: card.image_url || "",
      }));

      return base44.entities.Purchase.create({
        amount: Number(amount),
        date,
        store: store.trim(),
        description: description.trim(),
        notes: notes.trim(),
        cards_purchased: cardsPurchased,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });

      toast.success("Compra registrada com sucesso!");

      resetForm();
      setOpen(false);
    },

    onError: (error) => {
      toast.error(error.message || "Não foi possível registrar a compra.");
    },
  });

  const deletePurchase = useMutation({
    mutationFn: (id) => base44.entities.Purchase.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success("Compra excluída.");
    },

    onError: () => {
      toast.error("Não foi possível excluir a compra.");
    },
  });

  function resetForm() {
    setSelectedCards([]);
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setStore("");
    setDescription("");
    setNotes("");
  }

  function toggleCard(card) {
    setSelectedCards((current) => {
      const exists = current.some((item) => item.card_id === card.card_id);

      if (exists) {
        return current.filter((item) => item.card_id !== card.card_id);
      }

      return [...current, card];
    });
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatDate(value) {
    if (!value) return "-";

    const dateValue = new Date(`${value}T00:00:00`);

    if (Number.isNaN(dateValue.getTime())) return value;

    return dateValue.toLocaleDateString("pt-BR");
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">
            Compras
          </h1>

          <p className="text-xs text-muted-foreground">
            Histórico das suas compras
          </p>
        </div>

        <Button
          onClick={() => setOpen(true)}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova compra
        </Button>
      </motion.div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs">Compras</span>
          </div>

          <p className="text-xl font-display font-bold">
            {purchases.length}
          </p>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Coins className="w-4 h-4" />
            <span className="text-xs">Total gasto</span>
          </div>

          <p className="text-xl font-display font-bold">
            {formatCurrency(totalSpent)}
          </p>
        </div>
      </div>

      {/* Lista */}
      {loadingPurchases ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />

          <p className="font-display font-semibold">
            Nenhuma compra registrada
          </p>

          <p className="text-xs text-muted-foreground mt-2">
            As cartas da coleção não entram automaticamente aqui.
            Registre uma compra usando o botão acima.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => (
            <motion.div
              key={purchase.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-gold" />

                    <span className="font-display font-semibold">
                      {formatCurrency(purchase.amount)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {formatDate(purchase.date)}
                    </span>

                    {purchase.store && (
                      <span className="flex items-center gap-1">
                        <Store className="w-3.5 h-3.5" />
                        {purchase.store}
                      </span>
                    )}
                  </div>

                  {purchase.description && (
                    <p className="text-sm mt-3">
                      {purchase.description}
                    </p>
                  )}

                  {Array.isArray(purchase.cards_purchased) &&
                    purchase.cards_purchased.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {purchase.cards_purchased.map((card, index) => (
                          <div
                            key={`${card.card_id}-${index}`}
                            className="flex items-center gap-2"
                          >
                            {card.image_url && (
                              <img
                                src={card.image_url}
                                alt={card.card_name}
                                className="w-8 h-11 rounded object-cover"
                              />
                            )}

                            <div className="text-xs">
                              <p className="font-medium">
                                {card.card_name}
                              </p>

                              <p className="text-muted-foreground">
                                {card.quantity || 1} cópia(s)
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Deseja realmente excluir esta compra?"
                      )
                    ) {
                      deletePurchase.mutate(purchase.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Nova compra */}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);

          if (!value) {
            resetForm();
          }
        }}
      >
        <DialogContent className="bg-card border-border/50 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Registrar compra
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cartas */}
            <div>
              <Label className="text-xs text-muted-foreground">
                Cartas compradas
              </Label>

              {loadingCollection ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : collection.length === 0 ? (
                <div className="rounded-xl bg-secondary p-4 mt-2">
                  <p className="text-xs text-muted-foreground">
                    Sua coleção ainda está vazia.
                  </p>
                </div>
              ) : (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                  {collection.map((card) => {
                    const selected = selectedCards.some(
                      (item) => item.card_id === card.card_id
                    );

                    return (
                      <button
                        type="button"
                        key={card.id}
                        onClick={() => toggleCard(card)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl text-left border transition ${
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-border/30 bg-secondary/50"
                        }`}
                      >
                        <Checkbox checked={selected} />

                        {card.image_url && (
                          <img
                            src={card.image_url}
                            alt={card.card_name}
                            className="w-9 h-12 rounded object-cover"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">
                            {card.card_name}
                          </p>

                          <p className="text-[10px] text-muted-foreground">
                            {card.quantity || 1} cópia(s)
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Valor */}
            <div>
              <Label className="text-xs text-muted-foreground">
                Valor pago
              </Label>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="bg-secondary border-border/50 mt-1"
              />
            </div>

            {/* Data */}
            <div>
              <Label className="text-xs text-muted-foreground">
                Data da compra
              </Label>

              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-secondary border-border/50 mt-1"
              />
            </div>

            {/* Loja */}
            <div>
              <Label className="text-xs text-muted-foreground">
                Loja
              </Label>

              <Input
                value={store}
                onChange={(e) => setStore(e.target.value)}
                placeholder="Ex.: Mercado Livre, loja física..."
                className="bg-secondary border-border/50 mt-1"
              />
            </div>

            {/* Descrição */}
            <div>
              <Label className="text-xs text-muted-foreground">
                Descrição
              </Label>

              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex.: Compra de cartas para deck"
                className="bg-secondary border-border/50 mt-1"
              />
            </div>

            {/* Observações */}
            <div>
              <Label className="text-xs text-muted-foreground">
                Observações
              </Label>

              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre a compra..."
                className="bg-secondary border-border/50 mt-1"
              />
            </div>

            {/* Salvar */}
            <Button
              onClick={() => createPurchase.mutate()}
              disabled={createPurchase.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {createPurchase.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Registrar compra
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}