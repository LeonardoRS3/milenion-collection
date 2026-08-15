import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priorityConfig = {
  low: { label: "Baixa", class: "bg-muted text-muted-foreground border-muted" },
  medium: { label: "Média", class: "bg-neon-blue/10 text-neon-blue border-neon-blue/20" },
  high: { label: "Alta", class: "bg-primary/10 text-primary border-primary/20" },
  essential: { label: "Essencial", class: "bg-gold/10 text-gold border-gold/20" },
};

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.medium;
  return (
    <Badge variant="outline" className={cn("text-[10px] font-body border", config.class)}>
      {config.label}
    </Badge>
  );
}