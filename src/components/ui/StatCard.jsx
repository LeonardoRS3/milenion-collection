import { cn } from "@/lib/utils";

export default function StatCard({ title, value, icon: Icon, glowClass = "glow-purple", iconColor = "text-primary" }) {
  return (
    <div className={cn("glass rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]", glowClass)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">{title}</span>
        {Icon && <Icon className={cn("w-4 h-4", iconColor)} />}
      </div>
      <p className="text-xl font-display font-bold">{value}</p>
    </div>
  );
}