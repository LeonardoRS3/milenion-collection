import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY = {
  title: "",
  description: "",
  type: "card",
  target_value: "",
  target_card_name: "",
  target_archetype: "",
  deadline: "",
  priority: "medium",
  auto_track: true,
};

export default function GoalFormModal({ open, goal, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(goal ? {
      title: goal.title || "",
      description: goal.description || "",
      type: goal.type || "card",
      target_value: goal.target_value || "",
      target_card_name: goal.target_card_name || "",
      target_archetype: goal.target_archetype || "",
      deadline: goal.deadline || "",
      priority: goal.priority || "medium",
      auto_track: goal.auto_track !== false,
    } : EMPTY);
  }, [goal, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      target_value: form.target_value ? parseFloat(form.target_value) : 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50 max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="font-display text-base">{goal ? "Editar Meta" : "Nova Meta"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger className="bg-secondary border-border/50 mt-1 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Carta específica</SelectItem>
                <SelectItem value="archetype">Arquétipo</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="deck">Deck</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Título *</Label>
            <Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex: Completar coleção Blue-Eyes" className="bg-secondary border-border/50 mt-1 text-sm" />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Detalhes da meta..." className="bg-secondary border-border/50 mt-1 h-16 text-sm" />
          </div>

          {form.type === "card" && (
            <div>
              <Label className="text-xs text-muted-foreground">Nome da Carta</Label>
              <Input value={form.target_card_name} onChange={(e) => set("target_card_name", e.target.value)} placeholder="Ex: Dark Magician" className="bg-secondary border-border/50 mt-1 text-sm" />
            </div>
          )}

          {form.type === "archetype" && (
            <div>
              <Label className="text-xs text-muted-foreground">Arquétipo</Label>
              <Input value={form.target_archetype} onChange={(e) => set("target_archetype", e.target.value)} placeholder="Ex: Blue-Eyes, Triamid" className="bg-secondary border-border/50 mt-1 text-sm" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                {form.type === "financial" ? "Valor Alvo (R$)" : "Quantidade Alvo"}
              </Label>
              <Input type="number" value={form.target_value} onChange={(e) => set("target_value", e.target.value)} placeholder="0" className="bg-secondary border-border/50 mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Prazo</Label>
              <Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className="bg-secondary border-border/50 mt-1 text-sm" />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Prioridade</Label>
            <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
              <SelectTrigger className="bg-secondary border-border/50 mt-1 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-body text-xs border-border/50">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 font-body text-xs">
              {goal ? "Salvar" : "Criar Meta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}