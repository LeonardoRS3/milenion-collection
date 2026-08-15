import { cn } from "@/lib/utils";
import { EVENT_META } from "@/lib/historyService";
import {
  Plus, Minus, RefreshCw, Heart, ShoppingBag, TrendingUp, TrendingDown,
  BookOpen, Star, CheckCircle2, Target, Layers
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const EVENT_ICONS = {
  collection_add: Plus,
  collection_remove: Minus,
  collection_update: RefreshCw,
  collection_favorite: Heart,
  purchase: ShoppingBag,
  price_change: TrendingUp,
  deck_create: BookOpen,
  deck_add_card: BookOpen,
  deck_remove_card: BookOpen,
  wishlist_add: Star,
  wishlist_purchased: CheckCircle2,
  goal_completed: Target,
  goal_created: Target,
};

export default function HistoryItem({ log }) {
  const meta = EVENT_META[log.event_type] || EVENT_META.collection_add;
  const Icon = EVENT_ICONS[log.event_type] || Layers;

  const date = log.created_date ? parseISO(log.created_date) : new Date();
  const timeStr = format(date, "HH:mm");

  const hasPriceChange = log.old_value != null && log.new_value != null && log.event_type === "price_change";
  const diff = hasPriceChange ? log.new_value - log.old_value : null;
  const pct = hasPriceChange && log.old_value > 0 ? ((diff / log.old_value) * 100).toFixed(0) : null;

  return (
    <div className="flex items-start gap-3 pl-6 relative pb-1">
      {/* Dot on timeline */}
      <div className={cn(
        "absolute left-[-4px] top-2 w-2 h-2 rounded-full border-2",
        meta.color.replace("text-", "bg-").replace("/10", "").replace("text-neon-blue", "bg-blue-400").replace("text-gold", "bg-yellow-400"),
        "border-background"
      )} />

      {/* Icon */}
      <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", meta.bg, meta.border, "border")}>
        <Icon className={cn("w-3 h-3", meta.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-body font-medium text-foreground leading-snug">{log.title}</p>
          <span className="text-[10px] text-muted-foreground font-body shrink-0">{timeStr}</span>
        </div>

        {log.description && (
          <p className="text-[11px] text-muted-foreground font-body mt-0.5">{log.description}</p>
        )}

        {/* Price change */}
        {hasPriceChange && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] text-muted-foreground font-body line-through">R$ {log.old_value?.toFixed(2)}</span>
            <span className="text-[11px] text-foreground font-body">→ R$ {log.new_value?.toFixed(2)}</span>
            {pct && (
              <span className={cn(
                "text-[10px] font-display font-bold px-1.5 py-0.5 rounded",
                diff > 0 ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
              )}>
                {diff > 0 ? "+" : ""}{pct}%
              </span>
            )}
          </div>
        )}

        {/* Card image thumbnail */}
        {log.card_image_url && (
          <img src={log.card_image_url} alt={log.card_name} className="w-8 h-11 object-cover rounded mt-1.5 border border-border/30" />
        )}
      </div>
    </div>
  );
}