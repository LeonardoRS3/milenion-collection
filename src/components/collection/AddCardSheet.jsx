import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";

export default function AddCardSheet({ open, onClose, card, onConfirm, isLoading }) {
  const [form, setForm] = useState({
  quantity: 1,
  rarity: card?.rarity || card?.card_sets?.[0]?.set_rarity || "",
  condition: "near_mint",
  language: "portuguese",
  status: "not_purchased",
  priority: "medium",
  purchase_price: card?.purchase_price || "",
  notes: "",
});

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleConfirm = () => {
    onConfirm({
      ...form,
      quantity: Number(form.quantity) || 1,
      purchase_price: Number(form.purchase_price) || 0,
    });
  };

  const image = card?.card_images?.[0]?.image_url_small || card?.image_url;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="bg-card border-border/50 rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display text-base">Adicionar à Coleção</SheetTitle>
        </SheetHeader>

        {/* Card preview */}
        <div className="flex gap-4 mb-5 p-3 glass rounded-xl">
          {image && (
            <img src={image} alt={card?.name || card?.card_name} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-body font-semibold text-sm truncate">{card?.name || card?.card_name}</p>
            <p className="text-xs text-muted-foreground font-body">{card?.type || card?.card_type}</p>
            {(card?.card_prices?.[0]?.tcgplayer_price || card?.current_price) > 0 && (
              <p className="text-xs font-display text-gold mt-1">
                ${parseFloat(card?.card_prices?.[0]?.tcgplayer_price || card?.current_price).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Qty + Price row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">Quantidade</Label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                className="bg-secondary border-border/50 font-body"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">Preço pago (R$)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={form.purchase_price}
                onChange={(e) => set("purchase_price", e.target.value)}
                className="bg-secondary border-border/50 font-body"
              />
            </div>
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="bg-secondary border-border/50 text-xs font-body">
                  <SelectValue />
                <SelectContent>
  <SelectItem value="not_purchased">Não comprada</SelectItem>
  <SelectItem value="searching">Procurando</SelectItem>
  <SelectItem value="owned">Comprada</SelectItem>
</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger className="bg-secondary border-border/50 text-xs font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="essential">Essencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Condition + Language row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">Condição</Label>
              <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger className="bg-secondary border-border/50 text-xs font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mint">Mint</SelectItem>
                  <SelectItem value="near_mint">Near Mint</SelectItem>
                  <SelectItem value="lightly_played">Lightly Played</SelectItem>
                  <SelectItem value="moderately_played">Moderately Played</SelectItem>
                  <SelectItem value="heavily_played">Heavily Played</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-body">Idioma</Label>
              <Select value={form.language} onValueChange={(v) => set("language", v)}>
                <SelectTrigger className="bg-secondary border-border/50 text-xs font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portuguese">Português</SelectItem>
                  <SelectItem value="english">Inglês</SelectItem>
                  <SelectItem value="japanese">Japonês</SelectItem>
                  <SelectItem value="spanish">Espanhol</SelectItem>
                  <SelectItem value="french">Francês</SelectItem>
                  <SelectItem value="german">Alemão</SelectItem>
                  <SelectItem value="italian">Italiano</SelectItem>
                  <SelectItem value="korean">Coreano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rarity */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body">Raridade</Label>
            <Input
              placeholder="Ex: Ultra Rare, Secret Rare..."
              value={form.rarity}
              onChange={(e) => set("rarity", e.target.value)}
              className="bg-secondary border-border/50 font-body"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-body">Observações</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className="bg-secondary border-border/50 font-body resize-none text-sm"
            />
          </div>

          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 font-body"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Adicionar à Coleção
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}