import { Layers, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";

export default function DeckStatsBar({ stats }) {
  const items = [
    {
      icon: <Layers className="w-4 h-4 text-primary" />,
      label: "Main",
      value: stats.mainCount,
    },
    {
      icon: <Layers className="w-4 h-4 text-neon-blue" />,
      label: "Extra",
      value: stats.extraCount,
    },
    {
      icon: <Layers className="w-4 h-4 text-gold" />,
      label: "Side",
      value: stats.sideCount,
    },
    {
      icon:
        stats.missingCopies > 0 ? (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ),
      label: "Faltando",
      value: stats.missingCopies,
      highlight: stats.missingCopies > 0 ? "text-destructive" : "text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <div key={item.label} className="glass rounded-xl p-3 flex flex-col items-center gap-1">
          {item.icon}
          <span className={`font-display text-base font-bold ${item.highlight || "text-foreground"}`}>
            {item.value}
          </span>
          <span className="text-[10px] text-muted-foreground font-body">{item.label}</span>
        </div>
      ))}
    </div>
  );
}