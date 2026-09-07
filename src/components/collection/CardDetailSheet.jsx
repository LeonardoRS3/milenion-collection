import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Trash2, Save } from "lucide-react";
import PriorityBadge from "@/components/cards/PriorityBadge";

export default function CardDetailSheet({ card, open, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState({
    quantity: card.quantity || 1,
    purchase_price: card.purchase_price || 0,
    current_price: card.current_price || 0,
    status: card.status || "owned",
    priority: card.priority || "medium",
    condition: card.condition || "near_mint",
    language: card.language || "portuguese",
    notes: card.notes || "",
    is_favorite: card.is_favorite || false,
    tags: card.tags || "",
  });

  const handleSave = () => {
    onUpdate(form);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="bg-card border-border/50 rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start gap-3">
            {card.image_url && (
              <img src={card.image_url} alt={card.card_name} className="w-20 h-28 rounded-lg object-cover" />
            )}
            <div className="flex-1">
              <SheetTitle className="font-body text-base text-left">{card.card_name}</SheetTitle>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {card.card_type && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{card.card_type}</span>}
                {card.rarity && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold">{card.rarity}</span>}
                <PriorityBadge priority={form.priority} />
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setForm({ ...form, is_favorite: !form.is_favorite })}
            >
              <Heart className={`w-5 h-5 ${form.is_favorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-4 px-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Quantidade</Label>
              <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} className="bg-secondary border-border/50 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Preço Pago</Label>
              <Input type="number" step="0.01" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: parseFloat(e.target.value) || 0 })} className="bg-secondary border-border/50 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Preço Atual</Label>
              <Input type="number" step="0.01" value={form.current_price} onChange={(e) => setForm({ ...form, current_price: parseFloat(e.target.value) || 0 })} className="bg-secondary border-border/50 mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-secondary border-border/50 mt-1 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
  <SelectItem value="not_purchased">Não comprada</SelectItem>
  <SelectItem value="searching">Procurando</SelectItem>
  <SelectItem value="owned">Comprada</SelectItem>
</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger className="bg-secondary border-border/50 mt-1 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="essential">Essencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                <SelectTrigger className="bg-secondary border-border/50 mt-1 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mint">Mint</SelectItem>
                  <SelectItem value="near_mint">Near Mint</SelectItem>
                  <SelectItem value="lightly_played">Lightly Played</SelectItem>
                  <SelectItem value="moderately_played">Moderately Played</SelectItem>
                  <SelectItem value="heavily_played">Heavily Played</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Idioma</Label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                <SelectTrigger className="bg-secondary border-border/50 mt-1 text-xs"><SelectValue /></SelectTrigger>
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

          <div>
            <Label className="text-xs text-muted-foreground">Tags</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2, tag3" className="bg-secondary border-border/50 mt-1" />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Observações</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas sobre a carta..." className="bg-secondary border-border/50 mt-1 h-20" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" /> Salvar
            </Button>
            <Button variant="destructive" size="icon" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}