import { motion } from "framer-motion";

const Item = ({ icon: Icon, label, value, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass rounded-xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-all duration-300"
    style={{ boxShadow: `0 0 20px ${color}18` }}
  >
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{label}</span>
    </div>
    <p className="font-display text-xl font-bold leading-none">{value}</p>
    {sub && <p className="text-[11px] text-muted-foreground font-body">{sub}</p>}
  </motion.div>
);

const Layers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
const DollarSign = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const TrendingUp = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const StarIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const Tag = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const Zap = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

export default function StatsSummaryCards({ stats }) {
  const fmt = (n) => n?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0,00";

  const items = [
    { icon: Layers, label: "Total de Cartas", value: stats.totalCards.toLocaleString("pt-BR"), sub: `${stats.uniqueCards} únicas`, color: "#7c3aed", delay: 0.05 },
    { icon: DollarSign, label: "Valor Total", value: fmt(stats.totalValue), sub: `Gasto: ${fmt(stats.totalSpent)}`, color: "#22c55e", delay: 0.1 },
    { icon: TrendingUp, label: "Média por Carta", value: fmt(stats.avgPrice), sub: "Valor atual", color: "#3b82f6", delay: 0.15 },
    {
      icon: StarIcon,
      label: "Carta Mais Cara",
      value: stats.mostExpensive ? fmt(stats.mostExpensive.current_price) : "—",
      sub: stats.mostExpensive?.card_name ?? "",
      color: "#f59e0b",
      delay: 0.2,
    },
    { icon: Tag, label: "Arquétipo Top", value: stats.topArchetype, sub: "Mais cartas", color: "#ec4899", delay: 0.25 },
    { icon: Zap, label: "Tipo Mais Comum", value: stats.topType, sub: "Na coleção", color: "#06b6d4", delay: 0.3 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <Item key={it.label} {...it} />
      ))}
    </div>
  );
}