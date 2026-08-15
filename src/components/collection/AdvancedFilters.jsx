import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TYPE_OPTIONS, ATTRIBUTE_OPTIONS, RARITY_OPTIONS,
  PRIORITY_OPTIONS, STATUS_OPTIONS, LANGUAGE_OPTIONS,
  SORT_OPTIONS, DEFAULT_FILTERS, countActiveFilters,
} from "@/lib/collectionFilters";

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-[11px] font-body">
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

function MultiToggle({ options, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const lbl = typeof opt === "string" ? opt : opt.label;
        const active = selected.includes(val);
        return (
          <button
            key={val}
            onClick={() => onChange(active ? selected.filter((s) => s !== val) : [...selected, val])}
            className={`px-2.5 py-1 rounded-full text-[11px] font-body border transition-all duration-200 ${
              active
                ? "bg-primary/20 border-primary/50 text-primary"
                : "bg-secondary/50 border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {lbl}
          </button>
        );
      })}
    </div>
  );
}

export default function AdvancedFilters({ filters, onChange }) {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  const update = (key, val) => onChange({ ...filters, [key]: val });
  const reset = () => onChange({ ...DEFAULT_FILTERS });

  // Chip labels for active filters
  const chips = [];
  filters.type?.forEach((v) => chips.push({ key: "type", val: v, label: v }));
  filters.attribute?.forEach((v) => chips.push({ key: "attribute", val: v, label: v }));
  filters.rarity?.forEach((v) => chips.push({ key: "rarity", val: v, label: v }));
  filters.priority?.forEach((v) => chips.push({ key: "priority", val: v, label: PRIORITY_OPTIONS.find((p) => p.value === v)?.label ?? v }));
  filters.status?.forEach((v) => chips.push({ key: "status", val: v, label: STATUS_OPTIONS.find((s) => s.value === v)?.label ?? v }));
  filters.language?.forEach((v) => chips.push({ key: "language", val: v, label: LANGUAGE_OPTIONS.find((l) => l.value === v)?.label ?? v }));
  if (filters.priceMin !== "") chips.push({ key: "priceMin", val: null, label: `Min R$${filters.priceMin}` });
  if (filters.priceMax !== "") chips.push({ key: "priceMax", val: null, label: `Max R$${filters.priceMax}` });
  if (filters.playset) chips.push({ key: "playset", val: null, label: "Playset ×3" });
  if (filters.favOnly) chips.push({ key: "favOnly", val: null, label: "Favoritas" });

  const removeChip = (chip) => {
    if (chip.val !== null) {
      update(chip.key, filters[chip.key].filter((s) => s !== chip.val));
    } else if (chip.key === "priceMin" || chip.key === "priceMax") {
      update(chip.key, "");
    } else {
      update(chip.key, false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Top bar */}
      <div className="flex items-center gap-2">
        <Select value={filters.sort} onValueChange={(v) => update("sort", v)}>
          <SelectTrigger className="flex-1 bg-secondary border-border/50 text-xs font-body h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-xs">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
          className={`gap-1.5 border-border/50 font-body text-xs h-9 transition-all ${
            activeCount > 0 ? "border-primary/50 text-primary bg-primary/10" : "text-muted-foreground"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>

        {activeCount > 0 && (
          <Button variant="ghost" size="icon" onClick={reset} className="h-9 w-9 text-muted-foreground hover:text-destructive">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip, i) => (
            <Chip key={i} label={chip.label} onRemove={() => removeChip(chip)} />
          ))}
        </div>
      )}

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl p-4 space-y-4 border border-border/30">

              <Section label="Tipo">
                <MultiToggle options={TYPE_OPTIONS} selected={filters.type} onChange={(v) => update("type", v)} />
              </Section>

              <Section label="Atributo">
                <MultiToggle options={ATTRIBUTE_OPTIONS} selected={filters.attribute} onChange={(v) => update("attribute", v)} />
              </Section>

              <Section label="Raridade">
                <MultiToggle options={RARITY_OPTIONS} selected={filters.rarity} onChange={(v) => update("rarity", v)} />
              </Section>

              <div className="grid grid-cols-2 gap-4">
                <Section label="Prioridade">
                  <MultiToggle options={PRIORITY_OPTIONS} selected={filters.priority} onChange={(v) => update("priority", v)} />
                </Section>
                <Section label="Status">
                  <MultiToggle options={STATUS_OPTIONS} selected={filters.status} onChange={(v) => update("status", v)} />
                </Section>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Section label="Idioma">
                  <MultiToggle options={LANGUAGE_OPTIONS} selected={filters.language} onChange={(v) => update("language", v)} />
                </Section>
                <Section label="Quantidade">
                  <MultiToggle
                    options={[{ value: "playset", label: "Playset ×3" }]}
                    selected={filters.playset ? ["playset"] : []}
                    onChange={(v) => update("playset", v.includes("playset"))}
                  />
                </Section>
              </div>

              <Section label="Faixa de Preço (R$)">
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.priceMin}
                    onChange={(e) => update("priceMin", e.target.value)}
                    className="bg-secondary border-border/50 text-xs h-8 font-body"
                  />
                  <span className="text-muted-foreground text-xs">—</span>
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.priceMax}
                    onChange={(e) => update("priceMax", e.target.value)}
                    className="bg-secondary border-border/50 text-xs h-8 font-body"
                  />
                </div>
              </Section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}